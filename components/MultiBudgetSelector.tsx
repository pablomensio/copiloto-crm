
import React, { useState } from 'react';
import { Vehicle } from '../types';
import { X, Search, CheckCircle, Car } from 'lucide-react';

interface MultiBudgetSelectorProps {
  vehicles: Record<string, Vehicle>;
  onCreateMultiBudget: (selectedIds: string[]) => void;
  onCancel: () => void;
}

const MultiBudgetSelector: React.FC<MultiBudgetSelectorProps> = ({ 
  vehicles, 
  onCreateMultiBudget, 
  onCancel 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const allVehicles = Object.values(vehicles).filter(v => v.status === 'Disponible');
  
  const filteredVehicles = allVehicles.filter(v => 
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.year.toString().includes(searchTerm)
  );
  
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(vid => vid !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert("Máximo 3 vehículos por presupuesto comparativo");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Seleccionar Vehículos para Comparar</h2>
            <p className="text-sm text-gray-500 mt-1">
              Selecciona hasta 3 vehículos para crear un presupuesto comparativo ({selectedIds.length}/3)
            </p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por marca, modelo o año..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map(vehicle => {
              const isSelected = selectedIds.includes(vehicle.id);
              return (
                <div 
                  key={vehicle.id}
                  onClick={() => toggleSelection(vehicle.id)}
                  className={`
                    relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200
                    ${isSelected 
                      ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-lg transform scale-[1.02]' 
                      : 'border-white hover:border-gray-300 shadow-sm hover:shadow-md bg-white'
                    }
                  `}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={vehicle.imageUrl} 
                      alt={`${vehicle.make} ${vehicle.model}`} 
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center backdrop-blur-[2px]">
                        <CheckCircle className="text-white drop-shadow-md" size={48} fill="currentColor" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                        {vehicle.year}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-gray-900 truncate">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-indigo-600 font-bold mt-1">
                      ${vehicle.price.toLocaleString()}
                    </p>
                    <div className="mt-3 flex gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">{vehicle.mileage.toLocaleString()} km</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">{vehicle.fuelType}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Car size={48} className="mx-auto mb-4 opacity-50" />
              <p>No se encontraron vehículos disponibles con ese criterio.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
            <span className="text-sm text-gray-500">
                {selectedIds.length === 0 
                  ? "Selecciona al menos un vehículo" 
                  : `${selectedIds.length} vehículo${selectedIds.length !== 1 ? 's' : ''} seleccionado${selectedIds.length !== 1 ? 's' : ''}`
                }
            </span>
            <div className="flex gap-3">
                <button 
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={() => onCreateMultiBudget(selectedIds)}
                    disabled={selectedIds.length === 0}
                    className={`
                        px-6 py-2.5 rounded-xl text-white font-bold shadow-lg shadow-indigo-200 transition-all
                        ${selectedIds.length === 0 
                            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                            : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5'
                        }
                    `}
                >
                    Continuar
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default MultiBudgetSelector;
