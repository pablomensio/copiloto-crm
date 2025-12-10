import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import { ejecutarCerebroVentas } from "./genkitFlow";

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
        imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || null
      };
    });
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return [];
  }
}

export async function enviarMensajeWhatsApp(
  to: string,
  message: string,
  mediaUrl?: string | null
) {
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

    // Si hay mediaUrl, enviamos primero la imagen y luego el texto
    if (mediaUrl) {
      // Enviar imagen
      await axios.post(url, {
        to_number: to,
        type: "media",
        message: mediaUrl
      }, { headers });

      // Pequeño delay para que llegue en orden
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Enviar mensaje de texto
    await axios.post(url, {
      to_number: to,
      type: "text",
      message: message
    }, { headers });

  } catch (error: any) {
    console.error("Error enviando mensaje a WhatsApp (Maytapi):", error.response?.data || error.message);
  }
}

// Buscar o crear lead por teléfono
async function gestionarLead(
  db: admin.firestore.Firestore,
  telefono: string,
  gestionLead: any,
  chatId: string
) {
  const leadsRef = db.collection("leads");

  // Buscar lead existente por teléfono
  const existingLeadQuery = await leadsRef.where("phone", "==", telefono).limit(1).get();

  let leadId: string;
  let leadRef: admin.firestore.DocumentReference;

  if (!existingLeadQuery.empty) {
    // Lead ya existe
    leadRef = existingLeadQuery.docs[0].ref;
    leadId = leadRef.id;
  } else if (gestionLead.accion_lead === "CREAR" || gestionLead.accion_lead === "ACTUALIZAR") {
    // Crear nuevo lead
    const nuevoLead = {
      phone: telefono,
      name: gestionLead.datos_extraidos?.nombre || "Sin nombre",
      status: gestionLead.actualizaciones_estado?.estado || "NUEVO",
      interestLevel: "Medium",
      budget: 0,
      interestedVehicleId: "",
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(gestionLead.datos_extraidos?.nombre || "Cliente")}&background=random`,
      history: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "WhatsApp",
      chatId: chatId
    };
    leadRef = await leadsRef.add(nuevoLead);
    leadId = leadRef.id;
    console.log(`Nuevo lead creado: ${leadId}`);
  } else {
    // No hay acción de lead, retornar null
    return null;
  }

  // Actualizar datos si hay información nueva
  if (gestionLead.accion_lead === "ACTUALIZAR" && gestionLead.datos_extraidos) {
    const updates: any = {};
    if (gestionLead.datos_extraidos.nombre) updates.name = gestionLead.datos_extraidos.nombre;
    if (gestionLead.datos_extraidos.email) updates.email = gestionLead.datos_extraidos.email;
    if (gestionLead.actualizaciones_estado?.estado) updates.status = gestionLead.actualizaciones_estado.estado;
    if (Object.keys(updates).length > 0) {
      await leadRef.update(updates);
    }
  }

  return { leadId, leadRef };
}

export const receiveWhatsapp = functions.https.onRequest(async (req, res) => {
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

  const from = conversation?.id?.split("@")[0] || user?.phone;
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

    await new Promise(resolve => setTimeout(resolve, 3500));

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

      const historySnapshot = await chatRef.collection("history")
        .orderBy("timestamp", "desc")
        .limit(10).get();
      const history = historySnapshot.docs.map(d => {
        const data = d.data();
        const role = data.role === 'user' ? 'CLIENTE' : 'VENDEDOR (TÚ)';
        return `${role}: ${data.content}`;
      }).reverse();

      const inventario = await obtenerInventarioActualizado();

      const response = await ejecutarCerebroVentas({
        datos_lead: data?.leadData || "NO_EXISTE",
        historial_chat: history,
        inventario: inventario,
        mensaje_actual: fullText,
        contexto_origen: data?.contexto_origen || null
      });

      // Gestionar lead (crear/actualizar en CRM)
      const leadResult = await gestionarLead(
        db,
        from,
        response.gestion_lead,
        chatId
      );

      // Enviar respuesta con foto si la IA la incluyó
      await enviarMensajeWhatsApp(
        from,
        response.respuesta_cliente.mensaje_whatsapp,
        response.respuesta_cliente.media_url
      );

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
        content: response.respuesta_cliente.mensaje_whatsapp,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: response,
        mediaUrl: response.respuesta_cliente.media_url || null
      });

      // Vincular chat con lead si existe
      const chatUpdates: any = {
        buffer: [],
        processing: false
      };
      if (leadResult) {
        chatUpdates.leadId = leadResult.leadId;
      }
      batch.update(chatRef, chatUpdates);

      await batch.commit();
    }

  } catch (error: any) {
    console.error("Error en flujo WhatsApp:", error);
    if (from) {
      await enviarMensajeWhatsApp(from, `Error: ${error.message}`);
    }
  }

  res.sendStatus(200);
});
