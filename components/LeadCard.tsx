import React from 'react';
import { Lead } from '../types';
import { User, DollarSign, Activity, Phone, MessageSquare, Mail, Clock } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  active: boolean;
  onClick: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, active, onClick }) => {
  const handleAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    if (action === 'call' && lead.phone) window.open(`tel:${lead.phone}`);
    if (action === 'whatsapp' && lead.phone) {
      const phone = lead.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}?text=Hola ${lead.name.split(' ')[0]}, te escribo de Meny Cars...`);
    }
    if (action === 'email' && lead.email) window.open(`mailto:${lead.email}?subject=Consulta`);
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl cursor-pointer transition-all duration-200 border-2 overflow-hidden flex flex-col ${active
        ? 'border-indigo-600 bg-indigo-50 shadow-md'
        : 'border-transparent bg-white hover:bg-gray-50 shadow-sm'
        }`}
    >
      <div className="p-4 flex items-center space-x-3">
        <img
          src={lead.avatarUrl}
          alt={lead.name}
          className="w-12 h-12 rounded-full object-cover border border-gray-200"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate">{lead.name}</h3>
          {lead.phone && (
            <div className="flex items-center text-xs text-gray-500 mt-0.5">
              <Phone size={10} className="mr-1 text-gray-400" />
              {lead.phone}
            </div>
          )}
          <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
            <span className="flex items-center">
              <DollarSign size={10} className="mr-0.5" />
              {lead.budget.toLocaleString()}
            </span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${lead.interestLevel === 'High' ? 'bg-green-100 text-green-700' :
              lead.interestLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
              {lead.interestLevel} Interest
            </span>
          </div>
          {lead.nextFollowUp && (
            <div className={`mt-1 text-[10px] flex items-center gap-1 ${new Date(lead.nextFollowUp) < new Date() ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
              <Clock size={10} />
              {new Date(lead.nextFollowUp).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className={`grid grid-cols-3 border-t ${active ? 'border-indigo-200 bg-indigo-100/50' : 'border-gray-100 bg-gray-50'}`}>
        <button
          onClick={(e) => handleAction(e, 'call')}
          className="py-2 flex justify-center text-gray-500 hover:text-indigo-600 hover:bg-white/50 transition-colors"
          title="Llamar"
        >
          <Phone size={14} />
        </button>
        <button
          onClick={(e) => handleAction(e, 'whatsapp')}
          className="py-2 flex justify-center text-gray-500 hover:text-green-600 hover:bg-white/50 transition-colors"
          title="WhatsApp"
        >
          <MessageSquare size={14} />
        </button>
        <button
          onClick={(e) => handleAction(e, 'email')}
          className="py-2 flex justify-center text-gray-500 hover:text-blue-600 hover:bg-white/50 transition-colors"
          title="Email"
        >
          <Mail size={14} />
        </button>
      </div>
    </div>
  );
};

export default LeadCard;