import React, { useState } from 'react';
import { Vehicle, BudgetCalculation, Lead } from '../types';
import { X, Save } from 'lucide-react';
import BudgetCalculatorView from './BudgetCalculatorView';

interface MultiBudgetModalProps {
  selectedVehicles: Vehicle[];
  lead: Lead | null;
  onSave: (budgets: Array<{ vehicleId: string; budget: BudgetCalculation }>) => void;
  onCancel: () => void;
}

const MultiBudgetModal: React.FC<MultiBudgetModalProps> = ({ selectedVehicles, lead, onSave, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [budgets, setBudgets] = useState<Record<string, BudgetCalculation>>({});

  const currentVehicle = selectedVehicles[currentIndex];
  const isLastVehicle = currentIndex === selectedVehicles.length - 1;
  const allBudgetsConfigured = selectedVehicles.every(v => budgets[v.id]);

  const handleSaveBudget = (budget: BudgetCalculation) => {
    setBudgets(prev => ({
      ...prev,
      [currentVehicle.id]: budget
    }));

    if (!isLastVehicle) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinish = () => {
    const budgetArray = selectedVehicles.map(v => ({
      vehicleId: v.id,
      budget: budgets[v.id]
    }));
    onSave(budgetArray);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col animate-scaleIn" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Configurar Presupuestos</h2>
              <p className="text-sm text-gray-500 mt-1">
                Vehículo {currentIndex + 1} de {selectedVehicles.length}: {currentVehicle.make} {currentVehicle.model}
              </p>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex gap-2">
              {selectedVehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className={`flex-1 h-2 rounded-full transition-all ${budgets[vehicle.id]
                    ? 'bg-green-500'
                    : index === currentIndex
                      ? 'bg-indigo-500'
                      : 'bg-gray-200'
                    }`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {selectedVehicles.map((vehicle, index) => (
                <span key={vehicle.id} className={index === currentIndex ? 'font-bold text-indigo-600' : ''}>
                  {vehicle.model}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Calculator */}
        <div className="flex-1 overflow-y-auto p-6">
          <BudgetCalculatorView
            initialVehicle={currentVehicle}
            initialLead={lead}
            onSaveQuote={handleSaveBudget}
            readOnly={false}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="py-3 px-6 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <div className="flex-1" />
          {!isLastVehicle ? (
            <button
              onClick={() => budgets[currentVehicle.id] && setCurrentIndex(currentIndex + 1)}
              disabled={!budgets[currentVehicle.id]}
              className="py-3 px-6 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!allBudgetsConfigured}
              className="py-3 px-6 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Save size={20} />
              Crear Presupuesto Comparativo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiBudgetModal;
