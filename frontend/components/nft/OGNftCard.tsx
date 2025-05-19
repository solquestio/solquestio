import React from 'react';
import Link from 'next/link';
import styles from './OGNftCard.module.css';

const OGNftCard: React.FC = () => {
    return (
        <div className={styles.nftCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: 480, height: 320, background: 'rgba(20,20,40,0.7)', borderRadius: 24, padding: 0, position: 'relative', boxShadow: '0 8px 40px 0 rgba(151,71,255,0.18)' }}>
            {/* Badges Row */}
            <div style={{ position: 'absolute', top: 18, left: 18, display: 'flex', gap: 12, zIndex: 2 }}>
                <span style={{ background: 'linear-gradient(90deg, #00FFB3 60%, #4a9be2 100%)', color: '#121212', fontWeight: 700, fontSize: 15, borderRadius: 8, padding: '6px 16px', boxShadow: '0 2px 8px rgba(0,255,179,0.12)' }}>+10% SOL</span>
                <span style={{ background: 'linear-gradient(90deg, #9747FF 60%, #ffb347 100%)', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 8, padding: '6px 16px', boxShadow: '0 2px 8px rgba(151,71,255,0.12)' }}>+10% XP</span>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: 240, marginTop: 12 }}>
                <video
                    src="/OGNFT.mp4"
                    width="96%"
                    height="96%"
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        borderRadius: '18px',
                        boxShadow: '0 0 40px 10px rgba(151,71,255,0.25)',
                        background: '#000',
                        width: '96%',
                        height: '96%',
                        objectFit: 'cover',
                        maxHeight: 240,
                        maxWidth: 440,
                        display: 'block',
                    }}
                />
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'absolute', bottom: 20, left: 0 }}>
                <Link href="/claim-og-nft" className={styles.mintButton} style={{ fontSize: 18, padding: '14px 48px', borderRadius: 10 }}>
                    Mint OG NFT
                </Link>
            </div>
        </div>
    );
};

export default OGNftCard; 