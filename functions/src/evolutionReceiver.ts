import * as functions from "firebase-functions";
import { processIncomingMessage } from "./messageHandler";

export const receiveEvolution = functions.https.onRequest(async (req, res) => {
    const body = req.body;
    console.log("INCOMING WEBHOOK (EVOLUTION):", JSON.stringify(body));

    // Validation: Check global webhook or instance webhook signature if configured
    // For now we accept open webhook assuming URL is secret or authenticated by API Gateway/Firebase

    // const eventType = body.type || body.event;
    console.log("Event Type:", body.type || body.event);

    // Evolution API v2 events usually are like "MESSAGES_UPSERT", "MESSAGES_UPDATE"
    // For v1 it might be different. Let's handle the common "messages.upsert" or similar.

    // We are interested in new messages.
    // Payload structure depends on version. Typically:
    // { type: "messages.upsert", data: { ... } } or just the data.

    // Let's assume v2 format from research:
    const data = body.data;

    if (!data || !data.key || data.key.fromMe) {
        // Ignore updates or messages sent by me
        res.sendStatus(200);
        return;
    }

    const messageType = data.messageType;
    // We support text and simple conversation, or extendedTextMessage

    let text = "";
    if (messageType === "conversation") {
        text = data.message?.conversation;
    } else if (messageType === "extendedTextMessage") {
        text = data.message?.extendedTextMessage?.text;
    } else {
        // Check if it has a caption (image/video)
        text = data.message?.imageMessage?.caption || data.message?.videoMessage?.caption || "";
    }

    if (!text) {
        console.log("No text content found in Evolution message");
        res.sendStatus(200);
        return;
    }

    const remoteJid = data.key.remoteJid; // e.g., "5491112345678@s.whatsapp.net"
    const from = remoteJid.split("@")[0];
    const pushName = data.pushName || "Cliente WhatsApp";

    // Call the shared handler
    await processIncomingMessage(from, text, pushName);

    res.sendStatus(200);
});
