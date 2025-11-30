import React from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { ArrowLeft, Calendar, Gauge, Fuel, Settings, CheckCircle, Share2, Printer, Send, Users, Edit, Trash2 } from 'lucide-react';

interface VehicleDetailViewProps {
  vehicle: Vehicle;
  markup: number;
  onBack: () => void;
  onShare: () => void;
  onSendToClient: () => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
}

const VehicleDetailView: React.FC<VehicleDetailViewProps> = ({ vehicle, markup, onBack, onShare, onSendToClient, onEdit, onDelete }) => {
  const isSold = vehicle.status === VehicleStatus.SOLD;
  const finalPrice = vehicle.price + markup;

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se puede deshacer.')) {
      onDelete(vehicle.id);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Volver al Inventario
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(vehicle)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Edit size={16} />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 aspect-[4/3] bg-gray-100">
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
            {isSold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-3xl font-bold tracking-widest border-4 border-white px-8 py-3 rounded transform -rotate-12">VENDIDO</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide shadow-md ${isSold ? 'bg-red-500 text-white' :
                  vehicle.status === VehicleStatus.RESERVED ? 'bg-orange-500 text-white' :
                    'bg-green-500 text-white'
                }`}>
                {vehicle.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* Thumbnail placeholders since we only have 1 image in mock data */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`rounded-lg overflow-hidden h-20 bg-gray-200 border-2 ${i === 1 ? 'border-indigo-500' : 'border-transparent'}`}>
                <img src={vehicle.imageUrl} className="w-full h-full object-cover opacity-75 hover:opacity-100 cursor-pointer" alt="thumbnail" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Details */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-gray-400 font-medium text-lg uppercase tracking-wider">{vehicle.make}</h2>
              <h1 className="text-4xl font-extrabold text-gray-900 mt-1 mb-2">{vehicle.model}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={onShare} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" title="Compartir Link Público">
                <Share2 size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                <Printer size={20} />
              </button>
            </div>
          </div>

          <div className="mt-6 pb-6 border-b border-gray-100">
            {markup > 0 && (
              <div className="text-lg text-gray-400 line-through">
                ${vehicle.price.toLocaleString()}
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-indigo-700">${finalPrice.toLocaleString()}</span>
              <span className="text-gray-400 text-sm">Precio de lista {markup > 0 && '(con ganancia)'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-gray-100">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 mx-auto text-indigo-500 mb-2" />
              <p className="text-xs text-gray-500 uppercase">Año</p>
              <p className="font-bold text-gray-900">{vehicle.year}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Gauge className="w-5 h-5 mx-auto text-indigo-500 mb-2" />
              <p className="text-xs text-gray-500 uppercase">Kilometraje</p>
              <p className="font-bold text-gray-900">{vehicle.mileage.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Settings className="w-5 h-5 mx-auto text-indigo-500 mb-2" />
              <p className="text-xs text-gray-500 uppercase">Transmisión</p>
              <p className="font-bold text-gray-900">{vehicle.transmission}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Fuel className="w-5 h-5 mx-auto text-indigo-500 mb-2" />
              <p className="text-xs text-gray-500 uppercase">Combustible</p>
              <p className="font-bold text-gray-900">{vehicle.fuelType}</p>
            </div>
          </div>

          <div className="py-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Descripción</h3>
            <p className="text-gray-600 leading-relaxed">
              {vehicle.description}
            </p>
          </div>

          <div className="py-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Características Destacadas</h3>
            <ul className="grid grid-cols-2 gap-y-2">
              {['Garantía Extendida', 'Servicio Reciente', 'Único Dueño', 'Documentación al día'].map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-500" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={onShare}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <Share2 size={20} />
              <span>Compartir Público</span>
            </button>
            <button
              onClick={onSendToClient}
              className="flex-1 bg-white border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Users size={20} />
              <span>Enviar a Cliente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailView;