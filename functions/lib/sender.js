"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = void 0;
const maytapiClient_1 = require("./maytapiClient");
const evolutionClient_1 = require("./evolutionClient");
async function sendWhatsAppMessage(to, message, mediaUrls) {
    const provider = process.env.WHATSAPP_PROVIDER || 'maytapi';
    if (provider === 'evolution') {
        await (0, evolutionClient_1.sendEvolutionMessage)(to, message, mediaUrls);
    }
    else {
        await (0, maytapiClient_1.sendMaytapiMessage)(to, message, mediaUrls);
    }
}
exports.sendWhatsAppMessage = sendWhatsAppMessage;
//# sourceMappingURL=sender.js.map