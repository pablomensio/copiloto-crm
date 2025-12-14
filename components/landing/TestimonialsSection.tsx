import React from 'react';

const TestimonialsSection: React.FC = () => {
    const testimonials = [
        {
            quote: "Antes de Copiloto CRM, perdíamos el 60% de los leads que llegaban fuera de horario. Ahora, la IA los atiende y cuando llegamos a la mañana, ya están calificados. Resultado: +180% en ventas en 3 meses.",
            author: "Carlos Méndez",
            title: "Gerente de Ventas",
            company: "AutoMax - Buenos Aires",
            avatar: "CM",
            stats: [
                { label: 'Leads atendidos', value: '35% → 100%' },
                { label: 'Tiempo de respuesta', value: '4h → 3seg' },
                { label: 'Ventas mensuales', value: '15 → 42' },
                { label: 'ROI', value: '3,200%' }
            ]
        },
        {
            quote: "Soy un one-man show. No puedo estar 24/7 respondiendo WhatsApp. Copiloto CRM es mi vendedor nocturno. La IA califica, tasa y agenda. Yo solo cierro. Pasé de vender 3 autos/mes a 10 autos/mes.",
            author: "Martín Rodríguez",
            title: "Dueño",
            company: "Autos Premium - Córdoba",
            avatar: "MR",
            stats: [
                { label: 'Ventas mensuales', value: '3 → 10 (+233%)' },
                { label: 'Horas trabajadas', value: '12h → 8h/día' },
                { label: 'Leads calificados', value: '10% → 80%' }
            ]
        },
        {
            quote: "Teníamos 3 sistemas diferentes, uno por sucursal. Era un caos. Copiloto CRM unificó todo. Ahora vemos en tiempo real qué pasa en cada sucursal. El ROI fue del 400% en el primer trimestre.",
            author: "Laura Fernández",
            title: "Directora Comercial",
            company: "Grupo Automotor del Sur - Rosario",
            avatar: "LF",
            stats: [
                { label: 'Sistemas unificados', value: '3 → 1' },
                { label: 'Visibilidad', value: '30% → 100%' },
                { label: 'Eficiencia del equipo', value: '+65%' },
                { label: 'ROI', value: '400% en 3 meses' }
            ]
        }
    ];

    const shortTestimonials = [
        {
            text: "El tasador de mercado vale oro. Antes tardaba 2 días en conseguir comparables. Ahora, 2 minutos.",
            author: "Diego S.",
            title: "Vendedor Senior"
        },
        {
            text: "Mis vendedores están felices. Ya no pierden tiempo con leads fríos. Solo hablan con gente lista para comprar.",
            author: "Ana M.",
            title: "Gerente de Ventas"
        },
        {
            text: "Setup en 15 minutos, tal cual prometen. Increíble.",
            author: "Roberto L.",
            title: "Dueño de Concesionario"
        },
        {
            text: "La IA responde mejor que algunos vendedores humanos 😅",
            author: "Claudia P.",
            title: "Supervisora"
        },
        {
            text: "ROI positivo desde el primer mes. Mejor inversión que hice.",
            author: "Fernando G.",
            title: "Gerente General"
        }
    ];

    return (
        <section className="testimonials-section">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 className="section-title">
                    Resultados Reales de <span className="accent-text">Concesionarios Reales</span>
                </h2>
                <p className="section-subtitle">
                    No nos crea a nosotros. Créale a sus colegas.
                </p>
            </div>

            {/* Casos de Éxito Detallados */}
            <div className="testimonial-grid">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="case-study">
                        <div className="quote-mark">"</div>
                        <p className="quote-text">{testimonial.quote}</p>

                        <div className="quote-author">
                            <div className="author-avatar">{testimonial.avatar}</div>
                            <div className="author-info">
                                <div className="author-name">{testimonial.author}</div>
                                <div className="author-title">{testimonial.title}</div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--accent-cyan)',
                                    marginTop: '0.25rem'
                                }}>
                                    {testimonial.company}
                                </div>
                            </div>
                        </div>

                        {/* Métricas */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1.5rem',
                            background: 'rgba(0, 255, 255, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 255, 255, 0.1)'
                        }}>
                            <div style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-gray)',
                                marginBottom: '1rem',
                                fontWeight: 'bold'
                            }}>
                                📈 Métricas:
                            </div>
                            <div style={{
                                display: 'grid',
                                gap: '0.75rem',
                                fontSize: '0.9rem',
                                color: 'var(--text-gray)'
                            }}>
                                {testimonial.stats.map((stat, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span>• {stat.label}:</span>
                                        <span style={{
                                            color: 'var(--accent-cyan)',
                                            fontWeight: 'bold'
                                        }}>
                                            {stat.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Testimonios Cortos (Carrusel) */}
            <div style={{ marginTop: '4rem' }}>
                <h3 style={{
                    textAlign: 'center',
                    fontSize: '1.75rem',
                    marginBottom: '2rem',
                    color: 'var(--text-white)'
                }}>
                    Lo que Dicen Nuestros Clientes
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {shortTestimonials.map((testimonial, index) => (
                        <div key={index} style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{
                                color: 'var(--accent-cyan)',
                                marginBottom: '0.75rem',
                                fontSize: '1.25rem'
                            }}>
                                ⭐⭐⭐⭐⭐
                            </div>
                            <p style={{
                                color: 'var(--text-white)',
                                marginBottom: '1rem',
                                lineHeight: '1.6',
                                fontSize: '0.95rem'
                            }}>
                                "{testimonial.text}"
                            </p>
                            <div style={{
                                color: 'var(--text-gray)',
                                fontSize: '0.875rem',
                                borderTop: '1px solid var(--card-border)',
                                paddingTop: '0.75rem'
                            }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--text-white)' }}>
                                    {testimonial.author}
                                </div>
                                <div>{testimonial.title}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust Badges */}
            <div style={{
                marginTop: '4rem',
                padding: '3rem',
                background: 'rgba(0, 255, 255, 0.03)',
                borderRadius: '16px',
                textAlign: 'center'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1000px',
                    margin: '0 auto'
                }}>
                    <div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: 'var(--accent-cyan)',
                            marginBottom: '0.5rem'
                        }}>
                            400+
                        </div>
                        <div style={{ color: 'var(--text-gray)' }}>
                            Concesionarios Activos
                        </div>
                    </div>

                    <div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: 'var(--accent-cyan)',
                            marginBottom: '0.5rem'
                        }}>
                            50,000+
                        </div>
                        <div style={{ color: 'var(--text-gray)' }}>
                            Leads Gestionados
                        </div>
                    </div>

                    <div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: 'var(--accent-cyan)',
                            marginBottom: '0.5rem'
                        }}>
                            99.9%
                        </div>
                        <div style={{ color: 'var(--text-gray)' }}>
                            Uptime Garantizado
                        </div>
                    </div>

                    <div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: 'var(--accent-cyan)',
                            marginBottom: '0.5rem'
                        }}>
                            +200%
                        </div>
                        <div style={{ color: 'var(--text-gray)' }}>
                            ROI Promedio
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
