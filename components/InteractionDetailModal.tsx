import React, { useState } from 'react';
import { Interaction } from '../types';
import { X, Save, Trash2, Calendar, MessageSquare, FileText, Phone, Mail } from 'lucide-react';

interface InteractionDetailModalProps {
    interaction: Interaction;
    onClose: () => void;
    onSave: (updatedInteraction: Interaction) => void;
    onDelete: (interactionId: string) => void;
}

const InteractionDetailModal: React.FC<InteractionDetailModalProps> = ({
    interaction,
    onClose,
    onSave,
    onDelete
}) => {
    const [notes, setNotes] = useState(interaction.notes || '');
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        onSave({
            ...interaction,
            notes
        });
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
            onDelete(interaction.id);
        }
    };

    const getIcon = () => {
        switch (interaction.type) {
            case 'call': return <Phone className="text-blue-500" />;
            case 'whatsapp': return <MessageSquare className="text-green-500" />;
            case 'email': return <Mail className="text-yellow-500" />;
            case 'note': return <FileText className="text-gray-500" />;
            case 'budget': return <FileText className="text-indigo-500" />;
            default: return <FileText className="text-gray-500" />;
        }
    };

    const getTitle = () => {
        switch (interaction.type) {
            case 'call': return 'Llamada Telefónica';
            case 'whatsapp': return 'Mensaje de WhatsApp';
            case 'email': return 'Correo Electrónico';
            case 'note': return 'Nota Manual';
            case 'budget': return 'Presupuesto';
            case 'pdf_sent': return 'PDF Enviado';
            case 'pdf_view': return 'PDF Visto';
            default: return 'Interacción';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleIn">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            {getIcon()}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{getTitle()}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(interaction.date).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {interaction.details && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700">
                            {interaction.details}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Notas</label>
                        {isEditing || interaction.type === 'note' ? (
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] text-sm"
                                placeholder="Escribe tus notas aquí..."
                            />
                        ) : (
                            <div
                                onClick={() => setIsEditing(true)}
                                className="w-full p-3 border border-gray-100 rounded-xl bg-gray-50 min-h-[60px] text-sm text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                {notes || <span className="text-gray-400 italic">Sin notas...</span>}
                            </div>
                        )}
                    </div>

                    {interaction.budget && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <h4 className="font-bold text-green-800 text-sm mb-2">Detalles del Presupuesto</h4>
                            <div className="space-y-1 text-sm text-green-700">
                                <div className="flex justify-between">
                                    <span>A Cubrir:</span>
                                    <span className="font-bold">${interaction.budget.totalACubrir.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Entregado:</span>
                                    <span className="font-bold">${interaction.budget.totalEntregado.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                    <button
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={18} />
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
                        >
                            <Save size={18} />
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractionDetailModal;
