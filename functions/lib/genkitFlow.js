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
        accion_sugerida_app: genkit_1.z.enum(["ABRIR_CALCULADORA", "ENVIAR_FICHA", "SOLO_RESPONDER"])
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
1. **MEMORIA Y SALUDO:** Revisa el historial. Si ya saludaste hace poco, NO VUELVAS A DECIR "¡Hola!". Ve directo al grano.
2. **FOTOS:** Si el cliente pide fotos, detalles o "ver el auto":
   - Pon la URL de la imagen (campo 'imageUrl' del inventario) en el campo "media_url" de tu respuesta.
   - En "mensaje_whatsapp" escribe un texto corto como "Acá tenés las fotos del Toyota RAV4 🚗"
3. **EXTRAER DATOS:** Si el cliente menciona su nombre, apellídelo o email, extráelos en "datos_extraidos" y pon "accion_lead": "CREAR" o "ACTUALIZAR".
4. **DIRECCIÓN:** Si coordinas una visita, escribe explícitamente la dirección y horario.
5. **INVENTARIO:** Si el auto que piden no está en la lista JSON, di que no lo tenés y ofrece similares.

CONTEXTO DE INVENTARIO (con imageUrl para fotos):
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