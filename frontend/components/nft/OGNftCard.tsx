'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './OGNftCard.module.css';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const MAGIC_EDEN_COLLECTION_URL = "https://magiceden.io/collections/solquestio-og-nft";

interface NFTStats {
  totalMinted: number;
  maxSupply: number;
  remaining: number;
  mintPrice: number;
  mintType: string;
}

const OGNftCard = () => {
    const [stats, setStats] = useState<NFTStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/og-nft/stats`);
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error loading NFT stats:', error);
            // Fallback to initial values
            setStats({
                totalMinted: 0,
                maxSupply: 10000,
                remaining: 10000,
                mintPrice: 0,
                mintType: 'Community Free Mint'
            });
        } finally {
            setLoading(false);
        }
    };

    const progressPercentage = stats ? (stats.totalMinted / stats.maxSupply) * 100 : 0;

    return (
        <div className="relative">
            <div className="bg-gray-800/70 backdrop-blur rounded-lg overflow-hidden border border-gray-600">
                {/* Video Preview Section */}
                <div className="relative">
                    <div className="h-48 overflow-hidden">
                        <video 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            <source src="/OGNFT.mp4" type="video/mp4" />
                            {/* Fallback for browsers that don't support video */}
                            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <div className="text-4xl font-bold mb-2">OG</div>
                                    <div className="text-lg">SolQuest NFT</div>
                                </div>
                            </div>
                        </video>
                    </div>
                    
                    {/* Magic Eden badge */}
                    <div className="absolute top-2 right-2">
                        <Link href={MAGIC_EDEN_COLLECTION_URL} target="_blank" rel="noopener noreferrer" className="block">
                            <div className="bg-purple-600/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium text-white flex items-center shadow-lg hover:bg-purple-700 transition-colors">
                                <span className="mr-1">View on</span>
                                <svg className="h-3 w-3" viewBox="0 0 25 25" fill="white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.5 0L0 21.875H25L12.5 0ZM12.5 10.9375L8.59375 17.5H16.4062L12.5 10.9375Z"/>
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
                
                <div className="p-4">
                    <div className="text-center mb-3">
                        <h3 className="text-lg font-bold text-white mb-1">SolQuest OG</h3>
                        <div className="flex items-center justify-center mb-2">
                            <span className="text-sm text-gray-300 mr-1">Collection of {stats ? stats.maxSupply.toLocaleString() : '10,000'}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.0891 10.1328C16.9047 10.0469 16.6891 10.0469 16.4891 10.1328L14.2813 11.2031L12.7422 11.9062L10.5656 13.0156C10.3813 13.1016 10.1656 13.1016 9.96563 13.0156L8.16563 12.0469C7.98127 11.9609 7.85157 11.7656 7.85157 11.5547V9.6875C7.85157 9.47656 7.96563 9.28125 8.16563 9.19531L9.95001 8.25C10.1344 8.16406 10.35 8.16406 10.55 8.25L12.3344 9.19531C12.5188 9.28125 12.6484 9.47656 12.6484 9.6875V10.7578L14.1875 10.0078V8.92969C14.1875 8.71875 14.0734 8.52344 13.8734 8.4375L10.5656 6.77344C10.3813 6.6875 10.1656 6.6875 9.96563 6.77344L6.61563 8.4375C6.41563 8.52344 6.30157 8.71875 6.30157 8.92969V12.3125C6.30157 12.5234 6.41563 12.7188 6.61563 12.8047L9.96563 14.4688C10.15 14.5547 10.3656 14.5547 10.5656 14.4688L12.7422 13.3984L14.2813 12.6562L16.4578 11.5859C16.6422 11.5 16.8578 11.5 17.0578 11.5859L18.8422 12.5547C19.0266 12.6406 19.1563 12.8359 19.1563 13.0469V14.9141C19.1563 15.125 19.0422 15.3203 18.8422 15.4062L17.0578 16.3828C16.8734 16.4688 16.6578 16.4688 16.4578 16.3828L14.6734 15.4062C14.4891 15.3203 14.3594 15.125 14.3594 14.9141V13.8438L12.8203 14.5938V15.6719C12.8203 15.8828 12.9344 16.0781 13.1344 16.1641L16.4844 17.8281C16.6688 17.9141 16.8844 17.9141 17.0844 17.8281L20.4344 16.1641C20.6188 16.0781 20.7484 15.8828 20.7484 15.6719V12.2891C20.7484 12.0781 20.6344 11.8828 20.4344 11.7969L17.0891 10.1328Z" fill="#14F195"/>
                            </svg>
                        </div>
                        
                        {/* Stats */}
                        {loading ? (
                            <div className="text-sm text-gray-400">Loading stats...</div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Minted:</span>
                                    <span className="text-white font-mono">{stats ? stats.totalMinted.toLocaleString() : '0'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Available:</span>
                                    <span className="text-white font-mono">{stats ? stats.remaining.toLocaleString() : '10,000'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Price:</span>
                                    <span className="text-green-400 font-bold">FREE</span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                                    <div 
                                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-400">
                                    {progressPercentage.toFixed(1)}% claimed
                                </div>
                            </div>
                        )}
                        
                        {/* Mint Button */}
                        <div className="mt-4">
                            <Link href="/claim-og-nft" className="inline-block w-full">
                                <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                                    Claim FREE NFT
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OGNftCard; 