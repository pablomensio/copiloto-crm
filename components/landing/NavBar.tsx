import React, { useState, useEffect } from 'react';

interface NavBarProps {
    onLogin: () => void;
    onRegister: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onLogin, onRegister }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: scrolled
                ? 'rgba(8, 8, 8, 0.95)'
                : 'transparent',
            backdropFilter: scrolled ? 'blur(10px)' : 'none',
            borderBottom: scrolled
                ? '1px solid var(--card-border)'
                : '1px solid transparent',
            transition: 'all 0.3s ease',
            padding: '1rem 8%'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
                    }}>
                        🚗
                    </div>
                    <div>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: 'var(--text-white)',
                            lineHeight: 1
                        }}>
                            Copiloto CRM
                        </div>
                        <div style={{
                            fontSize: '0.7rem',
                            color: 'var(--accent-cyan)',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}>
                            Ventas Automotrices IA
                        </div>
                    </div>
                </div>

                {/* Navigation Links (Desktop) */}
                <div style={{
                    display: 'flex',
                    gap: '2rem',
                    alignItems: 'center'
                }}
                    className="nav-links-desktop">
                    <a
                        href="#features"
                        style={{
                            color: 'var(--text-gray)',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            transition: 'color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-gray)'}
                    >
                        Funcionalidades
                    </a>
                    <a
                        href="#pricing"
                        style={{
                            color: 'var(--text-gray)',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            transition: 'color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-gray)'}
                    >
                        Precios
                    </a>
                    <a
                        href="#testimonials"
                        style={{
                            color: 'var(--text-gray)',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            transition: 'color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-gray)'}
                    >
                        Casos de Éxito
                    </a>
                </div>

                {/* Auth Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={onLogin}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-white)',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        Ingresar
                    </button>

                    <button
                        onClick={onRegister}
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                            border: 'none',
                            color: 'var(--bg-black)',
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            padding: '0.75rem 1.75rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0, 255, 255, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 255, 255, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 255, 255, 0.3)';
                        }}
                    >
                        Registrarse Gratis →
                    </button>
                </div>
            </div>

            {/* Mobile Styles */}
            <style>{`
                @media (max-width: 768px) {
                    .nav-links-desktop {
                        display: none;
                    }
                }
            `}</style>
        </nav>
    );
};

export default NavBar;
