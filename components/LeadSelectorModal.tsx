import React, { useState } from 'react';
import { Lead } from '../types';
import { X, Search, User } from 'lucide-react';

interface LeadSelectorModalProps {
    leads: Lead[];
    onSelect: (lead: Lead) => void;
    onClose: () => void;
}

const LeadSelectorModal: React.FC<LeadSelectorModalProps> = ({ leads, onSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Seleccionar Cliente</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="p-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {filteredLeads.map(lead => (
                            <button
                                key={lead.id}
                                onClick={() => onSelect(lead)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-xl transition-colors text-left group"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 group-hover:bg-indigo-200 group-hover:text-indigo-700">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{lead.name}</p>
                                    <p className="text-xs text-gray-500">Interés: {lead.interestLevel}</p>
                                </div>
                            </button>
                        ))}
                        {filteredLeads.length === 0 && (
                            <p className="text-center text-gray-400 py-4">No se encontraron clientes</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadSelectorModal;
