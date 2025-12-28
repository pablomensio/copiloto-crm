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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveEvolution = void 0;
const functions = __importStar(require("firebase-functions"));
const messageHandler_1 = require("./messageHandler");
const sender_1 = require("./sender");
exports.receiveEvolution = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g;
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
        text = (_a = data.message) === null || _a === void 0 ? void 0 : _a.conversation;
    }
    else if (messageType === "extendedTextMessage") {
        text = (_c = (_b = data.message) === null || _b === void 0 ? void 0 : _b.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.text;
    }
    else {
        text = ((_e = (_d = data.message) === null || _d === void 0 ? void 0 : _d.imageMessage) === null || _e === void 0 ? void 0 : _e.caption) || ((_g = (_f = data.message) === null || _f === void 0 ? void 0 : _f.videoMessage) === null || _g === void 0 ? void 0 : _g.caption) || "";
    }
    const from = remoteJid.split("@")[0];
    const pushName = data.pushName || body.sender || "Cliente WhatsApp";
    console.log(`[EVOLUTION] Processing message from ${from} (${pushName}): "${text}"`);
    try {
        await (0, messageHandler_1.processIncomingMessage)(from, text, pushName);
        console.log(`[EVOLUTION] processIncomingMessage completed for ${from}`);
    }
    catch (err) {
        console.error(`[EVOLUTION] Error processing message from ${from}:`, err.message);
        await (0, sender_1.sendWhatsAppMessage)(from, `🔥 Error Crítico Receptor: ${err.message}`);
    }
    res.sendStatus(200);
});
//# sourceMappingURL=evolutionReceiver.js.map