import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './OGNftCard.module.css';

// In production, replace with actual collection symbols and URLs
const MAGIC_EDEN_COLLECTION_URL = "https://magiceden.io/collections/solquestio-og-nft";

const OGNftCard = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Video onLoad handler
    const handleVideoLoad = () => {
        setIsLoaded(true);
    };

    return (
        <div className="w-full aspect-video relative overflow-hidden rounded-sm">
            {/* Backdrop loading shimmer - visible until video loads */}
            <div className={`absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 animate-pulse ${isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}></div>
            
            {/* NFT Video */}
            <div className="relative w-full h-full">
                <video
                    src="/OGNFT.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-sm transition-all duration-500 hover:scale-105"
                    onLoadedData={handleVideoLoad}
                    style={{ objectFit: 'cover' }}
                >
                    Your browser does not support the video tag.
                </video>
                
                {/* NFT details overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-2">
                    <div className="flex flex-col">
                        <h3 className="text-sm font-bold text-white">SolQuestio OG</h3>
                        <div className="flex items-center mt-0.5">
                            <span className="text-xs text-gray-300 mr-1">Collection of 10,000</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.0891 10.1328C16.9047 10.0469 16.6891 10.0469 16.4891 10.1328L14.2813 11.2031L12.7422 11.9062L10.5656 13.0156C10.3813 13.1016 10.1656 13.1016 9.96563 13.0156L8.16563 12.0469C7.98127 11.9609 7.85157 11.7656 7.85157 11.5547V9.6875C7.85157 9.47656 7.96563 9.28125 8.16563 9.19531L9.95001 8.25C10.1344 8.16406 10.35 8.16406 10.55 8.25L12.3344 9.19531C12.5188 9.28125 12.6484 9.47656 12.6484 9.6875V10.7578L14.1875 10.0078V8.92969C14.1875 8.71875 14.0734 8.52344 13.8734 8.4375L10.5656 6.77344C10.3813 6.6875 10.1656 6.6875 9.96563 6.77344L6.61563 8.4375C6.41563 8.52344 6.30157 8.71875 6.30157 8.92969V12.3125C6.30157 12.5234 6.41563 12.7188 6.61563 12.8047L9.96563 14.4688C10.15 14.5547 10.3656 14.5547 10.5656 14.4688L12.7422 13.3984L14.2813 12.6562L16.4578 11.5859C16.6422 11.5 16.8578 11.5 17.0578 11.5859L18.8422 12.5547C19.0266 12.6406 19.1563 12.8359 19.1563 13.0469V14.9141C19.1563 15.125 19.0422 15.3203 18.8422 15.4062L17.0578 16.3828C16.8734 16.4688 16.6578 16.4688 16.4578 16.3828L14.6734 15.4062C14.4891 15.3203 14.3594 15.125 14.3594 14.9141V13.8438L12.8203 14.5938V15.6719C12.8203 15.8828 12.9344 16.0781 13.1344 16.1641L16.4844 17.8281C16.6688 17.9141 16.8844 17.9141 17.0844 17.8281L20.4344 16.1641C20.6188 16.0781 20.7484 15.8828 20.7484 15.6719V12.2891C20.7484 12.0781 20.6344 11.8828 20.4344 11.7969L17.0891 10.1328Z" fill="#14F195"/>
                            </svg>
                        </div>
                        
                        {/* Mint Button */}
                        <div className="mt-1">
                            <Link href="/claim-og-nft" className="inline-block">
                                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-1 px-3 rounded-sm transition-all duration-200 transform hover:scale-105 shadow-lg text-xs">
                                    Mint FREE NFT
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                
                {/* Magic Eden badge */}
                <div className="absolute top-0 right-0 m-1">
                    <Link href={MAGIC_EDEN_COLLECTION_URL} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="bg-purple-600 rounded-sm px-1.5 py-0.5 text-xs font-medium text-white flex items-center shadow-lg hover:bg-purple-700 transition-colors">
                            <span className="mr-0.5">View on</span>
                            <svg className="h-2.5 w-2.5" viewBox="0 0 25 25" fill="white" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.5 0L0 21.875H25L12.5 0ZM12.5 10.9375L8.59375 17.5H16.4062L12.5 10.9375Z"/>
                            </svg>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OGNftCard; 