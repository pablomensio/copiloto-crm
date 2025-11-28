import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Lead, Vehicle, CopilotResponse, UrgencyLevel } from "../types";
import firebaseConfig from "../firebaseConfig";

const LEAD_ANALYSIS_INSTRUCTION = `
Eres "AutoSales Copilot", un asistente experto en ventas automotrices diseñado para maximizar la conversión de leads. Tu tono es profesional, conciso y estratégico.

Tu objetivo principal es analizar el historial del cliente y decirme EXACTAMENTE qué acción tomar a continuación.

REGLAS DE DECISIÓN ESTRICTAS:
- Si el cliente vio el PDF más de 3 veces: Sugiere llamada inmediata para cerrar ("Cierre por Interés").
- Si enviamos PDF hace >24h y no lo abrió: Sugiere mensaje casual por WhatsApp preguntando si recibió el archivo.
- Si el vehículo de interés se vendió (Status: Sold/Vendido): Sugiere inmediatamente 2 alternativas del inventario con precio similar (invéntalas si no tienes datos exactos, pero propón modelos reales del mercado).
- Si no hay interacción en 5 días: Sugiere un mensaje de "Reacticavación" o marcar como "Perdido".

El vehículo de interés y el historial se te proporcionarán en el prompt.
`;

const VEHICLE_DESCRIPTION_INSTRUCTION = `
Eres un copywriter experto en marketing para una concesionaria de autos de alta gama. Tu tarea es generar descripciones de venta atractivas y profesionales para vehículos.

REGLAS:
- Utiliza un tono persuasivo y elegante.
- Destaca 2-3 características clave del vehículo (ej: motor, tecnología, paquete de equipamiento, estado).
- La descripción debe tener entre 3 y 4 frases.
- No inventes características que no se te proporcionen.
- Empieza siempre con una frase impactante.
`;


const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    analisis: { type: Type.STRING, description: "Breve explicación de 1 frase sobre la situación actual." },
    accion_sugerida: { type: Type.STRING, description: "Llamada | WhatsApp | Email | Esperar" },
    urgencia: { type: Type.STRING, enum: [UrgencyLevel.Alta, UrgencyLevel.Media, UrgencyLevel.Baja] },
    borrador_mensaje: { type: Type.STRING, description: "Redacta el texto exacto que el vendedor debería enviar o decir." }
  },
  required: ["analisis", "accion_sugerida", "urgencia", "borrador_mensaje"]
};

// Generates a unique signature based on the factors that influence the AI prompt
const generateAnalysisHash = (lead: Lead, vehicle: Vehicle): string => {
  const leadSig = `${lead.id}-${lead.budget}-${lead.interestLevel}`;
  // Use the ID of the last interaction to detect changes in history
  const lastInteraction = lead.history.length > 0 ? lead.history[0].id : 'none';
  const historySig = `${lead.history.length}-${lastInteraction}`;
  const vehicleSig = `${vehicle.id}-${vehicle.status}-${vehicle.price}`;

  return `${leadSig}|${vehicleSig}|${historySig}`;
};

export interface AnalysisResult {
  response: CopilotResponse;
  hash: string;
  fromCache: boolean;
}

export const analyzeLead = async (lead: Lead, vehicle: Vehicle): Promise<AnalysisResult> => {
  const currentHash = generateAnalysisHash(lead, vehicle);

  // Check if we have a valid cached analysis
  if (lead.lastAnalysis && lead.lastAnalysis.hash === currentHash) {
    console.log(`[Copilot] Using cached analysis for lead ${lead.name}`);
    return {
      response: lead.lastAnalysis.response,
      hash: currentHash,
      fromCache: true
    };
  }

  console.log(`[Copilot] Generating NEW analysis for lead ${lead.name}`);

  // Try to get API key from env, fallback to firebase config (assuming same project)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || firebaseConfig.apiKey;

  if (!apiKey || apiKey === "TU_API_KEY_AQUI") {
    // Return a dummy response if API key is not configured to avoid app crashing
    console.warn("Gemini API Key missing or default. Returning mock analysis.");
    return {
      response: {
        analisis: "Modo de demostración (Sin conexión a IA).",
        accion_sugerida: "Configurar API Key",
        urgencia: UrgencyLevel.Baja,
        borrador_mensaje: "Por favor configura tu VITE_GEMINI_API_KEY en el archivo .env para recibir sugerencias reales."
      },
      hash: currentHash,
      fromCache: false
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const contextData = {
    fecha_actual: new Date().toLocaleString(),
    perfil_lead: {
      nombre: lead.name,
      presupuesto: lead.budget,
      interes: lead.interestLevel
    },
    vehiculo_interes: {
      modelo: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
      precio: vehicle.price,
      estado: vehicle.status
    },
    historial_interacciones: lead.history.map(h => ({
      tipo: h.type,
      fecha: h.date,
      detalles: h.details || h.notes
    }))
  };

  const prompt = `Analiza este cliente:\n${JSON.stringify(contextData, null, 2)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: LEAD_ANALYSIS_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const parsedResponse = JSON.parse(text) as CopilotResponse;

    return {
      response: parsedResponse,
      hash: currentHash,
      fromCache: false
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};


export const generateVehicleDescription = async (vehicleData: Partial<Vehicle>): Promise<string> => {
  console.log('[Copilot] Generating vehicle description for:', vehicleData.model);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || firebaseConfig.apiKey;

  if (!apiKey || apiKey === "TU_API_KEY_AQUI") {
    return "Descripción automática no disponible (API Key faltante). Este es un vehículo excelente con grandes prestaciones.";
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Genera una descripción para el siguiente vehículo:
    - Marca: ${vehicleData.make}
    - Modelo: ${vehicleData.model}
    - Año: ${vehicleData.year}
    - Kilometraje: ${vehicleData.mileage} km
    - Transmisión: ${vehicleData.transmission}
    - Combustible: ${vehicleData.fuelType}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: VEHICLE_DESCRIPTION_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 150
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI did not return a description.");
    }
    return text.trim();
  } catch (error) {
    console.error("Gemini Description Generation Error:", error);
    return "No se pudo generar la descripción automáticamente.";
  }
};
