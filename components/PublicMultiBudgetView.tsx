
import React, { useEffect } from 'react';
import { MultiBudget, Vehicle } from '../types';
import { Car, Phone, Calendar, ShieldCheck, Check, Info } from 'lucide-react';

interface PublicMultiBudgetViewProps {
  multiBudget: MultiBudget;
  vehicles: Vehicle[];
  onTrackView: () => void;
}

const PublicMultiBudgetView: React.FC<PublicMultiBudgetViewProps> = ({
  multiBudget,
  vehicles,
  onTrackView
}) => {
  useEffect(() => {
    onTrackView();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Header */}
      <div className="bg-indigo-900 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-500 p-2 rounded-lg">
                <Car size={24} fill="currentColor" />
             </div>
             <div>
                <h1 className="text-2xl font-bold">Presupuesto Comparativo</h1>
                <p className="text-indigo-200 text-sm">Preparado para {multiBudget.leadName}</p>
             </div>
          </div>
          <div className="text-sm bg-indigo-800 px-4 py-2 rounded-full">
            Fecha: {new Date(multiBudget.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {multiBudget.vehicles.map((item, index) => {
                const vehicle = vehicles.find(v => v.id === item.vehicleId);
                const budget = item.budget;

                if (!vehicle) return null;

                return (
                    <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-2xl">
                        {/* Vehicle Image */}
                        <div className="aspect-video relative">
                            <img 
                                src={vehicle.imageUrl} 
                                alt={`${vehicle.make} ${vehicle.model}`} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-xl font-bold">
                                Opción {index + 1}
                            </div>
                        </div>

                        {/* Vehicle Details */}
                        <div className="p-6 flex-1 flex flex-col">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">{vehicle.make} {vehicle.model}</h2>
                            <p className="text-gray-500 text-sm mb-4">{vehicle.year} • {vehicle.mileage.toLocaleString()} km • {vehicle.fuelType}</p>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                    <Check size={16} className="text-green-500" />
                                    <span>Transmisión {vehicle.transmission}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                    <ShieldCheck size={16} className="text-green-500" />
                                    <span>Garantía {vehicle.year >= 2020 ? 'Vigente' : 'Mecánica 3 meses'}</span>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 my-2"></div>

                            {/* Financial Summary */}
                            <div className="space-y-4 mt-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-500 text-sm">Valor Vehículo</span>
                                    <span className="text-lg font-bold text-gray-900">${vehicle.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-500 text-sm">Gastos (Transferencia)</span>
                                    <span className="text-gray-900 font-medium">+${budget.items.transferencia.toLocaleString()}</span>
                                </div>
                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-indigo-900 font-bold">Total a Financiar</span>
                                        <span className="text-xl font-black text-indigo-700">${budget.totalACubrir.toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs text-indigo-400 text-right">Incluye gastos administrativos</div>
                                </div>

                                {/* Payment Breakdown */}
                                <div className="space-y-2 pt-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tu Propuesta de Pago</p>
                                    
                                    {budget.items.autoUsado > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Toma de Usado</span>
                                            <span className="font-bold text-green-600">${budget.items.autoUsado.toLocaleString()}</span>
                                        </div>
                                    )}
                                    
                                    {budget.items.pesos > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Efectivo</span>
                                            <span className="font-bold text-green-600">${budget.items.pesos.toLocaleString()}</span>
                                        </div>
                                    )}

                                    {budget.items.credito > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Crédito</span>
                                            <span className="font-bold text-green-600">${budget.items.credito.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 mt-auto">
                                    <div className={`p-3 rounded-lg text-center ${budget.diferencia > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                        <div className="text-xs uppercase tracking-wider font-bold mb-1">Diferencia Final</div>
                                        <div className="text-lg font-black">
                                            {budget.diferencia > 0 ? `Faltan $${budget.diferencia.toLocaleString()}` : '¡Cubierto Totalmente!'}
                                        </div>
                                    </div>
                                </div>

                            </div>
                            
                            <button className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                                <Phone size={20} />
                                Consultar por este
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="mt-12 text-center text-gray-400 text-sm">
             <p className="flex items-center justify-center gap-2">
                <Info size={16} />
                Los precios pueden sufrir modificaciones sin previo aviso. La oferta tiene validez de 48hs.
             </p>
        </div>

      </div>
    </div>
  );
};

export default PublicMultiBudgetView;
