import React from 'react';

const FinalCTASection: React.FC = () => {
    return (
        <section className="final-cta-section">
            <div className="cta-wrap">
                <h2 className="final-headline">
                    Deje de Soñar con Vender Más y Empiece a Hacerlo
                </h2>

                <p className="final-subtext">
                    Su competencia ya está perdiendo el tiempo. Usted no.
                    <br />
                    Cada minuto sin Copiloto CRM es un lead perdido.
                    <br />
                    Cada hora sin responder es dinero que se va a la competencia.
                </p>

                <div style={{
                    background: 'rgba(0, 255, 255, 0.1)',
                    border: '2px solid var(--accent-cyan)',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '3rem',
                    maxWidth: '600px',
                    margin: '0 auto 3rem auto'
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        marginBottom: '1.5rem',
                        color: 'var(--accent-cyan)'
                    }}>
                        🎁 OFERTA DE LANZAMIENTO
                    </h3>
                    <p style={{
                        fontSize: '1.1rem',
                        lineHeight: '1.8',
                        color: 'var(--text-white)',
                        marginBottom: '1rem'
                    }}>
                        Los primeros <strong>50 clientes</strong> obtienen:
                    </p>
                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        textAlign: 'left',
                        color: 'var(--text-white)',
                        fontSize: '1.05rem',
                        lineHeight: '2'
                    }}>
                        <li>✅ <strong>30 días gratis</strong> (en lugar de 14)</li>
                        <li>✅ <strong>Onboarding Premium GRATIS</strong> ($500 de valor)</li>
                        <li>✅ <strong>Precio bloqueado de por vida</strong></li>
                    </ul>
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(255, 68, 68, 0.2)',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: 'var(--accent-cyan)'
                    }}>
                        ⏰ Quedan: <span style={{ fontSize: '1.5rem' }}>12 cupos</span>
                    </div>
                </div>

                <button
                    className="cta-final-button"
                    onClick={() => window.location.href = '#register'}
                >
                    RECLAMAR MI CUPO AHORA →
                </button>

                <div style={{ marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-gray)' }}>
                    ✅ Setup en 15 minutos • ✅ Prueba gratis • ✅ Sin tarjeta de crédito • ✅ Cancela cuando quieras
                </div>

                <div className="trust-badges" style={{ marginTop: '3rem' }}>
                    <div className="badge">🔒 Seguro</div>
                    <div className="badge">⚡ Rápido</div>
                    <div className="badge">💰 Rentable</div>
                    <div className="badge">🇦🇷 Soporte en Español 24/7</div>
                </div>

                {/* FAQ Rápido */}
                <div style={{
                    marginTop: '4rem',
                    textAlign: 'left',
                    maxWidth: '800px',
                    margin: '4rem auto 0 auto'
                }}>
                    <h3 style={{
                        textAlign: 'center',
                        fontSize: '1.75rem',
                        marginBottom: '2rem',
                        color: 'var(--text-white)'
                    }}>
                        Preguntas Frecuentes
                    </h3>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {[
                            {
                                q: '¿Necesito conocimientos técnicos?',
                                a: 'No. El sistema está diseñado para vendedores, no para programadores. Setup en 15 minutos con tutorial interactivo.'
                            },
                            {
                                q: '¿Cómo funciona la prueba gratis?',
                                a: 'Te registras sin tarjeta de crédito. Tienes acceso completo al Plan PRO por 14 días (30 días si eres de los primeros 50). Si te gusta, agregas tu método de pago. Si no, simplemente no haces nada.'
                            },
                            {
                                q: '¿Puedo cancelar en cualquier momento?',
                                a: 'Sí. No hay contratos de permanencia. Cancelas con 1 click y puedes exportar todos tus datos.'
                            },
                            {
                                q: '¿El tasador funciona en mi país?',
                                a: 'Actualmente funciona en Argentina, Chile, Uruguay y Paraguay. Próximamente: Brasil, México, Colombia.'
                            },
                            {
                                q: '¿Qué pasa si recibo más leads de los incluidos?',
                                a: 'En el Plan PRO los leads son ILIMITADOS. En el Starter (100 leads/mes), el sistema te avisa cuando estás cerca del límite y puedes upgradear con 1 click.'
                            },
                            {
                                q: '¿Cómo garantizan la seguridad de mis datos?',
                                a: 'Encriptación AES-256 (nivel bancario), backups diarios automáticos, cumplimiento GDPR/LGPD, uptime 99.9% garantizado. Tus datos están más seguros que en tu servidor local.'
                            }
                        ].map((faq, index) => (
                            <div key={index} style={{
                                background: 'var(--card-bg)',
                                border: '1px solid var(--card-border)',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                transition: 'all 0.3s ease'
                            }}>
                                <h4 style={{
                                    color: 'var(--accent-cyan)',
                                    marginBottom: '0.75rem',
                                    fontSize: '1.1rem'
                                }}>
                                    {faq.q}
                                </h4>
                                <p style={{
                                    color: 'var(--text-gray)',
                                    lineHeight: '1.6',
                                    margin: 0
                                }}>
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Final Repetido */}
                <div style={{
                    marginTop: '4rem',
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 123, 255, 0.1))',
                    borderRadius: '16px',
                    border: '1px solid rgba(0, 255, 255, 0.3)'
                }}>
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-white)' }}>
                        ¿Listo para Transformar su Concesionario?
                    </h3>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-gray)', marginBottom: '2rem' }}>
                        No arriesgue nada. Gane todo.
                    </p>
                    <button
                        className="cta-final-button"
                        onClick={() => window.location.href = '#register'}
                    >
                        EMPEZAR PRUEBA GRATIS AHORA →
                    </button>
                </div>
            </div>
        </section>
    );
};

export default FinalCTASection;
