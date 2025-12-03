import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, DollarSign, Calendar } from 'lucide-react';
import { Lead } from '../types';

interface AddClientModalProps {
    onSave: (lead: Lead) => void;
    onClose: () => void;
    initialLead?: Lead;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onSave, onClose, initialLead }) => {
    const [formData, setFormData] = useState<Partial<Lead>>({
        name: '',
        phone: '',
        email: '',
        budget: 0,
        interestLevel: 'Medium',
        nextFollowUp: ''
    });

    useEffect(() => {
        if (initialLead) {
            setFormData(initialLead);
        }
    }, [initialLead]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'budget' ? Number(value) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newLead: Lead = {
            id: initialLead?.id || `lead_${Date.now()}`,
            name: formData.name || 'Nuevo Cliente',
            budget: formData.budget || 0,
            interestLevel: formData.interestLevel as 'High' | 'Medium' | 'Low',
            interestedVehicleId: initialLead?.interestedVehicleId || '',
            history: initialLead?.history || [],
            avatarUrl: initialLead?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'NC')}`,
            phone: formData.phone,
            email: formData.email,
            nextFollowUp: formData.nextFollowUp,
            createdAt: initialLead?.createdAt || new Date().toISOString(),
            status: initialLead?.status || 'new'
        };

        onSave(newLead);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <User className="text-indigo-600" size={24} />
                        {initialLead ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Nombre */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Ej: Juan Pérez"
                                required
                            />
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="+54 9 11..."
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="juan@mail.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Presupuesto e Interés */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Presupuesto</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Interés</label>
                            <select
                                name="interestLevel"
                                value={formData.interestLevel}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                            >
                                <option value="High">Alto 🔥</option>
                                <option value="Medium">Medio 😐</option>
                                <option value="Low">Bajo ❄️</option>
                            </select>
                        </div>
                    </div>

                    {/* Próximo Seguimiento */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Próximo Seguimiento</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="datetime-local"
                                name="nextFollowUp"
                                value={formData.nextFollowUp}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                        >
                            {initialLead ? 'Guardar Cambios' : 'Crear Cliente'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddClientModal;
