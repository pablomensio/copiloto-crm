import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

async function main() {
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
        const response = await axios.get(
            logsUrl,
            {
                headers: { "x-maytapi-key": token },
                params: { limit: 20 }
            }
        );

        console.log("Maytapi Logs (Last 5):");
        let logs: any[] = [];

        if (Array.isArray(response.data)) {
            logs = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
            logs = response.data.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data.list)) {
            logs = response.data.data.list;
        } else {
            console.log("Structure Unknown:", JSON.stringify(response.data).substring(0, 200));
            return;
        }

        console.log(`Log count: ${logs.length}`);

        logs.forEach((log: any) => {
            console.log(`TYPE: ${log.type} | DATE: ${log.created_at}`);

            if (log.type === "message" || log.type === "incoming") {
                const phone = log.user?.phone || log.data?.user?.phone || "N/A";
                const text = log.message?.text || log.body?.message?.text || JSON.stringify(log.message || log.body || "").substring(0, 50);
                console.log(`MSG FROM: ${phone} | TEXT: ${text}`);
            } else if (log.type === "webhook-error" || log.type === "error") {
                console.log(`ERROR: ${JSON.stringify(log.response || log.data).substring(0, 200)}`);
            } else {
                console.log(`DATA: ${JSON.stringify(log.data || {}).substring(0, 100)}`);
            }
            console.log("---------------------------------------------------");
        });

    } catch (e: any) {
        console.error("Error fetching logs:", e.response?.data || e.message);
    }
}

main();
