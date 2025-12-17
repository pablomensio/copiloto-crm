import axios from "axios";

export async function sendMaytapiMessage(
    to: string,
    message: string,
    mediaUrls?: string[] | null
) {
    const productId = process.env.MAYTAPI_PRODUCT_ID;
    const token = process.env.MAYTAPI_TOKEN;
    const phoneId = process.env.MAYTAPI_PHONE_ID;
    const apiUrl = process.env.MAYTAPI_API_URL || "https://api.maytapi.com/api";

    if (!productId || !token || !phoneId) {
        console.error("Faltan credenciales de Maytapi");
        return;
    }

    try {
        const url = `${apiUrl}/${productId}/${phoneId}/sendMessage`;
        const headers = {
            "x-maytapi-key": token,
            "Content-Type": "application/json"
        };

        if (mediaUrls && mediaUrls.length > 0) {
            for (const mediaUrl of mediaUrls) {
                await axios.post(url, {
                    to_number: to,
                    type: "media",
                    message: mediaUrl
                }, { headers });
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }

        await axios.post(url, {
            to_number: to,
            type: "text",
            message: message
        }, { headers });

    } catch (error: any) {
        console.error("Error enviando mensaje a WhatsApp (Maytapi):", error.response?.data || error.message);
    }
}
