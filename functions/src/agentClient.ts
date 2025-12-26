import { SessionsClient } from '@google-cloud/dialogflow-cx';

// Configuración del Agente de Vertex AI desde variables de entorno
const projectId = process.env.VERTEX_PROJECT_ID || '';
const agentId = process.env.VERTEX_AGENT_ID || '';
const location = process.env.VERTEX_LOCATION || 'us-central1';

// Cliente configurado con el endpoint regional correcto
const client = new SessionsClient({
    apiEndpoint: `${location}-dialogflow.googleapis.com`
});

export async function enviarMensajeAlAgente(
    leadId: string,
    mensaje: string,
    contexto: any
) {
    const sessionPath = client.projectLocationAgentSessionPath(
        projectId,
        location,
        agentId,
        leadId // Usamos el leadId como sessionId
    );

    console.log(`[AGENTE] Enviando mensaje al agente para lead ${leadId}`);
    console.log(`[AGENTE] Project: ${projectId}, Agent: ${agentId}, Location: ${location}`);
    console.log(`[AGENTE] Session path: ${sessionPath}`);

    try {
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: mensaje
                },
                languageCode: 'es'
            },
            queryParams: {
                parameters: {
                    fields: {
                        nombre_cliente: { stringValue: contexto.nombre || '' },
                        telefono_cliente: { stringValue: contexto.telefono || '' },
                        historial_resumen: { stringValue: (contexto.historial || '').substring(0, 500) },
                        inventario_count: { numberValue: contexto.inventario_disponible || 0 }
                    }
                }
            }
        };

        const [response] = await client.detectIntent(request);
        const queryResult = response.queryResult;

        // Extraer texto de respuesta
        const responseMessages = queryResult?.responseMessages || [];
        const textos = responseMessages
            .filter((msg: any) => msg.text)
            .map((msg: any) => msg.text?.text?.join(' '))
            .join('\n');

        console.log(`[AGENTE] Respuesta recibida:`, textos.substring(0, 200));

        return {
            mensaje: textos || 'No entendí, ¿podés repetir?',
            accion: null, // El agente maneja las acciones internamente
            raw: response
        };

    } catch (error: any) {
        console.error(`[AGENTE] Error al comunicarse con el agente:`, error);
        console.error(`[AGENTE] Detalles del error:`, {
            message: error.message,
            code: error.code,
            details: error.details
        });
        throw new Error(`Error del agente: ${error.message}`);
    }
}
