"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = void 0;
const evolutionClient_1 = require("./evolutionClient");
async function sendWhatsAppMessage(to, message, mediaUrls) {
    console.log(`[Sender] Sending message via Evolution API to: ${to}`);
    await (0, evolutionClient_1.sendEvolutionMessage)(to, message, mediaUrls);
}
exports.sendWhatsAppMessage = sendWhatsAppMessage;
//# sourceMappingURL=sender.js.map