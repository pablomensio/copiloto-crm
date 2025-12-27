import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { enviarMensajeAlAgente } from "./agentClient";
import { obtenerInventarioActualizado } from "./messageHandler";
// Cargar variables de entorno si existen en .env local (Solo dev)
// import * as dotenv from 'dotenv';
// dotenv.config();

export const webChat = onRequest({
    cors: true,
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 60
}, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    const { message, sessionId } = req.body;

    // Validar mensaje
    if (!message || !message.trim()) {
        res.status(400).json({ error: "Missing message" });
        return;
    }

    const db = admin.firestore();
    const chatId = sessionId || `web_${Date.now()}`;
    const chatRef = db.collection("web_chats").doc(chatId);

    try {
        // Inicializar chat si no existe
        const chatDoc = await chatRef.get();
        let historialTexto = "";

        if (!chatDoc.exists) {
            await chatRef.set({
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Obtener breve historial para contexto
            const historySnapshot = await chatRef.collection("history")
                .orderBy("timestamp", "desc")
                .limit(5)
                .get();

            historialTexto = historySnapshot.docs
                .map(d => `${d.data().role}: ${d.data().content}`)
                .reverse()
                .join("\n");
        }

        // 1. Obtener inventario actualizado de Firestore
        const inventario = await obtenerInventarioActualizado();

        // 2. Crear resumen de inventario optimizado para el contexto
        // Limitamos a texto simple para no saturar el payload de Dialogflow
        const resumenInventario = inventario
            .map(v => `- ${v.modelo} (${v.año || 'N/A'}) - $${v.precio || 'Consultar'}`)
            .slice(0, 20) // Top 20 autos más recientes/relevantes
            .join("\n");

        console.log(`[WEB_CHAT] Enviando a Vertex Agent. LeadsId: ${chatId}. Inventario: ${inventario.length} items.`);

        // 3. Llamar al Agente (Dialogflow CX)
        // Pasamos el inventario como 'contexto_inventario' en los parámetros
        const agenteResponse = await enviarMensajeAlAgente(chatId, message, {
            nombre: "Cliente Web",
            telefono: "N/A",
            historial: historialTexto,
            inventario_disponible: inventario.length,
            inventario_resumen: resumenInventario
            // Nota: Debes asegurarte de recibir 'inventario_resumen' en agentClient.ts
        });

        // 4. Guardar respuesta en Firestore
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
            content: agenteResponse.mensaje,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            raw: JSON.stringify(agenteResponse.raw) // Guardar raw para debug
        });

        await batch.commit();

        res.json({
            response: agenteResponse.mensaje,
            sessionId: chatId
        });

    } catch (error: any) {
        console.error("[WEB_CHAT] Error crítico:", error);

        // AUTO-HEALING: Si el error es por Token Limit, reintentamos con nueva sesión limpia
        if (error.message && (error.message.includes("Token limit") || error.message.includes("FAILED_PRECONDITION"))) {
            console.warn(`[AUTO-HEAL] Token limit exceeded for ${chatId}. Retrying with FRESH session.`);

            try {
                const newSessionId = `web_recovered_${Date.now()}`;

                // Reintento con inventario mínimo y sin historial
                const inventario = await obtenerInventarioActualizado();
                const resumenMinimo = inventario
                    .slice(0, 10)
                    .map(v => `${v.modelo} $${v.precio || '?'}`)
                    .join("; ");

                const retryResponse = await enviarMensajeAlAgente(
                    newSessionId,
                    message,
                    {
                        nombre: "Cliente Web",
                        telefono: "N/A",
                        historial: "", // Sin historial antiguo
                        inventario_resumen: resumenMinimo,
                        inventario_disponible: inventario.length
                    }
                );

                res.status(200).json({
                    response: retryResponse.mensaje,
                    sessionId: newSessionId // Nuevo ID para que el cliente lo use
                });
                return;
            } catch (retryError: any) {
                console.error("[AUTO-HEAL] Retry also failed:", retryError);
            }
        }

        // Respuesta fallback con DEBUG para ver el error real en el chat
        res.status(200).json({
            response: `🔴 ERROR TÉCNICO: ${error.message} (Código: ${error.code || 'N/A'})`,
            sessionId: chatId
        });
    }
});
