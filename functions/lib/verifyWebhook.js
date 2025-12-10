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
    var _a;
    const productId = process.env.MAYTAPI_PRODUCT_ID;
    const token = process.env.MAYTAPI_TOKEN;
    const apiUrl = process.env.MAYTAPI_API_URL || "https://api.maytapi.com/api";
    if (!productId || !token) {
        console.error("Faltan credenciales");
        return;
    }
    // Get product info to see webhook configuration
    const productUrl = `${apiUrl}/${productId}/product`;
    console.log(`Verificando configuración del producto...`);
    try {
        const response = await axios_1.default.get(productUrl, {
            headers: {
                "x-maytapi-key": token
            }
        });
        console.log("\n📋 Configuración actual del producto:");
        console.log("=====================================");
        console.log("Webhook URL:", response.data.webhook || "❌ NO CONFIGURADO");
        console.log("ACK Delivery:", response.data.ack_delivery);
        console.log("Package:", response.data.package);
        console.log("Phone Limit:", response.data.phone_limit);
        if (!response.data.webhook) {
            console.log("\n⚠️  PROBLEMA ENCONTRADO: No hay webhook configurado!");
            console.log("Ejecuta: npx ts-node src/configureWebhook.ts");
        }
        else if (response.data.webhook !== "https://us-central1-copiloto-crm-1764216245.cloudfunctions.net/receiveWhatsapp") {
            console.log("\n⚠️  PROBLEMA: El webhook configurado es diferente!");
            console.log("Esperado: https://us-central1-copiloto-crm-1764216245.cloudfunctions.net/receiveWhatsapp");
            console.log("Actual:", response.data.webhook);
        }
        else {
            console.log("\n✅ Webhook configurado correctamente!");
        }
    }
    catch (e) {
        console.error("Error verificando configuración:", ((_a = e.response) === null || _a === void 0 ? void 0 : _a.data) || e.message);
    }
}
main();
//# sourceMappingURL=verifyWebhook.js.map