
import React, { useState } from 'react';
import { Menu, Vehicle, SellerProfile } from '../types';
import { Phone, MessageCircle, Info } from 'lucide-react';
import VehicleCard from './VehicleCard';

interface PublicMenuViewProps {
  menu: Menu;
  vehicles: Vehicle[];
  sellerProfile: SellerProfile;
}

const PublicMenuView: React.FC<PublicMenuViewProps> = ({ menu, vehicles, sellerProfile }) => {
  // Use the menu's configuration as the default state, defaulting to true if undefined
  const [showPrices, setShowPrices] = useState(menu.withPrice ?? true);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header / Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src={sellerProfile.avatarUrl} alt="Seller" className="w-10 h-10 rounded-full border border-gray-100" />
                    <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{sellerProfile.name}</p>
                        <p className="text-xs text-gray-500">{sellerProfile.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 p-1">
                        <button 
                            onClick={() => setShowPrices(true)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${showPrices ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                        >
                            Con Precios
                        </button>
                        <button 
                            onClick={() => setShowPrices(false)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!showPrices ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                        >
                            Ocultar
                        </button>
                    </div>
                </div>
            </div>
        </header>

        {/* Hero Section */}
        <div className="bg-indigo-600 text-white py-12 px-4 text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{menu.name}</h1>
            <p className="text-indigo-100 max-w-lg mx-auto text-sm">
                He preparado esta selección especial de vehículos pensando en lo que buscas.
            </p>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-4">
            {vehicles.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>Este menú no tiene vehículos disponibles actualmente.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map(v => (
                         <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                             <div className="relative h-56 w-full">
                                <img src={v.imageUrl} className="w-full h-full object-cover" alt={v.model}/>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
                                    <h3 className="text-white font-bold text-lg">{v.make} {v.model}</h3>
                                    <p className="text-gray-200 text-sm">{v.year} • {v.mileage.toLocaleString()} km</p>
                                </div>
                             </div>
                             <div className="p-4">
                                 {showPrices && (
                                     <p className="text-2xl font-bold text-indigo-600 mb-2">${v.price.toLocaleString()}</p>
                                 )}
                                 <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                     {v.description}
                                 </p>
                                 <div className="flex gap-2">
                                     <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{v.transmission}</span>
                                     <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{v.fuelType}</span>
                                 </div>
                             </div>
                             <div className="p-4 border-t border-gray-100">
                                 <button 
                                    onClick={() => window.open(`https://wa.me/?text=Hola, me interesa el ${v.make} ${v.model} del catálogo.`, '_blank')}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                 >
                                     <MessageCircle size={18} /> Consultar
                                 </button>
                             </div>
                         </div>
                    ))}
                </div>
            )}
        </div>

        {/* Floating Contact */}
        <div className="fixed bottom-6 right-6 z-40">
             <button 
                onClick={() => window.open(`https://wa.me/?text=Hola, tengo una consulta sobre el catálogo "${menu.name}".`, '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold animate-bounce-slow"
             >
                <MessageCircle size={24} /> 
                <span className="hidden md:inline">Contactar Vendedor</span>
             </button>
        </div>
    </div>
  );
};

export default PublicMenuView;
