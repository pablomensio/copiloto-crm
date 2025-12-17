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
exports.receiveWhatsapp = void 0;
const functions = __importStar(require("firebase-functions"));
// import * as admin from "firebase-admin"; // Removed unused
const messageHandler_1 = require("./messageHandler");
exports.receiveWhatsapp = functions.https.onRequest(async (req, res) => {
    var _a;
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
    const from = ((_a = conversation === null || conversation === void 0 ? void 0 : conversation.id) === null || _a === void 0 ? void 0 : _a.split("@")[0]) || (user === null || user === void 0 ? void 0 : user.phone);
    const text = message.text;
    // Maytapi doesn't always provide sender name in the message payload cleanly, 
    // sometimes it's in user.name or conversation.name.
    // We'll try to extract it from user object if available.
    const senderName = (user === null || user === void 0 ? void 0 : user.name) || (user === null || user === void 0 ? void 0 : user.phone) || "Desconocido";
    if (!from || !text) {
        console.log("Missing from or text");
        res.sendStatus(200);
        return;
    }
    await (0, messageHandler_1.processIncomingMessage)(from, text, senderName);
    res.sendStatus(200);
});
//# sourceMappingURL=whatsappReceiver.js.map