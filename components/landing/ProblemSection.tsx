import React from 'react';

const ProblemSection: React.FC = () => {
    return (
        <section className="problem-solution-section">
            <div className="data-reveal">
                <h2 className="section-title">
                    El Costo Real de la <span className="accent-text">Lenta Respuesta</span>
                </h2>
                <p className="section-subtitle">
                    Cada hora que pasa sin responder, pierde dinero real
                </p>

                {/* Estadísticas de Impacto */}
                <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                    <div className="data-point">
                        <span className="old-value">65% de leads perdidos</span>
                        <span className="arrow">→</span>
                        <span className="new-value">0% perdidos</span>
                    </div>
                    <div className="data-point">
                        <span className="old-value">4 horas de respuesta</span>
                        <span className="arrow">→</span>
                        <span className="new-value">3 segundos</span>
                    </div>
                    <div className="data-point">
                        <span className="old-value">40% seguimientos olvidados</span>
                        <span className="arrow">→</span>
                        <span className="new-value">100% cumplidos</span>
                    </div>
                    <div className="data-point">
                        <span className="old-value">$0 ROI</span>
                        <span className="arrow">→</span>
                        <span className="new-value">+200% ROI</span>
                    </div>
                </div>

                {/* Escenario Real */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    marginTop: '4rem'
                }}>
                    {/* SIN Copiloto */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1a0000 0%, #0a0a0a 100%)',
                        border: '1px solid #ff4444',
                        borderRadius: '16px',
                        padding: '2rem'
                    }}>
                        <h3 style={{ color: '#ff4444', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                            ❌ SIN Copiloto CRM
                        </h3>
                        <div style={{ color: 'var(--text-gray)', lineHeight: '1.8' }}>
                            <p>🕐 <strong>2:00 AM</strong> - Cliente pregunta por una SUV</p>
                            <p>🕐 <strong>10:00 AM</strong> - Su vendedor ve el mensaje (8 horas después)</p>
                            <p>🕐 <strong>10:30 AM</strong> - Responde con "Buenos días, ¿en qué puedo ayudarte?"</p>
                            <p style={{ color: '#ff4444', fontWeight: 'bold', marginTop: '1rem' }}>
                                ❌ RESULTADO: El cliente ya compró en otro lado
                            </p>
                        </div>
                    </div>

                    {/* CON Copiloto */}
                    <div style={{
                        background: 'linear-gradient(135deg, #001a1a 0%, #0a0a0a 100%)',
                        border: '1px solid var(--accent-cyan)',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)'
                    }}>
                        <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                            ✅ CON Copiloto CRM
                        </h3>
                        <div style={{ color: 'var(--text-gray)', lineHeight: '1.8' }}>
                            <p>🕐 <strong>2:00 AM</strong> - Cliente pregunta por una SUV</p>
                            <p>⚡ <strong>2:00 AM</strong> - IA responde en 3 segundos</p>
                            <p>⚡ <strong>2:05 AM</strong> - IA envía catálogo + ofrece tasación</p>
                            <p>🕐 <strong>9:00 AM</strong> - Vendedor ve lead CALIFICADO</p>
                            <p style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', marginTop: '1rem' }}>
                                ✅ RESULTADO: Venta cerrada antes del mediodía
                            </p>
                        </div>
                    </div>
                </div>

                {/* Métricas de Transformación */}
                <div style={{
                    marginTop: '4rem',
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'rgba(0, 255, 255, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(0, 255, 255, 0.2)'
                }}>
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem', color: 'var(--accent-cyan)' }}>
                        Transformación Medible
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem'
                    }}>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                                78%
                            </div>
                            <div style={{ color: 'var(--text-gray)', marginTop: '0.5rem' }}>
                                de clientes compran al primer vendedor que responde
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                                $12,000
                            </div>
                            <div style={{ color: 'var(--text-gray)', marginTop: '0.5rem' }}>
                                USD perdidos por mes en leads no atendidos
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                                +200%
                            </div>
                            <div style={{ color: 'var(--text-gray)', marginTop: '0.5rem' }}>
                                ROI garantizado en 6 meses
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
