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
exports.receiveEvolution = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
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
    console.log("[DEBUG] data exists:", !!data);
    console.log("[DEBUG] data.key exists:", !!(data === null || data === void 0 ? void 0 : data.key));
    console.log("[DEBUG] data.key.fromMe:", (_a = data === null || data === void 0 ? void 0 : data.key) === null || _a === void 0 ? void 0 : _a.fromMe);
    if (!data || !data.key || data.key.fromMe) {
        // Ignore updates or messages sent by me
        console.log("[DEBUG] Rejecting: no data or fromMe=true");
        res.sendStatus(200);
        return;
    }
    const messageType = data.messageType;
    console.log("[DEBUG] messageType:", messageType);
    // We support text and simple conversation, or extendedTextMessage
    let text = "";
    if (messageType === "conversation") {
        text = (_b = data.message) === null || _b === void 0 ? void 0 : _b.conversation;
    }
    else if (messageType === "extendedTextMessage") {
        text = (_d = (_c = data.message) === null || _c === void 0 ? void 0 : _c.extendedTextMessage) === null || _d === void 0 ? void 0 : _d.text;
    }
    else {
        // Check if it has a caption (image/video)
        text = ((_f = (_e = data.message) === null || _e === void 0 ? void 0 : _e.imageMessage) === null || _f === void 0 ? void 0 : _f.caption) || ((_h = (_g = data.message) === null || _g === void 0 ? void 0 : _g.videoMessage) === null || _h === void 0 ? void 0 : _h.caption) || "";
    }
    console.log("[DEBUG] extracted text:", text);
    if (!text) {
        console.log("No text content found in Evolution message");
        res.sendStatus(200);
        return;
    }
    const remoteJid = data.key.remoteJid; // e.g., "5491112345678@s.whatsapp.net"
    const from = remoteJid.split("@")[0];
    const pushName = data.pushName || "Cliente WhatsApp";
    console.log(`[DEBUG] Calling processIncomingMessage(from=${from}, text=${text}, pushName=${pushName})`);
    // Call the shared handler
    await (0, messageHandler_1.processIncomingMessage)(from, text, pushName);
    res.sendStatus(200);
});
//# sourceMappingURL=evolutionReceiver.js.map