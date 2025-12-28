"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEvolutionMessage = void 0;
const axios_1 = __importDefault(require("axios"));
async function sendEvolutionMessage(to, message, mediaUrls) {
    var _a;
    console.log("[VERSION_CHECK] === CODIGO HARDCODEADO V3 ACTIVO ===");
    // HARDCODED TEMPORAL PARA DEBUG (Actualizado con IP real)
    const apiUrl = "http://34.123.232.94:8080";
    const apiKey = "Los@men59";
    const instanceName = "copiloto_main";
    console.log(`[EVOLUTION_DEBUG] URL: ${apiUrl}, Instance: ${instanceName}, APIKey defined: ${!!apiKey}`);
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
            console.log(`[EVOLUTION_DEBUG] Enviando POST a: ${url} para: ${numberWithJid}`);
            const response = await axios_1.default.post(url, {
                number: numberWithJid,
                text: message,
                options: {
                    delay: 1000,
                    presence: "composing"
                }
            }, { headers });
            console.log(`[EVOLUTION_DEBUG] Éxito! Status: ${response.status} Data:`, response.data);
        }
    }
    catch (error) {
        console.error("[CRITICAL] Error enviando mensaje a WhatsApp (Evolution):", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error("¡No se puede conectar a la IP de Evolution! Verifica firewall o IP pública.");
        }
    }
}
exports.sendEvolutionMessage = sendEvolutionMessage;
//# sourceMappingURL=evolutionClient.js.map