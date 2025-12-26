import React, { useState, useEffect, useRef } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const ChatWidget: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: '¡Hola! Soy Copiloto, tu asistente de Meny Cars. ¿En qué te puedo ayudar?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load session from localStorage on mount
    useEffect(() => {
        const savedSession = localStorage.getItem('chat_session_id');
        if (savedSession) {
            setSessionId(savedSession);
        }
    }, []);

    // Save session to localStorage when it changes
    useEffect(() => {
        if (sessionId) {
            localStorage.setItem('chat_session_id', sessionId);
        }
    }, [sessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            // URL harcoded para testing rápido, idealmente debe ir en .env
            const response = await fetch('https://us-central1-copiloto-crm-1764216245.cloudfunctions.net/webChat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: sessionId || undefined
                })
            });

            const data = await response.json();

            if (!sessionId && data.sessionId) {
                setSessionId(data.sessionId);
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response || 'Error al procesar mensaje'
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Disculpá, hubo un error conectando con el servidor. Intentá de nuevo.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-50 hover:scale-110"
                aria-label="Abrir chat"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[80vh] md:h-[600px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-cyan-500/30 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">
                        🤖
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Copiloto</h3>
                        <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <p className="text-xs text-cyan-100">En línea ahora</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${msg.role === 'user'
                                ? 'bg-cyan-600 text-white rounded-tr-sm'
                                : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-sm'
                            }`}>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 text-gray-100 p-4 rounded-2xl rounded-tl-sm border border-gray-700 shadow-sm">
                            <div className="flex space-x-1.5">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-900 border-t border-gray-800 select-none">
                <div className="flex space-x-2 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Escribí un mensaje..."
                        className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-500"
                        disabled={loading}
                        autoFocus
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95 flex items-center justify-center w-12"
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-600">
                        Powered by Meny Cars AI • <a href="/privacy" className="hover:text-cyan-500">Privacidad</a>
                    </p>
                </div>
            </div>
        </div>
    );
};
