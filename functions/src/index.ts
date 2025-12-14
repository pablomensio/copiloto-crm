import * as admin from "firebase-admin";
import { receiveWhatsapp } from "./whatsappReceiver";
import { createOrganization } from "./createOrganization";

admin.initializeApp();

export {
    receiveWhatsapp,
    createOrganization
};
