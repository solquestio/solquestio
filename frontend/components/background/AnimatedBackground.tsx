'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './AnimatedBackground.module.css';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    animationName: string;
    duration: number;
    delay: number;
}

const AnimatedBackground: React.FC = () => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Ensure this runs only client-side
        if (typeof window === 'undefined') return;

        const particleCount = 50; // Adjust as needed for performance/density
        const newParticles: Particle[] = [];
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;
        
        const colors = ['rgba(151, 71, 255, 0.5)', 'rgba(74, 155, 226, 0.5)', 'rgba(0, 255, 179, 0.4)']; // Slightly more transparent
        const animations = [styles.floatParticle1, styles.floatParticle2, styles.floatParticle3]; // Using CSS module animation names

        for (let i = 0; i < particleCount; i++) {
            const size = Math.random() * 2.5 + 1; // Slightly smaller particles
            const color = colors[Math.floor(Math.random() * colors.length)];
            newParticles.push({
                id: i,
                x: Math.random() * viewWidth,
                // Start particles from the bottom of the screen to float up
                y: Math.random() * viewHeight + viewHeight, 
                size: size,
                color: color,
                // animationName will be applied via className now
                animationName: animations[Math.floor(Math.random() * animations.length)],
                duration: Math.random() * 30 + 20, // 20-50 seconds duration
                delay: Math.random() * 20, // 0-20 seconds delay
            });
        }
        setParticles(newParticles);

        // Optional: Debounced resize handler to regenerate particles on resize
        // For simplicity, not adding it now, but could be an enhancement.

    }, []); // Empty dependency array to run once on mount

    return (
        <div className={styles.animatedBackgroundContainer} ref={containerRef}>
            <div className={styles.gradientBackground}></div>
            <svg className={styles.hexagonPattern} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* Using a slightly different ID to avoid potential conflicts if OGNftCard is ever reused */}
                    <pattern id="globalHexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(5) rotate(0)">
                        <polygon points="25,0 50,14.4 50,37.3 25,51.7 0,37.3 0,14.4" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#globalHexagons)" />
            </svg>
            {particles.map(particle => (
                <div
                    key={`particle-${particle.id}`}
                    className={styles.particle} // General particle class
                    style={{
                        left: `${particle.x}px`,
                        top: `${particle.y}px`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        boxShadow: `0 0 ${particle.size + 1}px ${particle.color}`,
                        // Using CSS Module animation name directly in the animation property
                        animation: `${particle.animationName} ${particle.duration}s linear infinite ${particle.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};

export default AnimatedBackground; 