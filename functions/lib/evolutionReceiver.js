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
    var _a, _b, _c, _d, _e, _f, _g;
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
        text = (_a = data.message) === null || _a === void 0 ? void 0 : _a.conversation;
    }
    else if (messageType === "extendedTextMessage") {
        text = (_c = (_b = data.message) === null || _b === void 0 ? void 0 : _b.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.text;
    }
    else {
        // Check if it has a caption (image/video)
        text = ((_e = (_d = data.message) === null || _d === void 0 ? void 0 : _d.imageMessage) === null || _e === void 0 ? void 0 : _e.caption) || ((_g = (_f = data.message) === null || _f === void 0 ? void 0 : _f.videoMessage) === null || _g === void 0 ? void 0 : _g.caption) || "";
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
    await (0, messageHandler_1.processIncomingMessage)(from, text, pushName);
    res.sendStatus(200);
});
//# sourceMappingURL=evolutionReceiver.js.map