'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './AnimatedBackground.module.css';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    color?: string;
    animationName: string;
    duration: number;
    delay: number;
    logoSrc?: string;
}

const LOGO_FILES = [
    '/replit.svg',
    '/devfun.ico',
    '/zeeprime.ico',
    '/zeusnetwork.ico',
    '/layerzero.ico',
    '/wormhole.ico',
    '/magicbook.png',
    '/audius.svg',
    '/solend.svg',
    '/solana-logo.svg',
];

const AnimatedBackground: React.FC = () => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const particleCount = 40; // Fewer for performance with images
        const newParticles: Particle[] = [];
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;
        const colors = ['rgba(151, 71, 255, 0.5)', 'rgba(74, 155, 226, 0.5)', 'rgba(0, 255, 179, 0.4)'];
        const animations = [styles.floatParticle1, styles.floatParticle2, styles.floatParticle3];

        for (let i = 0; i < particleCount; i++) {
            const isLogo = Math.random() < 0.55; // 55% chance to be a logo
            if (isLogo) {
                const logoSrc = LOGO_FILES[Math.floor(Math.random() * LOGO_FILES.length)];
                const size = Math.random() * 32 + 32; // 32-64px for logos
                newParticles.push({
                    id: i,
                    x: Math.random() * viewWidth,
                    y: Math.random() * viewHeight + viewHeight,
                    size,
                    color: undefined,
                    logoSrc,
                    animationName: animations[Math.floor(Math.random() * animations.length)],
                    duration: Math.random() * 30 + 20,
                    delay: Math.random() * 20,
                });
            } else {
                const size = Math.random() * 2.5 + 1;
                const color = colors[Math.floor(Math.random() * colors.length)];
                newParticles.push({
                    id: i,
                    x: Math.random() * viewWidth,
                    y: Math.random() * viewHeight + viewHeight,
                    size,
                    color,
                    logoSrc: undefined,
                    animationName: animations[Math.floor(Math.random() * animations.length)],
                    duration: Math.random() * 30 + 20,
                    delay: Math.random() * 20,
                });
            }
        }
        setParticles(newParticles);
    }, []);

    return (
        <div className={styles.animatedBackgroundContainer} ref={containerRef}>
            <div className={styles.gradientBackground}></div>
            <svg className={styles.hexagonPattern} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="globalHexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(5) rotate(0)">
                        <polygon points="25,0 50,14.4 50,37.3 25,51.7 0,37.3 0,14.4" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#globalHexagons)" />
            </svg>
            {particles.map(particle => (
                particle.logoSrc ? (
                    <img
                        key={`particle-logo-${particle.id}`}
                        src={particle.logoSrc}
                        alt="project logo"
                        className={styles.particle}
                        style={{
                            left: `${particle.x}px`,
                            top: `${particle.y}px`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            opacity: 0.85,
                            filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.2))',
                            animation: `${particle.animationName} ${particle.duration}s linear infinite ${particle.delay}s`,
                            position: 'absolute',
                            pointerEvents: 'none',
                        }}
                    />
                ) : (
                    <div
                        key={`particle-dot-${particle.id}`}
                        className={styles.particle}
                        style={{
                            left: `${particle.x}px`,
                            top: `${particle.y}px`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            backgroundColor: particle.color,
                            boxShadow: `0 0 ${particle.size + 1}px ${particle.color}`,
                            animation: `${particle.animationName} ${particle.duration}s linear infinite ${particle.delay}s`,
                            position: 'absolute',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                        }}
                    />
                )
            ))}
        </div>
    );
};

export default AnimatedBackground; 