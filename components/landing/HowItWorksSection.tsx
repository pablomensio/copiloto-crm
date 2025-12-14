import React from 'react';

const HowItWorksSection: React.FC = () => {
    const steps = [
        {
            number: '1',
            title: 'IA COSECHA',
            subtitle: 'El Copiloto TOMA el Lead',
            description: 'Cliente escribe a WhatsApp a las 2 AM. IA responde en 3 segundos, califica el lead, ofrece tasación de permuta y lo deja listo para cerrar.',
            details: [
                'Cliente: "Busco una SUV familiar"',
                'IA: "¡Hola! 👋 ¿Qué presupuesto tenés en mente?"',
                'Cliente: "Hasta $30,000"',
                'IA: "Perfecto. Tengo 3 opciones. ¿Preferís automática o manual?"',
                'IA: "¿Tenés un auto para dar en parte de pago?"',
                'Cliente: "Sí, un Corolla 2018"',
                'IA: "Subí 3 fotos y te doy una valuación en 2 minutos"'
            ],
            result: 'Lead calificado + Presupuesto conocido + Permuta tasada. TODO AUTOMÁTICO.',
            icon: '🤖',
            color: 'var(--accent-cyan)'
        },
        {
            number: '2',
            title: 'CRM MUESTRA',
            subtitle: 'El CRM le Dice QUÉ hacer',
            description: 'Vendedor llega a las 9 AM y ve el dashboard Kanban con leads organizados por prioridad. Sabe exactamente qué hacer, con quién y cuándo.',
            details: [
                '🔥 3 Leads HOT (listos para cerrar HOY)',
                '🌡️ 5 Leads WARM (seguimiento esta semana)',
                '❄️ 2 Leads COLD (seguimiento mes próximo)',
                '',
                'Lead de la SUV:',
                '📊 Scoring: 95/100 (HOT)',
                '💰 Presupuesto: $30,000',
                '🚗 Interés: SUV Automática',
                '🔄 Permuta: Corolla 2018 ($18,000)',
                '⏰ Próximo paso: "Llamar HOY para test drive"'
            ],
            result: 'Vendedor sabe EXACTAMENTE qué hacer. Cero tiempo perdido. Máxima eficiencia.',
            icon: '📊',
            color: 'var(--accent-blue)'
        },
        {
            number: '3',
            title: 'CIERRE ÉPICO',
            subtitle: 'Presupuesto en 45 Segundos',
            description: 'Vendedor genera presupuesto profesional en 45 segundos. Sistema calcula todo automáticamente y envía link interactivo con tracking.',
            details: [
                'Selecciona: Toyota RAV4 2023 ($32,000)',
                '',
                'Sistema calcula:',
                '✅ Valor del vehículo: $32,000',
                '✅ Permuta (Corolla): -$18,000',
                '✅ Transferencia: +$800',
                '✅ Otorgamiento: +$500',
                '✅ TOTAL: $15,300',
                '',
                'Financiación:',
                '• Seña: $3,000',
                '• 12 cuotas × $1,150',
                '',
                'Tracking: "Cliente vio presupuesto 3 veces"',
                '🔔 ALERTA: "Cliente muy interesado. Llamar AHORA"'
            ],
            result: 'Presupuesto profesional en 45 segundos. Vendedor sabe cuándo insistir. Cierre más rápido.',
            icon: '💰',
            color: '#10B981'
        }
    ];

    return (
        <section className="features-section" style={{ background: 'linear-gradient(180deg, var(--bg-black) 0%, #0a0a0a 100%)' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 className="section-title">
                    Vender es Ahora un Proceso de <span className="accent-text">3 Pasos Simples</span>
                </h2>
                <p className="section-subtitle">
                    De la consulta al cierre en minutos, no días
                </p>
            </div>

            {/* Video Placeholder */}
            <div style={{
                maxWidth: '900px',
                margin: '0 auto 4rem auto',
                background: 'var(--card-bg)',
                border: '2px solid var(--accent-cyan)',
                borderRadius: '16px',
                padding: '3rem',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                    filter: 'drop-shadow(0 0 20px var(--accent-cyan))'
                }}>
                    🎬
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-white)' }}>
                    Video Explicativo (90 segundos)
                </h3>
                <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem' }}>
                    Mira cómo funciona el flujo completo desde WhatsApp hasta el cierre
                </p>
                <button
                    className="cta-primary"
                    onClick={() => alert('Video demo próximamente')}
                >
                    ▶️ VER DEMO
                </button>
            </div>

            {/* Pasos Detallados */}
            <div style={{ display: 'grid', gap: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
                {steps.map((step, index) => (
                    <div key={index} style={{
                        background: 'linear-gradient(135deg, var(--card-bg) 0%, #0a0a0a 100%)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '20px',
                        padding: '3rem',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = step.color;
                            e.currentTarget.style.boxShadow = `0 20px 60px ${step.color}33`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--card-border)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {/* Número del Paso */}
                        <div style={{
                            position: 'absolute',
                            top: '2rem',
                            right: '2rem',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${step.color}, ${step.color}88)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'var(--bg-black)',
                            boxShadow: `0 0 30px ${step.color}66`
                        }}>
                            {step.number}
                        </div>

                        {/* Icono */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: `${step.color}22`,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem',
                            fontSize: '2.5rem',
                            filter: `drop-shadow(0 0 10px ${step.color})`
                        }}>
                            {step.icon}
                        </div>

                        {/* Contenido */}
                        <h3 style={{
                            fontSize: '1.75rem',
                            marginBottom: '0.5rem',
                            color: step.color
                        }}>
                            {step.title}
                        </h3>
                        <p style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            color: 'var(--text-white)'
                        }}>
                            {step.subtitle}
                        </p>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: '1.7',
                            color: 'var(--text-gray)',
                            marginBottom: '2rem'
                        }}>
                            {step.description}
                        </p>

                        {/* Detalles del Flujo */}
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            marginBottom: '2rem',
                            fontFamily: 'monospace',
                            fontSize: '0.95rem',
                            lineHeight: '1.8',
                            color: 'var(--text-gray)'
                        }}>
                            {step.details.map((detail, idx) => (
                                <div key={idx} style={{
                                    marginBottom: detail === '' ? '0.5rem' : '0.25rem',
                                    color: detail.includes('Cliente:') ? '#FFA500' :
                                        detail.includes('IA:') ? 'var(--accent-cyan)' :
                                            detail.includes('✅') ? '#10B981' :
                                                detail.includes('🔔') ? '#F59E0B' :
                                                    'var(--text-gray)'
                                }}>
                                    {detail}
                                </div>
                            ))}
                        </div>

                        {/* Resultado */}
                        <div style={{
                            background: `linear-gradient(135deg, ${step.color}22, ${step.color}11)`,
                            borderLeft: `3px solid ${step.color}`,
                            borderRadius: '8px',
                            padding: '1.25rem',
                            fontSize: '1.05rem',
                            fontWeight: 'bold',
                            color: step.color
                        }}>
                            ✅ {step.result}
                        </div>
                    </div>
                ))}
            </div>

            {/* Comparación Visual */}
            <div style={{
                marginTop: '4rem',
                padding: '3rem',
                background: 'rgba(0, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(0, 255, 255, 0.1)'
            }}>
                <h3 style={{
                    textAlign: 'center',
                    fontSize: '1.75rem',
                    marginBottom: '2rem',
                    color: 'var(--text-white)'
                }}>
                    Comparación: Proceso Tradicional vs. Copiloto CRM
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {/* Tradicional */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1a0000 0%, #0a0a0a 100%)',
                        border: '1px solid #ff4444',
                        borderRadius: '12px',
                        padding: '2rem'
                    }}>
                        <h4 style={{ color: '#ff4444', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                            ❌ Proceso Tradicional
                        </h4>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            color: 'var(--text-gray)',
                            lineHeight: '2'
                        }}>
                            <li>⏰ 4+ horas de espera</li>
                            <li>📝 Calificación manual</li>
                            <li>🔍 Tasación en 2 días</li>
                            <li>📄 Presupuesto en 30 minutos</li>
                            <li>❓ Sin tracking de interés</li>
                            <li>😰 65% de leads perdidos</li>
                        </ul>
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(255, 68, 68, 0.2)',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            color: '#ff4444'
                        }}>
                            Tiempo total: 2-3 días
                        </div>
                    </div>

                    {/* Con Copiloto */}
                    <div style={{
                        background: 'linear-gradient(135deg, #001a1a 0%, #0a0a0a 100%)',
                        border: '1px solid var(--accent-cyan)',
                        borderRadius: '12px',
                        padding: '2rem',
                        boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)'
                    }}>
                        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                            ✅ Con Copiloto CRM
                        </h4>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            color: 'var(--text-gray)',
                            lineHeight: '2'
                        }}>
                            <li>⚡ 3 segundos de respuesta</li>
                            <li>🤖 Calificación automática</li>
                            <li>📊 Tasación en 2 minutos</li>
                            <li>💰 Presupuesto en 45 segundos</li>
                            <li>📈 Tracking en tiempo real</li>
                            <li>🎯 0% de leads perdidos</li>
                        </ul>
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(0, 255, 255, 0.2)',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            color: 'var(--accent-cyan)'
                        }}>
                            Tiempo total: 2-3 horas
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
