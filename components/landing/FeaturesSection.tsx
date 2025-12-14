import React from 'react';

const FeaturesSection: React.FC = () => {
    const features = [
        {
            icon: '💰',
            title: 'Para el Dueño/Gerente',
            subtitle: 'Visibilidad Total + ROI Comprobado',
            description: 'Dashboard en tiempo real con métricas de conversión, performance del equipo y predicción de ventas con IA.',
            stats: [
                { number: '+200%', label: 'ROI en 6 meses' },
                { number: '3,014%', label: 'Retorno anual' }
            ],
            benefits: [
                'Ve cada lead, cada interacción, cada vendedor',
                'Decisiones basadas en datos reales',
                'Reduce costos de adquisición en 60%',
                'Optimiza inventario según demanda'
            ]
        },
        {
            icon: '⏰',
            title: 'Para el Vendedor',
            subtitle: '+4 Horas Diarias Recuperadas',
            description: 'IA maneja el 70% de consultas iniciales. Solo hablas con clientes listos para comprar.',
            stats: [
                { number: '+4h', label: 'Tiempo recuperado' },
                { number: '+150%', label: 'En comisiones' }
            ],
            benefits: [
                'Leads pre-calificados con scoring automático',
                'Presupuestos en 45 segundos vs. 30 minutos',
                'Recordatorios automáticos de seguimiento',
                'Todo en un solo lugar (WhatsApp + CRM)'
            ]
        },
        {
            icon: '⚡',
            title: 'Para el Cliente Final',
            subtitle: 'Experiencia Amazon',
            description: 'Atención instantánea 24/7 sin esperas. Todo por WhatsApp, sin apps ni visitas innecesarias.',
            stats: [
                { number: '3 seg', label: 'Tiempo de respuesta' },
                { number: '24/7', label: 'Disponibilidad' }
            ],
            benefits: [
                'Respuesta inmediata, incluso a las 3 AM',
                'Presupuestos interactivos desde el celular',
                'Tasación de auto usado en minutos',
                'Transparencia total en costos'
            ]
        }
    ];

    const keyFeatures = [
        {
            icon: '🤖',
            title: 'Agente de IA Especializado',
            description: 'Entrenado con 500+ conversaciones reales de ventas automotrices. Conoce jerga del sector y cierra ventas.',
            highlight: 'No solo responde, VENDE'
        },
        {
            icon: '📊',
            title: 'Tasador en Tiempo Real',
            description: 'Escanea 10,000+ publicaciones diarias en MercadoLibre y DeAutos. Tasaciones en 2 minutos vs. 2 días.',
            highlight: '95%+ de precisión'
        },
        {
            icon: '💬',
            title: 'WhatsApp Nativo',
            description: 'Integración directa con WhatsApp Business API. Cada mensaje se registra automáticamente en el CRM.',
            highlight: 'Cero copiar/pegar'
        },
        {
            icon: '📈',
            title: 'Presupuestos Interactivos',
            description: 'Links compartibles con tracking de visualizaciones. Sabes exactamente cuándo el cliente está listo.',
            highlight: 'No más PDFs muertos'
        },
        {
            icon: '🎯',
            title: 'Scoring Automático',
            description: 'IA califica cada lead como Hot, Warm o Cold. Vendedor sabe exactamente con quién hablar primero.',
            highlight: 'Máxima eficiencia'
        },
        {
            icon: '🔔',
            title: 'Alertas Inteligentes',
            description: 'Notificaciones cuando un cliente ve el presupuesto 3 veces o está listo para comprar.',
            highlight: 'Timing perfecto'
        }
    ];

    return (
        <section className="features-section">
            <div className="code-grid-background"></div>

            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 className="section-title">
                    ROI Garantizado: <span className="accent-text">¿Qué Gana Hoy?</span>
                </h2>
                <p className="section-subtitle">
                    Valor medible para cada rol en su concesionario
                </p>
            </div>

            {/* Beneficios por Rol */}
            <div className="features-grid">
                {features.map((feature, index) => (
                    <div key={index} className="feature-card">
                        <div className="icon-glow">
                            <span className="icon-emoji">{feature.icon}</span>
                        </div>

                        <h3>{feature.title}</h3>
                        <p style={{
                            color: 'var(--accent-cyan)',
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            fontSize: '1.1rem'
                        }}>
                            {feature.subtitle}
                        </p>
                        <p>{feature.description}</p>

                        <div className="feature-stats">
                            {feature.stats.map((stat, idx) => (
                                <div key={idx} className="stat-item">
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            marginTop: '1.5rem',
                            color: 'var(--text-gray)'
                        }}>
                            {feature.benefits.map((benefit, idx) => (
                                <li key={idx} style={{
                                    marginBottom: '0.75rem',
                                    paddingLeft: '1.5rem',
                                    position: 'relative'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: 0,
                                        color: 'var(--accent-cyan)'
                                    }}>✓</span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Features Clave */}
            <div style={{ marginTop: '6rem', textAlign: 'center' }}>
                <h2 className="section-title">
                    Funciones que <span className="accent-text">Generan Dinero</span>
                </h2>
                <p className="section-subtitle">
                    No somos un CRM genérico. Somos especialistas en automotriz.
                </p>
            </div>

            <div className="features-grid" style={{ marginTop: '3rem' }}>
                {keyFeatures.map((feature, index) => (
                    <div key={index} className="feature-card">
                        <div className="icon-glow">
                            <span className="icon-emoji">{feature.icon}</span>
                        </div>

                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>

                        <div style={{
                            marginTop: '1.5rem',
                            padding: '0.75rem 1rem',
                            background: 'rgba(0, 255, 255, 0.1)',
                            borderLeft: '3px solid var(--accent-cyan)',
                            borderRadius: '4px',
                            color: 'var(--accent-cyan)',
                            fontWeight: 'bold',
                            fontSize: '0.95rem'
                        }}>
                            {feature.highlight}
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA Intermedio */}
            <div style={{
                marginTop: '4rem',
                textAlign: 'center',
                padding: '3rem',
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 123, 255, 0.1))',
                borderRadius: '16px',
                border: '1px solid rgba(0, 255, 255, 0.3)'
            }}>
                <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-white)' }}>
                    ¿Listo para Multiplicar sus Ventas?
                </h3>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-gray)', marginBottom: '2rem' }}>
                    Únase a 400+ concesionarios que ya están vendiendo más con menos esfuerzo
                </p>
                <a href="#pricing" className="cta-primary" style={{ fontSize: '1.1rem' }}>
                    EMPEZAR PRUEBA GRATIS →
                </a>
            </div>
        </section>
    );
};

export default FeaturesSection;
