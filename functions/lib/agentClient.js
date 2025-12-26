"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarMensajeAlAgente = void 0;
const dialogflow_cx_1 = require("@google-cloud/dialogflow-cx");
const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'gen-lang-client-0517237991';
const agentId = process.env.VERTEX_AGENT_ID || '6c0cb660-6089-4f3b-bb54-e8840cc52666';
const location = process.env.LOCATION || 'us-central1';
// Cliente configurado con el endpoint regional correcto
const client = new dialogflow_cx_1.SessionsClient({
    apiEndpoint: `${location}-dialogflow.googleapis.com`
});
/**
 * Envía un mensaje al Agente de Vertex AI y obtiene la respuesta
 * @param leadId - ID del lead (se usa como session ID para mantener contexto)
 * @param mensaje - Mensaje del usuario
 * @param contexto - Contexto adicional (nombre, historial, etc.)
 */
async function enviarMensajeAlAgente(leadId, mensaje, contexto) {
    var _a, _b, _c, _d;
    if (!agentId) {
        throw new Error('VERTEX_AGENT_ID no está configurado en las variables de entorno');
    }
    if (!projectId) {
        throw new Error('GOOGLE_CLOUD_PROJECT no está configurado en las variables de entorno');
    }
    // Crear session path único por lead para mantener el contexto de la conversación
    const sessionPath = client.projectLocationAgentSessionPath(projectId, location, agentId, leadId // Cada lead tiene su propia sesión - mantiene el contexto
    );
    // Preparar el request al agente
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: mensaje,
            },
            languageCode: 'es', // Español
        },
        queryParams: contexto ? {
            parameters: contexto,
        } : undefined,
    };
    try {
        console.log(`[AGENTE] Enviando mensaje al agente para lead ${leadId}`);
        console.log(`[AGENTE] Project: ${projectId}, Agent: ${agentId}, Location: ${location}`);
        console.log(`[AGENTE] Session path: ${sessionPath}`);
        const [response] = await client.detectIntent(request);
        // Extraer respuesta del agente
        const result = response.queryResult;
        // El agente puede devolver varias respuestas de texto
        const respuestaTexto = ((_a = result === null || result === void 0 ? void 0 : result.responseMessages) === null || _a === void 0 ? void 0 : _a.map(m => { var _a, _b; return (_b = (_a = m.text) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b[0]; }).filter(Boolean).join('\n')) || '';
        // Si el agente decidió usar una Tool, la info viene aquí
        const accion = ((_c = (_b = result === null || result === void 0 ? void 0 : result.match) === null || _b === void 0 ? void 0 : _b.intent) === null || _c === void 0 ? void 0 : _c.displayName) || null;
        const parametros = ((_d = result === null || result === void 0 ? void 0 : result.parameters) === null || _d === void 0 ? void 0 : _d.fields) || {};
        console.log(`[AGENTE] Respuesta recibida (${respuestaTexto.length} chars)`);
        if (accion) {
            console.log(`[AGENTE] Acción detectada: ${accion}`);
        }
        return {
            mensaje: respuestaTexto,
            sessionId: leadId,
            accion,
            parametros
        };
    }
    catch (error) {
        console.error('[AGENTE] Error al comunicarse con el agente:', error);
        console.error('[AGENTE] Detalles del error:', {
            message: error.message,
            code: error.code,
            details: error.details
        });
        throw new Error(`Error del agente: ${error.message}`);
    }
}
exports.enviarMensajeAlAgente = enviarMensajeAlAgente;
//# sourceMappingURL=agentClient.js.map