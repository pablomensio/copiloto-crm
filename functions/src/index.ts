import * as admin from "firebase-admin";
import { receiveWhatsapp } from "./whatsappReceiver";

admin.initializeApp();

export {
    receiveWhatsapp
};
