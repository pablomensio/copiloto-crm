import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { cerebroVentas } from "./genkitFlow";

const db = admin.firestore();

// Helpers simulados (Implementar con lógica real)
async function obtenerInventarioActualizado() {
    // TODO: Implementar lectura real de Firestore
    return [
        { id: "FIA-CRO-001", modelo: "Fiat Cronos Precision", año: 2023, precio: 21500000 },
        { id: "FOR-FOC-99", modelo: "Ford Focus SE", año: 2017, precio: 14000000 }
    ];
}

async function enviarMensajeWhatsApp(to: string, message: string) {
    // TODO: Implementar llamada a API de Meta
    console.log(`[WHATSAPP MOCK] Enviando a ${to}: "${message}"`);
}

export const receiveWhatsapp = functions.https.onRequest(async (req, res) => {
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
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

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
      
      let currentBuffer: string[] = [];
      if (doc.exists) {
        const data = doc.data();
        currentBuffer = data?.buffer || [];
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
    
    if (Date.now() - (data?.lastMessageTime || 0) < 3000) {
      console.log("Buffer activo: Abortando ejecución, hay un mensaje más reciente.");
      res.sendStatus(200);
      return;
    }

    if (!data?.processing && data?.buffer && data.buffer.length > 0) {
      await chatRef.update({ processing: true });

      const fullText = data.buffer.join(" . "); 

      // Obtener historial
      const historySnapshot = await chatRef.collection("history")
                                           .orderBy("timestamp", "desc")
                                           .limit(10).get();
      const history = historySnapshot.docs.map(d => d.data().content).reverse();

      // Invocamos el flujo Genkit
      const response = await cerebroVentas({
        datos_lead: data?.leadData || "NO_EXISTE",
        historial_chat: history, 
        inventario: await obtenerInventarioActualizado(),
        mensaje_actual: fullText,
        contexto_origen: data?.contexto_origen || null
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

  } catch (error) {
    console.error("Error en flujo WhatsApp:", error);
  }

  res.sendStatus(200);
});
