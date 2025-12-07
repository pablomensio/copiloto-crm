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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveWhatsapp = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const genkitFlow_1 = require("./genkitFlow");
const db = admin.firestore();
// Helpers simulados (Implementar con lógica real)
async function obtenerInventarioActualizado() {
    // TODO: Implementar lectura real de Firestore
    return [
        { id: "FIA-CRO-001", modelo: "Fiat Cronos Precision", año: 2023, precio: 21500000 },
        { id: "FOR-FOC-99", modelo: "Ford Focus SE", año: 2017, precio: 14000000 }
    ];
}
async function enviarMensajeWhatsApp(to, message) {
    // TODO: Implementar llamada a API de Meta
    console.log(`[WHATSAPP MOCK] Enviando a ${to}: "${message}"`);
}
exports.receiveWhatsapp = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c;
    const body = req.body;
    // 1. Verificación básica del Webhook de Meta (Challenge)
    if (req.method === "GET") {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        // Reemplaza 'TU_VERIFY_TOKEN' con tu token real
        if (mode === "subscribe" && token === "TU_VERIFY_TOKEN") {
            res.status(200).send(challenge);
            return;
        }
        res.sendStatus(403);
        return;
    }
    // 2. Procesar Mensaje Entrante
    const entry = (_a = body.entry) === null || _a === void 0 ? void 0 : _a[0];
    const changes = (_b = entry === null || entry === void 0 ? void 0 : entry.changes) === null || _b === void 0 ? void 0 : _b[0];
    const value = changes === null || changes === void 0 ? void 0 : changes.value;
    const message = (_c = value === null || value === void 0 ? void 0 : value.messages) === null || _c === void 0 ? void 0 : _c[0];
    if (!message || message.type !== "text") {
        res.sendStatus(200);
        return;
    }
    const from = message.from;
    const text = message.text.body;
    const chatId = `chat_${from}`;
    const chatRef = db.collection("chats").doc(chatId);
    // 3. ESTRATEGIA DE BUFFER (DEBOUNCE)
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
        // 4. ESPERA DE SEGURIDAD
        await new Promise(resolve => setTimeout(resolve, 3500));
        // 5. VERIFICACIÓN FINAL Y EJECUCIÓN
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
            // Obtener historial
            const historySnapshot = await chatRef.collection("history")
                .orderBy("timestamp", "desc")
                .limit(10).get();
            const history = historySnapshot.docs.map(d => d.data().content).reverse();
            // Invocamos el flujo Genkit
            const response = await (0, genkitFlow_1.cerebroVentas)({
                datos_lead: (data === null || data === void 0 ? void 0 : data.leadData) || "NO_EXISTE",
                historial_chat: history,
                inventario: await obtenerInventarioActualizado(),
                mensaje_actual: fullText,
                contexto_origen: (data === null || data === void 0 ? void 0 : data.contexto_origen) || null
            });
            // Enviamos respuesta
            await enviarMensajeWhatsApp(from, response.respuesta_cliente.mensaje_whatsapp);
            // Guardamos en historial
            const batch = db.batch();
            // Mensaje usuario
            const userMsgRef = chatRef.collection("history").doc();
            batch.set(userMsgRef, {
                role: "user",
                content: fullText,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            // Mensaje bot
            const botMsgRef = chatRef.collection("history").doc();
            batch.set(botMsgRef, {
                role: "assistant",
                content: response.respuesta_cliente.mensaje_whatsapp,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                metadata: response // Guardamos todo el análisis para debug
            });
            // Limpiamos buffer
            batch.update(chatRef, {
                buffer: [],
                processing: false
            });
            await batch.commit();
        }
    }
    catch (error) {
        console.error("Error en flujo WhatsApp:", error);
    }
    res.sendStatus(200);
});
//# sourceMappingURL=whatsappReceiver.js.map