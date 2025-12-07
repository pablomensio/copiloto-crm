"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cerebroVentas = void 0;
const functions_1 = require("@genkit-ai/firebase/functions");
const ai_1 = require("@genkit-ai/ai");
const core_1 = require("@genkit-ai/core");
const vertexai_1 = require("@genkit-ai/vertexai");
const zod_1 = require("zod");
const prompts_1 = require("./prompts");
(0, core_1.configureGenkit)({
    plugins: [(0, vertexai_1.vertexAI)({ location: "us-central1" })],
});
// Esquema de Salida
const CopilotoOutputSchema = zod_1.z.object({
    gestion_lead: zod_1.z.object({
        accion_lead: zod_1.z.enum(["CREAR", "ACTUALIZAR", "SCORE", "NINGUNA"]),
        datos_extraidos: zod_1.z.object({
            nombre: zod_1.z.string().nullable(),
            apellido: zod_1.z.string().nullable(),
            email: zod_1.z.string().nullable(),
            telefono: zod_1.z.string().nullable()
        }),
        actualizaciones_estado: zod_1.z.object({
            score_prioridad: zod_1.z.number().min(0).max(100),
            estado: zod_1.z.enum(["NUEVO", "CONTACTADO", "NEGOCIACION", "CERRADO", "PERDIDO"])
        })
    }),
    analisis_conversacional: zod_1.z.object({
        intencion_detectada: zod_1.z.enum(["EXPLORACION", "INFORMATIVA", "NEGOCIACION", "TASACION", "CITA", "CIERRE", "OTRO"]),
        vehiculos_identificados: zod_1.z.array(zod_1.z.string())
    }),
    respuesta_cliente: zod_1.z.object({
        mensaje_whatsapp: zod_1.z.string(),
        accion_sugerida_app: zod_1.z.enum(["ABRIR_CALCULADORA", "ENVIAR_FICHA", "SOLO_RESPONDER"])
    }),
    razonamiento: zod_1.z.string()
});
exports.cerebroVentas = (0, functions_1.onFlow)({
    name: "cerebroVentas",
    inputSchema: zod_1.z.object({
        datos_lead: zod_1.z.any(),
        historial_chat: zod_1.z.array(zod_1.z.string()),
        inventario: zod_1.z.array(zod_1.z.any()),
        mensaje_actual: zod_1.z.string(),
        contexto_origen: zod_1.z.string().nullable().optional()
    }),
    outputSchema: CopilotoOutputSchema,
}, async (input) => {
    const userPrompt = `
      CONTEXTO DE EJECUCIÓN:
      - DATOS LEAD: ${JSON.stringify(input.datos_lead)}
      - INVENTARIO DISPONIBLE: ${JSON.stringify(input.inventario)}
      - HISTORIAL RECIENTE: ${JSON.stringify(input.historial_chat)}
      - CONTEXTO ORIGEN (Click en catálogo): ${input.contexto_origen || "Ninguno"}
      
      MENSAJE DEL CLIENTE (Puede incluir varios unidos):
      "${input.mensaje_actual}"
    `;
    const llmResponse = await (0, ai_1.generate)({
        model: "vertexai/gemini-2.0-flash-001",
        prompt: userPrompt,
        system: prompts_1.SYSTEM_INSTRUCTION,
        config: {
            temperature: 0.2,
        },
        output: { schema: CopilotoOutputSchema }
    });
    return llmResponse.output();
});
//# sourceMappingURL=genkitFlow.js.map