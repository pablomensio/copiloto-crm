import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import { cerebroVentas } from "./genkitFlow"; // Ya no se importa directamente
import axios from 'axios'; // Para hacer la llamada HTTP

const db = admin.firestore();

// TODO: ESTA URL DEBE SER LA DE LA FUNCIÓN 'cerebroVentas' UNA VEZ DESPLEGADA.
// La encontrarás en la consola de Firebase o en los logs de despliegue.
const CEREBRO_VENTAS_FUNCTION_URL = process.env.CEREBRO_VENTAS_URL || "YOUR_CEREBRO_VENTAS_FUNCTION_URL_HERE";

// Helpers simulados (Implementar con lógica real)
async function obtenerInventarioActualizado() {
    // TODO: Implementar lectura real de Firestore de tu colección de vehículos
    // Ejemplo: db.collection("vehicles").where("active", "==", true).get()
    return [
        { id: "FIA-CRO-001", modelo: "Fiat Cronos Precision", año: 2023, precio: 21500000, url_web: "https://tucar.com/fiat-cronos" },
        { id: "FOR-FOC-99", modelo: "Ford Focus SE", año: 2017, precio: 14000000, url_web: "https://tucar.com/ford-focus" }
    ];
}

async function enviarMensajeWhatsApp(to: string, message: string) {
    // TODO: Implementar llamada real a la API de Meta para enviar mensajes
    // Necesitarás tu TOKEN DE ACCESO (Access Token) permanente.
    console.log(`[WHATSAPP MOCK] Enviando a ${to}: "${message}"`);
}

export const receiveWhatsapp = functions.https.onRequest(async (req, res) => {
  const body = req.body;
  
  // 1. Verificación básica del Webhook de Meta (Challenge)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    
    if (mode === "subscribe" && token === "copiloto_token_seguro_2024") { // Usar tu token real
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
    res.sendStatus(200); // Ignoramos estados, fotos por ahora, etc.
    return;
  }

  const from = message.from; // Número del cliente
  const text = message.text.body;
  const chatId = `chat_${from}`;
  const chatRef = db.collection("chats").doc(chatId);

  // 3. ESTRATEGIA DE BUFFER (DEBOUNCE)
  try {
    let fullText = ""; // Declarar fuera del if para scope

    await db.runTransaction(async (t) => {
      const doc = await t.get(chatRef);
      const now = Date.now();
      
      let currentBuffer: string[] = [];
      let leadData: any = null; // Inicializar leadData
      let historialChat: string[] = []; // Inicializar historial
      let contextoOrigen: string | null = null; // Inicializar contexto

      if (doc.exists) {
        const data = doc.data();
        currentBuffer = data?.buffer || [];
        leadData = data?.leadData || "NO_EXISTE";
        historialChat = data?.historial_chat || []; // Asumir que también guardas el historial aquí
        contextoOrigen = data?.contexto_origen || null;
      }

      currentBuffer.push(text);

      t.set(chatRef, {
        buffer: currentBuffer,
        lastMessageTime: now,
        processing: false, // Reset processing flag for new message
        leadData: leadData,
        historial_chat: historialChat, 
        contexto_origen: contextoOrigen
      }, { merge: true });
    });

    // 4. ESPERA DE SEGURIDAD (3.5s)
    await new Promise(resolve => setTimeout(resolve, 3500));

    // 5. VERIFICACIÓN FINAL Y EJECUCIÓN
    const docAfterWait = await chatRef.get();
    const data = docAfterWait.data();
    
    // Si ha pasado menos de 3s desde el ÚLTIMO mensaje registrado en la DB,
    // significa que entró otro mensaje mientras esperábamos. ABORTAMOS esta ejecución.
    if (Date.now() - (data?.lastMessageTime || 0) < 3000) { // Usar 3000ms para comparación con 3.5s de espera
      console.log("Buffer activo: Abortando ejecución, hay un mensaje más reciente.");
      res.sendStatus(200);
      return;
    }

    // Si llegamos acá, hubo silencio por 3.5 segundos. ¡PROCESAMOS!
    if (!data?.processing && data?.buffer && data.buffer.length > 0) {
      // Marcamos como procesando para evitar condiciones de carrera
      await chatRef.update({ processing: true });

      // Unimos los mensajes: "Hola . Precio . Del Cronos"
      fullText = data.buffer.join(" . "); // Asignar a la variable fullText declarada arriba

      // Obtenemos historial real para pasarle contexto
      const historySnapshot = await chatRef.collection("history")
                                           .orderBy("timestamp", "desc")
                                           .limit(10).get();
      const history = historySnapshot.docs.map(d => d.data().content).reverse();

      // --- LLAMADA AL CEREBRO (GENKIT VIA HTTP) ---
      // Se envía una petición POST a la Cloud Function cerebroVentas
      if (!CEREBRO_VENTAS_FUNCTION_URL || CEREBRO_VENTAS_FUNCTION_URL === "YOUR_CEREBRO_VENTAS_FUNCTION_URL_HERE") {
          console.error("CEREBRO_VENTAS_FUNCTION_URL no configurada.");
          await chatRef.update({ processing: false, buffer: data.buffer }); // Dejar buffer sin limpiar para reintento
          res.sendStatus(500);
          return;
      }

      const genkitResponse = await axios.post(CEREBRO_VENTAS_FUNCTION_URL, {
          datos_lead: data?.leadData || "NO_EXISTE",
          historial_chat: history, 
          inventario: await obtenerInventarioActualizado(), // Tu función auxiliar
          mensaje_actual: fullText,
          contexto_origen: data?.contexto_origen || null
      });

      const response = genkitResponse.data; // La respuesta real del flujo de Genkit

      // Guardamos respuesta, limpiamos buffer y enviamos a Meta
      await enviarMensajeWhatsApp(from, response.respuesta_cliente.mensaje_whatsapp);
      
      // Guardamos en historial y limpiamos buffer en una sola batch
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

      // Limpiamos buffer y reseteamos processing flag
      batch.update(chatRef, { 
        buffer: [], 
        processing: false
      });

      await batch.commit();
    }

  } catch (error) {
    console.error("Error en flujo WhatsApp:", error);
    // En caso de error, asegurarnos de resetear el flag de processing
    if (chatRef) {
        await chatRef.update({ processing: false });
    }
    res.sendStatus(500); // Responder con error si algo falla
    return;
  }

  res.sendStatus(200); // Éxito si no hubo errores antes
});
