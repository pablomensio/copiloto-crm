import React, { useState } from 'react';
import { DollarSign, X } from 'lucide-react';

interface MarkupViewProps {
  currentMarkup: number;
  onMarkupChange: (amount: number) => void;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
}

const MarkupView: React.FC<MarkupViewProps> = ({ currentMarkup, onMarkupChange }) => {
  const [localMarkup, setLocalMarkup] = useState<string>(currentMarkup === 0 ? '' : currentMarkup.toString());

  const handleApply = () => {
    onMarkupChange(Number(localMarkup) || 0);
  };

  const handleClear = () => {
    setLocalMarkup('');
    onMarkupChange(0);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Sumar Ganancia (Markup)</h1>
            <p className="text-gray-500 text-sm mt-1">
                Añade un valor que se sumará al precio de cada vehículo. Este cambio solo es visible para ti.
            </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800">Configurar Monto a Sumar</h3>
                <div className="space-y-2 mt-4">
                    <label htmlFor="markup-amount" className="text-sm font-medium text-gray-600">Monto a Sumar</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="markup-amount"
                            name="markup-amount"
                            type="number"
                            placeholder="0"
                            value={localMarkup}
                            onChange={(e) => setLocalMarkup(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                 {currentMarkup > 0 && (
                    <div className="mt-4 p-3 rounded-md bg-indigo-50 text-indigo-800 text-center font-semibold text-sm border border-indigo-100">
                       Monto actual aplicado: {formatCurrency(currentMarkup)}
                    </div>
                )}
            </div>
            <div className="flex justify-end gap-2 bg-gray-50 p-4 border-t border-gray-100">
                <button
                    onClick={handleClear}
                    disabled={currentMarkup === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <X className="h-4 w-4" />
                    Limpiar
                </button>
                <button
                    onClick={handleApply}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                    Aplicar Monto
                </button>
            </div>
        </div>
    </div>
  );
};

export default MarkupView;
