import axios from "axios";

export async function sendEvolutionMessage(
    to: string,
    message: string,
    mediaUrls?: string[] | null
) {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME;

    if (!apiUrl || !apiKey || !instanceName) {
        console.error("Faltan credenciales de Evolution API");
        return;
    }

    const cleanPhone = to.replace(/\D/g, ""); // Asegurar solo números
    // Evolution a veces requiere el formato con @s.whatsapp.net o solo el número según versión.
    // v2 suele aceptar el número directamente en el body 'number'.

    const headers = {
        "apikey": apiKey,
        "Content-Type": "application/json"
    };

    try {
        // 1. Enviar medias si existen
        if (mediaUrls && mediaUrls.length > 0) {
            for (const mediaUrl of mediaUrls) {
                // Endpoint para media: /message/sendMedia/{instance}
                const url = `${apiUrl}/message/sendMedia/${instanceName}`;
                await axios.post(url, {
                    number: cleanPhone,
                    mediaMessage: {
                        mediatype: "image", // Asumimos imagen por ahora, se podría mejorar detección
                        media: mediaUrl,
                        caption: ""
                    },
                    options: {
                        delay: 1000,
                        presence: "composing"
                    }
                }, { headers });
                // Pequeño delay
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }

        // 2. Enviar texto
        if (message) {
            // Endpoint para texto: /message/sendText/{instance}
            const url = `${apiUrl}/message/sendText/${instanceName}`;
            await axios.post(url, {
                number: cleanPhone,
                textMessage: {
                    text: message
                },
                options: {
                    delay: 1000,
                    presence: "composing"
                }
            }, { headers });
        }

    } catch (error: any) {
        console.error("Error enviando mensaje a WhatsApp (Evolution):", error.response?.data || error.message);
    }
}
