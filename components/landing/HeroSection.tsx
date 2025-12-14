import React from 'react';

const HeroSection: React.FC = () => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1 className="headline-glitch">
                    DEJE DE PERDER EL{' '}
                    <span className="accent-text">65% DE SUS LEADS</span>
                </h1>

                <p className="subhead">
                    <strong>Copiloto CRM</strong> es el único sistema que le da un <strong>Vendedor de IA 24/7</strong>.
                    Mientras su competencia duerme, su agente de IA responde consultas en 3 segundos,
                    califica leads automáticamente y tasa vehículos usados en tiempo real.
                </p>

                <div className="trust-badges" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div className="badge">✓ 400+ Concesionarios Activos</div>
                    <div className="badge">✓ 50,000+ Leads Gestionados</div>
                    <div className="badge">✓ 99.9% Uptime Garantizado</div>
                </div>

                <div className="cta-group">
                    <a href="#pricing" className="cta-primary">
                        PRUEBA GRATIS 14 DÍAS →
                    </a>
                    <a href="#demo" className="cta-secondary">
                        Ver Demo en Vivo (2 min)
                    </a>
                </div>

                <p style={{ marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--text-gray)' }}>
                    ✅ Sin tarjeta de crédito • ✅ Setup en 15 minutos • ✅ +200% ROI en 6 meses
                </p>
            </div>

            <div className="ia-3d-visual">
                <div className="ai-visual-container">
                    <div className="ai-visual-wrapper">
                        {/* Esfera Central */}
                        <div className="ai-sphere">
                            <div className="sphere-inner"></div>
                            <div className="sphere-glow"></div>
                        </div>

                        {/* Anillos Orbitales */}
                        <div className="ai-ring ring-1"></div>
                        <div className="ai-ring ring-2"></div>
                        <div className="ai-ring ring-3"></div>

                        {/* Partículas Flotantes */}
                        <div className="particle particle-1"></div>
                        <div className="particle particle-2"></div>
                        <div className="particle particle-3"></div>
                        <div className="particle particle-4"></div>
                        <div className="particle particle-5"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
