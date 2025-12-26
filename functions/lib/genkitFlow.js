"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ejecutarCerebroVentas = exports.CopilotoOutputSchema = void 0;
const zod_1 = require("zod");
const prompts_1 = require("./prompts");
const generative_ai_1 = require("@google/generative-ai");
// Esquemas
const VehiculoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    modelo: zod_1.z.string(),
    año: zod_1.z.any().optional(),
    precio: zod_1.z.any().optional(),
    url: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().optional(),
    imageUrls: zod_1.z.array(zod_1.z.string()).optional(),
});
const CerebroVentasInputSchema = zod_1.z.object({
    datos_lead: zod_1.z.any().optional(),
    historial_chat: zod_1.z.array(zod_1.z.string()),
    inventario: zod_1.z.array(VehiculoSchema).optional(),
    mensaje_actual: zod_1.z.string(),
    contexto_origen: zod_1.z.string().nullable().optional()
});
exports.CopilotoOutputSchema = zod_1.z.object({
    gestion_lead: zod_1.z.object({
        accion_lead: zod_1.z.enum(["CREAR", "ACTUALIZAR", "SCORE", "NINGUNA"]),
        datos_extraidos: zod_1.z.object({
            nombre: zod_1.z.string().nullish(),
            apellido: zod_1.z.string().nullish(),
            email: zod_1.z.string().nullish(),
            telefono: zod_1.z.string().nullish()
        }),
        actualizaciones_estado: zod_1.z.object({
            score_prioridad: zod_1.z.number().min(0).max(100),
            estado: zod_1.z.enum(["NUEVO", "CONTACTADO", "NEGOCIACION", "CERRADO", "PERDIDO", "INFORMATIVA", "TASACION"]).catch("NUEVO")
        })
    }),
    analisis_conversacional: zod_1.z.object({
        intencion_detectada: zod_1.z.enum(["EXPLORACION", "INFORMATIVA", "NEGOCIACION", "TASACION", "CITA", "CIERRE", "OBJECION", "OTRO"]),
        vehiculos_identificados: zod_1.z.array(zod_1.z.string())
    }),
    respuesta_cliente: zod_1.z.object({
        mensaje_whatsapp: zod_1.z.string(),
        media_url: zod_1.z.string().nullish(),
        media_urls: zod_1.z.array(zod_1.z.string()).optional(),
        accion_sugerida_app: zod_1.z.enum(["ABRIR_CALCULADORA", "ENVIAR_FICHA", "SOLO_RESPONDER", "CREAR_TAREA", "CREAR_NOTA", "ENVIAR_TASACION", "ENVIAR_CATALOGO_COMPLETO"])
    }),
    razonamiento: zod_1.z.string()
});
function extractJsonObject(text) {
    const trimmed = text.trim();
    if (!trimmed)
        return "";
    // Si viene con ```json ... ```
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced === null || fenced === void 0 ? void 0 : fenced[1]) {
        return fenced[1].trim();
    }
    // Desde primer '{' hasta último '}'
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
        return trimmed.slice(start, end + 1).trim();
    }
    return trimmed;
}
async function generarSalidaGemini(prompt) {
    // Usar API key de Gemini (modelo público)
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Falta GOOGLE_GENAI_API_KEY o GEMINI_API_KEY en variables de entorno");
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    // Modelo público: gemini-2.0-flash (más rápido y económico)
    const modelName = "gemini-2.0-flash";
    console.log(`[GEMINI] Usando modelo: ${modelName}`);
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
        },
    });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    if (!(text === null || text === void 0 ? void 0 : text.trim())) {
        throw new Error("Respuesta vacía de Gemini");
    }
    const responseText = text.trim();
    console.log(`[GEMINI] Respuesta recibida (${responseText.length} chars)`);
    const jsonText = extractJsonObject(responseText);
    if (!jsonText) {
        throw new Error("Gemini devolvió respuesta vacía (sin texto JSON)");
    }
    try {
        return JSON.parse(jsonText);
    }
    catch (e) {
        const preview = jsonText.length > 800 ? jsonText.slice(0, 800) + "…" : jsonText;
        throw new Error(`Salida no es JSON válido: ${(e === null || e === void 0 ? void 0 : e.message) || e}. Preview: ${preview}`);
    }
}
// Función wrapper principal
async function ejecutarCerebroVentas(input) {
    console.log(`[GEMINI] Iniciando CerebroVentas`);
    // Construir el prompt del sistema + contexto
    const sistemaPrompt = `
${prompts_1.SYSTEM_INSTRUCTION}

### CONTEXTO DE INVENTARIO (Actualizado):
${JSON.stringify(input.inventario || [], null, 2)}

### HISTORIAL CHAT (Dialogo Previo, con Roles):
${input.historial_chat.join("\n")}

### MENSAJE ACTUAL DEL CLIENTE:
"${input.mensaje_actual}"
`;
    const prompt = `${sistemaPrompt}\n\nIMPORTANTE: Respondé SOLO con un JSON válido que cumpla el schema. Sin texto extra, sin Markdown, sin backticks.`;
    const parsed = await generarSalidaGemini(prompt);
    return exports.CopilotoOutputSchema.parse(parsed);
}
exports.ejecutarCerebroVentas = ejecutarCerebroVentas;
//# sourceMappingURL=genkitFlow.js.map