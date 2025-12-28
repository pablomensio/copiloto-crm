"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarMensajeAlAgente = void 0;
const vertexai_1 = require("@google-cloud/vertexai");
const prompts_1 = require("./prompts");
/**
 * Cliente para el modelo fine-tuneado de Copiloto en Vertex AI
 * SDK: @google-cloud/vertexai (Generative AI)
 */
const projectId = 'copiloto-crm-1764216245';
const location = 'us-central1';
// El modelo fine-tuneado se referencia por su ENDPOINT ID
const fineTunedModelEndpoint = 'projects/copiloto-crm-1764216245/locations/us-central1/endpoints/3356227357949034496';
// Cliente de Vertex AI - inicialización lazy
let _vertexAI = null;
function getVertexAI() {
    if (!_vertexAI) {
        _vertexAI = new vertexai_1.VertexAI({
            project: projectId,
            location: location,
        });
    }
    return _vertexAI;
}
/**
 * Envía un mensaje al modelo fine-tuneado de Copiloto
 */
async function enviarMensajeAlAgente(leadId, mensaje, contexto = {}) {
    var _a, _b, _c;
    console.log(`[COPILOTO] Enviando mensaje a Gemini Fine-Tuned (Endpoint) para lead ${leadId}`);
    const vertexAI = getVertexAI();
    // Instanciar el modelo generativo usando el Endpoint del modelo fine-tuneado
    const generativeModel = vertexAI.getGenerativeModel({
        model: fineTunedModelEndpoint,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.95,
            topK: 40,
            responseMimeType: "application/json" // Forzamos salida JSON
        }
    });
    // Construir el prompt
    const inventarioTexto = (contexto.inventario_resumen || '').substring(0, 2000);
    const historialTexto = (contexto.historial || '').substring(0, 800);
    // Prompt de sistema (instrucciones base)
    // Se combina la instrucción general con los datos dinámicos (inventario, cliente)
    const systemPromptCombined = `${prompts_1.SYSTEM_INSTRUCTION}

INVENTARIO ACTUAL DISPONIBLE:
${inventarioTexto || 'Sin stock disponible en este momento.'}

DATOS DEL CLIENTE:
- Nombre: ${contexto.nombre || 'Desconocido'}
- Teléfono: ${contexto.telefono || 'N/A'}
- Lead ID: ${leadId}`;
    const userPrompt = `
HISTORIAL PREVIO:
${historialTexto}

NUEVO MENSAJE CLIENTE:
${mensaje}
`;
    try {
        const result = await generativeModel.generateContent({
            contents: [
                { role: 'user', parts: [{ text: systemPromptCombined + "\n\n" + userPrompt }] }
            ]
        });
        const response = result.response;
        console.log(`[COPILOTO] Respuesta recibida de Gemini.`);
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("No candidates received from Gemini");
        }
        const candidate = response.candidates[0];
        const rawText = candidate.content.parts[0].text || "{}";
        console.log(`[COPILOTO] Raw response: ${rawText.substring(0, 200)}...`);
        try {
            const jsonResponse = JSON.parse(rawText);
            return {
                mensaje: ((_a = jsonResponse.respuesta_cliente) === null || _a === void 0 ? void 0 : _a.mensaje_whatsapp) || rawText,
                accion: (_b = jsonResponse.respuesta_cliente) === null || _b === void 0 ? void 0 : _b.accion_sugerida_app,
                vehiculos_identificados: (_c = jsonResponse.analisis_conversacional) === null || _c === void 0 ? void 0 : _c.vehiculos_identificados,
                raw: jsonResponse
            };
        }
        catch (parseError) {
            console.warn(`[COPILOTO] Respuesta no es JSON válido, usando texto plano`);
            return {
                mensaje: rawText,
                raw: { rawText }
            };
        }
    }
    catch (error) {
        console.error(`[COPILOTO] Error Gemini:`, error.message);
        throw new Error(`Error Gemini: ${error.message}`);
    }
}
exports.enviarMensajeAlAgente = enviarMensajeAlAgente;
//# sourceMappingURL=agentClient.js.map