import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
    console.log("Configurando Webhook en Maytapi...");

    const productId = process.env.MAYTAPI_PRODUCT_ID;
    const token = process.env.MAYTAPI_TOKEN;
    const apiUrl = process.env.MAYTAPI_API_URL || "https://api.maytapi.com/api";
    // Deployed URL from previous steps
    const webhookUrl = "https://us-central1-copiloto-crm-1764216245.cloudfunctions.net/receiveWhatsapp";

    if (!productId || !token) {
        console.error("Faltan credenciales");
        return;
    }

    const setWebhookUrl = `${apiUrl}/${productId}/setWebhook`;
    console.log(`Endpoint: ${setWebhookUrl}`);
    console.log(`Setting Webhook to: ${webhookUrl}`);

    try {
        const response = await axios.post(
            setWebhookUrl,
            { webhook: webhookUrl },
            {
                headers: {
                    "x-maytapi-key": token,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log("Webhook configurado EXITOSAMENTE!");
        console.log("Respuesta:", response.data);
    } catch (e: any) {
        console.error("Error configurando webook:", e.response?.data || e.message);
    }
}

main();
