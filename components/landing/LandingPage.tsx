import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import NavBar from './NavBar';
import HeroSection from './HeroSection';
import ProblemSection from './ProblemSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import PricingSection from './PricingSection';
import FinalCTASection from './FinalCTASection';
import { ChatWidget } from '../ChatWidget';
import './landing.css';


gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
    onLogin?: () => void;
    onRegister?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
    const mainRef = useRef<HTMLElement>(null);

    // Funciones por defecto si no se pasan props
    const handleLogin = () => {
        if (onLogin) {
            onLogin();
        } else {
            // Navegar a la ruta de login de tu app
            window.location.href = '/login';
        }
    };

    const handleRegister = () => {
        if (onRegister) {
            onRegister();
        } else {
            // Navegar a la ruta de registro de tu app
            window.location.href = '/register';
        }
    };

    useEffect(() => {
        // Configuración global de animaciones de scroll
        if (mainRef.current) {
            // Parallax effect en el hero
            gsap.to('.hero-content', {
                scrollTrigger: {
                    trigger: '.hero-section',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
                y: 100,
                opacity: 0.5,
            });

            // Animación de entrada para las feature cards
            gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card, index) => {
                gsap.from(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 80%',
                        end: 'top 50%',
                        toggleActions: 'play none none reverse',
                    },
                    y: 60,
                    opacity: 0,
                    duration: 0.8,
                    delay: index * 0.15,
                    ease: 'power3.out',
                });
            });

            // Animación para las pricing cards
            gsap.from('.plan-card', {
                scrollTrigger: {
                    trigger: '.pricing-section',
                    start: 'top 70%',
                },
                y: 50,
                opacity: 0,
                stagger: 0.2,
                duration: 0.6,
                ease: 'back.out(1.4)',
            });
        }
    }, []);

    return (
        <>
            <NavBar onLogin={handleLogin} onRegister={handleRegister} />
            <main ref={mainRef} className="landing-page dark-mode">
                <HeroSection />
                <ProblemSection />
                <FeaturesSection />
                <HowItWorksSection />
                {/* <TestimonialsSection /> Eliminado por solicitud */}
                <PricingSection />
                <FinalCTASection />

                <footer className="footer-section">
                    <div className="footer-content" style={{
                        flexDirection: 'column',
                        gap: '2rem',
                        maxWidth: '1200px',
                        margin: '0 auto'
                    }}>
                        {/* Top Section */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '2rem',
                            width: '100%'
                        }}>
                            {/* Columna 1: Sobre Copiloto */}
                            <div>
                                <h4 style={{
                                    color: 'var(--accent-cyan)',
                                    marginBottom: '1rem',
                                    fontSize: '1.1rem'
                                }}>
                                    Copiloto CRM
                                </h4>
                                <p style={{
                                    color: 'var(--text-gray)',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.6'
                                }}>
                                    El único CRM con IA especializada en ventas automotrices.
                                    Transformamos leads en ventas 24/7.
                                </p>
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                                        🇦🇷 Desarrollado en Argentina
                                    </div>
                                    <div style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                                        🌎 Servicio en toda Latinoamérica
                                    </div>
                                </div>
                            </div>

                            {/* Columna 2: Producto */}
                            <div>
                                <h4 style={{
                                    color: 'var(--accent-cyan)',
                                    marginBottom: '1rem',
                                    fontSize: '1.1rem'
                                }}>
                                    Producto
                                </h4>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}>
                                    <a href="#features" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        Funcionalidades
                                    </a>
                                    <a href="#pricing" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        Precios
                                    </a>
                                    <a href="#testimonials" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        Casos de Éxito
                                    </a>
                                    <a href="#demo" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        Ver Demo
                                    </a>
                                </div>
                            </div>

                            {/* Columna 3: Soporte */}
                            <div>
                                <h4 style={{
                                    color: 'var(--accent-cyan)',
                                    marginBottom: '1rem',
                                    fontSize: '1.1rem'
                                }}>
                                    Soporte
                                </h4>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}>
                                    <a href="#help" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        Centro de Ayuda
                                    </a>
                                    <a href="#contact" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        Contacto
                                    </a>
                                    <a href="https://wa.me/5491112345678" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        WhatsApp Soporte
                                    </a>
                                    <a href="#status" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        Estado del Sistema
                                    </a>
                                </div>
                            </div>

                            {/* Columna 4: Legal */}
                            <div>
                                <h4 style={{
                                    color: 'var(--accent-cyan)',
                                    marginBottom: '1rem',
                                    fontSize: '1.1rem'
                                }}>
                                    Legal
                                </h4>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}>
                                    <a href="#privacy" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        Privacidad
                                    </a>
                                    <a href="#terms" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        Términos de Servicio
                                    </a>
                                    <a href="#security" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        Seguridad
                                    </a>
                                    <a href="#compliance" style={{ color: 'var(--text-gray)', textDecoration: 'none' }}>
                                        Cumplimiento (GDPR/LGPD)
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div style={{
                            borderTop: '1px solid var(--card-border)',
                            paddingTop: '2rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            width: '100%'
                        }}>
                            <p style={{ margin: 0 }}>
                                © 2025 Copiloto CRM. Todos los derechos reservados.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                                    Síguenos:
                                </span>
                                <a href="#linkedin" style={{ color: 'var(--text-gray)', fontSize: '1.25rem' }}>
                                    in
                                </a>
                                <a href="#instagram" style={{ color: 'var(--text-gray)', fontSize: '1.25rem' }}>
                                    📷
                                </a>
                                <a href="#youtube" style={{ color: 'var(--text-gray)', fontSize: '1.25rem' }}>
                                    ▶️
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
                <ChatWidget />
            </main>
        </>
    );
};

export default LandingPage;
