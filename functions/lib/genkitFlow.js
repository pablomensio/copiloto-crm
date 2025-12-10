"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ejecutarCerebroVentas = exports.CopilotoOutputSchema = void 0;
const zod_1 = require("zod");
// Esquemas
const VehiculoSchema = zod_1.z.object({
    id: zod_1.z.string(),
    modelo: zod_1.z.string(),
    año: zod_1.z.any().optional(),
    precio: zod_1.z.any().optional(),
    url: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().optional(),
    imageUrls: zod_1.z.array(zod_1.z.string()).optional(),
    // Agrega más campos si los tienes disponibles en el objeto inventario
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
        media_url: zod_1.z.string().nullable().optional(),
        media_urls: zod_1.z.array(zod_1.z.string()).optional(),
        accion_sugerida_app: zod_1.z.enum(["ABRIR_CALCULADORA", "ENVIAR_FICHA", "SOLO_RESPONDER", "CREAR_TAREA", "CREAR_NOTA", "ENVIAR_TASACION", "ENVIAR_CATALOGO_COMPLETO"])
    }),
    razonamiento: zod_1.z.string()
});
// LAZY LOADING EXTREMO: Dynamic Imports
let aiInstance = null;
async function getAI() {
    if (!aiInstance) {
        console.log('🔄 Inicializando Genkit (Dynamic Import)...');
        // Importamos dinámicamente para que Firebase Trigger Analysis no cargue estos módulos pesados
        const { genkit } = await Promise.resolve().then(() => __importStar(require("genkit")));
        const { googleAI } = await Promise.resolve().then(() => __importStar(require("@genkit-ai/googleai")));
        aiInstance = genkit({
            plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
            model: "googleai/gemini-2.0-flash-lite-preview-02-05",
        });
    }
    return aiInstance;
}
// Función wrapper
async function ejecutarCerebroVentas(input) {
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
        output: { schema: exports.CopilotoOutputSchema },
    });
    if (!output) {
        throw new Error("Genkit no generó una salida válida");
    }
    return output;
}
exports.ejecutarCerebroVentas = ejecutarCerebroVentas;
//# sourceMappingURL=genkitFlow.js.map