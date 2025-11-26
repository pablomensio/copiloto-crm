
import React, { useState } from 'react';
import { Vehicle } from '../types';
import VehicleCard from './VehicleCard';
import { Search, Filter, PlusCircle, Upload } from 'lucide-react';

interface InventoryViewProps {
  vehicles: Vehicle[];
  onVehicleSelect: (id: string) => void;
  onAddVehicleClick: () => void;
  onBulkUploadClick: () => void;
  markup: number;
}

const InventoryView: React.FC<InventoryViewProps> = ({ vehicles, onVehicleSelect, onAddVehicleClick, onBulkUploadClick, markup }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = vehicles.filter(v => 
    `${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
          <p className="text-gray-500 text-sm mt-1">Gestiona y visualiza la flota disponible</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar vehículo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onBulkUploadClick}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm whitespace-nowrap transition-colors"
            >
              <Upload size={18} />
              Carga Masiva
            </button>
            <button 
              onClick={onAddVehicleClick}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 whitespace-nowrap transition-colors"
            >
              <PlusCircle size={18} />
              Añadir Vehículo
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVehicles.map(v => (
          <VehicleCard 
            key={v.id} 
            vehicle={v} 
            markup={markup}
            onClick={() => onVehicleSelect(v.id)} 
          />
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No se encontraron vehículos</h3>
          <p className="text-gray-500">Intenta con otros términos de búsqueda, añade un nuevo vehículo o utiliza la carga masiva.</p>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
