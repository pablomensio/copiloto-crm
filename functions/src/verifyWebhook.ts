import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
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
        const response = await axios.get(
            productUrl,
            {
                headers: {
                    "x-maytapi-key": token
                }
            }
        );

        console.log("\n📋 Configuración actual del producto:");
        console.log("=====================================");
        console.log("Webhook URL:", response.data.webhook || "❌ NO CONFIGURADO");
        console.log("ACK Delivery:", response.data.ack_delivery);
        console.log("Package:", response.data.package);
        console.log("Phone Limit:", response.data.phone_limit);

        if (!response.data.webhook) {
            console.log("\n⚠️  PROBLEMA ENCONTRADO: No hay webhook configurado!");
            console.log("Ejecuta: npx ts-node src/configureWebhook.ts");
        } else if (response.data.webhook !== "https://us-central1-copiloto-crm-1764216245.cloudfunctions.net/receiveWhatsapp") {
            console.log("\n⚠️  PROBLEMA: El webhook configurado es diferente!");
            console.log("Esperado: https://us-central1-copiloto-crm-1764216245.cloudfunctions.net/receiveWhatsapp");
            console.log("Actual:", response.data.webhook);
        } else {
            console.log("\n✅ Webhook configurado correctamente!");
        }

    } catch (e: any) {
        console.error("Error verificando configuración:", e.response?.data || e.message);
    }
}

main();
