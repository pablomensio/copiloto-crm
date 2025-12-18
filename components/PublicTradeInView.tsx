
import React, { useState } from 'react';
import { TradeInAppraisal } from '../types';
import { saveAppraisal } from '../services/appraisalService';
import { uploadVehicleImage } from '../services/firebase';
import { Camera, CheckCircle2, ChevronRight, ChevronLeft, Car, Calendar, Gauge, MessageSquare, Loader2, AlertCircle, Trash2 } from 'lucide-react';

const PublicTradeInView: React.FC = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        mileage: '',
        condition: 'Bueno' as any,
        notes: '',
        imageUrls: [] as string[]
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Extraer leadId de la URL si existe (?leadId=...)
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('leadId') || 'public_web';

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.make) newErrors.make = 'Marca requerida';
        if (!formData.model) newErrors.model = 'Modelo requerido';
        if (!formData.year) newErrors.year = 'Año requerido';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2) setStep(3);
    };

    const prevStep = () => setStep(step - 1);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setUploading(true);
        const files = Array.from(e.target.files).slice(0, 5); // Max 5 fotos
        const uploadedUrls: string[] = [...formData.imageUrls];

        try {
            for (const file of files) {
                const url = await uploadVehicleImage(file);
                uploadedUrls.push(url);
            }
            setFormData(prev => ({ ...prev, imageUrls: uploadedUrls }));
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Error al subir imágenes. Intenta de nuevo.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const appraisal: TradeInAppraisal = {
                id: `appr_${Date.now()}`,
                leadId,
                vehicleData: {
                    make: formData.make,
                    model: formData.model,
                    year: parseInt(formData.year),
                    mileage: parseInt(formData.mileage) || 0,
                    condition: formData.condition,
                    imageUrls: formData.imageUrls
                },
                notes: formData.notes,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            await saveAppraisal(appraisal);

            // 2. Add interaction to lead history (if leadId is valid)
            if (leadId && leadId !== 'public_web') {
                const { db } = await import('../services/firebase');
                const { updateDoc, arrayUnion, doc } = await import('firebase/firestore');
                const leadRef = doc(db, 'leads', leadId);
                await updateDoc(leadRef, {
                    history: arrayUnion({
                        id: `appr_int_${Date.now()}`,
                        type: 'appraisal',
                        date: new Date().toISOString(),
                        notes: `Nueva tasación recibida: ${formData.make} ${formData.model} (${formData.year})`,
                        details: `Estado: ${formData.condition}. Notas: ${formData.notes}`,
                        appraisalId: appraisal.id
                    }),
                    status: 'NEGOCIACION' // Auto-update funnel stage
                });
            }

            setSubmitted(true);
        } catch (error) {
            console.error("Error saving appraisal:", error);
            alert("Error al enviar la tasación. Por favor intenta más tarde.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 animate-scaleIn">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">¡Tasación Enviada!</h1>
                    <p className="text-gray-500">Recibimos los datos de tu vehículo. Pablo se pondrá en contacto con vos en breve para darte una cotización inicial.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
            {/* Header */}
            <header className="bg-indigo-900 text-white p-6 md:p-10 shadow-lg mb-8">
                <div className="max-w-3xl mx-auto space-y-2">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">Tasar mi Auto</h1>
                    <p className="text-indigo-200 text-sm md:text-base">Completá los datos y obtené una cotización de Meny Cars en minutos.</p>

                    {/* Stepper */}
                    <div className="flex gap-2 pt-4">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-400' : 'bg-indigo-950'}`}></div>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

                    {step === 1 && (
                        <div className="p-6 md:p-10 space-y-6 animate-fadeIn">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Car className="text-indigo-500" /> Datos del Vehículo</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Marca</label>
                                    <input
                                        type="text"
                                        value={formData.make}
                                        onChange={e => setFormData({ ...formData, make: e.target.value })}
                                        className={`w-full bg-gray-50 border ${errors.make ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500`}
                                        placeholder="Ej: Toyota"
                                    />
                                    {errors.make && <p className="text-xs text-red-500 mt-1">{errors.make}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Modelo</label>
                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                        className={`w-full bg-gray-50 border ${errors.model ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500`}
                                        placeholder="Ej: Hilux SRV"
                                    />
                                    {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Año</label>
                                    <input
                                        type="number"
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                                        className={`w-full bg-gray-50 border ${errors.year ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500`}
                                        placeholder="Ej: 2018"
                                    />
                                    {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Kilometraje</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.mileage}
                                            onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Ej: 85000"
                                        />
                                        <span className="absolute right-4 top-3.5 text-gray-400 text-xs font-bold">KM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="p-6 md:p-10 space-y-6 animate-fadeIn">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Camera className="text-indigo-500" /> Fotos y Estado</h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {formData.imageUrls.map((url, i) => (
                                    <div key={i} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-200 shadow-sm">
                                        <img src={url} className="w-full h-full object-cover" alt="Preview" />
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, idx) => idx !== i) }))}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                {formData.imageUrls.length < 5 && (
                                    <label className="aspect-square bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-100 transition-all text-indigo-600 gap-2">
                                        {uploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                                        <span className="text-[10px] font-black uppercase text-center">{uploading ? 'Subiendo...' : 'Agregar Foto'}</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                    </label>
                                )}
                            </div>

                            <div className="space-y-4 pt-4">
                                <label className="text-xs font-bold text-gray-400 uppercase block">¿En qué estado está?</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Excelente', 'Bueno', 'Regular'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setFormData({ ...formData, condition: c as any })}
                                            className={`py-3 rounded-2xl text-xs font-bold border transition-all ${formData.condition === c ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-500'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="p-6 md:p-10 space-y-6 animate-fadeIn">
                            <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="text-indigo-500" /> Detalles Finales</h2>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Contanos un poco más</label>
                                <textarea
                                    rows={4}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Detalles de mantenimiento, agregados, golpes, deudas..."
                                />
                            </div>

                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-4">
                                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                                    Recordá que la tasación online es <b>orientativa</b>. El valor final se confirmará luego de la revisión física en Meny Cars.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="p-6 md:p-10 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                        {step > 1 && (
                            <button
                                onClick={prevStep}
                                className="px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all flex items-center gap-2"
                            >
                                <ChevronLeft size={20} /> Atrás
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                onClick={nextStep}
                                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                            >
                                Siguiente <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={24} className="animate-spin" /> : 'Enviar Tasación'}
                            </button>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default PublicTradeInView;
