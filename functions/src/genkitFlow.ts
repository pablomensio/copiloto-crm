import { onFlow } from "@genkit-ai/firebase/functions";
import { generate } from "@genkit-ai/ai";
import { configureGenkit } from "@genkit-ai/core";
import { vertexAI } from "@genkit-ai/vertexai";
import { z } from "zod";
import { SYSTEM_INSTRUCTION } from "./prompts";

configureGenkit({
    plugins: [vertexAI({ location: "us-central1" })],
});

// Esquema de Salida
const CopilotoOutputSchema = z.object({
    gestion_lead: z.object({
        accion_lead: z.enum(["CREAR", "ACTUALIZAR", "SCORE", "NINGUNA"]),
        datos_extraidos: z.object({
            nombre: z.string().nullable(),
            apellido: z.string().nullable(),
            email: z.string().nullable(),
            telefono: z.string().nullable()
        }),
        actualizaciones_estado: z.object({
            score_prioridad: z.number().min(0).max(100),
            estado: z.enum(["NUEVO", "CONTACTADO", "NEGOCIACION", "CERRADO", "PERDIDO"])
        })
    }),
    analisis_conversacional: z.object({
        intencion_detectada: z.enum(["EXPLORACION", "INFORMATIVA", "NEGOCIACION", "TASACION", "CITA", "CIERRE", "OTRO"]),
        vehiculos_identificados: z.array(z.string())
    }),
    respuesta_cliente: z.object({
        mensaje_whatsapp: z.string(),
        accion_sugerida_app: z.enum(["ABRIR_CALCULADORA", "ENVIAR_FICHA", "SOLO_RESPONDER"])
    }),
    razonamiento: z.string()
});

export const cerebroVentas = onFlow(
    {
        name: "cerebroVentas",
        inputSchema: z.object({
            datos_lead: z.any(),
            historial_chat: z.array(z.string()),
            inventario: z.array(z.any()),
            mensaje_actual: z.string(),
            contexto_origen: z.string().nullable().optional()
        }),
        outputSchema: CopilotoOutputSchema,
    },
    async (input) => {
        const userPrompt = `
      CONTEXTO DE EJECUCIÓN:
      - DATOS LEAD: ${JSON.stringify(input.datos_lead)}
      - INVENTARIO DISPONIBLE: ${JSON.stringify(input.inventario)}
      - HISTORIAL RECIENTE: ${JSON.stringify(input.historial_chat)}
      - CONTEXTO ORIGEN (Click en catálogo): ${input.contexto_origen || "Ninguno"}
      
      MENSAJE DEL CLIENTE (Puede incluir varios unidos):
      "${input.mensaje_actual}"
    `;

        const llmResponse = await generate({
            model: "vertexai/gemini-2.0-flash-001",
            prompt: userPrompt,
            system: SYSTEM_INSTRUCTION,
            config: {
                temperature: 0.2,
            },
            output: { schema: CopilotoOutputSchema }
        });

        return llmResponse.output();
    }
);
