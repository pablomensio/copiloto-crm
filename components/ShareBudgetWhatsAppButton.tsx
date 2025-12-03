import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Lead, Vehicle, BudgetCalculation } from '../types';

interface ShareBudgetWhatsAppButtonProps {
  lead: Lead;
  vehicle: Vehicle;
  budget: BudgetCalculation;
  disabled?: boolean;
  trackingUrl?: string;
  onBeforeShare?: () => Promise<string | null>; // Returns tracking URL or null
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const ShareBudgetWhatsAppButton: React.FC<ShareBudgetWhatsAppButtonProps> = ({
  lead,
  vehicle,
  budget,
  disabled,
  trackingUrl
}) => {

  const generateMessage = () => {
    const { items, totalACubrir, totalEntregado, diferencia } = budget;

    let message = `Hola ${lead.name}, te comparto el presupuesto detallado para el ${vehicle.make} ${vehicle.model}:\n\n`;
    message += "DETALLE A CUBRIR:\n";
    message += `- Valor del Vehículo: ${formatCurrency(items.valorVehiculo)}\n`;
    message += `- Transferencia: ${formatCurrency(items.transferencia)}\n`;
    if (items.costoOtorgamiento > 0) {
      message += `- Costo de Otorgamiento: ${formatCurrency(items.costoOtorgamiento)}\n`;
    }
    message += `*TOTAL A CUBRIR: ${formatCurrency(totalACubrir)}*\n\n`;

    message += "DETALLE DE TU ENTREGA:\n";
    if (items.autoUsado > 0) {
      message += `- Auto Usado: ${formatCurrency(items.autoUsado)}\n`;
    }
    if (items.pesos > 0) {
      message += `- Pesos: ${formatCurrency(items.pesos)}\n`;
    }
    if (items.sena > 0) {
      message += `- Seña: ${formatCurrency(items.sena)}\n`;
    }
    if (items.credito > 0) {
      message += `- Crédito: ${formatCurrency(items.credito)}\n`;
    }
    message += `*TOTAL ENTREGADO: ${formatCurrency(totalEntregado)}*\n\n`;

    message += "----------------------------\n";
    message += `*DIFERENCIA: ${formatCurrency(diferencia)}*\n`;
    message += "----------------------------\n\n";

    if (trackingUrl) {
      message += `Ver presupuesto online: ${trackingUrl}\n\n`;
    }

    message += "¡Quedo a tu disposición para cualquier consulta!";

    return encodeURIComponent(message);
  };

  const handleShare = () => {
    const message = generateMessage();
    const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, '') : '';
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      disabled={disabled}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed w-full sm:w-auto"
    >
      <MessageCircle size={20} />
      Compartir por WhatsApp
    </button>
  );
};

export default ShareBudgetWhatsAppButton;