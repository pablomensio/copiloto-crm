import React, { useState, useEffect } from 'react';
import { Lead, CopilotResponse, Vehicle, BudgetCalculation } from '../types';
import { analyzeLead } from '../services/geminiService';
import LeadCard from './LeadCard';
import VehicleCard from './VehicleCard';
import CopilotAction from './CopilotAction';
import { Search, MessageSquare, DollarSign, Activity, Clock, MapPin, Plus, Calendar, FileText, Calculator, ArrowLeft } from 'lucide-react';

interface DashboardViewProps {
  leads: Lead[];
  vehicles: Record<string, Vehicle>;
  onLeadUpdate: (lead: Lead) => void;
  onVehicleClick: (id: string) => void;
  markup: number;
  onAddTask: (leadId?: string) => void;
  onAddNote: (leadId: string) => void;
  onQuote: (lead: Lead, vehicle: Vehicle) => void;
  onOpenBudget: (lead: Lead, vehicle: Vehicle, budget: BudgetCalculation) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  vehicles,
  onLeadUpdate,
  onVehicleClick,
  markup,
  onAddTask,
  onAddNote,
  onQuote,
  onOpenBudget
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [copilotResponse, setCopilotResponse] = useState<CopilotResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  // Mobile View State
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];
  const selectedVehicle = selectedLead ? vehicles[selectedLead.interestedVehicleId] : null;

  useEffect(() => {
    if (!selectedLead || !selectedVehicle) return;

    const runAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await analyzeLead(selectedLead, selectedVehicle);
        setCopilotResponse(result.response);

        if (!result.fromCache) {
          onLeadUpdate({
            ...selectedLead,
            lastAnalysis: {
              hash: result.hash,
              response: result.response,
              timestamp: Date.now()
            }
          });
        }
      } catch (err) {
        setError("Error connecting to AutoSales Copilot. Please check your API Key.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, [selectedLeadId, selectedLead, selectedVehicle, onLeadUpdate]);

  const handleLeadClick = (id: string) => {
    setSelectedLeadId(id);
    setShowMobileDetail(true);
  };

  const formatDateDiff = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes === 0 ? 'Ahora' : `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffHours < 24 * 7) {
      return `${Math.floor(diffHours / 24)}d`;
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  };

  if (!selectedLead) {
    return <div className="p-8 text-center text-gray-500">No hay leads disponibles.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for Leads */}
      <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-full z-10 ${showMobileDetail ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar lead..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1 p-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Leads Activos</h2>
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              active={selectedLeadId === lead.id}
              onClick={() => handleLeadClick(lead.id)}
            />
          ))}
        </div>
      </div>

      {/* Main Content - Hidden on mobile if list is shown */}
      <main className={`flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50 pb-24 md:pb-8 ${!showMobileDetail ? 'hidden md:block' : 'block'}`}>
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Mobile Back Button */}
          <button
            onClick={() => setShowMobileDetail(false)}
            className="md:hidden flex items-center gap-2 text-gray-500 mb-4 font-medium"
          >
            <ArrowLeft size={18} /> Volver a la lista
          </button>

          {/* CLIENT PROFILE HEADER */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="relative shrink-0">
                <img src={selectedLead.avatarUrl} alt={selectedLead.name} className="w-20 h-20 rounded-full object-cover border-4 border-indigo-50 shadow-sm" />
                <span className={`absolute bottom-1 right-1 w-5 h-5 border-2 border-white rounded-full ${selectedLead.interestLevel === 'High' ? 'bg-green-500' : selectedLead.interestLevel === 'Medium' ? 'bg-yellow-500' : 'bg-gray-400'}`}></span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{selectedLead.name}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    <DollarSign size={14} className="text-gray-500" />
                    Presupuesto: <span className="font-semibold text-gray-900">${selectedLead.budget.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    <Activity size={14} className="text-gray-500" />
                    Interés: <span className={`font-semibold ${selectedLead.interestLevel === 'High' ? 'text-green-600' : selectedLead.interestLevel === 'Medium' ? 'text-yellow-600' : 'text-gray-600'}`}>{selectedLead.interestLevel}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
              <div>
                {selectedVehicle && (
                  <button
                    onClick={() => onQuote(selectedLead, selectedVehicle)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium shadow-md hover:bg-indigo-700 transition-colors"
                  >
                    <Calculator size={16} />
                    Cotizar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Adjusted Grid Layout: 2 Columns on Large Screens instead of 3 to reduce width of Strategy column */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column: Context Data */}
            <div>
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={14} /> Historial de Interacciones
                </h3>
                <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
                  Última: {formatDateDiff(selectedLead.history[0]?.date || new Date().toISOString())}
                </span>
              </div>

              {selectedVehicle && (
                <div className="mb-6">
                  <VehicleCard vehicle={selectedVehicle} markup={markup} onClick={() => onVehicleClick(selectedVehicle.id)} />
                </div>
              )}

              <section>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Actividad Reciente</h4>
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm max-h-[400px] overflow-y-auto custom-scrollbar">
                  {selectedLead.history.map((interaction) => (
                    <div key={interaction.id} className="relative pl-4 pb-4 border-l-2 border-indigo-100 last:pb-0 last:border-l-0">
                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${interaction.type === 'budget' ? 'bg-green-100 border-green-500' : 'bg-indigo-50 border-indigo-200'
                        }`}></div>
                      <div className="flex flex-col gap-1 -mt-1">
                        <div className="flex justify-between items-start">
                          <span className={`font-semibold text-sm ${interaction.type === 'budget' ? 'text-green-700' : 'text-gray-800'}`}>
                            {interaction.type === 'pdf_view' ? 'Vio PDF' :
                              interaction.type === 'pdf_sent' ? 'PDF Enviado' :
                                interaction.type === 'call' ? 'Llamada' :
                                  interaction.type === 'note' ? 'Nota Manual' :
                                    interaction.type === 'budget' ? 'Presupuesto Creado' : 'WhatsApp'}
                          </span>
                          <span className="text-[10px] text-gray-400">{formatDateDiff(interaction.date)}</span>
                        </div>
                        {interaction.details && (
                          <p className="text-gray-600 text-xs bg-gray-50 p-2 rounded border border-gray-100">
                            {interaction.details}
                          </p>
                        )}
                        {interaction.notes && (
                          <p className="text-gray-600 text-xs bg-yellow-50 p-2 rounded border border-yellow-100 italic">
                            "{interaction.notes}"
                          </p>
                        )}
                        {interaction.budget && (
                          <div className="text-xs bg-green-50 p-2 rounded border border-green-100 mt-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-bold text-green-800">Presupuesto Guardado</p>
                              <button
                                onClick={() => selectedVehicle && onOpenBudget(selectedLead, selectedVehicle, interaction.budget!)}
                                className="text-[10px] bg-white border border-green-200 text-green-700 px-2 py-0.5 rounded hover:bg-green-50 transition-colors"
                              >
                                Ver Detalle
                              </button>
                            </div>
                            <p>Total: <b>${interaction.budget.totalACubrir.toLocaleString()}</b></p>
                            <p>Entrega: ${interaction.budget.totalEntregado.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedLead.history.length === 0 && (
                    <p className="text-gray-400 text-sm italic text-center py-4">Sin historial reciente</p>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: AI Action */}
            <div>
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 ${loading ? 'animate-ping' : ''}`}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  Estrategia de Venta Sugerida
                </h3>
                {selectedLead.lastAnalysis && !loading && (
                  <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">
                    Actualizado hace {Math.floor((Date.now() - selectedLead.lastAnalysis.timestamp) / 1000)}s
                  </span>
                )}
              </div>

              {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2 shadow-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              ) : (
                <div className="transition-all duration-300 ease-in-out">
                  <CopilotAction response={copilotResponse} loading={loading} />
                </div>
              )}

              <div className="mt-6 p-5 bg-white/50 rounded-xl border border-dashed border-gray-300 hover:bg-white hover:border-gray-400 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-gray-400" />
                  <h4 className="text-xs font-bold text-gray-500 uppercase">Variables del Análisis</h4>
                </div>
                <div className="grid grid-cols-2 gap-8 text-xs text-gray-600">
                  <div>
                    <p className="font-semibold mb-1 text-gray-800">Perfil del Cliente</p>
                    <div className="flex flex-col gap-1 pl-2 border-l-2 border-gray-200">
                      <span>Presupuesto: ${selectedLead.budget.toLocaleString()}</span>
                      <span>Nivel de Interés: {selectedLead.interestLevel}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-1 text-gray-800">Estado del Vehículo</p>
                    {selectedVehicle ? (
                      <div className="flex flex-col gap-1 pl-2 border-l-2 border-gray-200">
                        <span>Disponibilidad: <span className={selectedVehicle.status === 'Disponible' ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>{selectedVehicle.status}</span></span>
                        <span>Valor: ${selectedVehicle.price.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 pl-2 border-l-2 border-gray-200">
                        <span className="text-gray-400 italic">No asignado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FAB (Floating Action Button) */}
        <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3 z-30">
          {fabOpen && (
            <>
              {selectedVehicle && (
                <button
                  onClick={() => { onQuote(selectedLead, selectedVehicle); setFabOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all animate-scaleIn"
                >
                  <span className="text-sm font-medium">Cotizar</span>
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <Calculator size={18} />
                  </div>
                </button>
              )}
              <button
                onClick={() => { onAddNote(selectedLead.id); setFabOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all animate-scaleIn"
              >
                <span className="text-sm font-medium">Agregar Nota</span>
                <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                  <FileText size={18} />
                </div>
              </button>
              <button
                onClick={() => { onAddTask(selectedLead.id); setFabOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-all animate-scaleIn"
              >
                <span className="text-sm font-medium">Programar Tarea</span>
                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                  <Calendar size={18} />
                </div>
              </button>
            </>
          )}
          <button
            onClick={() => setFabOpen(!fabOpen)}
            className={`p-4 rounded-full shadow-xl transition-all duration-300 ${fabOpen ? 'bg-gray-800 rotate-45' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            <Plus size={24} className="text-white" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default DashboardView;