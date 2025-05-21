import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './OGNftCard.module.css';

// In production, replace with actual collection symbols and URLs
const MAGIC_EDEN_COLLECTION_URL = "https://magiceden.io/collections/solquestio-og-nft";

const OGNftCard = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Image onLoad handler
    const handleImageLoad = () => {
        setIsLoaded(true);
    };

    return (
        <div className="w-full aspect-square relative overflow-hidden rounded-xl">
            {/* Backdrop loading shimmer - visible until image loads */}
            <div className={`absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 animate-pulse ${isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}></div>
            
            {/* NFT Image */}
            <div className="relative w-full h-full">
                <Image
                    src="/images/nft/og-nft-preview.jpg"
                    alt="SolQuestio OG NFT"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-xl transition-all duration-500 hover:scale-105"
                    onLoad={handleImageLoad}
                    priority
                />
                
                {/* NFT details overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-white">SolQuestio OG</h3>
                        <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-300 mr-2">Collection of 10,000</span>
                            <img src="/images/solana-logo.svg" alt="Solana" className="h-4 w-4" />
                        </div>
                    </div>
                </div>
                
                {/* Magic Eden badge */}
                <div className="absolute top-0 right-0 m-2">
                    <Link href={MAGIC_EDEN_COLLECTION_URL} passHref>
                        <a target="_blank" rel="noopener noreferrer" className="block">
                            <div className="bg-purple-600 rounded-full px-2 py-1 text-xs font-medium text-white flex items-center shadow-lg hover:bg-purple-700 transition-colors">
                                <span className="mr-1">View on</span>
                                <svg className="h-3 w-3" viewBox="0 0 25 25" fill="white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.5 0L0 21.875H25L12.5 0ZM12.5 10.9375L8.59375 17.5H16.4062L12.5 10.9375Z"/>
                                </svg>
                            </div>
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OGNftCard; 