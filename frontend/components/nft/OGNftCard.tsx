import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './OGNftCard.module.css';

interface Sparkle {
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
}

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

const OGNftCard: React.FC = () => {
    const nftCardRef = useRef<HTMLDivElement>(null);
    const cardInnerRef = useRef<HTMLDivElement>(null);
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);

    // TODO: Port the JavaScript logic for particles into useEffect and event handlers.

    // Effect for 3D Tilt
    useEffect(() => {
        const card = nftCardRef.current;
        const innerCard = cardInnerRef.current;

        if (!card || !innerCard) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rotateY = ((x / rect.width) - 0.5) * 10;
            const rotateX = -((y / rect.height) - 0.5) * 10;

            innerCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        };

        const handleMouseLeave = () => {
            innerCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
        innerCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    // Effect for generating sparkles
    useEffect(() => {
        const sparkleCount = 20;
        const newSparkles: Sparkle[] = [];
        const cardWidth = 400; // Adjusted from 800
        const cardHeight = 250; // Adjusted from 500

        for (let i = 0; i < sparkleCount; i++) {
            newSparkles.push({
                id: i,
                x: Math.random() * cardWidth,
                y: Math.random() * cardHeight,
                size: Math.random() * 4 + 2,
                delay: Math.random() * 3,
            });
        }
        setSparkles(newSparkles);
    }, []); // Empty dependency array to run once on mount

    // Effect for generating particles
    useEffect(() => {
        const particleCount = 60;
        const newParticles: Particle[] = [];
        const cardWidth = 400; // Adjusted from 800
        const cardHeight = 250; // Adjusted from 500
        const colors = ['rgba(151, 71, 255, 0.7)', 'rgba(74, 155, 226, 0.7)', 'rgba(0, 255, 179, 0.7)'];
        const animations = ['float-particle-1', 'float-particle-2', 'float-particle-3'];

        for (let i = 0; i < particleCount; i++) {
            const size = Math.random() * 3 + 1;
            const color = colors[Math.floor(Math.random() * colors.length)];
            newParticles.push({
                id: i,
                x: Math.random() * cardWidth,
                y: Math.random() * cardHeight,
                size: size,
                color: color,
                animationName: animations[Math.floor(Math.random() * animations.length)],
                duration: Math.random() * 20 + 10, // 10-30 seconds
                delay: Math.random() * 15, // 0-15 seconds
            });
        }
        setParticles(newParticles);
    }, []);

    return (
        <div className={styles.nftCard} ref={nftCardRef}>
            <div className={styles.nftCardInner} ref={cardInnerRef}>
                <div className={styles.cardBg}></div>
                <div className={styles.cardOverlay}></div>
                
                {/* Direct video element with absolute positioning for maximum visibility */}
                <video
                    src="/OGNFT.mp4"
                    width="300px" 
                    height="300px"
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        borderRadius: "16px",
                        zIndex: 9999,
                        opacity: 1,
                        display: "block",
                        boxShadow: "0 0 40px 20px rgba(151,71,255,0.5)"
                    }}
                />
                
                {/* SVG patterns and paths */}
                <svg className={styles.hexagonPattern} width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(5) rotate(0)">
                            <polygon points="25,0 50,14.4 50,37.3 25,51.7 0,37.3 0,14.4" fill="none" stroke="white" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="800" height="500" fill="url(#hexagons)" />
                </svg>
                <svg className={styles.questMap} width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100,400 C150,350 250,300 300,350 S450,450 500,400" stroke="white" strokeWidth="2" fill="none"/>
                    <circle cx="100" cy="400" r="6" fill="white"/>
                    <circle cx="300" cy="350" r="6" fill="white"/>
                    <circle cx="500" cy="400" r="6" fill="white"/>
                    <path d="M200,200 C250,150 350,100 400,150 S550,250 600,200" stroke="white" strokeWidth="2" fill="none"/>
                    <circle cx="200" cy="200" r="6" fill="white"/>
                    <circle cx="400" cy="150" r="6" fill="white"/>
                    <circle cx="600" cy="200" r="6" fill="white"/>
                    <path d="M150,300 C200,250 300,200 350,250 S500,350 550,300" stroke="white" strokeWidth="2" fill="none"/>
                    <circle cx="150" cy="300" r="6" fill="white"/>
                    <circle cx="350" cy="250" r="6" fill="white"/>
                    <circle cx="550" cy="300" r="6" fill="white"/>
                </svg>
                
                <div className={styles.energyRings}>
                    <div className={`${styles.ring} ${styles.ring1}`}></div>
                    <div className={`${styles.ring} ${styles.ring2}`}></div>
                    <div className={`${styles.ring} ${styles.ring3}`}></div>
                    <div className={styles.ringRotate}></div>
                </div>
                
                <div className={styles.solquestText}>SOLQUEST.IO</div>
                
                <div className={styles.logoContainer}>
                    <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        zIndex: 10 
                    }} className={styles.logoShineContainer}>
                        {/* Replace SVG/logo with looping video */}
                        <video
                          src="/OGNFT.mp4"
                          width="100%"
                          height="100%"
                          autoPlay
                          loop
                          muted
                          playsInline
                          style={{ 
                              width: '90%', 
                              height: '90%', 
                              borderRadius: '32px', 
                              objectFit: 'cover', 
                              boxShadow: '0 0 32px 12px rgba(151,71,255,0.3)',
                              zIndex: 20,
                              opacity: 1,
                              display: 'block'
                          }}
                        />
                    </div>
                </div>
                
                <div className={styles.ogBadge}>OG</div>
                <div className={styles.title}>SolQuest OG Pass</div>
                
                {/* Boost badges */}
                <div className={styles.boostContainer}>
                    <div className={styles.boostBadge}>+10% SOL</div>
                    <div className={styles.boostBadge}>+10% XP</div>
                </div>

                {/* Render Sparkles */}
                {sparkles.map(sparkle => (
                    <div
                        key={`sparkle-${sparkle.id}`}
                        className={styles.sparkle}
                        style={{
                            left: `${sparkle.x}px`,
                            top: `${sparkle.y}px`,
                            width: `${sparkle.size}px`,
                            height: `${sparkle.size}px`,
                            animationDelay: `${sparkle.delay}s`,
                        }}
                    />
                ))}
                {particles.map(particle => (
                    <div
                        key={`particle-${particle.id}`}
                        className={styles.particle}
                        style={{
                            left: `${particle.x}px`,
                            top: `${particle.y}px`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            backgroundColor: particle.color,
                            boxShadow: `0 0 ${particle.size + 2}px ${particle.color}`,
                            animation: `${particle.animationName} ${particle.duration}s linear infinite ${particle.delay}s`,
                        }}
                    />
                ))}

                {/* Mint Button */}
                <div className={styles.mintButtonContainer}>
                    <Link href="/claim-og-nft" className={styles.mintButton}>
                        Mint OG NFT
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OGNftCard; 