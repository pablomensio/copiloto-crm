import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { ejecutarCerebroVentas } from "./genkitFlow";
import { obtenerInventarioActualizado } from "./messageHandler";

export const webChat = onRequest({ cors: true, region: "us-central1" }, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    const { message, sessionId } = req.body;

    if (!message) {
        res.status(400).json({ error: "Missing message" });
        return;
    }

    // DEBUG: Verificar API KEY de Gemini (no imprimir valor completo por seguridad)
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    console.log("[DEBUG ENV] API_KEY_PRESENT:", !!apiKey);

    // Si no hay API KEY, intentar cargarla de config (fallback)
    if (!apiKey) {
        console.warn("[DEBUG ENV] WARNING: No API Key in env vars. Check GOOGLE_GENAI_API_KEY");
    }

    const db = admin.firestore();
    const chatId = sessionId || `web_${Date.now()}`;
    const chatRef = db.collection("web_chats").doc(chatId);

    try {
        // Inicializar chat si no existe
        const chatDoc = await chatRef.get();
        if (!chatDoc.exists) {
            await chatRef.set({
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // 1. Obtener historial para el contexto
        const historySnapshot = await chatRef.collection("history")
            .orderBy("timestamp", "desc")
            .limit(15)
            .get();

        // Formato esperado por CerebroVentasInput: string[] con "Rol: mensaje"
        const historialChat = historySnapshot.docs
            .map(d => {
                const data = d.data();
                const role = data.role === 'user' ? 'CLIENTE' : 'VENDEDOR';
                return `${role}: ${data.content}`;
            })
            .reverse();

        // 2. Obtener inventario actualizado
        const inventario = await obtenerInventarioActualizado();
        console.log(`[WEB_CHAT] Inventario cargado: ${inventario.length} vehículos`);

        // 3. Ejecutar cerebro (Gemini directo)
        // Nota: ejecutarCerebroVentas devuelve un objeto estructurado (CopilotoOutputSchema)
        const cerebroOutput = await ejecutarCerebroVentas({
            mensaje_actual: message,
            historial_chat: historialChat,
            inventario: inventario,
            datos_lead: { telefono: "web_client" }, // Placeholder para web
            contexto_origen: "WEB_LANDING"
        });

        // 4. Extraer respuesta textual
        const respuestaTexto = cerebroOutput.respuesta_cliente.mensaje_whatsapp;
        const razonamiento = cerebroOutput.razonamiento; // Útil para debug

        console.log(`[WEB_CHAT] Respuesta Gemini:`, respuestaTexto);
        console.log(`[WEB_CHAT] Razonamiento:`, razonamiento);

        // 5. Guardar en historial
        const batch = db.batch();
        await chatRef.update({ lastMessageAt: admin.firestore.FieldValue.serverTimestamp() });

        const userMsgRef = chatRef.collection("history").doc();
        batch.set(userMsgRef, {
            role: "user",
            content: message,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        const botMsgRef = chatRef.collection("history").doc();
        batch.set(botMsgRef, {
            role: "assistant",
            content: respuestaTexto,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            metadata: cerebroOutput // Guardamos todo el análisis por si queremos ver las acciones detectadas después
        });

        await batch.commit();

        res.json({
            response: respuestaTexto,
            sessionId: chatId,
            debug: { // Opcional: devolver data extra para debug en consola del browser
                intent: cerebroOutput.analisis_conversacional.intencion_detectada,
                action: cerebroOutput.respuesta_cliente.accion_sugerida_app
            }
        });

    } catch (error: any) {
        console.error("[WEB_CHAT] Error:", error);
        res.status(500).json({
            error: "Error procesando mensaje",
            response: "Disculpá, tuve un problema interno. Intentá de nuevo."
        });
    }
});
