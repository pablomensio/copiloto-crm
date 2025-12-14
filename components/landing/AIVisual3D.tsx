import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Versión CSS del visual de IA (más ligera y compatible)
const AIVisual3D: React.FC = () => {
    const sphereRef = useRef<HTMLDivElement>(null);
    const ring1Ref = useRef<HTMLDivElement>(null);
    const ring2Ref = useRef<HTMLDivElement>(null);
    const ring3Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Animación de la esfera principal
        if (sphereRef.current) {
            gsap.to(sphereRef.current, {
                rotation: 360,
                duration: 20,
                repeat: -1,
                ease: 'none',
            });

            gsap.to(sphereRef.current, {
                scale: 1.1,
                duration: 3,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
            });
        }

        // Animación de los anillos
        [ring1Ref, ring2Ref, ring3Ref].forEach((ref, index) => {
            if (ref.current) {
                gsap.to(ref.current, {
                    rotation: 360,
                    duration: 15 + index * 5,
                    repeat: -1,
                    ease: 'none',
                });
            }
        });
    }, []);

    return (
        <div className="ai-visual-container">
            <div className="ai-visual-wrapper">
                {/* Esfera central */}
                <div ref={sphereRef} className="ai-sphere">
                    <div className="sphere-inner"></div>
                    <div className="sphere-glow"></div>
                </div>

                {/* Anillos orbitales */}
                <div ref={ring1Ref} className="ai-ring ring-1"></div>
                <div ref={ring2Ref} className="ai-ring ring-2"></div>
                <div ref={ring3Ref} className="ai-ring ring-3"></div>

                {/* Partículas flotantes */}
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
                <div className="particle particle-4"></div>
                <div className="particle particle-5"></div>
            </div>
        </div>
    );
};

export default AIVisual3D;
