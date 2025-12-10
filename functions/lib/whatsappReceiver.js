"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveWhatsapp = exports.enviarMensajeWhatsApp = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const genkitFlow_1 = require("./genkitFlow");
// Helpers
async function obtenerInventarioActualizado() {
    const db = admin.firestore();
    try {
        const snapshot = await db.collection("vehicles").limit(20).get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                modelo: `${data.make} ${data.model} ${data.year}`,
                año: data.year,
                precio: data.price,
                url: `https://copiloto-crm-1764216245.web.app/?vehicle=${doc.id}`,
                imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || null,
                imageUrls: data.imageUrls || [] // Agregamos lista completa para carrusel
            };
        });
    }
    catch (error) {
        console.error("Error al obtener inventario:", error);
        return [];
    }
}
async function enviarMensajeWhatsApp(to, message, mediaUrls) {
    var _a;
    const productId = process.env.MAYTAPI_PRODUCT_ID;
    const token = process.env.MAYTAPI_TOKEN;
    const phoneId = process.env.MAYTAPI_PHONE_ID;
    const apiUrl = process.env.MAYTAPI_API_URL || "https://api.maytapi.com/api";
    if (!productId || !token || !phoneId) {
        console.error("Faltan credenciales de Maytapi");
        return;
    }
    try {
        const url = `${apiUrl}/${productId}/${phoneId}/sendMessage`;
        const headers = {
            "x-maytapi-key": token,
            "Content-Type": "application/json"
        };
        // Si hay mediaUrls, enviamos cada imagen
        if (mediaUrls && mediaUrls.length > 0) {
            for (const mediaUrl of mediaUrls) {
                await axios_1.default.post(url, {
                    to_number: to,
                    type: "media",
                    message: mediaUrl
                }, { headers });
                // Delay para evitar rate limits o desorden
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }
        // Enviar mensaje de texto
        await axios_1.default.post(url, {
            to_number: to,
            type: "text",
            message: message
        }, { headers });
    }
    catch (error) {
        console.error("Error enviando mensaje a WhatsApp (Maytapi):", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
}
exports.enviarMensajeWhatsApp = enviarMensajeWhatsApp;
// Buscar o crear lead por teléfono
async function gestionarLead(db, telefono, gestionLead, chatId) {
    var _a, _b;
    const leadsRef = db.collection("leads");
    // Buscar lead existente por teléfono
    const existingLeadQuery = await leadsRef.where("phone", "==", telefono).limit(1).get();
    let leadId;
    let leadRef;
    if (!existingLeadQuery.empty) {
        // Lead ya existe - actualizar si hay datos nuevos
        leadRef = existingLeadQuery.docs[0].ref;
        leadId = leadRef.id;
        console.log(`Lead existente encontrado: ${leadId}`);
        // Actualizar con datos extraídos si los hay
        if (gestionLead.datos_extraidos) {
            const updates = {};
            if (gestionLead.datos_extraidos.nombre)
                updates.name = gestionLead.datos_extraidos.nombre;
            if (gestionLead.datos_extraidos.email)
                updates.email = gestionLead.datos_extraidos.email;
            if ((_a = gestionLead.actualizaciones_estado) === null || _a === void 0 ? void 0 : _a.estado)
                updates.status = gestionLead.actualizaciones_estado.estado;
            if (Object.keys(updates).length > 0) {
                await leadRef.update(updates);
                console.log(`Lead actualizado con:`, updates);
            }
        }
    }
    else {
        // Lead NO existe - SIEMPRE crear uno nuevo en primer contacto
        const nombreExtraido = ((_b = gestionLead.datos_extraidos) === null || _b === void 0 ? void 0 : _b.nombre) || null;
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
        console.log(`✅ Nuevo lead creado automáticamente: ${leadId} para teléfono ${telefono}`);
    }
    return { leadId, leadRef };
}
exports.receiveWhatsapp = functions.https.onRequest(async (req, res) => {
    var _a;
    const db = admin.firestore();
    const body = req.body;
    console.log("INCOMING WEBHOOK:", JSON.stringify(body));
    // Maytapi webhook structure: { type: "message", message: {...}, conversation: {...}, user: {...} }
    if (body.type !== "message") {
        console.log("Not a message event, ignoring");
        res.sendStatus(200);
        return;
    }
    // Extract message data from Maytapi payload
    const message = body.message;
    const conversation = body.conversation;
    const user = body.user;
    if (!message || message.type !== "text") {
        console.log("Not a text message, ignoring");
        res.sendStatus(200);
        return;
    }
    const from = ((_a = conversation === null || conversation === void 0 ? void 0 : conversation.id) === null || _a === void 0 ? void 0 : _a.split("@")[0]) || (user === null || user === void 0 ? void 0 : user.phone);
    const text = message.text;
    if (!from || !text) {
        console.log("Missing from or text");
        res.sendStatus(200);
        return;
    }
    console.log(`Message from ${from}: ${text}`);
    const chatId = `chat_${from}`;
    const chatRef = db.collection("chats").doc(chatId);
    try {
        await db.runTransaction(async (t) => {
            const doc = await t.get(chatRef);
            const now = Date.now();
            let currentBuffer = [];
            if (doc.exists) {
                const data = doc.data();
                currentBuffer = (data === null || data === void 0 ? void 0 : data.buffer) || [];
            }
            currentBuffer.push(text);
            t.set(chatRef, {
                buffer: currentBuffer,
                lastMessageTime: now,
                processing: false
            }, { merge: true });
        });
        await new Promise(resolve => setTimeout(resolve, 3500));
        const docAfterWait = await chatRef.get();
        const data = docAfterWait.data();
        if (Date.now() - ((data === null || data === void 0 ? void 0 : data.lastMessageTime) || 0) < 3000) {
            console.log("Buffer activo: Abortando ejecución, hay un mensaje más reciente.");
            res.sendStatus(200);
            return;
        }
        if (!(data === null || data === void 0 ? void 0 : data.processing) && (data === null || data === void 0 ? void 0 : data.buffer) && data.buffer.length > 0) {
            await chatRef.update({ processing: true });
            const fullText = data.buffer.join(" . ");
            const historySnapshot = await chatRef.collection("history")
                .orderBy("timestamp", "desc")
                .limit(10).get();
            const history = historySnapshot.docs.map(d => {
                const data = d.data();
                const role = data.role === 'user' ? 'CLIENTE' : 'VENDEDOR (TÚ)';
                return `${role}: ${data.content}`;
            }).reverse();
            const inventario = await obtenerInventarioActualizado();
            const response = await (0, genkitFlow_1.ejecutarCerebroVentas)({
                datos_lead: (data === null || data === void 0 ? void 0 : data.leadData) || "NO_EXISTE",
                historial_chat: history,
                inventario: inventario,
                mensaje_actual: fullText,
                contexto_origen: (data === null || data === void 0 ? void 0 : data.contexto_origen) || null
            });
            // Gestionar lead (crear/actualizar en CRM)
            const leadResult = await gestionarLead(db, from, response.gestion_lead, chatId);
            // 2. Gestionar acciones especiales (Tareas, Notas, Tasación)
            let finalMessage = response.respuesta_cliente.mensaje_whatsapp;
            const accion = response.respuesta_cliente.accion_sugerida_app;
            if (leadResult && leadResult.leadId) {
                // TASACIÓN: Generar link (placeholder por ahora)
                if (accion === "ENVIAR_TASACION") {
                    const tradeInLink = `https://copiloto-crm-1764216245.web.app/public/trade-in?leadId=${leadResult.leadId}`;
                    finalMessage += `\n\n📝 Completá los datos de tu vehículo aquí: ${tradeInLink}`;
                }
                // TAREA: "Llamar el viernes"
                if (accion === "CREAR_TAREA") {
                    await db.collection("tasks").add({
                        title: `Seguimiento WhatsApp: ${leadResult.leadId}`,
                        description: `El cliente pidió: "${fullText}"`,
                        status: "Pending",
                        priority: "Medium",
                        dueDate: admin.firestore.Timestamp.now(),
                        leadId: leadResult.leadId,
                        assignedTo: "bot",
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    console.log("✅ Tarea creada para el lead:", leadResult.leadId);
                }
                // NOTA: Información relevante
                if (accion === "CREAR_NOTA" || accion === "CREAR_TAREA") {
                    const noteRef = db.collection("leads").doc(leadResult.leadId).collection("notes");
                    await noteRef.add({
                        content: `🤖 Nota IA: ${response.razonamiento}`,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        author: "Copiloto Bot"
                    });
                }
            }
            // 3. Preparar URLs de medios (compatibilidad con single y array)
            let mediaUrlsToSend = [];
            if (response.respuesta_cliente.media_urls) {
                mediaUrlsToSend = response.respuesta_cliente.media_urls;
            }
            else if (response.respuesta_cliente.media_url) {
                mediaUrlsToSend = [response.respuesta_cliente.media_url];
            }
            // 4. Enviar respuesta final
            await enviarMensajeWhatsApp(from, finalMessage, mediaUrlsToSend.length > 0 ? mediaUrlsToSend : null);
            const batch = db.batch();
            // Guardar mensaje del usuario en historial del chat
            const userMsgRef = chatRef.collection("history").doc();
            batch.set(userMsgRef, {
                role: "user",
                content: fullText,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            // Guardar respuesta del bot
            const botMsgRef = chatRef.collection("history").doc();
            batch.set(botMsgRef, {
                role: "assistant",
                content: finalMessage,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                metadata: response,
                mediaUrls: mediaUrlsToSend
            });
            // Vincular chat con lead si existe
            const chatUpdates = {
                buffer: [],
                processing: false
            };
            if (leadResult) {
                chatUpdates.leadId = leadResult.leadId;
            }
            batch.update(chatRef, chatUpdates);
            await batch.commit();
        }
    }
    catch (error) {
        console.error("Error en flujo WhatsApp:", error);
        if (from) {
            await enviarMensajeWhatsApp(from, `Error: ${error.message}`);
        }
    }
    res.sendStatus(200);
});
//# sourceMappingURL=whatsappReceiver.js.map