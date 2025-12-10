import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const PRODUCT_ID = process.env.MAYTAPI_PRODUCT_ID;
const PHONE_ID = process.env.MAYTAPI_PHONE_ID;
const TOKEN = process.env.MAYTAPI_TOKEN;
const TEST_NUMBER = "5493517670440"; // Número de la tabla que mostraste

if (!PRODUCT_ID || !PHONE_ID || !TOKEN) {
    console.error("❌ Faltan variables de entorno en .env");
    process.exit(1);
}

const BASE_URL = `https://api.maytapi.com/api/${PRODUCT_ID}/${PHONE_ID}`;

async function runDiagnostics() {
    console.log("🔍 === DIAGNÓSTICO COMPLETO MAYTAPI === 🔍");
    console.log(`Product: ${PRODUCT_ID}`);
    console.log(`Phone: ${PHONE_ID}`);
    console.log(`Test Number: ${TEST_NUMBER}`);

    // 1. Verificar Estado de la Conexión
    try {
        console.log("\n1️⃣  Verificando estado de conexión...");
        const statusRes = await axios.get(`${BASE_URL}/status`, {
            headers: { "x-maytapi-key": TOKEN },
        });

        const statusData = statusRes.data;
        console.log("Estado:", JSON.stringify(statusData, null, 2));

        if (!statusData.data?.loggedIn && !statusData.data?.connected) {
            console.error("❌ ERROR: El teléfono NO está conectado.");
            console.log("👉 Escanea el QR en: https://api.maytapi.com/api/" + PRODUCT_ID + "/" + PHONE_ID + "/screen?token=" + TOKEN);
            return;
        } else {
            console.log("✅ Teléfono conectado correctamente.");
        }

    } catch (error: any) {
        console.error("❌ Error verificando estado:", error.response?.data || error.message);
    }

    // 2. Probar envío de mensaje
    try {
        console.log(`\n2️⃣  Enviando mensaje de prueba a: ${TEST_NUMBER}`);
        const msgRes = await axios.post(
            `${BASE_URL}/sendMessage`,
            {
                to_number: TEST_NUMBER,
                type: "text",
                message: "🤖 TEST: Si recibes esto, el envío funciona correctamente!",
            },
            {
                headers: {
                    "x-maytapi-key": TOKEN,
                    "Content-Type": "application/json"
                },
            }
        );

        console.log("✅ Respuesta de Maytapi:", JSON.stringify(msgRes.data, null, 2));
        console.log("\n📱 REVISA TU WHATSAPP AHORA (número " + TEST_NUMBER + ")");
        console.log("Si NO recibes el mensaje, el problema puede ser:");
        console.log("  - El número no está registrado en WhatsApp");
        console.log("  - Cuenta trial de Maytapi con restricciones");
        console.log("  - El número necesita estar en la lista de prueba");

    } catch (error: any) {
        console.error("❌ Error enviando mensaje:", error.response?.data || error.message);

        if (error.response?.status === 400) {
            console.log("\n💡 Posibles causas del error 400:");
            console.log("  - Formato de número incorrecto");
            console.log("  - Número no permitido en cuenta trial");
            console.log("  - Sesión de WhatsApp desconectada");
        }
    }

    // 3. Verificar configuración del webhook
    try {
        console.log("\n3️⃣  Verificando webhook configurado...");
        const productRes = await axios.get(
            `https://api.maytapi.com/api/${PRODUCT_ID}/product`,
            {
                headers: { "x-maytapi-key": TOKEN },
            }
        );

        const webhook = productRes.data.webhook;
        const expectedWebhook = "https://us-central1-copiloto-crm-1764216245.cloudfunctions.net/receiveWhatsapp";

        if (webhook === expectedWebhook) {
            console.log("✅ Webhook configurado correctamente:", webhook);
        } else {
            console.log("⚠️  Webhook diferente:");
            console.log("   Esperado:", expectedWebhook);
            console.log("   Actual:", webhook);
        }

    } catch (error: any) {
        console.error("❌ Error verificando webhook:", error.response?.data || error.message);
    }

    console.log("\n=== FIN DEL DIAGNÓSTICO ===");
}

runDiagnostics();
