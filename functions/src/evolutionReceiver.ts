import * as functions from "firebase-functions";
import { processIncomingMessage } from "./messageHandler";

export const receiveEvolution = functions.https.onRequest(async (req, res) => {
    const body = req.body;
    console.log("INCOMING WEBHOOK HEADERS:", JSON.stringify(req.headers));
    console.log("INCOMING WEBHOOK BODY (JSON):", JSON.stringify(body));

    // Debug raw body if needed (Firebase sometimes parses it automatically)
    // console.log("Raw Body Type:", typeof body);

    // const eventType = body.type || body.event;
    console.log("Event Type:", body.type || body.event);

    // Evolution API v2 events usually are like "MESSAGES_UPSERT", "MESSAGES_UPDATE"
    // For v1 it might be different. Let's handle the common "messages.upsert" or similar.

    // We are interested in new messages.
    // Payload structure depends on version. Typically:
    // { type: "messages.upsert", data: { ... } } or just the data.

    // Let's assume v2 format from research:
    const data = body.data;
    const instance = body.instance;

    console.log(`[EVOLUTION] Instance: ${instance} | Event: ${body.event}`);

    if (!data || !data.key) {
        console.log("[DEBUG] Rejecting: no data or key");
        res.sendStatus(200);
        return;
    }

    // CRITICAL: fromMe check. We ONLY ignore if fromMe is explicitly true.
    // If it's false or undefined (coming from others), we process.
    if (data.key.fromMe === true) {
        console.log("[DEBUG] Ignoring message sent by the bot (fromMe=true)");
        res.sendStatus(200);
        return;
    }

    // WhatsApp now uses @lid format, the real number is in remoteJidAlt
    let remoteJid = data.key.remoteJid;

    // If it's the new @lid format, use remoteJidAlt instead
    if (remoteJid && remoteJid.includes('@lid')) {
        console.log(`[EVOLUTION] Detected @lid format, using remoteJidAlt`);
        remoteJid = data.key.remoteJidAlt || remoteJid;
    }

    if (!remoteJid || remoteJid.includes('@g.us')) {
        console.log("[DEBUG] Ignoring group or invalid JID:", remoteJid);
        res.sendStatus(200);
        return;
    }

    const messageType = data.messageType;
    let text = "";
    if (messageType === "conversation") {
        text = data.message?.conversation;
    } else if (messageType === "extendedTextMessage") {
        text = data.message?.extendedTextMessage?.text;
    } else {
        text = data.message?.imageMessage?.caption || data.message?.videoMessage?.caption || "";
    }

    const from = remoteJid.split("@")[0];
    const pushName = data.pushName || body.sender || "Cliente WhatsApp";

    console.log(`[EVOLUTION] Processing message from ${from} (${pushName}): "${text}"`);

    try {
        await processIncomingMessage(from, text, pushName);
        console.log(`[EVOLUTION] processIncomingMessage completed for ${from}`);
    } catch (err: any) {
        console.error(`[EVOLUTION] Error processing message from ${from}:`, err.message);
    }

    res.sendStatus(200);
});
