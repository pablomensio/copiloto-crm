
import React from 'react';
import { Vehicle, SellerProfile } from '../types';
import { ArrowLeft, Calendar, Gauge, Fuel, Cog, MessageCircle, DollarSign, CheckCircle2 } from 'lucide-react';

interface PublicVehicleDetailProps {
  vehicle: Vehicle;
  sellerProfile: SellerProfile;
  onBack: () => void;
  showPrice: boolean;
}

const PublicVehicleDetail: React.FC<PublicVehicleDetailProps> = ({ vehicle, sellerProfile, onBack, showPrice }) => {
  const whatsappUrl = `https://wa.me/${sellerProfile.phoneNumber || ''}?text=Hola ${sellerProfile.name}, estoy interesado en el ${vehicle.make} ${vehicle.model} (${vehicle.year}) que vi en tu catálogo.`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
      {/* Navbar simplificado */}
      <div className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Volver al catálogo
        </button>
        <div className="text-sm font-bold text-gray-900">{sellerProfile.name}</div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Imagen Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="aspect-video w-full bg-gray-100 relative">
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
            {showPrice && (
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-indigo-700 px-6 py-2 rounded-full font-bold text-2xl shadow-lg">
                ${vehicle.price.toLocaleString()}
              </div>
            )}
          </div>
        </div>
        {/* Gallery Thumbnails */}
        {(vehicle.imageUrls && vehicle.imageUrls.length > 1) && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-4 bg-gray-50 border-t border-gray-100">
            {vehicle.imageUrls.map((img, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-indigo-500 transition-colors">
                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Principal */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{vehicle.make} {vehicle.model}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar size={18} className="text-indigo-500" />
                <span className="font-medium">{vehicle.year}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Gauge size={18} className="text-indigo-500" />
                <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Cog size={18} className="text-indigo-500" />
                <span className="font-medium">{vehicle.transmission}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Fuel size={18} className="text-indigo-500" />
                <span className="font-medium">{vehicle.fuelType}</span>
              </div>
            </div>

            <div className="prose prose-indigo max-w-none text-gray-600">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Descripción</h3>
              <p className="whitespace-pre-line leading-relaxed">{vehicle.description}</p>
            </div>
          </div>

          {/* Características Adicionales (Ejemplo estático o dinámico si tuviéramos más campos) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Detalles y Equipamiento</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 size={16} className="text-green-500" /> Documentación al día
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 size={16} className="text-green-500" /> Mantenimientos registrados
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 size={16} className="text-green-500" /> Sin multas
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CheckCircle2 size={16} className="text-green-500" /> Transferencia inmediata
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar de Contacto (Sticky en Desktop) */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">¿Te interesa este auto?</h3>
            <p className="text-sm text-gray-500 mb-6">Contacta directamente al vendedor para agendar una visita o consultar detalles.</p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-200 mb-3"
            >
              <MessageCircle size={20} />
              Enviar WhatsApp
            </a>

            <div className="text-center">
              {sellerProfile.companyName && <p className="font-bold text-gray-800">{sellerProfile.companyName}</p>}
              {sellerProfile.businessHours && <p className="text-xs text-gray-500 mt-1">Horario: {sellerProfile.businessHours}</p>}
              <p className="text-xs text-gray-400 mt-4">Referencia: {vehicle.make} {vehicle.model} #{vehicle.id.slice(-4)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicVehicleDetail;
