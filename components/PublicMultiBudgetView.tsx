import React, { useEffect, useState } from 'react';
import { MultiBudget, Vehicle, BudgetCalculation } from '../types';
import { Calendar, Gauge, Settings, Fuel, Phone, Mail, ExternalLink } from 'lucide-react';

interface PublicMultiBudgetViewProps {
    multiBudget: MultiBudget;
    vehicles: Vehicle[];
    onTrackView: () => void;
}

const PublicMultiBudgetView: React.FC<PublicMultiBudgetViewProps> = ({ multiBudget, vehicles, onTrackView }) => {
    const [hasTracked, setHasTracked] = useState(false);

    useEffect(() => {
        if (!hasTracked) {
            onTrackView();
            setHasTracked(true);
        }
    }, [hasTracked, onTrackView]);

    const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Comparación de Vehículos</h1>
                    <p className="text-lg text-gray-600">Presupuesto personalizado para {multiBudget.leadName}</p>
                    <p className="text-sm text-gray-400 mt-2">Creado el {new Date(multiBudget.createdAt).toLocaleDateString('es-AR')}</p>
                </div>
            </div>

            {/* Comparison Grid */}
            <div className="max-w-7xl mx-auto">
                <div className={`grid grid-cols-1 ${multiBudget.vehicles.length === 2 ? 'md:grid-cols-2' : multiBudget.vehicles.length === 3 ? 'md:grid-cols-3' : ''} gap-6`}>
                    {multiBudget.vehicles.map((item, index) => {
                        const vehicle = vehicles.find(v => v.id === item.vehicleId);
                        if (!vehicle) return null;

                        const budget = item.budget;

                        return (
                            <div key={vehicle.id} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
                                {/* Ranking Badge */}
                                {index === 0 && (
                                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-center py-2 font-bold text-sm">
                                        ⭐ OPCIÓN RECOMENDADA
                                    </div>
                                )}

                                {/* Vehicle Image */}
                                <div className="relative aspect-[4/3] bg-gray-200">
                                    <img
                                        src={vehicle.imageUrl}
                                        alt={`${vehicle.make} ${vehicle.model}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Vehicle Info */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500 uppercase tracking-wide">{vehicle.make}</p>
                                        <h2 className="text-2xl font-bold text-gray-900 mt-1">{vehicle.model}</h2>
                                    </div>

                                    {/* Specs Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={16} className="text-indigo-500" />
                                            <span>{vehicle.year}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Gauge size={16} className="text-indigo-500" />
                                            <span>{vehicle.mileage.toLocaleString()} km</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Settings size={16} className="text-indigo-500" />
                                            <span>{vehicle.transmission}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Fuel size={16} className="text-indigo-500" />
                                            <span>{vehicle.fuelType}</span>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Detalle Financiero</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Valor Vehículo:</span>
                                                <span className="font-semibold">{formatCurrency(budget.items.valorVehiculo)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Transferencia:</span>
                                                <span className="font-semibold">{formatCurrency(budget.items.transferencia)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Costo Otorgamiento:</span>
                                                <span className="font-semibold">{formatCurrency(budget.items.costoOtorgamiento)}</span>
                                            </div>
                                            <div className="border-t border-gray-200 pt-2 mt-2">
                                                <div className="flex justify-between font-bold text-base">
                                                    <span className="text-gray-900">Total a Cubrir:</span>
                                                    <span className="text-indigo-600">{formatCurrency(budget.totalACubrir)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Options */}
                                    <div className="bg-indigo-50 rounded-xl p-4 mb-4">
                                        <h3 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-wide">Opciones de Pago</h3>
                                        <div className="space-y-2 text-sm">
                                            {budget.items.autoUsado > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-indigo-700">Auto Usado:</span>
                                                    <span className="font-semibold text-indigo-900">{formatCurrency(budget.items.autoUsado)}</span>
                                                </div>
                                            )}
                                            {budget.items.pesos > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-indigo-700">Pesos:</span>
                                                    <span className="font-semibold text-indigo-900">{formatCurrency(budget.items.pesos)}</span>
                                                </div>
                                            )}
                                            {budget.items.sena > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-indigo-700">Seña:</span>
                                                    <span className="font-semibold text-indigo-900">{formatCurrency(budget.items.sena)}</span>
                                                </div>
                                            )}
                                            {budget.items.credito > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-indigo-700">Crédito:</span>
                                                    <span className="font-semibold text-indigo-900">{formatCurrency(budget.items.credito)}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-indigo-200 pt-2 mt-2">
                                                <div className="flex justify-between font-bold text-base">
                                                    <span className="text-indigo-900">Total Entregado:</span>
                                                    <span className="text-green-600">{formatCurrency(budget.totalEntregado)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Difference */}
                                    <div className={`rounded-xl p-4 text-center ${budget.diferencia >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                        <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: budget.diferencia >= 0 ? '#059669' : '#DC2626' }}>
                                            {budget.diferencia >= 0 ? 'A Favor' : 'Faltante'}
                                        </p>
                                        <p className="text-2xl font-bold" style={{ color: budget.diferencia >= 0 ? '#059669' : '#DC2626' }}>
                                            {formatCurrency(Math.abs(budget.diferencia))}
                                        </p>
                                    </div>

                                    {/* CTA Button */}
                                    <button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                                        <Phone size={20} />
                                        Consultar por este vehículo
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer CTA */}
            <div className="max-w-7xl mx-auto mt-12">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">¿Listo para dar el siguiente paso?</h2>
                    <p className="text-lg mb-6 opacity-90">Nuestro equipo está disponible para responder todas tus consultas</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href={`https://wa.me/5491112345678?text=Hola, vi el presupuesto comparativo y me interesa ${multiBudget.vehicles[0] ? vehicles.find(v => v.id === multiBudget.vehicles[0].vehicleId)?.model : ''}`}
                            className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            <Phone size={20} />
                            Contactar por WhatsApp
                        </a>
                        <a
                            href="mailto:ventas@concesionaria.com"
                            className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white border-2 border-white font-bold py-4 px-8 rounded-xl hover:bg-white/20 transition-all"
                        >
                            <Mail size={20} />
                            Enviar Email
                        </a>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="max-w-7xl mx-auto mt-8 text-center text-sm text-gray-500">
                <p>Los precios y condiciones están sujetos a cambios sin previo aviso.</p>
                <p className="mt-1">Este presupuesto tiene una validez de 7 días desde su creación.</p>
            </div>
        </div>
    );
};

export default PublicMultiBudgetView;
