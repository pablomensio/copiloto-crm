import React, { useState } from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { ArrowLeft, Calendar, Gauge, Fuel, Settings, CheckCircle, Share2, Printer, Send, Users, Edit, Trash2, Brain, X, ExternalLink } from 'lucide-react';
import { analyzeMarketPrice } from '../services/marketAnalysis';

interface VehicleDetailViewProps {
  vehicle: Vehicle;
  markup: number;
  onBack: () => void;
  onShare: () => void;
  onSendToClient: () => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
}

const VehicleDetailView: React.FC<VehicleDetailViewProps> = ({ vehicle, markup, onBack, onShare, onSendToClient, onEdit, onDelete }) => {
  const isSold = vehicle.status === VehicleStatus.SOLD;
  const finalPrice = vehicle.price + markup;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer.')) {
      onDelete(vehicle.id);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeMarketPrice(vehicle);
      setAnalysisResult(result);
      setShowAnalysisModal(true);
    } catch (error) {
      alert("Error al analizar el mercado. Verifica la conexión o intenta más tarde.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fadeIn relative">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Volver al Inventario
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(vehicle)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Edit size={16} />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 aspect-[4/3] bg-gray-100">
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
            {isSold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-3xl font-bold tracking-widest border-4 border-white px-8 py-3 rounded transform -rotate-12">VENDIDO</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-md ${isSold ? 'bg-red-500 text-white' :
                vehicle.status === VehicleStatus.RESERVED ? 'bg-orange-500 text-white' :
                  'bg-green-500 text-white'
                }`}>
                {vehicle.status}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2">
            {(vehicle.imageUrls || [vehicle.imageUrl]).slice(0, 4).map((img, i) => (
              <div key={i} className={`rounded-lg overflow-hidden h-20 bg-gray-200 border-2 border-transparent hover:border-indigo-500 transition-colors`}>
                <img src={img} className="w-full h-full object-cover cursor-pointer" alt={`thumbnail ${i}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Details */}
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-gray-400 font-medium text-lg uppercase tracking-wider">{vehicle.make}</h2>
            <h1 className="text-4xl font-extrabold text-gray-900 mt-1 mb-2">{vehicle.model}</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={onShare} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Compartir Link Público">
              <Share2 size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
              <Printer size={20} />
            </button>
          </div>
        </div>

        <div className="mt-6 pb-6 border-b border-gray-100">
          {markup > 0 && (
            <div className="text-lg text-gray-400 line-through">
              ${vehicle.price.toLocaleString()}
            </div>
          )}
          <div className="flex items-baseline gap-2 justify-between">
            <div>
              <span className="text-5xl font-bold text-indigo-700">${finalPrice.toLocaleString()}</span>
              <span className="text-gray-400 text-sm ml-2">Precio de lista {markup > 0 && '(con ganancia)'}</span>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Brain size={16} />}
              Analizar Precio
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-gray-100">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 mx-auto text-indigo-500 mb-2" />
            <p className="text-xs text-gray-500 uppercase">Año</p>
            <p className="font-bold text-gray-900">{vehicle.year}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Gauge className="w-5 h-5 mx-auto text-indigo-500 mb-2" />
            <p className="text-xs text-gray-500 uppercase">Kilometraje</p>
            <p className="font-bold text-gray-900">{vehicle.mileage.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Settings className="w-5 h-5 mx-auto text-indigo-500 mb-2" />
            <p className="text-xs text-gray-500 uppercase">Transmisión</p>
            <p className="font-bold text-gray-900">{vehicle.transmission}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Fuel className="w-5 h-5 mx-auto text-indigo-500 mb-2" />
            <p className="text-xs text-gray-500 uppercase">Combustible</p>
            <p className="font-bold text-gray-900">{vehicle.fuelType}</p>
          </div>
        </div>

        <div className="py-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción</h3>
          <p className="text-gray-600 leading-relaxed">
            {vehicle.description}
          </p>
        </div>

        <div className="py-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Características Destacadas</h3>
          <ul className="grid grid-cols-2 gap-y-2">
            {['Garantía Extendida', 'Servicio Reciente', 'Único Dueño', 'Documentación al día'].map((feat, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle size={16} className="text-green-500" />
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={onShare}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <Share2 size={20} />
            <span>Compartir Público</span>
          </button>
          <button
            onClick={onSendToClient}
            className="flex-1 bg-white border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Users size={20} />
            <span>Enviar a Cliente</span>
          </button>
        </div>
      </div>

      {/* Analysis Modal */}
      {showAnalysisModal && analysisResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowAnalysisModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative animate-scaleIn" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAnalysisModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="text-purple-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Análisis de Mercado</h2>
              </div>
              <p className="text-sm text-gray-600">Basado en {analysisResult.count} publicaciones similares en MercadoLibre.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs text-green-600 font-bold uppercase mb-1">Precio Promedio</p>
                  <p className="text-2xl font-bold text-green-700">{formatCurrency(analysisResult.avg_price)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-600 font-bold uppercase mb-1">Toma Sugerida (-15%)</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(analysisResult.suggested_trade_in)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mínimo Encontrado:</span>
                  <span className="font-medium">{formatCurrency(analysisResult.min_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Máximo Encontrado:</span>
                  <span className="font-medium">{formatCurrency(analysisResult.max_price)}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Barato</span>
                  <span>Caro</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Ejemplos en MercadoLibre:</p>
                <div className="space-y-2">
                  {analysisResult.sample_links.map((link: string, i: number) => (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 hover:underline p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                      <ExternalLink size={14} />
                      Ver Publicación #{i + 1}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailView;