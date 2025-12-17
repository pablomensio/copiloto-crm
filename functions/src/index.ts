import * as admin from "firebase-admin";
import { receiveWhatsapp } from "./whatsappReceiver";
import { receiveEvolution } from "./evolutionReceiver";
import { createOrganization } from "./createOrganization";

admin.initializeApp();

export {
    receiveWhatsapp,
    createOrganization,
    receiveEvolution
};
