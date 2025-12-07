
import React, { useState, useEffect } from 'react';
import { Vehicle, BudgetCalculation, Lead } from '../types';
import { X, Check, DollarSign, Calculator, ChevronRight, ChevronLeft } from 'lucide-react';
import { calculateBudget } from '../constants'; // Assumes calculateBudget exists in constants or utilities

interface MultiBudgetModalProps {
  selectedVehicles: Vehicle[];
  lead: Lead | null;
  onSave: (budgets: Array<{ vehicleId: string; budget: BudgetCalculation }>) => void;
  onCancel: () => void;
}

const MultiBudgetModal: React.FC<MultiBudgetModalProps> = ({
  selectedVehicles,
  lead,
  onSave,
  onCancel
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [budgets, setBudgets] = useState<Record<string, BudgetCalculation>>({});
  
  // Form State for current vehicle
  const [transferencia, setTransferencia] = useState(0);
  const [costoOtorgamiento, setCostoOtorgamiento] = useState(0);
  const [autoUsado, setAutoUsado] = useState(0);
  const [pesos, setPesos] = useState(0);
  const [sena, setSena] = useState(0);
  const [credito, setCredito] = useState(0);

  const currentVehicle = selectedVehicles[currentIndex];

  useEffect(() => {
    // Reset or load existing budget when switching vehicles
    if (budgets[currentVehicle.id]) {
      const b = budgets[currentVehicle.id].items;
      setTransferencia(b.transferencia);
      setCostoOtorgamiento(b.costoOtorgamiento);
      setAutoUsado(b.autoUsado);
      setPesos(b.pesos);
      setSena(b.sena);
      setCredito(b.credito);
    } else {
      // Defaults
      setTransferencia(currentVehicle.price * 0.05); // Estimate 5%
      setCostoOtorgamiento(0);
      setAutoUsado(0);
      setPesos(0);
      setSena(0);
      setCredito(0);
    }
  }, [currentIndex, currentVehicle]);

  // Recalculate whenever inputs change
  const currentBudget = calculateBudget(
    currentVehicle.price,
    transferencia,
    costoOtorgamiento,
    autoUsado,
    pesos,
    sena,
    credito
  );

  const handleNext = () => {
    // Save current calculation
    setBudgets({
      ...budgets,
      [currentVehicle.id]: currentBudget
    });

    if (currentIndex < selectedVehicles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finish
      const finalBudgets = selectedVehicles.map(v => ({
        vehicleId: v.id,
        budget: budgets[v.id] || currentBudget // Use current if it was the last one being edited
      }));
      onSave(finalBudgets);
    }
  };

  const handlePrev = () => {
     // Save current before moving back too
     setBudgets({
      ...budgets,
      [currentVehicle.id]: currentBudget
    });
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Configurar Presupuestos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Vehículo {currentIndex + 1} de {selectedVehicles.length}: {currentVehicle.make} {currentVehicle.model}
            </p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Vehicle Info & Image */}
            <div className="space-y-4">
               <div className="rounded-xl overflow-hidden aspect-video shadow-md">
                 <img src={currentVehicle.imageUrl} className="w-full h-full object-cover" alt="Vehicle" />
               </div>
               <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 text-lg">Resumen Financiero</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valor Vehículo:</span>
                      <span className="font-bold text-gray-900">${currentVehicle.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total a Cubrir:</span>
                      <span className="font-bold text-gray-900">${currentBudget.totalACubrir.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-indigo-200 my-2"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Entregado:</span>
                      <span className="font-bold text-green-600">${currentBudget.totalEntregado.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg mt-2 p-2 bg-white rounded-lg border border-indigo-100 shadow-sm">
                      <span className="font-bold text-indigo-900">Diferencia:</span>
                      <span className={`font-bold ${currentBudget.diferencia > 0 ? 'text-red-500' : 'text-green-600'}`}>
                        ${currentBudget.diferencia.toLocaleString()}
                      </span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Right: Calculator Inputs */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Calculator size={18} />
                Calculadora
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Gastos */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gastos Adicionales</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Transferencia</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={transferencia || ''}
                        onChange={e => setTransferencia(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Costo Otorgamiento</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={costoOtorgamiento || ''}
                        onChange={e => setCostoOtorgamiento(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Entregas */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Entregas</h4>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Toma de Usado</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={autoUsado || ''}
                        onChange={e => setAutoUsado(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Efectivo/Pesos</label>
                        <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={pesos || ''}
                            onChange={e => setPesos(Number(e.target.value))}
                        />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Seña</label>
                        <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={sena || ''}
                            onChange={e => setSena(Number(e.target.value))}
                        />
                        </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Crédito Prendario</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={credito || ''}
                        onChange={e => setCredito(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
             <div className="flex gap-2">
                {selectedVehicles.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    />
                ))}
             </div>

             <div className="flex gap-3">
                <button 
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <ChevronLeft size={18} />
                    Anterior
                </button>
                <button 
                    onClick={handleNext}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                    {currentIndex === selectedVehicles.length - 1 ? (
                        <>
                           <Check size={18} />
                           Finalizar y Guardar
                        </>
                    ) : (
                        <>
                           Siguiente
                           <ChevronRight size={18} />
                        </>
                    )}
                </button>
             </div>
        </div>

      </div>
    </div>
  );
};

export default MultiBudgetModal;
