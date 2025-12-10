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
        imageUrl: data.imageUrl || (data.imageUrls && data.imageUrls[0]) || null,
        imageUrls: data.imageUrls || [] // Agregamos lista completa para carrusel
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
  mediaUrls?: string[] | null
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

    // Si hay mediaUrls, enviamos cada imagen
    if (mediaUrls && mediaUrls.length > 0) {
      for (const mediaUrl of mediaUrls) {
        await axios.post(url, {
          to_number: to,
          type: "media",
          message: mediaUrl
        }, { headers });
        // Delay para evitar rate limits o desorden
        await new Promise(resolve => setTimeout(resolve, 800));
      }
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
    // Lead ya existe - actualizar si hay datos nuevos
    leadRef = existingLeadQuery.docs[0].ref;
    leadId = leadRef.id;
    console.log(`Lead existente encontrado: ${leadId}`);

    // Actualizar con datos extraídos si los hay
    if (gestionLead.datos_extraidos) {
      const updates: any = {};
      if (gestionLead.datos_extraidos.nombre) updates.name = gestionLead.datos_extraidos.nombre;
      if (gestionLead.datos_extraidos.email) updates.email = gestionLead.datos_extraidos.email;
      if (gestionLead.actualizaciones_estado?.estado) updates.status = gestionLead.actualizaciones_estado.estado;
      if (Object.keys(updates).length > 0) {
        await leadRef.update(updates);
        console.log(`Lead actualizado con:`, updates);
      }
    }
  } else {
    // Lead NO existe - SIEMPRE crear uno nuevo en primer contacto
    const nombreExtraido = gestionLead.datos_extraidos?.nombre || null;
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
          const taskId = db.collection("tasks").doc().id;
          const now = new Date().toISOString();
          await db.collection("tasks").doc(taskId).set({
            id: taskId,
            title: `Seguimiento WhatsApp: ${fullText.substring(0, 50)}...`,
            description: `El cliente pidió: "${fullText}"`,
            date: now, // ISO string, no Timestamp
            isCompleted: false,
            priority: "Medium",
            type: "FollowUp",
            relatedLeadId: leadResult.leadId
          });

          // Agregar al history del lead
          await leadResult.leadRef.update({
            history: admin.firestore.FieldValue.arrayUnion({
              id: `task_${taskId}`,
              type: "note",
              date: now,
              notes: `🤖 Tarea creada: ${fullText}`,
              details: response.razonamiento
            })
          });

          console.log("✅ Tarea creada para el lead:", leadResult.leadId);
        }

        // NOTA: Información relevante
        if (accion === "CREAR_NOTA") {
          const now = new Date().toISOString();
          // Agregar al history del lead
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
      }

      // 3. Preparar URLs de medios (compatibilidad con single y array)
      let mediaUrlsToSend: string[] = [];
      if (response.respuesta_cliente.media_urls) {
        mediaUrlsToSend = response.respuesta_cliente.media_urls;
      } else if (response.respuesta_cliente.media_url) {
        mediaUrlsToSend = [response.respuesta_cliente.media_url];
      }

      // 4. Enviar respuesta final
      await enviarMensajeWhatsApp(
        from,
        finalMessage,
        mediaUrlsToSend.length > 0 ? mediaUrlsToSend : null
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
        content: finalMessage,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: response,
        mediaUrls: mediaUrlsToSend
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
