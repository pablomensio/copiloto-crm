import React from 'react';
import ElectricBorder from './ElectricBorder';

const PricingSection: React.FC = () => {
    const plans = [
        {
            name: 'STARTER',
            price: 99,
            period: 'mes',
            ideal: 'Ideal para: Revendedores independientes',
            description: 'Perfecto para empezar a organizar tu inventario y responder rápido',
            features: [
                { text: '1 Usuario (Admin)', included: true },
                { text: '1 Número de WhatsApp', included: true },
                { text: '50 Vehículos en inventario', included: true },
                { text: '100 Leads/mes', included: true },
                { text: 'Agente de IA 24/7', included: true },
                { text: 'CRM Completo', included: true },
                { text: 'Presupuestos Básicos', included: true },
                { text: 'Catálogos Digitales', included: true },
                { text: 'Soporte por Email', included: true },
                { text: 'Tasador de Mercado', included: false },
                { text: 'Tracking de Presupuestos', included: false },
                { text: 'Alertas Avanzadas', included: false }
            ],
            cta: 'EMPEZAR PRUEBA GRATIS',
            ctaLink: '#register'
        },
        {
            name: 'PRO',
            price: 199,
            period: 'mes',
            recommended: true,
            ideal: 'Ideal para: Concesionarios pequeños y medianos',
            description: 'El plan más popular. Todo lo que necesitas para vender más.',
            features: [
                { text: '5 Usuarios (Vendedores + Supervisores)', included: true },
                { text: '3 Números de WhatsApp', included: true },
                { text: 'Vehículos ILIMITADOS', included: true, highlight: true },
                { text: 'Leads ILIMITADOS', included: true, highlight: true },
                { text: 'Agente de IA 24/7', included: true },
                { text: 'TASADOR DE MERCADO ILIMITADO', included: true, highlight: true },
                { text: 'Tracking de Presupuestos (Visto/No Visto)', included: true, highlight: true },
                { text: 'Alertas de Seguimiento Avanzadas', included: true, highlight: true },
                { text: 'Scoring Automático de Leads', included: true, highlight: true },
                { text: 'Presupuestos Interactivos Premium', included: true },
                { text: 'Análisis de Conversión', included: true },
                { text: 'Soporte Prioritario (Chat + Email)', included: true }
            ],
            roi: {
                investment: 199,
                sales: 3,
                commission: 2000,
                total: 6000,
                percentage: 3015
            },
            cta: 'EMPEZAR PRUEBA GRATIS',
            ctaLink: '#register'
        },
        {
            name: 'BUSINESS',
            price: 399,
            period: 'mes',
            ideal: 'Ideal para: Grupos automotrices y agencias grandes',
            description: 'Solución enterprise con integración completa y soporte dedicado',
            features: [
                { text: '15 Usuarios', included: true },
                { text: '5 Números de WhatsApp', included: true },
                { text: 'Múltiples Sucursales/Depósitos', included: true },
                { text: 'TODO del Plan PRO, MÁS:', included: true, highlight: true },
                { text: 'Integración API/DMS (AutoGestion, DealerTrack)', included: true, highlight: true },
                { text: 'Marca Blanca (Logo y dominio personalizado)', included: true, highlight: true },
                { text: 'Onboarding Premium (Setup + Training)', included: true, highlight: true },
                { text: 'Reportes Personalizados', included: true },
                { text: 'Dashboard de BI Avanzado', included: true },
                { text: 'Soporte Dedicado 24/7 (WhatsApp + Teléfono)', included: true },
                { text: 'Account Manager asignado', included: true }
            ],
            cta: 'CONTACTAR VENTAS',
            ctaLink: '#contact'
        }
    ];

    return (
        <section className="pricing-section" id="pricing">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 className="section-title">
                    Inversión Inteligente: <span className="accent-text">Multiplique sus Ventas</span>
                </h2>
                <p className="section-subtitle">
                    Elija el plan que se adapta a su concesionario
                </p>
            </div>

            <div className="kanban-grid">
                {plans.map((plan, index) => (
                    <ElectricBorder
                        key={index}
                        color="#00FFFF"
                        speed={0.5}
                        chaos={0.3}
                        thickness={plan.recommended ? 2 : 1.5}
                        style={{ borderRadius: 20 }}
                    >
                        <div className={`plan-card ${plan.recommended ? 'recommended-plan' : ''}`}>
                            {plan.recommended && (
                                <div className="ribbon">
                                    ⭐ MÁS POPULAR
                                </div>
                            )}

                            <div className="plan-header">
                                <h3>{plan.name}</h3>
                                <div className="price-wrapper">
                                    <span className="currency">$</span>
                                    <span className="price-tag">{plan.price}</span>
                                    <span className="per-month">USD/{plan.period}</span>
                                </div>
                            </div>

                            <div className="plan-ideal">
                                {plan.ideal}
                            </div>

                            <p style={{
                                color: 'var(--text-gray)',
                                marginBottom: '2rem',
                                fontSize: '0.95rem',
                                lineHeight: '1.6'
                            }}>
                                {plan.description}
                            </p>

                            {/* ROI Calculator (solo para PRO) */}
                            {plan.roi && (
                                <div style={{
                                    background: 'rgba(0, 255, 255, 0.05)',
                                    border: '1px solid rgba(0, 255, 255, 0.2)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    marginBottom: '2rem'
                                }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-gray)',
                                        marginBottom: '1rem'
                                    }}>
                                        💰 ROI Garantizado:
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-gray)', lineHeight: '1.8' }}>
                                        <div>Inversión: ${plan.roi.investment}/mes</div>
                                        <div>Retorno: {plan.roi.sales} ventas × ${plan.roi.commission.toLocaleString()} = ${plan.roi.total.toLocaleString()}</div>
                                        <div style={{
                                            color: 'var(--accent-cyan)',
                                            fontWeight: 'bold',
                                            fontSize: '1.25rem',
                                            marginTop: '0.5rem'
                                        }}>
                                            ROI: {plan.roi.percentage.toLocaleString()}% anual
                                        </div>
                                    </div>
                                </div>
                            )}

                            <ul className="features-list">
                                {plan.features.map((feature, idx) => (
                                    <li
                                        key={idx}
                                        className={`feature-item ${!feature.included ? 'disabled' : ''}`}
                                    >
                                        <span className={feature.included ? 'check-icon' : 'x-icon'}>
                                            {feature.included ? '✓' : '✗'}
                                        </span>
                                        <span style={{
                                            fontWeight: feature.highlight ? 'bold' : 'normal',
                                            color: feature.highlight ? 'var(--accent-cyan)' : 'inherit'
                                        }}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={plan.ctaLink}
                                className={`cta-plan ${plan.recommended ? 'cta-pro' : ''}`}
                            >
                                {plan.cta}
                            </a>
                        </div>
                    </ElectricBorder>
                ))}
            </div>

            {/* Garantías */}
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
                    Garantías que Protegen su Inversión
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                            14 Días Gratis
                        </h4>
                        <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem' }}>
                            Sin tarjeta de crédito. Acceso completo al plan PRO. Cancela cuando quieras.
                        </p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💯</div>
                        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                            Satisfacción 30 Días
                        </h4>
                        <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem' }}>
                            Si no vendes más, te devolvemos el 100%. Sin preguntas.
                        </p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                            Setup en 15 Minutos
                        </h4>
                        <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem' }}>
                            Tutorial interactivo incluido. Soporte en vivo por WhatsApp. Empieza HOY.
                        </p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔓</div>
                        <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                            Cancela Cuando Quieras
                        </h4>
                        <p style={{ color: 'var(--text-gray)', fontSize: '0.95rem' }}>
                            Sin contratos. Sin penalizaciones. Exporta tus datos en 1 click.
                        </p>
                    </div>
                </div>
            </div>

            {/* Calculadora de ROI */}
            <div style={{
                marginTop: '4rem',
                padding: '3rem',
                background: 'linear-gradient(135deg, #001a1a 0%, #0a0a0a 100%)',
                borderRadius: '16px',
                border: '1px solid var(--accent-cyan)',
                textAlign: 'center'
            }}>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--text-white)' }}>
                    🧮 Calcule su ROI
                </h3>

                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    textAlign: 'left',
                    color: 'var(--text-gray)',
                    lineHeight: '2'
                }}>
                    <p><strong>Escenario Típico:</strong></p>
                    <p>• Leads recibidos por mes: <strong style={{ color: 'var(--accent-cyan)' }}>100</strong></p>
                    <p>• Leads perdidos por respuesta lenta (65%): <strong style={{ color: '#ff4444' }}>65</strong></p>
                    <p>• Comisión promedio por venta: <strong style={{ color: 'var(--accent-cyan)' }}>$2,000 USD</strong></p>

                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(255, 68, 68, 0.1)',
                        borderLeft: '3px solid #ff4444',
                        borderRadius: '4px'
                    }}>
                        <p style={{ color: '#ff4444', fontWeight: 'bold' }}>❌ SIN Copiloto CRM:</p>
                        <p>• Leads perdidos: 65/mes</p>
                        <p>• Ventas perdidas: 13/mes (20% conversión)</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            Dinero perdido: <span style={{ color: '#ff4444' }}>$26,000/mes</span>
                        </p>
                    </div>

                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1.5rem',
                        background: 'rgba(0, 255, 255, 0.1)',
                        borderLeft: '3px solid var(--accent-cyan)',
                        borderRadius: '4px'
                    }}>
                        <p style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>✅ CON Copiloto CRM:</p>
                        <p>• Leads perdidos: 0/mes</p>
                        <p>• Ventas adicionales: 13/mes</p>
                        <p>• Dinero ganado: $26,000/mes</p>
                        <p>• Inversión: $199/mes</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            ROI: <span style={{ color: 'var(--accent-cyan)' }}>13,065%</span>
                        </p>
                    </div>
                </div>

                <a
                    href="#register"
                    className="cta-primary"
                    style={{ marginTop: '2rem', fontSize: '1.1rem' }}
                >
                    EMPEZAR AHORA →
                </a>
            </div>
        </section>
    );
};

export default PricingSection;
