import * as admin from "firebase-admin";
import { ejecutarCerebroVentas } from "./genkitFlow";
import { sendWhatsAppMessage } from "./sender";

// Helpers (reused)
async function obtenerInventarioActualizado() {
    const db = admin.firestore();
    try {
        const snapshot = await db.collection("vehicles").limit(50).get();
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
    const FULL_INVENTORY_ID = "__FULL_INVENTORY__";
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
    console.log(`Processing message from ${from}: ${text}`);

    const chatId = `chat_${from}`;
    const chatRef = db.collection("chats").doc(chatId);

    try {
        const shouldProcess = await db.runTransaction(async (t) => {
            const doc = await t.get(chatRef);
            const now = Date.now();
            let currentBuffer: string[] = [];

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
            // Mark as processing
            await chatRef.update({ processing: true });

            const fullText = data.buffer.join(" . ");

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

            // AI Execution
            const response = await ejecutarCerebroVentas({
                datos_lead: data?.leadData || "NO_EXISTE",
                historial_chat: history,
                inventario: inventario,
                mensaje_actual: fullText,
                contexto_origen: data?.contexto_origen || null
            });

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

            if (leadResult && leadResult.leadId) {
                if (accion === "ENVIAR_TASACION") {
                    const tradeInLink = `https://copiloto-crm-1764216245.web.app/public/trade-in?leadId=${leadResult.leadId}`;
                    finalMessage += `\n\n📝 Completá los datos de tu vehículo aquí: ${tradeInLink}`;
                }

                if (accion === "CREAR_TAREA") {
                    const taskId = db.collection("tasks").doc().id;
                    const now = new Date().toISOString();
                    await db.collection("tasks").doc(taskId).set({
                        id: taskId,
                        title: `Seguimiento WhatsApp: ${fullText.substring(0, 50)}...`,
                        description: `El cliente pidió: "${fullText}"`,
                        date: now,
                        isCompleted: false,
                        priority: "Medium",
                        type: "FollowUp",
                        relatedLeadId: leadResult.leadId
                    });
                    await leadResult.leadRef.update({
                        history: admin.firestore.FieldValue.arrayUnion({
                            id: `task_${taskId}`,
                            type: "note",
                            date: now,
                            notes: `🤖 Tarea creada: ${fullText}`,
                            details: response.razonamiento
                        })
                    });
                }

                if (accion === "CREAR_NOTA") {
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
                }

                if (accion === "ENVIAR_CATALOGO_COMPLETO") {
                    const catalogoUrl = await obtenerOCrearCatalogoCompleto(db);
                    finalMessage += `\n\n🚗 Acá podés ver todo nuestro stock actualizado:\n${catalogoUrl}`;
                }
            }

            // Prepare Media
            let mediaUrlsToSend: string[] = [];
            if (response.respuesta_cliente.media_urls) {
                mediaUrlsToSend = response.respuesta_cliente.media_urls;
            } else if (response.respuesta_cliente.media_url) {
                mediaUrlsToSend = [response.respuesta_cliente.media_url];
            }

            // Send response
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
        console.error("Error en flujo MessageHandler:", error);
        if (from) {
            await sendWhatsAppMessage(from, `Error: ${error.message}`);
        }
    }
}
