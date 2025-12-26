import * as admin from "firebase-admin";
import { receiveEvolution } from "./evolutionReceiver";
import { createOrganization } from "./createOrganization";
import {
    toolBuscarVehiculos,
    toolEnviarFicha,
    toolAbrirCalculadora,
    toolCrearTarea
} from "./agentTools";

admin.initializeApp();

export {
    createOrganization,
    receiveEvolution,
    // Tools del Agente de Vertex AI
    toolBuscarVehiculos,
    toolEnviarFicha,
    toolAbrirCalculadora,
    toolCrearTarea
};
