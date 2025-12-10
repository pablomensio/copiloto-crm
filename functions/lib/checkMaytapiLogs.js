"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const axios_1 = __importDefault(require("axios"));
async function main() {
    var _a;
    const productId = process.env.MAYTAPI_PRODUCT_ID;
    const token = process.env.MAYTAPI_TOKEN;
    const apiUrl = process.env.MAYTAPI_API_URL || "https://api.maytapi.com/api";
    if (!productId || !token) {
        console.error("Faltan credenciales");
        return;
    }
    const logsUrl = `${apiUrl}/${productId}/logs`;
    console.log(`Fetching logs from: ${logsUrl}`);
    try {
        const response = await axios_1.default.get(logsUrl, {
            headers: { "x-maytapi-key": token },
            params: { limit: 20 }
        });
        console.log("Maytapi Logs (Last 5):");
        let logs = [];
        if (Array.isArray(response.data)) {
            logs = response.data;
        }
        else if (response.data && Array.isArray(response.data.data)) {
            logs = response.data.data;
        }
        else if (response.data && response.data.data && Array.isArray(response.data.data.list)) {
            logs = response.data.data.list;
        }
        else {
            console.log("Structure Unknown:", JSON.stringify(response.data).substring(0, 200));
            return;
        }
        console.log(`Log count: ${logs.length}`);
        logs.forEach((log) => {
            var _a, _b, _c, _d, _e, _f;
            console.log(`TYPE: ${log.type} | DATE: ${log.created_at}`);
            if (log.type === "message" || log.type === "incoming") {
                const phone = ((_a = log.user) === null || _a === void 0 ? void 0 : _a.phone) || ((_c = (_b = log.data) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.phone) || "N/A";
                const text = ((_d = log.message) === null || _d === void 0 ? void 0 : _d.text) || ((_f = (_e = log.body) === null || _e === void 0 ? void 0 : _e.message) === null || _f === void 0 ? void 0 : _f.text) || JSON.stringify(log.message || log.body || "").substring(0, 50);
                console.log(`MSG FROM: ${phone} | TEXT: ${text}`);
            }
            else if (log.type === "webhook-error" || log.type === "error") {
                console.log(`ERROR: ${JSON.stringify(log.response || log.data).substring(0, 200)}`);
            }
            else {
                console.log(`DATA: ${JSON.stringify(log.data || {}).substring(0, 100)}`);
            }
            console.log("---------------------------------------------------");
        });
    }
    catch (e) {
        console.error("Error fetching logs:", ((_a = e.response) === null || _a === void 0 ? void 0 : _a.data) || e.message);
    }
}
main();
//# sourceMappingURL=checkMaytapiLogs.js.map