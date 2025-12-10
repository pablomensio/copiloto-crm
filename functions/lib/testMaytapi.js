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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const whatsappReceiver_1 = require("./whatsappReceiver");
async function main() {
    console.log("Iniciando prueba de envío de WhatsApp via Maytapi...");
    const recipient = "5493517670440"; // User's number
    const message = "Hola! Esta es una prueba desde Maytapi + Firebase Functions 🚀";
    if (!process.env.MAYTAPI_PRODUCT_ID || !process.env.MAYTAPI_TOKEN) {
        console.error("Faltan variables de entorno");
        return;
    }
    console.log(`Enviando mensaje a ${recipient}...`);
    try {
        await (0, whatsappReceiver_1.enviarMensajeWhatsApp)(recipient, message);
        console.log("Mensaje enviado (función ejecutada).");
    }
    catch (e) {
        console.error("Error en test:", e);
    }
    console.log("Proceso finalizado.");
}
main().catch(err => console.error(err));
//# sourceMappingURL=testMaytapi.js.map