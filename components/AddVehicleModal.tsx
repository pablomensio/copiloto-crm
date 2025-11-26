import React, { useState } from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { generateVehicleDescription } from '../services/geminiService';
import { X, Save, Car, DollarSign, Calendar, Gauge, Settings, Fuel, Image as ImageIcon, Wand2 } from 'lucide-react';

interface AddVehicleModalProps {
  onAdd: (newVehicle: Vehicle) => void;
  onClose: () => void;
}

const initialFormState: Omit<Vehicle, 'id'> = {
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    status: VehicleStatus.AVAILABLE,
    imageUrl: '',
    mileage: 0,
    transmission: 'Manual',
    fuelType: 'Gasolina',
    description: '',
};

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof Vehicle, string>>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'year' || name === 'price' || name === 'mileage' ? Number(value) : value }));
  };
  
  const validate = () => {
      const newErrors: Partial<Record<keyof Vehicle, string>> = {};
      if (!formData.make) newErrors.make = "La marca es requerida";
      if (!formData.model) newErrors.model = "El modelo es requerido";
      if (formData.price <= 0) newErrors.price = "El precio debe ser mayor a cero";
      if (formData.year < 1980 || formData.year > new Date().getFullYear() + 1) newErrors.year = "Año inválido";
      if (!formData.imageUrl) newErrors.imageUrl = "La URL de la imagen es requerida";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }

  const handleGenerateDescription = async () => {
      if (!formData.make || !formData.model) {
          setErrors(prev => ({ ...prev, make: !formData.make ? 'Marca requerida' : '', model: !formData.model ? 'Modelo requerido' : ''}));
          return;
      }
      setIsGenerating(true);
      try {
          const description = await generateVehicleDescription(formData);
          setFormData(prev => ({ ...prev, description }));
      } catch (error) {
          console.error("Failed to generate description:", error);
          // Optionally show an error to the user
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSave = () => {
    if (!validate()) return;

    const newVehicle: Vehicle = {
      ...formData,
      id: `v_${Date.now()}` // Generate a unique ID
    };
    onAdd(newVehicle);
  };

  const renderInput = (id: keyof Omit<Vehicle, 'id' | 'status' | 'transmission' | 'fuelType' | 'description'>, label: string, type: string, placeholder = '', icon: React.ReactNode) => (
      <div>
          <label htmlFor={id} className="text-xs font-semibold text-gray-500 uppercase">{label}</label>
          <div className="relative mt-1">
              {icon}
              <input 
                  id={id}
                  name={id}
                  type={type} 
                  value={formData[id] as string | number}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={`w-full pl-9 pr-3 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors[id] ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-indigo-500'}`}
              />
          </div>
          {errors[id] && <p className="text-xs text-red-500 mt-1">{errors[id]}</p>}
      </div>
  )

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-scaleIn flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Añadir Nuevo Vehículo</h2>
          <p className="text-sm text-gray-500">Completa los detalles para agregarlo al inventario.</p>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {renderInput('make', 'Marca', 'text', 'Ej: Toyota', <Car size={16} className="absolute left-3 top-2.5 text-gray-400" />)}
             {renderInput('model', 'Modelo', 'text', 'Ej: Corolla', <Car size={16} className="absolute left-3 top-2.5 text-gray-400" />)}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {renderInput('year', 'Año', 'number', 'Ej: 2024', <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />)}
             {renderInput('price', 'Precio', 'number', 'Ej: 25000', <DollarSign size={16} className="absolute left-3 top-2.5 text-gray-400" />)}
             {renderInput('mileage', 'Kilometraje', 'number', 'Ej: 15000', <Gauge size={16} className="absolute left-3 top-2.5 text-gray-400" />)}
           </div>
           
           {renderInput('imageUrl', 'URL de Imagen', 'text', 'https://...', <ImageIcon size={16} className="absolute left-3 top-2.5 text-gray-400" />)}
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                  <label htmlFor="status" className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
                  <select name="status" id="status" value={formData.status} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {Object.values(VehicleStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
              </div>
              <div>
                  <label htmlFor="transmission" className="text-xs font-semibold text-gray-500 uppercase">Transmisión</label>
                  <select name="transmission" id="transmission" value={formData.transmission} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>Manual</option>
                      <option>Automática</option>
                  </select>
              </div>
              <div>
                  <label htmlFor="fuelType" className="text-xs font-semibold text-gray-500 uppercase">Combustible</label>
                  <select name="fuelType" id="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>Gasolina</option>
                      <option>Diesel</option>
                      <option>Híbrido</option>
                      <option>Eléctrico</option>
                  </select>
              </div>
           </div>

           <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="description" className="text-xs font-semibold text-gray-500 uppercase">Descripción</label>
                    <button 
                        onClick={handleGenerateDescription}
                        disabled={isGenerating || !formData.make || !formData.model}
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-wait transition-colors"
                    >
                        {isGenerating ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <Wand2 size={14} />
                        )}
                        {isGenerating ? 'Generando...' : 'Generar con IA'}
                    </button>
                </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Añade una descripción detallada o genera una con IA..."
                className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isGenerating}
              />
           </div>
        </div>

        <div className="p-6 mt-auto border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Guardar Vehículo
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleModal;
