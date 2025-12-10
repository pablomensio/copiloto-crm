import * as dotenv from 'dotenv';
dotenv.config();

import { enviarMensajeWhatsApp } from './whatsappReceiver';

async function main() {
    console.log("Iniciando prueba de envío de WhatsApp via Maytapi...");

    const recipient = "5493517670440"; // User's number
    const message = "Hola! Esta es una prueba desde Maytapi + Firebase Functions 🚀";

    if (!process.env.MAYTAPI_PRODUCT_ID || !process.env.MAYTAPI_TOKEN) {
        console.error("Faltan variables de entorno");
        return;
    }

    console.log(`Enviando mensaje a ${recipient}...`);
    try {
        await enviarMensajeWhatsApp(recipient, message);
        console.log("Mensaje enviado (función ejecutada).");
    } catch (e) {
        console.error("Error en test:", e);
    }

    console.log("Proceso finalizado.");
}

main().catch(err => console.error(err));
