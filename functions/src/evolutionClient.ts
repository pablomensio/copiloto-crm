import axios from "axios";

export async function sendEvolutionMessage(
    to: string,
    message: string,
    mediaUrls?: string[] | null
) {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME;

    console.log(`[EVOLUTION] URL: ${apiUrl}, Instance: ${instanceName}, APIKey defined: ${!!apiKey}`);

    if (!apiUrl || !apiKey || !instanceName) {
        console.error("Faltan credenciales de Evolution API. Verifica functions/.env");
        return;
    }

    const cleanPhone = to.replace(/\D/g, "");

    const headers = {
        "apikey": apiKey,
        "Content-Type": "application/json"
    };

    try {
        if (message) {
            const url = `${apiUrl}/message/sendText/${instanceName}`;
            const numberWithJid = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@s.whatsapp.net`;

            console.log(`[EVOLUTION] Enviando a: ${numberWithJid}`);

            const response = await axios.post(url, {
                number: numberWithJid,
                text: message,
                options: {
                    delay: 1000,
                    presence: "composing"
                }
            }, { headers });

            console.log(`[EVOLUTION] Éxito! Status: ${response.status}`);
        }

    } catch (error: any) {
        console.error("[CRITICAL] Error enviando mensaje a WhatsApp (Evolution):", error.response?.data || error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error("¡No se puede conectar a la IP de Evolution! Verifica firewall o IP pública.");
        }
    }
}
