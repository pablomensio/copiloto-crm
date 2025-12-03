import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Check, X } from 'lucide-react';

interface MultiBudgetSelectorProps {
    vehicles: Record<string, Vehicle>;
    onCreateMultiBudget: (selectedVehicleIds: string[]) => void;
    onCancel: () => void;
}

const MultiBudgetSelector: React.FC<MultiBudgetSelectorProps> = ({ vehicles, onCreateMultiBudget, onCancel }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleToggle = (vehicleId: string) => {
        if (selectedIds.includes(vehicleId)) {
            setSelectedIds(selectedIds.filter(id => id !== vehicleId));
        } else {
            if (selectedIds.length < 3) {
                setSelectedIds([...selectedIds, vehicleId]);
            }
        }
    };

    const handleCreate = () => {
        if (selectedIds.length > 0) {
            onCreateMultiBudget(selectedIds);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scaleIn" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Crear Presupuesto Comparativo</h2>
                        <p className="text-sm text-gray-500 mt-1">Selecciona hasta 3 vehículos para comparar</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Seleccionados</p>
                            <p className="text-2xl font-bold text-indigo-600">{selectedIds.length}/3</p>
                        </div>
                        <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Vehicle Grid */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.values(vehicles).map(vehicle => {
                            const isSelected = selectedIds.includes(vehicle.id);
                            const isDisabled = !isSelected && selectedIds.length >= 3;

                            return (
                                <div
                                    key={vehicle.id}
                                    onClick={() => !isDisabled && handleToggle(vehicle.id)}
                                    className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${isSelected
                                            ? 'border-indigo-500 shadow-lg shadow-indigo-200 scale-105'
                                            : isDisabled
                                                ? 'border-gray-200 opacity-50 cursor-not-allowed'
                                                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                        }`}
                                >
                                    {/* Selection Badge */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 z-10 bg-indigo-600 text-white rounded-full p-2 shadow-lg">
                                            <Check size={20} />
                                        </div>
                                    )}

                                    {/* Vehicle Image */}
                                    <div className="aspect-[4/3] bg-gray-100">
                                        <img
                                            src={vehicle.imageUrl}
                                            alt={`${vehicle.make} ${vehicle.model}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Vehicle Info */}
                                    <div className="p-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">{vehicle.make}</p>
                                        <h3 className="text-lg font-bold text-gray-900 mt-1">{vehicle.model}</h3>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-sm text-gray-600">{vehicle.year}</p>
                                            <p className="text-lg font-bold text-indigo-600">${vehicle.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={selectedIds.length === 0}
                        className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Continuar con {selectedIds.length} vehículo{selectedIds.length !== 1 ? 's' : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MultiBudgetSelector;
