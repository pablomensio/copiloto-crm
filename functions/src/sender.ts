import { sendMaytapiMessage } from "./maytapiClient";
import { sendEvolutionMessage } from "./evolutionClient";

export async function sendWhatsAppMessage(
    to: string,
    message: string,
    mediaUrls?: string[] | null
) {
    const provider = process.env.WHATSAPP_PROVIDER || 'maytapi';

    if (provider === 'evolution') {
        await sendEvolutionMessage(to, message, mediaUrls);
    } else {
        await sendMaytapiMessage(to, message, mediaUrls);
    }
}
