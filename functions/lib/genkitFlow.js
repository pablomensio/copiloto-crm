"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ejecutarCerebroVentas = exports.CopilotoOutputSchema = void 0;
const genkit_1 = require("genkit");
const googleai_1 = require("@genkit-ai/googleai");
// Inicializar Genkit con Google AI
const ai = (0, genkit_1.genkit)({
    plugins: [(0, googleai_1.googleAI)({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
    model: "googleai/gemini-2.0-flash-lite-preview-02-05", // Usamos el modelo solicitado
});
// Esquemas
const VehiculoSchema = genkit_1.z.object({
    id: genkit_1.z.string(),
    modelo: genkit_1.z.string(),
    año: genkit_1.z.any().optional(),
    precio: genkit_1.z.any().optional(),
    url: genkit_1.z.string().optional(),
    imageUrl: genkit_1.z.string().optional(),
    imageUrls: genkit_1.z.array(genkit_1.z.string()).optional(),
    // Agrega más campos si los tienes disponibles en el objeto inventario
});
const CerebroVentasInputSchema = genkit_1.z.object({
    datos_lead: genkit_1.z.any().optional(),
    historial_chat: genkit_1.z.array(genkit_1.z.string()),
    inventario: genkit_1.z.array(VehiculoSchema).optional(),
    mensaje_actual: genkit_1.z.string(),
    contexto_origen: genkit_1.z.string().nullable().optional()
});
exports.CopilotoOutputSchema = genkit_1.z.object({
    gestion_lead: genkit_1.z.object({
        accion_lead: genkit_1.z.enum(["CREAR", "ACTUALIZAR", "SCORE", "NINGUNA"]),
        datos_extraidos: genkit_1.z.object({
            nombre: genkit_1.z.string().nullable(),
            apellido: genkit_1.z.string().nullable(),
            email: genkit_1.z.string().nullable(),
            telefono: genkit_1.z.string().nullable()
        }),
        actualizaciones_estado: genkit_1.z.object({
            score_prioridad: genkit_1.z.number().min(0).max(100),
            estado: genkit_1.z.enum(["NUEVO", "CONTACTADO", "NEGOCIACION", "CERRADO", "PERDIDO"])
        })
    }),
    analisis_conversacional: genkit_1.z.object({
        intencion_detectada: genkit_1.z.enum(["EXPLORACION", "INFORMATIVA", "NEGOCIACION", "TASACION", "CITA", "CIERRE", "OTRO"]),
        vehiculos_identificados: genkit_1.z.array(genkit_1.z.string())
    }),
    respuesta_cliente: genkit_1.z.object({
        mensaje_whatsapp: genkit_1.z.string(),
        media_url: genkit_1.z.string().nullable().optional(),
        media_urls: genkit_1.z.array(genkit_1.z.string()).optional(),
        accion_sugerida_app: genkit_1.z.enum(["ABRIR_CALCULADORA", "ENVIAR_FICHA", "SOLO_RESPONDER", "CREAR_TAREA", "CREAR_NOTA", "ENVIAR_TASACION"])
    }),
    razonamiento: genkit_1.z.string()
});
// Definir el Flujo
exports.ejecutarCerebroVentas = ai.defineFlow({
    name: "cerebroVentas",
    inputSchema: CerebroVentasInputSchema,
    outputSchema: exports.CopilotoOutputSchema,
}, async (input) => {
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
5. **DIRECCIÓN:** Si coordinas cita, pasa la dirección explícita.

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
        output: { schema: exports.CopilotoOutputSchema },
    });
    if (!output) {
        throw new Error("Genkit no generó una salida válida");
    }
    return output;
});
//# sourceMappingURL=genkitFlow.js.map