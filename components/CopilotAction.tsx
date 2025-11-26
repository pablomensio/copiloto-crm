import React, { useState } from 'react';
import { CopilotResponse, UrgencyLevel } from '../types';
import { MessageSquare, Phone, Mail, AlertCircle, Copy, Check } from 'lucide-react';

interface CopilotActionProps {
  response: CopilotResponse | null;
  loading: boolean;
}

const CopilotAction: React.FC<CopilotActionProps> = ({ response, loading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response.borrador_mensaje);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Initial loading state when there is no response data at all
  if (loading && !response) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">AutoSales Copilot</h3>
        <p className="text-gray-500 mt-2 text-center">Analizando comportamiento del lead...</p>
        <p className="text-xs text-gray-400 mt-1">Consultando historial y reglas de negocio</p>
      </div>
    );
  }

  // Empty state when no lead is selected or no response available
  if (!response) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px] text-gray-400">
        <MessageSquare size={48} className="mb-4 opacity-20" />
        <p>Selecciona un lead para iniciar el análisis</p>
      </div>
    );
  }

  const urgencyColors = {
    [UrgencyLevel.Alta]: 'bg-red-50 text-red-700 border-red-100',
    [UrgencyLevel.Media]: 'bg-orange-50 text-orange-700 border-orange-100',
    [UrgencyLevel.Baja]: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  const getIcon = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('llamada') || lower.includes('llamar')) return <Phone className="w-5 h-5" />;
    if (lower.includes('whatsapp') || lower.includes('mensaje')) return <MessageSquare className="w-5 h-5" />;
    return <Mail className="w-5 h-5" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-indigo-50 overflow-hidden relative">
      {/* --- Loading Overlay --- */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center transition-opacity duration-300">
           <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-sm font-medium text-indigo-700">Actualizando análisis...</p>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Copilot Analysis</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{response.accion_sugerida}</h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${urgencyColors[response.urgencia]}`}>
            Urgencia {response.urgencia}
          </div>
        </div>

        {/* Analysis Section */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {response.analisis}
            </p>
          </div>
        </div>

        {/* Draft Message Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase">Borrador Sugerido</label>
            <button 
              onClick={handleCopy}
              className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 relative group">
            <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
              "{response.borrador_mensaje}"
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
          {getIcon(response.accion_sugerida)}
          <span>Ejecutar Acción Ahora</span>
        </button>
      </div>
    </div>
  );
};

export default CopilotAction;
