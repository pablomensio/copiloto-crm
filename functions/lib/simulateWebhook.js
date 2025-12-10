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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const axios_1 = __importDefault(require("axios"));
async function main() {
    var _a, _b;
    const webhookUrl = "https://us-central1-copiloto-crm-1764216245.cloudfunctions.net/receiveWhatsapp";
    // Simular payload exacto de Maytapi
    const payload = {
        "type": "message",
        "message": {
            "id": "test-message-id",
            "type": "text",
            "text": "Hola desde test",
            "timestamp": Date.now()
        },
        "conversation": {
            "id": "5493517670440@c.us",
            "name": "Test User"
        },
        "user": {
            "phone": "5493517670440",
            "name": "Test User"
        }
    };
    console.log("Enviando webhook simulado...");
    console.log("Payload:", JSON.stringify(payload, null, 2));
    try {
        const response = await axios_1.default.post(webhookUrl, payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        console.log("\n✅ Respuesta del webhook:");
        console.log("Status:", response.status);
        console.log("Data:", response.data);
        console.log("\nSi ves status 200, la función recibió el mensaje.");
        console.log("Revisa tu WhatsApp en 5-10 segundos para ver si llega la respuesta.");
    }
    catch (e) {
        console.error("\n❌ Error llamando al webhook:");
        console.error("Status:", (_a = e.response) === null || _a === void 0 ? void 0 : _a.status);
        console.error("Data:", (_b = e.response) === null || _b === void 0 ? void 0 : _b.data);
        console.error("Message:", e.message);
    }
}
main();
//# sourceMappingURL=simulateWebhook.js.map