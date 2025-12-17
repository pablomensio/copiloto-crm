import * as functions from "firebase-functions";
// import * as admin from "firebase-admin"; // Removed unused
import { processIncomingMessage } from "./messageHandler";

export const receiveWhatsapp = functions.https.onRequest(async (req, res) => {
  const body = req.body;

  console.log("INCOMING WEBHOOK (MAYTAPI):", JSON.stringify(body));

  if (body.type !== "message") {
    console.log("Not a message event, ignoring");
    res.sendStatus(200);
    return;
  }

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

  // Maytapi doesn't always provide sender name in the message payload cleanly, 
  // sometimes it's in user.name or conversation.name.
  // We'll try to extract it from user object if available.
  const senderName = user?.name || user?.phone || "Desconocido";

  if (!from || !text) {
    console.log("Missing from or text");
    res.sendStatus(200);
    return;
  }

  await processIncomingMessage(from, text, senderName);
  res.sendStatus(200);
});
