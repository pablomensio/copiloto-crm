import React from 'react';
import { MessageCircle } from 'lucide-react';

interface Budget {
  valorVehiculo: number;
  transferencia: number;
  costoOtorgamiento: number;
}

interface Coverage {
  autoUsado: number;
  pesos: number;
  sena: number;
  credito: number;
}

interface ShareBudgetWhatsAppButtonProps {
  aCubrir: Budget;
  comoSeCubre: Coverage;
  diferencia: number;
  totalACubrir: number;
  totalComoSeCubre: number;
  disabled: boolean;
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
  aCubrir,
  comoSeCubre,
  diferencia,
  totalACubrir,
  totalComoSeCubre,
  disabled
}) => {

  const generateMessage = () => {
    let message = "Hola, te comparto el presupuesto detallado:\n\n";
    message += "DETALLE A CUBRIR:\n";
    message += `- Valor del Vehículo: ${formatCurrency(aCubrir.valorVehiculo)}\n`;
    message += `- Transferencia: ${formatCurrency(aCubrir.transferencia)}\n`;
    if (aCubrir.costoOtorgamiento > 0) {
      message += `- Costo de Otorgamiento: ${formatCurrency(aCubrir.costoOtorgamiento)}\n`;
    }
    message += `*TOTAL A CUBRIR: ${formatCurrency(totalACubrir)}*\n\n`;

    message += "DETALLE DE TU ENTREGA:\n";
    if (comoSeCubre.autoUsado > 0) {
      message += `- Auto Usado: ${formatCurrency(comoSeCubre.autoUsado)}\n`;
    }
    if (comoSeCubre.pesos > 0) {
      message += `- Pesos: ${formatCurrency(comoSeCubre.pesos)}\n`;
    }
    if (comoSeCubre.sena > 0) {
      message += `- Seña: ${formatCurrency(comoSeCubre.sena)}\n`;
    }
    if (comoSeCubre.credito > 0) {
      message += `- Crédito: ${formatCurrency(comoSeCubre.credito)}\n`;
    }
    message += `*TOTAL ENTREGADO: ${formatCurrency(totalComoSeCubre)}*\n\n`;

    message += "----------------------------\n";
    message += `*DIFERENCIA: ${formatCurrency(diferencia)}*\n`;
    message += "----------------------------\n\n";
    message += "¡Quedo a tu disposición para cualquier consulta!";

    return encodeURIComponent(message);
  };

  const handleShare = () => {
    const message = generateMessage();
    const url = `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      disabled={disabled}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-600 transition-all disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
    >
      <MessageCircle size={20} />
      Compartir por WhatsApp
    </button>
  );
};

export default ShareBudgetWhatsAppButton;