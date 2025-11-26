
import React, { useState } from 'react';
import { Vehicle, Menu } from '../types';
import { ArrowLeft, Save, Search, PlusCircle, Trash2, Globe, DollarSign, AlertCircle } from 'lucide-react';

interface MenuEditorViewProps {
  vehicles: Vehicle[];
  onSave: (menu: Menu) => void;
  onBack: () => void;
  initialMenu?: Menu | null;
}

const MenuEditorView: React.FC<MenuEditorViewProps> = ({ vehicles, onSave, onBack, initialMenu }) => {
  const [name, setName] = useState(initialMenu?.name || '');
  const [withPrice, setWithPrice] = useState(initialMenu?.withPrice ?? true);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(initialMenu?.vehicleIds || []);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter vehicles that are NOT selected yet for the "Available" list
  const availableVehicles = vehicles.filter(v => 
    !selectedVehicleIds.includes(v.id) &&
    `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get full objects for selected vehicles
  const selectedVehicles = selectedVehicleIds
    .map(id => vehicles.find(v => v.id === id))
    .filter((v): v is Vehicle => !!v);

  const handleAddVehicle = (id: string) => {
    setSelectedVehicleIds(prev => [...prev, id]);
  };

  const handleRemoveVehicle = (id: string) => {
    setSelectedVehicleIds(prev => prev.filter(vid => vid !== id));
  };

  const handleSave = () => {
    if (!name.trim()) {
        alert("Por favor ingresa un nombre para el menú.");
        return;
    }
    if (selectedVehicleIds.length === 0) {
        alert("Por favor selecciona al menos un vehículo.");
        return;
    }

    const newMenu: Menu = {
      id: initialMenu?.id || `menu_${Date.now()}`,
      name,
      vehicleIds: selectedVehicleIds,
      createdAt: initialMenu?.createdAt || new Date().toISOString(),
      viewCount: initialMenu?.viewCount || 0,
      active: true,
      withPrice
    };

    onSave(newMenu);
  };

  const isValid = name.trim().length > 0 && selectedVehicleIds.length > 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-screen flex flex-col bg-gray-50/50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {initialMenu ? 'Editar Catálogo' : 'Nuevo Catálogo Público'}
                    {!initialMenu && <Globe size={18} className="text-indigo-500" />}
                </h1>
                <p className="text-gray-500 text-xs md:text-sm">Selecciona los vehículos y publica tu enlace.</p>
            </div>
        </div>
        
        <div className="flex flex-col items-end">
            <button 
                onClick={handleSave}
                disabled={!isValid}
                className={`
                    px-6 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all
                    ${isValid 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 transform hover:scale-105' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }
                `}
            >
                <Save size={18} />
                {initialMenu ? 'Guardar Cambios' : 'Crear y Publicar'}
            </button>
            {!isValid && (
                <span className="text-[10px] text-red-500 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle size={10} />
                    {!name.trim() ? 'Falta el nombre' : 'Selecciona vehículos'}
                </span>
            )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        
        {/* Left Column: Configuration & Selected */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-hidden">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 shrink-0">
                <h3 className="font-bold text-gray-900 mb-4">1. Configuración</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nombre del Catálogo <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ej: Ofertas de Verano, SUVs para Familia..."
                            className={`w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 ${!name.trim() ? 'border-red-200 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-500'}`}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-md text-green-600 shadow-sm">
                                <DollarSign size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Mostrar Precios</p>
                                <p className="text-xs text-gray-500">Visible en la web pública</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setWithPrice(!withPrice)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${withPrice ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${withPrice ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">2. Vehículos Seleccionados</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${selectedVehicles.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                        {selectedVehicles.length}
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedVehicles.length === 0 && (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                            <p className="text-sm font-medium">Lista vacía</p>
                            <p className="text-xs mt-1">Selecciona vehículos del panel derecho</p>
                        </div>
                    )}
                    {selectedVehicles.map(v => (
                        <div key={v.id} className="flex gap-3 p-2 bg-white border border-gray-100 rounded-xl group hover:border-red-200 transition-colors shadow-sm">
                            <img src={v.imageUrl} alt={v.model} className="w-16 h-12 object-cover rounded-lg bg-gray-100" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{v.make} {v.model}</p>
                                <p className="text-xs text-gray-500">{v.year}</p>
                            </div>
                            <button 
                                onClick={() => handleRemoveVehicle(v.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Quitar del catálogo"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Inventory */}
        <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
             <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">3. Agregar del Inventario</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por marca, modelo o año..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {availableVehicles.map(v => (
                        <div key={v.id} className="bg-white p-3 rounded-xl border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer" onClick={() => handleAddVehicle(v.id)}>
                             <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                                <img src={v.imageUrl} alt={v.model} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2">
                                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shadow-sm ${
                                        v.status === 'Vendido' ? 'bg-red-500 text-white' : 
                                        v.status === 'Reservado' ? 'bg-orange-500 text-white' :
                                        'bg-green-500 text-white'
                                    }`}>
                                        {v.status}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors flex items-center justify-center">
                                    <PlusCircle size={32} className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all drop-shadow-lg" />
                                </div>
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-900 text-sm truncate">{v.make} {v.model}</h4>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-500">{v.year} • {v.mileage.toLocaleString()} km</p>
                                    <p className="text-sm font-bold text-indigo-600">${v.price.toLocaleString()}</p>
                                </div>
                                <button 
                                    className="w-full mt-3 py-2 bg-gray-50 group-hover:bg-indigo-600 group-hover:text-white text-gray-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    Agregar
                                </button>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile/Bottom Action Bar */}
            <div className="p-4 border-t border-gray-200 bg-white lg:hidden">
                <button 
                    onClick={handleSave}
                    disabled={!isValid}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 disabled:bg-gray-300 disabled:shadow-none transition-all"
                >
                    {initialMenu ? 'Guardar Cambios' : 'Crear Catálogo Público'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default MenuEditorView;
