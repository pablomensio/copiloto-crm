import { z } from "zod";
import { SYSTEM_INSTRUCTION } from "./prompts";

// Esquemas
const VehiculoSchema = z.object({
    id: z.string(),
    modelo: z.string(),
    año: z.any().optional(), // Puede venir como string o number
    precio: z.any().optional(),
    url: z.string().optional(),
    imageUrl: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
    // Agrega más campos si los tienes disponibles en el objeto inventario
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
        media_url: z.string().nullable().optional(),
        media_urls: z.array(z.string()).optional(),
        accion_sugerida_app: z.enum(["ABRIR_CALCULADORA", "ENVIAR_FICHA", "SOLO_RESPONDER", "CREAR_TAREA", "CREAR_NOTA", "ENVIAR_TASACION", "ENVIAR_CATALOGO_COMPLETO"])
    }),
    razonamiento: z.string()
});

export type CerebroVentasInput = z.infer<typeof CerebroVentasInputSchema>;
export type CerebroVentasOutput = z.infer<typeof CopilotoOutputSchema>;

// LAZY LOADING EXTREMO: Dynamic Imports
let aiInstance: any = null;

async function getAI() {
    if (!aiInstance) {
        console.log('🔄 Inicializando Genkit con Vertex AI (Modelo Entrenado: entrenamiento)...');
        // Importamos dinámicamente para que Firebase Trigger Analysis no cargue estos módulos pesados
        const { genkit } = await import("genkit");
        const { vertexAI } = await import("@genkit-ai/vertexai");

        aiInstance = genkit({
            plugins: [
                vertexAI({
                    location: 'us-central1',
                    projectId: 'copiloto-crm-1764216245'
                })
            ],
            // Modelo entrenado en Vertex AI
            model: "vertexai/projects/127628700164/locations/us-central1/models/1994996778390257664",
        });
    }
    return aiInstance;
}

// Función wrapper
export async function ejecutarCerebroVentas(input: CerebroVentasInput): Promise<CerebroVentasOutput> {
    const ai = await getAI(); // Inicialización asíncrona

    // Construir el prompt del sistema + contexto
    // Combinamos la instrucción maestra con los datos en tiempo real
    const sistemaPrompt = `
${SYSTEM_INSTRUCTION}

### CONTEXTO DE INVENTARIO (Actualizado):
${JSON.stringify(input.inventario || [], null, 2)}

### HISTORIAL CHAT (Dialogo Previo, con Roles):
${input.historial_chat.join("\n")}

### MENSAJE ACTUAL DEL CLIENTE:
"${input.mensaje_actual}"
`;

    // Generar respuesta estructurada
    const { output } = await ai.generate({
        prompt: sistemaPrompt,
        output: { schema: CopilotoOutputSchema },
    });

    if (!output) {
        throw new Error("Genkit no generó una salida válida");
    }

    return output;
}
