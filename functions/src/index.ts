import * as admin from "firebase-admin";
import { receiveWhatsapp } from "./whatsappReceiver";
import { cerebroVentas } from "./genkitFlow";

admin.initializeApp();

export {
    receiveWhatsapp,
    cerebroVentas
};
