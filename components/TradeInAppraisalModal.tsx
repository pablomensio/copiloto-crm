
import React, { useState } from 'react';
import { Lead, TradeInAppraisal, SellerProfile, Vehicle } from '../types';
import { X, Search, Check, Upload, Loader2, DollarSign } from 'lucide-react';
import { analyzeMarketPrice } from '../services/marketAnalysis'; 
import { uploadVehicleImage } from '../services/firebase';

interface TradeInAppraisalModalProps {
  lead: Lead;
  sellerProfile: SellerProfile;
  onSave: (appraisal: TradeInAppraisal) => Promise<void>;
  onClose: () => void;
}

const TradeInAppraisalModal: React.FC<TradeInAppraisalModalProps> = ({
  lead,
  sellerProfile,
  onSave,
  onClose
}) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Vehicle Data, 2: Analysis & Offer
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [mileage, setMileage] = useState<number>(0);
  const [transmission, setTransmission] = useState<'Automática' | 'Manual'>('Manual');
  const [fuelType, setFuelType] = useState<'Híbrido' | 'Gasolina' | 'Eléctrico' | 'Diesel'>('Gasolina');
  const [condition, setCondition] = useState<'Excelente' | 'Muy Bueno' | 'Bueno' | 'Regular' | 'Malo'>('Muy Bueno');
  const [observations, setObservations] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  
  // Analysis Result
  const [marketAnalysis, setMarketAnalysis] = useState<TradeInAppraisal['marketAnalysis'] | null>(null);
  const [offeredValue, setOfferedValue] = useState<number>(0);

  const handleAnalyze = async () => {
    if (!make || !model || !year) {
      alert("Por favor completa Marca, Modelo y Año");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Create a partial mock vehicle to satisfy the service signature
      // The service only uses make, model, year.
      const mockVehicle = {
          make,
          model,
          year
      } as Vehicle;

      const result = await analyzeMarketPrice(mockVehicle);

      const analysisData = {
          avg_price: result.avg_price,
          min_price: result.min_price,
          max_price: result.max_price,
          suggested_trade_in: result.suggested_trade_in,
          sample_links: result.sample_links,
          analyzedAt: new Date().toISOString()
      };

      setMarketAnalysis(analysisData);
      setOfferedValue(result.suggested_trade_in);
      setStep(2);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Error al analizar el mercado. Intenta nuevamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Upload photos if any
      const uploadedUrls: string[] = [];
      for (const photo of photos) {
          const url = await uploadVehicleImage(photo);
          uploadedUrls.push(url);
      }

      // 2. Construct Appraisal Object
      const newAppraisal: TradeInAppraisal = {
        id: `appr_${Date.now()}`,
        leadId: lead.id,
        vehicleData: {
          make,
          model,
          year,
          mileage,
          transmission,
          fuelType,
          condition,
          observations,
          photos: uploadedUrls
        },
        marketAnalysis: marketAnalysis!,
        offeredValue,
        vendorNotes: '',
        createdAt: new Date().toISOString(),
        createdBy: sellerProfile.name, // Should be ID ideally
        status: 'sent'
      };

      // 3. Save
      await onSave(newAppraisal);
      onClose();
    } catch (error) {
      console.error("Error saving appraisal", error);
      alert("Error al guardar tasación");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Tasación de Vehículo Usado</h2>
            <p className="text-sm text-gray-500 mt-1">Para {lead.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 mb-4">Datos del Vehículo</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Marca</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg" 
                    value={make} 
                    onChange={e => setMake(e.target.value)}
                    placeholder="Ej. Toyota"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Modelo</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg" 
                    value={model} 
                    onChange={e => setModel(e.target.value)}
                    placeholder="Ej. Corolla"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Año</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded-lg" 
                    value={year} 
                    onChange={e => setYear(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kilometraje</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded-lg" 
                    value={mileage} 
                    onChange={e => setMileage(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Transmisión</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={transmission}
                    onChange={e => setTransmission(e.target.value as any)}
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automática">Automática</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Combustible</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as any)}
                  >
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                  </select>
                </div>
              </div>

              <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estado General</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={condition}
                    onChange={e => setCondition(e.target.value as any)}
                  >
                    <option value="Excelente">Excelente (Como nuevo)</option>
                    <option value="Muy Bueno">Muy Bueno (Detalles mínimos)</option>
                    <option value="Bueno">Bueno (Uso normal)</option>
                    <option value="Regular">Regular (Requiere reparaciones)</option>
                    <option value="Malo">Malo (Daños mayores)</option>
                  </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea 
                  className="w-full p-2 border rounded-lg h-24"
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  placeholder="Detalles adicionales, equipamiento extra, daños visibles..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fotos (Opcional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handlePhotoUpload}
                    />
                    <Upload className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Haz clic o arrastra fotos aquí</p>
                    {photos.length > 0 && (
                        <p className="text-xs text-green-600 mt-2">{photos.length} fotos seleccionadas</p>
                    )}
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-6">
              {/* Analysis Result View */}
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-2">Análisis de Mercado</h3>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Precio Promedio:</span>
                    <span className="font-bold text-gray-900">${marketAnalysis?.avg_price.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500">
                    Rango: ${marketAnalysis?.min_price.toLocaleString()} - ${marketAnalysis?.max_price.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Valor de Toma Ofrecido</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-bold">$</span>
                    <input 
                        type="number" 
                        className="w-full pl-8 pr-4 py-3 text-2xl font-bold text-green-700 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-green-200"
                        value={offeredValue}
                        onChange={e => setOfferedValue(Number(e.target.value))}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    El sistema sugiere un valor del 85% del promedio de mercado, pero puedes ajustarlo manualmente.
                </p>
              </div>

              {marketAnalysis?.sample_links && marketAnalysis.sample_links.length > 0 && (
                  <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Referencias de Mercado</h4>
                      <ul className="text-xs text-blue-600 space-y-1">
                          {marketAnalysis.sample_links.map((link, idx) => (
                              <li key={idx}>
                                  <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate block">
                                      {link}
                                  </a>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
          {step === 1 ? (
            <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                {isAnalyzing ? 'Analizando...' : 'Analizar Mercado'}
            </button>
          ) : (
            <>
                <button 
                    onClick={() => setStep(1)}
                    className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-lg"
                >
                    Volver
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Check size={18} />}
                    Generar Tasación
                </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default TradeInAppraisalModal;
