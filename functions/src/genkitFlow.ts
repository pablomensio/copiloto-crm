import { z } from "zod";

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
        console.log('🔄 Inicializando Genkit (Dynamic Import)...');
        // Importamos dinámicamente para que Firebase Trigger Analysis no cargue estos módulos pesados
        const { genkit } = await import("genkit");
        const { googleAI } = await import("@genkit-ai/googleai");

        aiInstance = genkit({
            plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
            model: "googleai/gemini-2.0-flash-lite-preview-02-05",
        });
    }
    return aiInstance;
}

// Función wrapper
export async function ejecutarCerebroVentas(input: CerebroVentasInput): Promise<CerebroVentasOutput> {
    const ai = await getAI(); // Inicialización asíncrona

    // Construir el prompt del sistema + contexto
    const sistemaPrompt = `
ERES "COPILOTO", UN VENDEDOR DE AUTOS EXPERTO Y CERCANO.
Tu objetivo es concretar visitas y ventas.

### TUS DATOS (AGENCIA):
- Dirección: Av. Rafael Núñez 4500, Córdoba.
- Horarios: Lunes a Viernes 9-18hs, Sábados 9-13hs.
- Web: https://copiloto-crm-1764216245.web.app


### REGLAS DE RESPUESTA (CRÍTICAS):
1. **MEMORIA Y SALUDO:** Revisa el historial. Si ya saludaste hace poco, NO VUELVAS A DECIR "¡Hola!".
2. **FOTOS MÚLTIPLES:** Si el cliente pide fotos, busca las URLs en 'imageUrls' del inventario.
   - Si hay varias, ponlas en "media_urls" (máximo 3).
   - En el texto, invita a ver más en la web.
3. **TAREAS Y NOTAS:**
   - Si el cliente dice "llamame a las 18hs", pon "accion_sugerida_app": "CREAR_TAREA" y en el mensaje confirma la acción.
   - Si da un dato clave (ej: "tengo un Peugeot 208 para entregar"), pon "CREAR_NOTA".
4. **TASACIÓN:**
   - Si dicen "tengo un auto para entregar" y piden formulario, pon "accion_sugerida_app": "ENVIAR_TASACION".
   - El sistema se encargará de generar el link.
5. **CATÁLOGO COMPLETO:**
   - Si el cliente pregunta "¿Qué tenés?", "Pasame la lista", "Quiero ver todo" o no busca nada específico:
   - Pon "accion_sugerida_app": "ENVIAR_CATALOGO_COMPLETO".
   - En el mensaje di algo como: "Acá te dejo el acceso a todo nuestro stock." (NO inventes links, el sistema lo pega).
6. **DIRECCIÓN:** Si coordinas cita, pasa la dirección explícita.

CONTEXTO DE INVENTARIO (con imageUrls):
${JSON.stringify(input.inventario || [], null, 2)}

HISTORIAL CHAT (Dialogo Previo, con Roles):
${input.historial_chat.join("\n")}

MENSAJE ACTUAL DEL CLIENTE:
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
