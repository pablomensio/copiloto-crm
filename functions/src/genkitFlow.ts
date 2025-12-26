import { z } from "zod";
import { SYSTEM_INSTRUCTION } from "./prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Esquemas
const VehiculoSchema = z.object({
    id: z.string(),
    modelo: z.string(),
    año: z.any().optional(),
    precio: z.any().optional(),
    url: z.string().optional(),
    imageUrl: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
});

const CerebroVentasInputSchema = z.object({
    datos_lead: z.any().optional(),
    historial_chat: z.array(z.string()),
    inventario: z.array(VehiculoSchema).optional(),
    mensaje_actual: z.string(),
    contexto_origen: z.string().nullable().optional()
});

export const CopilotoOutputSchema = z.object({
    gestion_lead: z.object({
        accion_lead: z.enum(["CREAR", "ACTUALIZAR", "SCORE", "NINGUNA"]),
        datos_extraidos: z.object({
            nombre: z.string().nullish(),
            apellido: z.string().nullish(),
            email: z.string().nullish(),
            telefono: z.string().nullish()
        }),
        actualizaciones_estado: z.object({
            score_prioridad: z.number().min(0).max(100),
            estado: z.enum(["NUEVO", "CONTACTADO", "NEGOCIACION", "CERRADO", "PERDIDO", "INFORMATIVA", "TASACION"]).catch("NUEVO")
        })
    }),
    analisis_conversacional: z.object({
        intencion_detectada: z.enum(["EXPLORACION", "INFORMATIVA", "NEGOCIACION", "TASACION", "CITA", "CIERRE", "OBJECION", "OTRO"]),
        vehiculos_identificados: z.array(z.string())
    }),
    respuesta_cliente: z.object({
        mensaje_whatsapp: z.string(),
        media_url: z.string().nullish(),
        media_urls: z.array(z.string()).optional(),
        accion_sugerida_app: z.enum(["ABRIR_CALCULADORA", "ENVIAR_FICHA", "SOLO_RESPONDER", "CREAR_TAREA", "CREAR_NOTA", "ENVIAR_TASACION", "ENVIAR_CATALOGO_COMPLETO"])
    }),
    razonamiento: z.string()
});

export type CerebroVentasInput = z.infer<typeof CerebroVentasInputSchema>;
export type CerebroVentasOutput = z.infer<typeof CopilotoOutputSchema>;

function extractJsonObject(text: string): string {
    const trimmed = text.trim();
    if (!trimmed) return "";

    // Si viene con ```json ... ```
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) {
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

async function generarSalidaGemini(prompt: string): Promise<unknown> {
    // Usar API key de Gemini (modelo público)
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error("Falta GOOGLE_GENAI_API_KEY o GEMINI_API_KEY en variables de entorno");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
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
    
    if (!text?.trim()) {
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
    } catch (e: any) {
        const preview = jsonText.length > 800 ? jsonText.slice(0, 800) + "…" : jsonText;
        throw new Error(`Salida no es JSON válido: ${e?.message || e}. Preview: ${preview}`);
    }
}

// Función wrapper principal
export async function ejecutarCerebroVentas(input: CerebroVentasInput): Promise<CerebroVentasOutput> {
    console.log(`[GEMINI] Iniciando CerebroVentas`);

    // Construir el prompt del sistema + contexto
    const sistemaPrompt = `
${SYSTEM_INSTRUCTION}

### CONTEXTO DE INVENTARIO (Actualizado):
${JSON.stringify(input.inventario || [], null, 2)}

### HISTORIAL CHAT (Dialogo Previo, con Roles):
${input.historial_chat.join("\n")}

### MENSAJE ACTUAL DEL CLIENTE:
"${input.mensaje_actual}"
`;

    const prompt = `${sistemaPrompt}\n\nIMPORTANTE: Respondé SOLO con un JSON válido que cumpla el schema. Sin texto extra, sin Markdown, sin backticks.`;

    const parsed = await generarSalidaGemini(prompt);
    return CopilotoOutputSchema.parse(parsed);
}
