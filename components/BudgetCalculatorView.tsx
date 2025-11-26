import React, { useState, useMemo, useEffect } from 'react';
import ShareBudgetWhatsAppButton from './ShareBudgetWhatsAppButton';
import { Vehicle, Lead, BudgetCalculation } from '../types';
import { ArrowLeft, Save, User, Car, Calculator, FileText } from 'lucide-react';

interface BudgetCalculatorViewProps {
  initialVehicle?: Vehicle | null;
  initialLead?: Lead | null;
  onBack?: () => void;
  onSaveQuote?: (budget: BudgetCalculation) => void;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
}

const BudgetCalculatorView: React.FC<BudgetCalculatorViewProps> = ({ 
    initialVehicle, 
    initialLead, 
    onBack,
    onSaveQuote
}) => {
  const [aCubrir, setACubrir] = useState({
    valorVehiculo: initialVehicle ? initialVehicle.price : 0,
    transferencia: 0,
    costoOtorgamiento: 0,
  });

  const [comoSeCubre, setComoSeCubre] = useState({
    autoUsado: 0,
    pesos: 0,
    sena: 0,
    credito: 0,
  });

  // Reset states if props change (e.g. new quote started)
  useEffect(() => {
    if (initialVehicle) {
        setACubrir(prev => ({ ...prev, valorVehiculo: initialVehicle.price }));
    }
  }, [initialVehicle]);

  const totalACubrir = useMemo(() => {
    return aCubrir.valorVehiculo + aCubrir.transferencia + aCubrir.costoOtorgamiento;
  }, [aCubrir]);

  const totalComoSeCubre = useMemo(() => {
    return comoSeCubre.autoUsado + comoSeCubre.pesos + comoSeCubre.sena + comoSeCubre.credito;
  }, [comoSeCubre]);

  const diferencia = useMemo(() => {
    return totalACubrir - totalComoSeCubre;
  }, [totalACubrir, totalComoSeCubre]);
  
  const handleACubrirChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setACubrir(prev => ({ ...prev, [name]: Number(value) || 0 }));
  };
  
  const handleComoSeCubreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setComoSeCubre(prev => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const handleSave = () => {
    if (onSaveQuote) {
        const budgetData: BudgetCalculation = {
            totalACubrir,
            totalEntregado: totalComoSeCubre,
            diferencia,
            items: { ...aCubrir, ...comoSeCubre }
        };
        onSaveQuote(budgetData);
    }
  };
  
  const isButtonDisabled = totalACubrir === 0 && totalComoSeCubre === 0;
  
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fadeIn">
        {onBack && (
             <button 
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
            >
                <ArrowLeft size={18} />
                Volver al Dashboard
            </button>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Calculator className="text-indigo-600" />
                    Constructor de Tratos
                </h1>
                <p className="text-gray-500 text-sm mt-1">Genera una propuesta comercial formal.</p>
            </div>
            {initialLead && (
                <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                    <User size={16} className="text-indigo-600"/>
                    <span className="text-sm font-semibold text-indigo-900">{initialLead.name}</span>
                </div>
            )}
        </div>

        {/* DEAL HEADER CARD */}
        {initialVehicle && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex items-center gap-6">
                <img src={initialVehicle.imageUrl} alt={initialVehicle.model} className="w-24 h-16 object-cover rounded-lg border border-gray-100" />
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{initialVehicle.make}</p>
                    <h2 className="text-xl font-bold text-gray-900">{initialVehicle.model} {initialVehicle.year}</h2>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Precio Lista: {formatCurrency(initialVehicle.price)}</span>
                    </p>
                </div>
            </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
            {/* Columna A Cubrir */}
            <div className="bg-white rounded-xl shadow-lg shadow-gray-100 border border-gray-100 overflow-hidden relative group hover:border-indigo-300 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        1. Estructura de Costos
                    </h3>
                </div>
                <div className="p-6 space-y-5">
                    <div className="space-y-1">
                        <label htmlFor="valorVehiculo" className="text-xs font-bold text-gray-500 uppercase">Valor del Vehículo</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                            <input id="valorVehiculo" name="valorVehiculo" type="number" value={aCubrir.valorVehiculo} onChange={handleACubrirChange} className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"/>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="transferencia" className="text-xs font-bold text-gray-500 uppercase">Gastos Transferencia</label>
                         <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                            <input id="transferencia" name="transferencia" type="number" placeholder="0" onChange={handleACubrirChange} className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"/>
                        </div>
                    </div>
                     <div className="space-y-1">
                        <label htmlFor="costoOtorgamiento" className="text-xs font-bold text-gray-500 uppercase">Gestoría / Otros</label>
                         <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                            <input id="costoOtorgamiento" name="costoOtorgamiento" type="number" placeholder="0" onChange={handleACubrirChange} className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"/>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between font-bold text-lg bg-gray-50 p-4 border-t border-gray-100">
                    <span className="text-gray-600">Total Operación:</span>
                    <span className="text-indigo-700">{formatCurrency(totalACubrir)}</span>
                </div>
            </div>

             {/* Columna Cómo se Cubre */}
            <div className="bg-white rounded-xl shadow-lg shadow-gray-100 border border-gray-100 overflow-hidden relative group hover:border-green-300 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        2. Forma de Pago
                    </h3>
                </div>
                <div className="p-6 space-y-5">
                    <div className="space-y-1">
                        <label htmlFor="autoUsado" className="text-xs font-bold text-gray-500 uppercase">Toma de Usado</label>
                         <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                            <input id="autoUsado" name="autoUsado" type="number" placeholder="0" onChange={handleComoSeCubreChange} className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="pesos" className="text-xs font-bold text-gray-500 uppercase">Efectivo / Pesos</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                                <input id="pesos" name="pesos" type="number" placeholder="0" onChange={handleComoSeCubreChange} className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"/>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="sena" className="text-xs font-bold text-gray-500 uppercase">Seña Previa</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                                <input id="sena" name="sena" type="number" placeholder="0" onChange={handleComoSeCubreChange} className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"/>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="credito" className="text-xs font-bold text-gray-500 uppercase">Financiación / Crédito</label>
                         <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">$</span>
                            <input id="credito" name="credito" type="number" placeholder="0" onChange={handleComoSeCubreChange} className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"/>
                        </div>
                    </div>
                </div>
                 <div className="flex justify-between font-bold text-lg bg-gray-50 p-4 border-t border-gray-100">
                    <span className="text-gray-600">Total Integrado:</span>
                    <span className="text-green-700">{formatCurrency(totalComoSeCubre)}</span>
                </div>
            </div>
        </div>

        <div className="my-8">
            <div className={`rounded-xl shadow-md border-2 p-6 flex flex-row items-center justify-between transition-colors duration-500 ${
                diferencia === 0 ? 'bg-green-50 border-green-200' : 
                diferencia > 0 ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'
            }`}>
                 <div>
                    <h3 className="text-xl font-bold text-gray-800">Saldo a Cubrir</h3>
                    <p className="text-sm text-gray-500">
                        {diferencia === 0 ? '¡La operación está balanceada!' : 
                         diferencia > 0 ? 'El cliente aún debe cubrir este monto.' : 
                         'El cliente está entregando de más.'}
                    </p>
                 </div>
                 <span className={`text-3xl font-extrabold tracking-tight ${diferencia > 0 ? 'text-gray-900' : diferencia === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(diferencia)}
                </span>
            </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col md:flex-row justify-end gap-4 mt-8 pt-8 border-t border-gray-200">
            {onSaveQuote && initialLead && (
                <button
                    onClick={handleSave}
                    disabled={totalACubrir === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={20} />
                    Guardar en Historial
                </button>
            )}
            <ShareBudgetWhatsAppButton
                aCubrir={aCubrir}
                comoSeCubre={comoSeCubre}
                diferencia={diferencia}
                totalACubrir={totalACubrir}
                totalComoSeCubre={totalComoSeCubre}
                disabled={isButtonDisabled}
            />
        </div>
    </div>
  );
};

export default BudgetCalculatorView;