"use client";

import { useEffect, useReducer, useState, FormEvent, useRef } from "react";
import { saveLead } from "../services/firebase";
import { cn } from "../lib/utils";

type Message = {
  from: "bot" | "user";
  text: string;
};

// Define los estados de la conversación
type State = {
  step: "idle" | "greeting" | "askingName" | "askingPhone" | "askingIntention" | "submitting" | "thankYou" | "error";
  history: Message[];
  name: string;
  phone: string;
  intention: string; // Nuevo campo para la intención
};

// Define las acciones que pueden cambiar el estado
type Action =
  | { type: "START_CONVERSATION" }
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_PHONE"; payload: string }
  | { type: "SET_INTENTION"; payload: string } // Nueva acción para la intención
  | { type: "SUBMIT_ANSWER" }
  | { type: "SUBMIT_LEAD" }
  | { type: "SUCCESS" }
  | { type: "FAIL" }
  | { type: "RESET"; payload: { initialMessage: Message } };

const initialState: State = {
  step: "idle",
  history: [],
  name: "",
  phone: "",
  intention: "",
};

function chatReducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return { ...initialState, step: "greeting", history: [action.payload.initialMessage] };
    case "START_CONVERSATION":
      return { ...state, step: "askingName", history: [...state.history, { from: "bot", text: "Para empezar, ¿cuál es tu nombre?" }] };
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_PHONE":
      return { ...state, phone: action.payload };
    case "SET_INTENTION": // Nueva lógica para la intención
      return { ...state, intention: action.payload };
    case "SUBMIT_ANSWER":
      if (state.step === "askingName") {
        return {
          ...state,
          step: "askingPhone",
          history: [
            ...state.history,
            { from: "user", text: state.name },
            { from: "bot", text: `¡Gracias, ${state.name}! ¿Cuál es tu número de teléfono?` },
          ],
        };
      } else if (state.step === "askingPhone") { // Después del teléfono, preguntar la intención
        return {
          ...state,
          step: "askingIntention",
          history: [
            ...state.history,
            { from: "user", text: state.phone },
            { from: "bot", text: "¿Cuál es tu principal interés?" },
          ],
        };
      }
      return state;
    case "SUBMIT_LEAD": // Se dispara después de seleccionar la intención
      return {
        ...state,
        step: "submitting",
        history: [
          ...state.history,
          { from: "user", text: state.intention }, // Añadir la intención al historial
          { from: "bot", text: "Enviando..." },
        ]
      };
    case "SUCCESS":
      return { ...state, step: "thankYou", history: [...state.history, { from: "bot", text: "¡Perfecto! Un asesor se pondrá en contacto contigo. ¡Gracias!" }] };
    case "FAIL":
      return { ...state, step: "error", history: [...state.history, { from: "bot", text: "Hubo un error. Por favor, intenta de nuevo más tarde." }] };
    default:
      return state;
  }
}

interface LeadChatProps {
  menuId?: string | null;
  carId?: string;
  initialMessage?: string;
}

export default function LeadChat({ menuId, carId, initialMessage }: LeadChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const greetingMessage: Message = { from: "bot", text: initialMessage || "¡Hola! ¿Te podemos ayudar a encontrar tu próximo auto?" };

  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    step: "greeting",
    history: [greetingMessage]
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.history]);

  useEffect(() => {
    const bubbleTimer = setTimeout(() => {
      if (!isOpen) setShowBubble(true);
    }, 3000);

    const previewTimer = setTimeout(() => {
      if (!isOpen) setShowPreview(true);
    }, 5000);

    return () => {
      clearTimeout(bubbleTimer);
      clearTimeout(previewTimer);
    };
  }, [isOpen]);

  const resetConversation = () => {
    dispatch({ type: "RESET", payload: { initialMessage: greetingMessage } });
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setShowPreview(false); // Ocultar el preview al abrir el chat
    if (!isOpen) {
      resetConversation();
    }
  };

  const handleIntentionSelect = async (intention: string) => {
    dispatch({ type: "SET_INTENTION", payload: intention });
    dispatch({ type: "SUBMIT_LEAD" });

    try {
      await saveLead({
        id: `lead_${Date.now()}`, // Generate ID
        name: state.name,
        budget: 0, // Default
        interestLevel: 'Medium', // Default
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(state.name)}`, // Default avatar
        history: [],

        // Extended fields
        phone: state.phone,
        source: 'chatbot',
        status: 'new',
        menuId: menuId || undefined,
        interestedVehicleId: carId || '', // Mapped from carId
        createdAt: new Date().toISOString(),
      });
      dispatch({ type: "SUCCESS" });
    } catch (error) {
      console.error("Error saving lead:", error);
      dispatch({ type: "FAIL" });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state.step === "askingName" && state.name) {
      dispatch({ type: "SUBMIT_ANSWER" });
    } else if (state.step === "askingPhone" && state.phone) {
      dispatch({ type: "SUBMIT_ANSWER" });
    }
  };

  if (!showBubble) {
    return null;
  }

  const intentionOptions = [
    "Quiero entregar mi auto usado en parte de pago",
    "Quiero comprar de contado",
    "Quiero entregar una parte y financiar el resto",
  ];

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4", // Changed position to bottom-right and added gap
      showPreview && !isOpen && "pointer-events-none"
    )}>
      {/* Preview Bubble (CTA) */}
      {showPreview && !isOpen && (
        <div
          className="relative bg-white text-gray-800 p-4 rounded-xl shadow-xl max-w-xs cursor-pointer pointer-events-auto border-2 border-secondary/20 animate-in fade-in slide-in-from-bottom-4 duration-500"
          onClick={toggleOpen}
        >
          <p className="text-sm font-medium text-gray-700 leading-relaxed">
            👋 {greetingMessage.text}
          </p>
          {/* Triangle Tail */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b-2 border-r-2 border-secondary/20 transform rotate-45"></div>
        </div>
      )}

      {/* Main Chat Window */}
      <div
        className={`
          bg-white rounded-xl shadow-2xl w-80 transition-all duration-300 ease-out origin-bottom-right overflow-hidden border border-gray-100
          ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none h-0"}
        `}
      >
        <div className="bg-secondary text-white p-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <img src="/assets/chatbot_avatar.png" alt="Bot" className="w-8 h-8 rounded-full" />
            <h3 className="font-bold text-lg">Asistente Virtual</h3>
          </div>
          <button onClick={toggleOpen} className="text-white/80 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 h-96 flex flex-col bg-gray-50">
          <div className="flex-grow space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {state.history.map((msg, index) => (
              <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${msg.from === 'user'
                  ? 'bg-secondary text-white rounded-br-none'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {state.step === 'greeting' && (
            <div className="flex justify-start pt-4 animate-in fade-in duration-300">
              <button
                onClick={() => dispatch({ type: 'START_CONVERSATION' })}
                className="bg-secondary text-white px-6 py-2.5 rounded-full hover:bg-secondary/90 transition-all shadow-md hover:shadow-lg text-sm font-medium w-full"
              >
                ¡Claro, ayúdame!
              </button>
            </div>
          )}

          {(state.step === "askingName" || state.step === "askingPhone") && (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4 flex-shrink-0 animate-in fade-in slide-in-from-bottom-2">
              <input
                type={state.step === "askingName" ? "text" : "tel"}
                value={state.step === "askingName" ? state.name : state.phone}
                onChange={(e) => dispatch({ type: state.step === 'askingName' ? 'SET_NAME' : 'SET_PHONE', payload: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all text-sm shadow-sm"
                placeholder={state.step === "askingName" ? "Escribe tu nombre..." : "Escribe tu teléfono..."}
                required
                autoFocus
              />
              <button type="submit" className="bg-secondary text-white p-3 rounded-xl hover:bg-secondary/90 transition-all shadow-md hover:shadow-lg flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          )}

          {state.step === "askingIntention" && (
            <div className="flex flex-col space-y-2 mt-4 flex-shrink-0 animate-in fade-in slide-in-from-bottom-2">
              {intentionOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleIntentionSelect(option)}
                  className="bg-white text-gray-700 px-4 py-3 rounded-xl border border-gray-200 hover:border-secondary hover:text-secondary hover:bg-secondary/5 transition-all text-sm text-left shadow-sm"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bubble Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="group bg-secondary text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl hover:bg-secondary/90 hover:scale-110 transition-all duration-300 ease-out z-50"
          aria-label="Abrir chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>

          {/* Notification Dot */}
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        </button>
      )}
    </div>
  );
}

