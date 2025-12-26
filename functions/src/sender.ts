import { sendEvolutionMessage } from "./evolutionClient";

export async function sendWhatsAppMessage(
    to: string,
    message: string,
    mediaUrls?: string[] | null
) {
    console.log(`[Sender] Sending message via Evolution API to: ${to}`);
    await sendEvolutionMessage(to, message, mediaUrls);
}
