import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
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
        const response = await axios.post(webhookUrl, payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("\n✅ Respuesta del webhook:");
        console.log("Status:", response.status);
        console.log("Data:", response.data);
        console.log("\nSi ves status 200, la función recibió el mensaje.");
        console.log("Revisa tu WhatsApp en 5-10 segundos para ver si llega la respuesta.");

    } catch (e: any) {
        console.error("\n❌ Error llamando al webhook:");
        console.error("Status:", e.response?.status);
        console.error("Data:", e.response?.data);
        console.error("Message:", e.message);
    }
}

main();
