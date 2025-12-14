import React, { useState } from 'react';
import { MessageSquare, Check, ArrowRight, Loader2, Building2, Users, Zap } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface OnboardingViewProps {
    organizationId: string;
    onComplete: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ organizationId, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // WhatsApp Configuration
    const [whatsappConfig, setWhatsappConfig] = useState({
        phoneNumber: '',
        maytapiProductId: '',
        maytapiPhoneId: '',
        apiKey: ''
    });

    // Deposit Configuration
    const [deposits, setDeposits] = useState<string[]>(['']);

    const handleAddDeposit = () => {
        setDeposits([...deposits, '']);
    };

    const handleDepositChange = (index: number, value: string) => {
        const newDeposits = [...deposits];
        newDeposits[index] = value;
        setDeposits(newDeposits);
    };

    const handleRemoveDeposit = (index: number) => {
        setDeposits(deposits.filter((_, i) => i !== index));
    };

    const handleSkipWhatsApp = () => {
        setCurrentStep(3);
    };

    const handleSaveWhatsApp = async () => {
        if (!whatsappConfig.phoneNumber) {
            alert('Ingresa al menos el número de WhatsApp');
            return;
        }

        setLoading(true);

        try {
            // Validar número con Maytapi (opcional)
            // const isValid = await validateMaytapiNumber(whatsappConfig);

            // Guardar configuración en Firestore
            const orgRef = doc(db, 'organizations', organizationId);
            await updateDoc(orgRef, {
                whatsappConfig: {
                    phoneNumber: whatsappConfig.phoneNumber,
                    maytapiProductId: whatsappConfig.maytapiProductId || null,
                    maytapiPhoneId: whatsappConfig.maytapiPhoneId || null,
                    apiKey: whatsappConfig.apiKey || null,
                    configuredAt: new Date().toISOString()
                }
            });

            setCurrentStep(3);
        } catch (error) {
            console.error('Error saving WhatsApp config:', error);
            alert('Error al guardar la configuración de WhatsApp');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDeposits = async () => {
        setLoading(true);

        try {
            const validDeposits = deposits.filter(d => d.trim() !== '');

            const orgRef = doc(db, 'organizations', organizationId);
            await updateDoc(orgRef, {
                deposits: validDeposits,
                onboardingCompleted: true,
                onboardingCompletedAt: new Date().toISOString()
            });

            setCurrentStep(4);

            // Completar onboarding después de 2 segundos
            setTimeout(() => {
                onComplete();
            }, 2000);

        } catch (error) {
            console.error('Error saving deposits:', error);
            alert('Error al guardar los depósitos');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Zap size={40} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            ¡Bienvenido a AutoSales CRM!
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Vamos a configurar tu cuenta en 3 simples pasos para que puedas empezar a vender más rápido.
                        </p>
                        <button
                            onClick={() => setCurrentStep(2)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
                        >
                            Comenzar
                            <ArrowRight size={20} />
                        </button>
                    </div>
                );

            case 2:
                return (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <MessageSquare size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Configurar WhatsApp</h2>
                                <p className="text-gray-600">Conecta tu número de WhatsApp Business</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>Nota:</strong> Necesitas una cuenta de Maytapi para conectar WhatsApp.
                                Si no tienes una, puedes saltear este paso y configurarlo después.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Número de WhatsApp *
                                </label>
                                <input
                                    type="tel"
                                    value={whatsappConfig.phoneNumber}
                                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumber: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="+54 9 11 1234-5678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maytapi Product ID (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={whatsappConfig.maytapiProductId}
                                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, maytapiProductId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="abc123"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maytapi Phone ID (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={whatsappConfig.maytapiPhoneId}
                                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, maytapiPhoneId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="12345"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maytapi API Key (Opcional)
                                </label>
                                <input
                                    type="password"
                                    value={whatsappConfig.apiKey}
                                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, apiKey: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={handleSkipWhatsApp}
                                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                            >
                                Saltear por Ahora
                            </button>
                            <button
                                onClick={handleSaveWhatsApp}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        Continuar
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                <Building2 size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Configurar Depósitos</h2>
                                <p className="text-gray-600">Define los depósitos o sucursales de tu negocio</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                Los depósitos te permiten organizar tu inventario por ubicación.
                                Puedes asignar vendedores a depósitos específicos.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {deposits.map((deposit, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={deposit}
                                        onChange={(e) => handleDepositChange(index, e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder={`Depósito ${index + 1} (ej: hum001, pilar002)`}
                                    />
                                    {deposits.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveDeposit(index)}
                                            className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddDeposit}
                            className="mt-4 text-indigo-600 font-semibold hover:underline"
                        >
                            + Agregar Otro Depósito
                        </button>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleSaveDeposits}
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        Finalizar
                                        <Check size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={40} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            ¡Todo Listo!
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Tu cuenta está configurada. Redirigiendo al dashboard...
                        </p>
                        <Loader2 size={32} className="text-indigo-600 animate-spin mx-auto" />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">

                {/* Progress Bar */}
                {currentStep < 4 && (
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Paso {currentStep} de 3</span>
                            <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / 3) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(currentStep / 3) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {renderStep()}
            </div>
        </div>
    );
};

export default OnboardingView;
