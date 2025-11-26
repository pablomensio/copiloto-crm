import React from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { Car, Tag, Calendar, Gauge, Fuel } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  markup: number;
  onClick?: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, markup, onClick }) => {
  const isSold = vehicle.status === VehicleStatus.SOLD;
  const finalPrice = vehicle.price + markup;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all duration-200' : ''
      }`}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={vehicle.imageUrl} 
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {isSold && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
            <span className="text-white font-bold tracking-wider border-2 border-white px-3 py-1 rounded">VENDIDO</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide shadow-sm ${
            isSold ? 'bg-red-500 text-white' : 
            vehicle.status === VehicleStatus.RESERVED ? 'bg-orange-500 text-white' :
            'bg-green-500 text-white'
          }`}>
            {vehicle.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          {vehicle.make} {vehicle.model}
        </h4>
        
        <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-gray-400" />
            <span>{vehicle.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel size={14} className="text-gray-400" />
            <span>{vehicle.fuelType}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-end">
          <div>
            {markup > 0 && (
              <div className="text-xs text-gray-400 line-through">
                ${vehicle.price.toLocaleString()}
              </div>
            )}
            <div className="flex items-center gap-1.5 font-bold text-xl text-indigo-700">
              <span>${finalPrice.toLocaleString()}</span>
            </div>
          </div>
          {onClick && (
            <span className="text-xs font-medium text-indigo-600 group-hover:underline">Ver Detalles &rarr;</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;