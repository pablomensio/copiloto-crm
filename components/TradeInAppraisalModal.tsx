import React, { useState } from 'react';
import { Lead, TradeInAppraisal, SellerProfile } from '../types';
import { X, Search, Save, FileText, Loader, DollarSign, Car } from 'lucide-react';
import { analyzeMarketPrice } from '../services/marketAnalysis';
import { saveAppraisal, uploadAppraisalPDF } from '../services/appraisalService';
import { generateAppraisalPDF } from '../services/pdfGenerator';

interface TradeInAppraisalModalProps {
    lead: Lead;
    sellerProfile: SellerProfile;
    onSave: (appraisal: TradeInAppraisal) => Promise<void>;
    onClose: () => void;
}

const TradeInAppraisalModal: React.FC<TradeInAppraisalModalProps> = ({ lead, sellerProfile, onSave, onClose }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [vehicleData, setVehicleData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: 0,
        transmission: 'Manual' as 'Manual' | 'Automática',
        fuelType: 'Gasolina' as 'Gasolina' | 'Diesel' | 'Híbrido' | 'Eléctrico',
        condition: 'Muy Bueno' as 'Excelente' | 'Muy Bueno' | 'Bueno' | 'Regular' | 'Malo',
        observations: ''
    });

    // Analysis Result
    const [analysis, setAnalysis] = useState<TradeInAppraisal['marketAnalysis'] | null>(null);
    const [offeredValue, setOfferedValue] = useState<number>(0);

    const handleAnalyze = async () => {
        if (!vehicleData.make || !vehicleData.model) {
            setError("Por favor ingresa marca y modelo");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Mock vehicle object for the service
            const mockVehicle: any = {
                make: vehicleData.make,
                model: vehicleData.model,
                year: vehicleData.year
            };

            const result = await analyzeMarketPrice(mockVehicle);

            setAnalysis({
                avg_price: result.avg_price,
                min_price: result.min_price,
                max_price: result.max_price,
                suggested_trade_in: result.suggested_trade_in,
                sample_links: result.sample_links,
                analyzedAt: new Date().toISOString()
            });

            setOfferedValue(result.suggested_trade_in);
            setStep(2);
        } catch (err) {
            console.error(err);
            setError("Error al analizar el mercado. Intenta nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!analysis) return;

        setIsLoading(true);
        try {
            const appraisalId = `appraisal_${Date.now()}`;

            const newAppraisal: TradeInAppraisal = {
                id: appraisalId,
                leadId: lead.id,
                vehicleData: { ...vehicleData },
                marketAnalysis: analysis,
                offeredValue: offeredValue,
                createdAt: new Date().toISOString(),
                createdBy: 'current_user', // TODO: Get actual user ID
                status: 'sent'
            };

            // 1. Generate PDF
            const pdfBlob = generateAppraisalPDF(newAppraisal, lead.name, sellerProfile);

            // 2. Upload PDF
            const pdfUrl = await uploadAppraisalPDF(pdfBlob, lead.id);
            newAppraisal.pdfUrl = pdfUrl;

            // 3. Save Appraisal
            await onSave(newAppraisal);

            // 4. Copy Link
            navigator.clipboard.writeText(pdfUrl);
            alert("Tasación guardada y link copiado al portapapeles!");

            onClose();
        } catch (err) {
            console.error(err);
            setError("Error al guardar la tasación");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scaleIn">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Car className="text-indigo-600" />
                            Tasación de Vehículo Usado
                        </h2>
                        <p className="text-sm text-slate-500">Cliente: {lead.name}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={vehicleData.make}
                                        onChange={e => setVehicleData({ ...vehicleData, make: e.target.value })}
                                        placeholder="Ej: Toyota"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={vehicleData.model}
                                        onChange={e => setVehicleData({ ...vehicleData, model: e.target.value })}
                                        placeholder="Ej: Corolla XEI"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={vehicleData.year}
                                        onChange={e => setVehicleData({ ...vehicleData, year: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Kilometraje</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={vehicleData.mileage}
                                        onChange={e => setVehicleData({ ...vehicleData, mileage: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Transmisión</label>
                                    <select
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={vehicleData.transmission}
                                        onChange={e => setVehicleData({ ...vehicleData, transmission: e.target.value as any })}
                                    >
                                        <option>Manual</option>
                                        <option>Automática</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Combustible</label>
                                    <select
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={vehicleData.fuelType}
                                        onChange={e => setVehicleData({ ...vehicleData, fuelType: e.target.value as any })}
                                    >
                                        <option>Gasolina</option>
                                        <option>Diesel</option>
                                        <option>Híbrido</option>
                                        <option>Eléctrico</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Estado General</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={vehicleData.condition}
                                    onChange={e => setVehicleData({ ...vehicleData, condition: e.target.value as any })}
                                >
                                    <option>Excelente</option>
                                    <option>Muy Bueno</option>
                                    <option>Bueno</option>
                                    <option>Regular</option>
                                    <option>Malo</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    rows={3}
                                    value={vehicleData.observations}
                                    onChange={e => setVehicleData({ ...vehicleData, observations: e.target.value })}
                                    placeholder="Detalles adicionales, daños visibles, equipamiento extra..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Market Analysis Results */}
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                                    <Search size={18} />
                                    Análisis de Mercado
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <p className="text-xs text-slate-500">Precio Promedio</p>
                                        <p className="text-lg font-bold text-slate-800">
                                            ${analysis?.avg_price.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <p className="text-xs text-slate-500">Rango Estimado</p>
                                        <p className="text-sm font-medium text-slate-800">
                                            ${analysis?.min_price.toLocaleString()} - ${analysis?.max_price.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                                    <p className="text-xs text-green-700 font-medium mb-1">Valor de Toma Sugerido (85%)</p>
                                    <p className="text-xl font-bold text-green-800">
                                        ${analysis?.suggested_trade_in.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Offer Adjustment */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Valor Final a Ofrecer
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-slate-400" size={20} />
                                    <input
                                        type="number"
                                        className="w-full pl-10 p-3 border rounded-xl text-xl font-bold text-slate-800 focus:ring-2 focus:ring-green-500 outline-none border-slate-300"
                                        value={offeredValue}
                                        onChange={e => setOfferedValue(parseInt(e.target.value))}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Este es el valor que aparecerá destacado en la tasación formal.
                                </p>
                            </div>

                            {/* Sample Links */}
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Referencias de MercadoLibre</p>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {analysis?.sample_links.map((link, i) => (
                                        <a
                                            key={i}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-xs text-blue-600 hover:underline truncate"
                                        >
                                            {link}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                    >
                        Cancelar
                    </button>

                    {step === 1 ? (
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? <Loader className="animate-spin" size={18} /> : <Search size={18} />}
                            Analizar Mercado
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? <Loader className="animate-spin" size={18} /> : <FileText size={18} />}
                            Generar Tasación y PDF
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TradeInAppraisalModal;
