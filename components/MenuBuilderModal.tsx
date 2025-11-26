
import React, { useState } from 'react';
import { Vehicle, Menu } from '../types';
import { X, Save, Search, CheckCircle, Car } from 'lucide-react';

interface MenuBuilderModalProps {
  vehicles: Vehicle[];
  onSave: (menu: Menu) => void;
  onClose: () => void;
}

const MenuBuilderModal: React.FC<MenuBuilderModalProps> = ({ vehicles, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = vehicles.filter(v => 
    `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    setSelectedVehicleIds(prev => 
      prev.includes(id) ? prev.filter(vid => vid !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (selectedVehicleIds.length === 0) return;

    const newMenu: Menu = {
      id: `menu_${Date.now()}`,
      name,
      vehicleIds: selectedVehicleIds,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      active: true,
      withPrice: true // Default to true
    };

    onSave(newMenu);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col relative animate-scaleIn" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X size={20} />
        </button>

        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Menú</h2>
          <p className="text-sm text-gray-500">Selecciona los vehículos que quieres incluir en este catálogo.</p>
        </div>

        <div className="p-6 border-b border-gray-100 space-y-4">
           <div>
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nombre del Menú</label>
              <input 
                  type="text" 
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: SUVs para Familia Pérez..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar vehículos para agregar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {filteredVehicles.map(v => {
                   const isSelected = selectedVehicleIds.includes(v.id);
                   return (
                       <div 
                        key={v.id}
                        onClick={() => toggleSelection(v.id)}
                        className={`bg-white p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                            isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-indigo-300'
                        }`}
                       >
                           <img src={v.imageUrl} alt={v.model} className="w-16 h-12 object-cover rounded-md bg-gray-100" />
                           <div className="flex-1 min-w-0">
                               <p className="text-sm font-bold truncate">{v.make} {v.model}</p>
                               <p className="text-xs text-gray-500">{v.year} • ${v.price.toLocaleString()}</p>
                           </div>
                           <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                               isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                           }`}>
                               {isSelected && <CheckCircle size={12} className="text-white" />}
                           </div>
                       </div>
                   )
               })}
           </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white rounded-b-2xl">
            <div className="text-sm">
                <span className="font-bold text-indigo-600">{selectedVehicleIds.length}</span> vehículos seleccionados
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSave}
                    disabled={!name.trim() || selectedVehicleIds.length === 0}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={16} />
                    Crear Menú
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MenuBuilderModal;
