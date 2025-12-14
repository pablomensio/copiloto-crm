import React, { useState } from 'react';
import { Building2, Mail, Lock, User, Phone, Zap, Check, ArrowRight, Loader2 } from 'lucide-react';

interface RegisterViewProps {
    onRegisterSuccess: (organizationId: string) => void;
    onSwitchToLogin: () => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
    const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
    const [formData, setFormData] = useState({
        // Organization Info
        organizationName: '',
        businessType: 'concesionario',

        // Admin User Info
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',

        // Plan Selection
        plan: 'basic' as 'basic' | 'pro' | 'enterprise'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Organization validation
        if (!formData.organizationName.trim()) {
            newErrors.organizationName = 'El nombre de la empresa es requerido';
        }

        // User validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Tu nombre es requerido';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setStep('loading');

        try {
            // Call Cloud Function to create organization
            const response = await fetch('/api/createOrganization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Error al crear la organización');
            }

            const { organizationId } = await response.json();

            setStep('success');

            // Redirect to onboarding after 2 seconds
            setTimeout(() => {
                onRegisterSuccess(organizationId);
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ submit: 'Error al crear la cuenta. Intenta nuevamente.' });
            setStep('form');
        }
    };

    const plans = [
        {
            id: 'basic',
            name: 'Básico',
            price: '$50',
            features: ['1 Usuario', '1 Número WhatsApp', '100 Vehículos', 'Soporte Email']
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '$100',
            features: ['5 Usuarios', '3 Números WhatsApp', 'Vehículos Ilimitados', 'Soporte Prioritario', 'Análisis Avanzado'],
            popular: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Contactar',
            features: ['Usuarios Ilimitados', 'WhatsApp Ilimitado', 'Marca Blanca', 'Soporte 24/7', 'API Personalizada']
        }
    ];

    if (step === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Creando tu cuenta...</h2>
                    <p className="text-gray-600">Estamos configurando tu CRM personalizado</p>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Cuenta Creada!</h2>
                    <p className="text-gray-600">Redirigiendo a tu dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <Zap size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">AutoSales CRM</h1>
                            <p className="text-indigo-100">Transforma tu concesionario en una máquina de ventas</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">

                    {/* Plan Selection */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Selecciona tu Plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {plans.map((plan) => (
                                <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, plan: plan.id as any })}
                                    className={`relative p-6 rounded-xl border-2 transition-all ${formData.plan === plan.id
                                            ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                                            : 'border-gray-200 hover:border-indigo-300'
                                        }`}
                                >
                                    {plan.popular && (
                                        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                                            Más Popular
                                        </span>
                                    )}
                                    <div className="text-center mb-4">
                                        <h4 className="font-bold text-lg text-gray-800">{plan.name}</h4>
                                        <p className="text-2xl font-bold text-indigo-600 mt-2">{plan.price}</p>
                                        {plan.id !== 'enterprise' && <p className="text-sm text-gray-500">/mes</p>}
                                    </div>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <Check size={16} className="text-green-500 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Organization Info */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Building2 size={20} className="text-indigo-600" />
                                Información de la Empresa
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre de la Empresa *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.organizationName}
                                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.organizationName ? 'border-red-500' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                        placeholder="Ej: AutoMax S.A."
                                    />
                                    {errors.organizationName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Negocio
                                    </label>
                                    <select
                                        value={formData.businessType}
                                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="concesionario">Concesionario</option>
                                        <option value="reventa">Reventa</option>
                                        <option value="agencia">Agencia</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Admin User Info */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={20} className="text-indigo-600" />
                                Tu Información (Administrador)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                        placeholder="Juan Pérez"
                                    />
                                    {errors.fullName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Teléfono *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                        placeholder="+54 9 11 1234-5678"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                        placeholder="tu@email.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña *
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                        placeholder="••••••••"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmar Contraseña *
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                        placeholder="••••••••"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                                {errors.submit}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            Crear Mi Cuenta
                            <ArrowRight size={20} />
                        </button>

                        {/* Login Link */}
                        <p className="text-center text-gray-600">
                            ¿Ya tienes cuenta?{' '}
                            <button
                                type="button"
                                onClick={onSwitchToLogin}
                                className="text-indigo-600 font-semibold hover:underline"
                            >
                                Inicia Sesión
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterView;
