"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMaytapiMessage = void 0;
const axios_1 = __importDefault(require("axios"));
async function sendMaytapiMessage(to, message, mediaUrls) {
    var _a;
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
                await axios_1.default.post(url, {
                    to_number: to,
                    type: "media",
                    message: mediaUrl
                }, { headers });
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }
        await axios_1.default.post(url, {
            to_number: to,
            type: "text",
            message: message
        }, { headers });
    }
    catch (error) {
        console.error("Error enviando mensaje a WhatsApp (Maytapi):", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    }
}
exports.sendMaytapiMessage = sendMaytapiMessage;
//# sourceMappingURL=maytapiClient.js.map