import * as admin from "firebase-admin";
import { enviarMensajeAlAgente } from "./agentClient";
import { sendWhatsAppMessage } from "./sender";

// Helpers (reused)
export async function obtenerInventarioActualizado() {
    const db = admin.firestore();
    try {
        // Obtenemos solo los vehículos disponibles para no confundir al bot
        const snapshot = await db.collection("vehicles")
            .where("status", "==", "Available")
            .limit(100)
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                modelo: `${data.make} ${data.model} ${data.year}`,
                año: data.year,
                precio: data.price,
                url: `https://copiloto-crm-1764216245.web.app/public/car/${doc.id}`,
                imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || null,
                imageUrls: data.imageUrls || []
            };
        });
    } catch (error) {
        console.error("Error al obtener inventario:", error);
        return [];
    }
}

async function obtenerOCrearCatalogoCompleto(db: admin.firestore.Firestore): Promise<string> {
    const FULL_INVENTORY_ID = "FULL_INVENTORY_CATALOG"; // Cambiado de __FULL_INVENTORY__ (reservado)
    const menuRef = db.collection("menus").doc(FULL_INVENTORY_ID);

    const doc = await menuRef.get();
    const now = admin.firestore.Timestamp.now();

    if (doc.exists) {
        const data = doc.data();
        const lastUpdate = data?.updatedAt || data?.createdAt;
        if (lastUpdate && (now.toMillis() - lastUpdate.toMillis() < 24 * 60 * 60 * 1000)) {
            return `https://copiloto-crm-1764216245.web.app/public/menu/${FULL_INVENTORY_ID}`;
        }
    }

    try {
        const vehiclesSnapshot = await db.collection("vehicles")
            .where("status", "==", "Available")
            .get();

        const vehicleIds = vehiclesSnapshot.docs.map(d => d.id);

        await menuRef.set({
            id: FULL_INVENTORY_ID,
            name: "Inventario Completo",
            vehicleIds: vehicleIds,
            createdAt: now,
            updatedAt: now,
            viewCount: doc.exists ? (doc.data()?.viewCount || 0) : 0,
            includePrice: true,
            isSystem: true
        });

        return `https://copiloto-crm-1764216245.web.app/public/menu/${FULL_INVENTORY_ID}`;

    } catch (error) {
        console.error("Error regenerando catálogo completo:", error);
        return `https://copiloto-crm-1764216245.web.app/public/menu/${FULL_INVENTORY_ID}`;
    }
}

async function gestionarLead(
    db: admin.firestore.Firestore,
    telefono: string,
    gestionLead: any,
    chatId: string,
    senderName: string
) {
    const leadsRef = db.collection("leads");
    const existingLeadQuery = await leadsRef.where("phone", "==", telefono).limit(1).get();

    let leadId: string;
    let leadRef: admin.firestore.DocumentReference;

    if (!existingLeadQuery.empty) {
        leadRef = existingLeadQuery.docs[0].ref;
        leadId = leadRef.id;

        if (gestionLead.datos_extraidos) {
            const updates: any = {};
            if (gestionLead.datos_extraidos.nombre) updates.name = gestionLead.datos_extraidos.nombre;
            if (gestionLead.datos_extraidos.email) updates.email = gestionLead.datos_extraidos.email;
            if (gestionLead.actualizaciones_estado?.estado) updates.status = gestionLead.actualizaciones_estado.estado;
            if (Object.keys(updates).length > 0) {
                await leadRef.update(updates);
            }
        }
    } else {
        const nombreExtraido = gestionLead.datos_extraidos?.nombre || senderName;
        const nuevoLead = {
            phone: telefono,
            name: nombreExtraido || "Cliente WhatsApp",
            status: "NUEVO",
            interestLevel: "Medium",
            budget: 0,
            interestedVehicleId: "",
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreExtraido || "WA")}&background=6366f1&color=fff`,
            history: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            source: "WhatsApp",
            chatId: chatId
        };
        leadRef = await leadsRef.add(nuevoLead);
        leadId = leadRef.id;
    }

    return { leadId, leadRef };
}

export async function processIncomingMessage(
    from: string,
    text: string,
    senderName: string
) {
    const db = admin.firestore();
    console.log(`[HANDLER] Entry: Received message from ${from}: "${text}"`);
    console.log(`[HANDLER] Entry: Received message from ${from}: "${text}"`);

    const chatId = `chat_${from}`;
    const chatRef = db.collection("chats").doc(chatId);

    // COMMAND: /RESET
    if (text.trim().toLowerCase() === "/reset" || text.trim().toLowerCase() === "/clear") {
        console.log(`[RESET] Limpiando sesión para ${from}`);
        const newSessionId = `${from}_${Date.now()}`;

        // 1. Update session ID and clear buffer
        await chatRef.set({
            currentSessionId: newSessionId,
            buffer: [],
            processing: false,
            lastMessageTime: Date.now()
        }, { merge: true });

        // 2. Clear history (batch delete is better but this is quick for now)
        const historySnapshot = await chatRef.collection("history").get();
        const batch = db.batch();
        historySnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        await sendWhatsAppMessage(from, "🔄 Memoria reiniciada. Soy *Copiloto*, tu asistente de Meny Cars. ¿En qué te ayudo hoy?");
        return;
    }

    try {
        console.log(`[HANDLER] Running transaction for ${from}...`);
        const shouldProcess = await db.runTransaction(async (t) => {
            const doc = await t.get(chatRef);
            const now = Date.now();
            let currentBuffer: string[] = [];

            // Ensure session ID exists
            if (!doc.exists || !doc.data()?.currentSessionId) {
                t.set(chatRef, { currentSessionId: from }, { merge: true });
            }

            if (doc.exists) {
                const data = doc.data();
                currentBuffer = data?.buffer || [];
            }

            currentBuffer.push(text);

            t.set(chatRef, {
                buffer: currentBuffer,
                lastMessageTime: now,
                processing: false,
                lastSenderName: senderName // Update sender name if available
            }, { merge: true });

            return true;
        });

        if (!shouldProcess) return;

        // Debounce wait
        await new Promise(resolve => setTimeout(resolve, 3500));

        const docAfterWait = await chatRef.get();
        const data = docAfterWait.data();

        // Check if new messages arrived
        if (Date.now() - (data?.lastMessageTime || 0) < 3000) {
            console.log("Buffer activo: Abortando ejecución, hay un mensaje más reciente.");
            return;
        }

        if (!data?.processing && data?.buffer && data.buffer.length > 0) {
            console.log(`[HANDLER] Starting AI processing for ${from}. Buffer size: ${data.buffer.length}`);
            // Mark as processing
            await chatRef.update({ processing: true });

            const fullText = data.buffer.join(" . ");
            console.log(`[HANDLER] Full text for AI: "${fullText}"`);

            // Get history
            const historySnapshot = await chatRef.collection("history")
                .orderBy("timestamp", "desc")
                .limit(15).get(); // Increased limit

            const history = historySnapshot.docs.map(d => {
                const hData = d.data();
                const role = hData.role === 'user' ? 'CLIENTE' : 'VENDEDOR (TÚ)';
                return `${role}: ${hData.content}`;
            }).reverse();

            const inventario = await obtenerInventarioActualizado();

            // AI Execution - Ahora usando Vertex AI Agent
            console.log(`[AGENT] Llamando al Agente de Vertex AI para lead ${from}`);

            // Usamos el session ID dinámico si existe, sino el teléfono por defecto
            const sessionIdToUse = data.currentSessionId || from;

            const agentResponse = await enviarMensajeAlAgente(
                sessionIdToUse, // leadId / Session ID dinámico
                fullText,
                {
                    nombre: data?.leadData?.nombre || senderName,
                    telefono: from,
                    historial: history.join('\n'),
                    inventario_disponible: inventario.length
                }
            );

            console.log(`[AGENT] Respuesta del agente:`, agentResponse.mensaje);

            // El agente devuelve texto plano, lo adaptamos al formato esperado
            const response = {
                respuesta_cliente: {
                    mensaje_whatsapp: agentResponse.mensaje,
                    accion_sugerida_app: null, // El agente maneja las acciones vía Tools
                    media_urls: [],
                    media_url: null
                },
                gestion_lead: {
                    datos_extraidos: {},
                    actualizaciones_estado: {}
                },
                analisis_conversacional: {
                    vehiculos_identificados: [],
                    intencion_detectada: "CONSULTA"
                },
                razonamiento: "Procesado por Vertex AI Agent"
            };

            // Lead Management
            const leadResult = await gestionarLead(
                db,
                from,
                response.gestion_lead,
                chatId,
                senderName
            );

            // Actions (Tasks, Notes, etc)
            let finalMessage = response.respuesta_cliente.mensaje_whatsapp;
            const accion = response.respuesta_cliente.accion_sugerida_app;

            console.log(`[AI_RESPONSE] Accion detectada: ${accion}`);
            console.log(`[AI_RESPONSE] Vehiculos identificados:`, response.analisis_conversacional?.vehiculos_identificados);

            if (leadResult && leadResult.leadId) {
                if (accion === "ENVIAR_TASACION") {
                    const tradeInLink = `https://copiloto-crm-1764216245.web.app/public/trade-in?leadId=${leadResult.leadId}`;
                    finalMessage += `\n\n📝 Completá los datos de tu vehículo aquí: ${tradeInLink}`;
                }

                if (accion === "CREAR_TAREA") {
                    // Solo crear tarea si hay intención real de cita o consulta avanzada
                    const intencion = response.analisis_conversacional.intencion_detectada;
                    const esCitaSegura = (intencion === "CITA" || intencion === "TASACION") &&
                        (fullText.toLowerCase().includes("mañana") ||
                            fullText.toLowerCase().includes("lunes") ||
                            fullText.match(/\d+/) ||
                            fullText.includes("hs"));

                    if (esCitaSegura) {
                        const taskId = db.collection("tasks").doc().id;
                        const now = new Date().toISOString();
                        await db.collection("tasks").doc(taskId).set({
                            id: taskId,
                            title: `Cita WhatsApp: ${fullText.substring(0, 30)}...`,
                            description: `El cliente confirmó visita: "${fullText}"`,
                            date: now,
                            isCompleted: false,
                            priority: "High",
                            type: "FollowUp",
                            relatedLeadId: leadResult.leadId
                        });
                        console.log(`[CRM] Tarea creada para lead ${leadResult.leadId}`);
                    }
                }

                if (accion === "CREAR_NOTA") {
                    // Solo crear nota si no es un simple saludo o dato trivial
                    const razonamiento = response.razonamiento;
                    if (razonamiento && razonamiento.length > 5 && !razonamiento.includes("saludo")) {
                        const now = new Date().toISOString();
                        await leadResult.leadRef.update({
                            history: admin.firestore.FieldValue.arrayUnion({
                                id: `note_${Date.now()}`,
                                type: "note",
                                date: now,
                                notes: `🤖 ${response.razonamiento}`,
                                details: fullText
                            })
                        });
                        console.log(`[CRM] Nota creada para lead ${leadResult.leadId}`);
                    }
                }

                if (accion === "ENVIAR_CATALOGO_COMPLETO") {
                    const catalogoUrl = await obtenerOCrearCatalogoCompleto(db);
                    finalMessage += `\n\n🚗 Acá podés ver todo nuestro stock actualizado:\n${catalogoUrl}`;
                }
            }

            // Prepare Media
            let mediaUrlsToSend: string[] = [];
            if (accion === "ENVIAR_FICHA") {
                const vehiculosMencionados = response.analisis_conversacional.vehiculos_identificados;
                if (vehiculosMencionados && vehiculosMencionados.length > 0 && typeof vehiculosMencionados[0] === 'string') {
                    const nombreBuscado = (vehiculosMencionados[0] as string).toLowerCase();

                    // Split search term into words (to handle "Volkswagen Voyage" matching "Voyage")
                    const palabrasBusqueda = nombreBuscado.replace(/_/g, ' ').split(' ').filter((p: string) => p.length > 2);

                    console.log(`[SEARCH] Buscando vehiculo con palabras:`, palabrasBusqueda);

                    const autosEncontrados = inventario.filter(v => {
                        const modeloLower = v.modelo.toLowerCase().replace(/_/g, ' ');
                        // Match if ANY word from search appears in the model name
                        return palabrasBusqueda.some((palabra: string) => modeloLower.includes(palabra));
                    });

                    console.log(`[SEARCH] Encontrados ${autosEncontrados.length} vehiculos:`, autosEncontrados.map(v => v.modelo));

                    if (autosEncontrados.length === 1) {
                        const auto = autosEncontrados[0];
                        if (auto.imageUrl) {
                            mediaUrlsToSend.push(auto.imageUrl);
                            console.log(`[MEDIA] Adjuntando foto de ${auto.modelo}: ${auto.imageUrl}`);
                        } else {
                            console.log(`[MEDIA] Vehiculo ${auto.modelo} NO tiene imageUrl`);
                        }
                        if (auto.url) {
                            finalMessage += `\n\n🔗 Ver detalles de ${auto.modelo}: ${auto.url}`;
                        }
                    } else if (autosEncontrados.length > 1) {
                        // Si hay varios, listarlos todos con sus links
                        let listaAutos = "\n\nEncontré estas opciones de " + vehiculosMencionados[0] + ":";
                        autosEncontrados.forEach(auto => {
                            listaAutos += `\n📍 ${auto.modelo}: ${auto.url}`;
                        });
                        finalMessage += listaAutos;
                        // Opcionalmente mandar la foto del primero
                        if (autosEncontrados[0].imageUrl) {
                            mediaUrlsToSend.push(autosEncontrados[0].imageUrl);
                        }
                    }
                }
            }

            if (response.respuesta_cliente.media_urls) {
                mediaUrlsToSend = [...mediaUrlsToSend, ...response.respuesta_cliente.media_urls];
            } else if (response.respuesta_cliente.media_url) {
                mediaUrlsToSend.push(response.respuesta_cliente.media_url);
            }

            // Send response
            console.log(`[SEND] About to send message. Media URLs count: ${mediaUrlsToSend.length}`, mediaUrlsToSend);
            await sendWhatsAppMessage(
                from,
                finalMessage,
                mediaUrlsToSend
            );

            // Save to Chat History
            const batch = db.batch();

            const userMsgRef = chatRef.collection("history").doc();
            batch.set(userMsgRef, {
                role: "user",
                content: fullText,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            const botMsgRef = chatRef.collection("history").doc();
            batch.set(botMsgRef, {
                role: "assistant",
                content: finalMessage,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                metadata: response,
                mediaUrls: mediaUrlsToSend
            });

            const chatUpdates: any = {
                buffer: [],
                processing: false
            };
            if (leadResult) chatUpdates.leadId = leadResult.leadId;

            batch.update(chatRef, chatUpdates);
            await batch.commit();
        }

    } catch (error: any) {
        const status = error?.response?.status;
        const url = error?.config?.url;
        const safeDetails = {
            message: error?.message,
            name: error?.name,
            code: error?.code,
            status,
            url,
        };
        console.error("Error en flujo MessageHandler (sanitizado):", safeDetails);

        if (from) {
            await sendWhatsAppMessage(from, "Perdón, justo tuve un error interno. En un ratito te respondo bien.");
        }
    }
}
