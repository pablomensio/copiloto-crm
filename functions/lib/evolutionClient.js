"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEvolutionMessage = void 0;
const axios_1 = __importDefault(require("axios"));
async function sendEvolutionMessage(to, message, mediaUrls) {
    var _a;
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
                await axios_1.default.post(url, {
                    number: cleanPhone,
                    mediaMessage: {
                        mediatype: "image",
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
            // Evolution v2.3.6 acepta número con o sin sufijo, pero mejor ser explícitos
            const numberWithJid = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@s.whatsapp.net`;
            await axios_1.default.post(url, {
                number: numberWithJid,
                text: message,
                options: {
                    delay: 1000,
                    presence: "composing"
                }
            }, { headers });
        }
    }
    catch (error) {
        console.error("Error enviando mensaje a WhatsApp (Evolution):", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
}
exports.sendEvolutionMessage = sendEvolutionMessage;
//# sourceMappingURL=evolutionClient.js.map