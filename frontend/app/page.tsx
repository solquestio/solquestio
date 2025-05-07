'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useWallet, WalletNotSelectedError } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { SparklesIcon, TrophyIcon, UserCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image'; // For NFT image
import { AuthPromptModal } from '@/components/AuthPromptModal';
import bs58 from 'bs58';
// import OGNftCard from '@/components/nft/OGNftCard'; // Removed import

// --- Interfaces --- 
interface LearningPath {
    id: string;
    title: string;
    description: string;
    questCount: number;
    isLocked?: boolean;
    totalXp?: number; // Added totalXp
    graphicType?: 'image' | 'gradient' | 'none'; // Made graphicType optional
    imageUrl?: string | null; // Allow null
}

interface UserProfile { 
  id: string;
  username?: string;
  xp: number;
}

interface LeaderboardUser {
    _id: string;
    walletAddress: string;
    username?: string;
    xp: number;
    rank?: number; // Optional rank if provided by API or calculated client-side
    xpBoost?: number; // Added xpBoost
    // avatar?: string; // Placeholder for avatar images later
}

// --- Constants --- 
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const AUTH_TOKEN_KEY = 'solquest_auth_token';
const SIGN_IN_MESSAGE = "Sign this message to verify your wallet and log in to SolQuest.io. This does not cost any SOL.";

// --- Helper Components --- 

interface LearningPathCardProps {
    title: string;
    description: string;
    isLocked: boolean;
    pathSlug?: string;
    totalXp?: number; // Added totalXp
    questCount: number;
    isAuthenticated: boolean; // Added
    promptLogin: () => void; // Added
    graphicType?: 'image' | 'gradient' | 'none'; // Added graphicType
    imageUrl?: string | null; // Added imageUrl
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ title, description, isLocked, pathSlug, totalXp, questCount, isAuthenticated, promptLogin, graphicType = 'none', imageUrl }) => {
    const cardClasses = isLocked
        ? "bg-dark-card-secondary border-gray-700 cursor-not-allowed opacity-60"
        : "bg-dark-card border-gray-800 hover:border-solana-purple transition-all duration-200 ease-in-out transform hover:-translate-y-1 shadow-lg hover:shadow-solana-purple/30";

    const cardContent = (
        <div className={`rounded-xl border ${cardClasses} flex flex-col h-full overflow-hidden`}>
            {/* Graphic Area */}            
            {(graphicType === 'image' && imageUrl) ? (
                <div className="relative h-36 w-full bg-black/20"> 
                    <Image 
                        src={imageUrl} 
                        alt={`${title} graphic`} 
                        layout="fill" 
                        objectFit="contain" // Changed back to contain
                        className="p-4 opacity-80 group-hover:opacity-100 transition-opacity" // Added p-4 back
                    />
                </div>
            ) : graphicType === 'gradient' ? (
                // Example gradient for Solana Explorer Path
                <div className="h-36 w-full bg-gradient-to-br from-emerald-900/70 via-sky-900/60 to-purple-900/70 flex items-center justify-center">
                    {/* Optional: Add a subtle icon or text here */}
                     <svg className="w-16 h-16 text-sky-300 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> 
                </div>
            ) : (
                 <div className="h-8"></div> // Minimal space if no graphic
            )}

            {/* Content Area */} 
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-2 text-gray-100">{title}</h3>
                <p className="text-gray-400 text-sm mb-4 flex-grow">{description}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-700/50">
                    <div className="text-xs text-gray-500">
                        {questCount} Quests 
                        {totalXp !== undefined && (
                            <span className="ml-2 pl-2 border-l border-gray-600">
                                Up to <span className="font-semibold text-yellow-400">{totalXp} XP</span>
                            </span>
                        )}
                    </div>
                    {isLocked ? (
                        <span className="text-xs text-gray-500 italic">Coming Soon</span>
                    ) : !isAuthenticated ? (
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); promptLogin(); }}
                            className="text-sm font-medium text-solana-green hover:text-solana-green-light flex items-center focus:outline-none"
                        >
                            Login to Start <ArrowRightIcon className="w-4 h-4 ml-1" />
                        </button>
                    ) : (
                        <span className="text-sm font-medium text-solana-purple group-hover:text-solana-purple-light flex items-center">
                            Start Path <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    if (!isLocked && pathSlug && isAuthenticated) {
        return (
            <Link href={`/paths/${pathSlug}`} legacyBehavior={false} className="block group h-full">
                {cardContent}
            </Link>
        );
    } else {
        return <div className="block group h-full">{cardContent}</div>; 
    }
};

interface OgNftShowcaseProps {
    isAuthenticated: boolean;
    promptLogin: () => void;
}

const OgNftShowcase: React.FC<OgNftShowcaseProps> = ({ isAuthenticated, promptLogin }) => {
    const nftName = "SolQuest OG Pass";
    const nftBenefit = "Unlock exclusive XP boosts, early access to new paths, and special community perks.";
    const nftImageUrl = "/placeholder-nft.png"; // Restored placeholder image

    return (
        <div className="relative bg-gradient-to-br from-purple-600/80 via-solana-purple to-solana-green/80 p-8 md:p-12 rounded-xl shadow-2xl overflow-hidden mb-16">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('/grid-pattern.svg')`, backgroundSize: 'cover'}}></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center">
                <div className="md:w-2/3 mb-8 md:mb-0 md:pr-10">
                     <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                        Hold the <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">{nftName}</span>
                    </h2>
                    <p className="text-purple-100 text-lg mb-6">
                        {nftBenefit}
                    </p>
                    {!isAuthenticated ? (
                        <button 
                            onClick={promptLogin}
                            className="inline-block bg-white text-solana-purple font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
                        > 
                            Login to Learn More
                        </button>
                    ) : (
                        <Link 
                            href="/mint" // Assuming /mint page might require auth or show different content
                            legacyBehavior={false} 
                            className="inline-block bg-white text-solana-purple font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200"
                        > 
                            Learn More & Mint (Soon)
                        </Link>
                    )}
                </div>
                <div className="md:w-1/3 flex justify-center md:justify-end">
                    {/* Restored placeholder image div */}
                    <div className="w-48 h-48 md:w-60 md:h-60 bg-black/20 rounded-lg shadow-xl flex items-center justify-center overflow-hidden animate-float">
                        <img src={nftImageUrl} alt={nftName} className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity" /> 
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to shorten wallet address (if not already global)
const shortenAddress = (address: string, chars = 4): string => {
    if (!address) return '';
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

// Rank Color/Style Helper (copied from leaderboard page)
const getRankClasses = (rank: number): string => {
    if (rank === 1) return 'bg-yellow-500 text-black';
    if (rank === 2) return 'bg-gray-400 text-black';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-gray-700 text-gray-300';
};

const LeaderboardSnippet: React.FC = () => {
    const [topPlayers, setTopPlayers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopPlayers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BACKEND_URL}/api/users/leaderboard?limit=3`); 
                if (!response.ok) throw new Error('Failed to fetch leaderboard');
                let data: LeaderboardUser[] = await response.json();
                // Ensure limit if backend doesn't support it
                if (data.length > 3 && !response.url.includes('limit=3')) {
                    data = data.slice(0, 3);
                }
                 // Assign rank explicitly if not provided by backend
                 setTopPlayers(data.map((player, index) => ({
                    ...player, 
                    rank: player.rank ?? index + 1 // Use backend rank or calculate
                })));
            } catch (err: any) {
                setError(err.message || 'Could not load top players.');
                console.error("Leaderboard snippet error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopPlayers();
    }, []);

    return (
        <div className="bg-dark-card border border-gray-800/50 p-6 rounded-xl shadow-xl h-full"> {/* Added h-full */} 
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-gray-100 flex items-center">
                    <TrophyIcon className="w-6 h-6 mr-2 text-yellow-400" /> Top Questers
                </h2>
                <Link href="/leaderboard" legacyBehavior={false}
                    className="text-xs text-solana-purple hover:text-solana-purple-light transition-colors font-medium"
                >
                    View All &rarr;
                </Link>
            </div>
            {isLoading && (
                <div className="space-y-2 animate-pulse">
                     {/* Updated Skeleton to match new layout */}
                    {[...Array(3)].map((_, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-dark-card-secondary rounded-md">
                           <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-gray-600 rounded-md"></div> {/* Rank */}
                                <div className="w-8 h-8 bg-gray-600 rounded-full"></div> {/* Avatar */}
                                <div className="h-4 w-24 bg-gray-600 rounded"></div> {/* Name */}
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="h-4 w-12 bg-gray-600 rounded"></div> {/* Boost */}
                                <div className="h-5 w-16 bg-gray-600 rounded-md"></div> {/* Score */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-red-400 text-sm text-center py-4">Error: {error}</p>}
            {!isLoading && !error && topPlayers.length > 0 && (
                 <div className="space-y-1"> {/* Use space-y-1 for tighter rows */} 
                    {topPlayers.map((player, index) => {
                         const rank = player.rank ?? index + 1;
                         const rankClasses = getRankClasses(rank);
                         const truncatedAddress = shortenAddress(player.walletAddress, 4); // Use 4 chars for snippet
                         const gradientBg = rank === 1 ? 'bg-gradient-to-r from-yellow-500/15 to-dark-card-secondary/0' 
                                           : rank === 2 ? 'bg-gradient-to-r from-gray-500/15 to-dark-card-secondary/0'
                                           : rank === 3 ? 'bg-gradient-to-r from-orange-600/15 to-dark-card-secondary/0' 
                                           : 'bg-dark-card-secondary/50';

                        return (
                            <div 
                                key={player._id} 
                                className={`flex items-center justify-between p-3 rounded-lg ${gradientBg} hover:bg-gray-700/40 transition-colors duration-150`}
                            >
                                {/* Left Side: Rank, Avatar, User Info */}
                                <div className="flex items-center space-x-3 flex-grow min-w-0 mr-3">
                                    <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold rounded-md ${rankClasses}`}>
                                        {rank}
                                    </span>
                                    <UserCircleIcon className="flex-shrink-0 w-8 h-8 text-gray-500" /> {/* Placeholder Avatar */}
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-100 truncate">
                                            {player.username || truncatedAddress}
                                        </p>
                                        {player.username && (
                                            <p className="text-xs text-gray-400 font-mono truncate">
                                                {truncatedAddress}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Boosts and Score */}
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    {/* Boost Badges */}
                                     {(player.xpBoost && player.xpBoost > 1) && (
                                        <span className="flex items-center text-xs font-semibold bg-black/50 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/50" title={`XP Boost x${player.xpBoost.toFixed(1)}`}>
                                            <SparklesIcon className="h-3 w-3 mr-0.5"/> x{player.xpBoost.toFixed(1)}
                                        </span>
                                    )}
                                     {/* Score (XP) */}
                                     <div className="bg-gradient-to-r from-purple-600/70 to-blue-600/70 text-white px-2 py-0.5 rounded text-center min-w-[60px]">
                                        <span className="text-xs font-bold">
                                            {player.xp} XP
                                        </span>
                                     </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
             {!isLoading && !error && topPlayers.length === 0 && (
                 <p className="text-gray-500 text-sm italic text-center py-6">Be the first on the leaderboard!</p>
            )}
        </div>
    );
};

// --- Main Homepage Component --- 
export default function HomePage() {
    const { publicKey: hookPublicKey, signMessage, connected, wallet } = useWallet();
    const { setVisible: setWalletModalVisible } = useWalletModal();
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
    const [isLoadingPaths, setIsLoadingPaths] = useState(true);
    const [pathFetchError, setPathFetchError] = useState<string | null>(null); // Specific error for path fetching
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // To store user profile after auth
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Added for passing to children

    // Effect to update isAuthenticated based on token in localStorage
    useEffect(() => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        setIsAuthenticated(!!token);
        // Simple listener for storage changes to keep this state somewhat reactive
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === AUTH_TOKEN_KEY) {
                setIsAuthenticated(!!event.newValue);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []); // Runs once on mount and sets up listener

    const fetchPaths = useCallback(async (token?: string | null) => {
        setIsLoadingPaths(true);
        setPathFetchError(null);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${BACKEND_URL}/api/quests/paths`, { headers });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); 
                throw new Error(errorData.message || `Failed to fetch learning paths (status: ${response.status})`);
            }
            const data = await response.json();
            setLearningPaths(Array.isArray(data) ? data : data.paths || []); 
        } catch (error: any) {
            console.error("Failed to fetch learning paths:", error);
            setLearningPaths([]);
            setPathFetchError(error.message || "Could not load learning paths.");
        } finally {
            setIsLoadingPaths(false);
        }
    }, []);

    useEffect(() => {
        const currentToken = localStorage.getItem(AUTH_TOKEN_KEY);
        setIsAuthenticated(!!currentToken); // Ensure isAuthenticated state is current

        if (!currentToken) {
            // No longer automatically open modal
            fetchPaths(); // Fetch public paths
        } else {
            fetchPaths(currentToken);
        }
    }, [wallet, fetchPaths]); // Simplified dependencies

    const handleRequestAuthentication = async () => {
        setAuthError(null);
        setIsAuthLoading(true);

        // If not connected, open the standard wallet modal
        if (!connected) {
            console.log("Wallet not connected, opening standard wallet modal.");
            setWalletModalVisible(true); // Open the wallet selection modal
            setIsAuthLoading(false); // Stop loading, user needs to interact with wallet modal
            return; // Stop here
        }

        // If connected, proceed. Check for public key.
        const currentPublicKey = hookPublicKey; // Use the reactive value from the hook
        if (!currentPublicKey) {
             setAuthError("Wallet connected, but failed to get public key. Please try disconnecting and reconnecting.");
             setIsAuthLoading(false);
             return;
        }

        // Check for signMessage support
        if (!signMessage) {
            setAuthError('The selected wallet does not support message signing.');
            setIsAuthLoading(false);
            return;
        }

        // Proceed with signing and verification
        try {
            const messageToSign = SIGN_IN_MESSAGE;
            const messageBytes = new TextEncoder().encode(messageToSign);
            const signatureBytes = await signMessage(messageBytes);
            const signature = bs58.encode(signatureBytes);

            const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: currentPublicKey.toBase58(), signature, message: messageToSign }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Authentication failed (status: ${response.status}). Please try again.`);
            }

            const { token, user } = await response.json();
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            setUserProfile(user);
            setIsAuthenticated(true); 
            setIsAuthModalOpen(false); 
            setAuthError(null); 
            console.log("Successfully authenticated and token stored.");
            fetchPaths(token); // Re-fetch paths with token

        } catch (error: any) {
            console.error("Authentication error:", error);
            let errorMessage = "An unexpected error occurred during sign-in.";
            // Simplified error check for user rejection
            if (error.message && (error.message.toLowerCase().includes('user rejected') || 
                 error.message.toLowerCase().includes('cancelled') || 
                 error.message.toLowerCase().includes('declined'))) {
                errorMessage = "Sign message request was cancelled or rejected in your wallet. Please try again.";
            } else if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                 errorMessage = error;
            }
            setAuthError(errorMessage);
        } finally {
            setIsAuthLoading(false);
        }
    };

    // Function to open the auth modal (called by external buttons)
    const openAuthModal = () => {
        setAuthError(null); 
        setIsAuthModalOpen(true);
    }
    
    return (
        <div className="space-y-12 md:space-y-16 py-8 px-4 md:px-6 lg:px-8 min-h-screen bg-dark-background text-gray-200">
            
            <AuthPromptModal 
                isOpen={isAuthModalOpen}
                onClose={() => {
                    setIsAuthModalOpen(false);
                    setAuthError(null); 
                }}
                onAuthenticate={handleRequestAuthentication} // Modal button triggers the full handler
                loading={isAuthLoading}
            />
            {authError && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-600/90 text-white p-4 rounded-md shadow-lg z-50 max-w-md w-auto text-center">
                    <p>{authError}</p>
                    <button onClick={() => setAuthError(null)} className="text-xs underline hover:text-red-200 mt-1">Dismiss</button>
                </div>
            )}

            <section className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                <div className="w-full lg:w-2/3">
                    <OgNftShowcase isAuthenticated={isAuthenticated} promptLogin={openAuthModal} />
                </div>
                
                <div className="w-full lg:w-1/3">
                     <LeaderboardSnippet />
                </div>
            </section>

            <section>
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                        Learning Paths
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Choose a path to begin your Solana journey and earn XP!
                    </p>
                </div>

                {isLoadingPaths && <div className="text-center text-gray-400 py-8">Loading paths... <SparklesIcon className="w-5 h-5 inline animate-pulse" /></div>}
                {pathFetchError && !isLoadingPaths && (
                    <p className="text-center text-red-400 py-8">
                        Error loading learning paths: {pathFetchError}
                    </p>
                )}
                {!isLoadingPaths && !pathFetchError && learningPaths.length === 0 && (
                     <p className="text-gray-500 md:col-span-2 text-center py-8">No learning paths available currently. Check back soon!</p>
                )}
                {!isLoadingPaths && !pathFetchError && learningPaths.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 max-w-4xl mx-auto">
                        {learningPaths.map((path) => (
                            <LearningPathCard
                                key={path.id}
                                title={path.title}
                                description={path.description}
                                isLocked={path.isLocked || false}
                                pathSlug={path.id} 
                                totalXp={path.totalXp}
                                questCount={path.questCount}
                                isAuthenticated={isAuthenticated} 
                                promptLogin={openAuthModal} 
                                graphicType={path.graphicType}
                                imageUrl={path.imageUrl}
                            />
                        ))}
                    </div>
                )}
            </section>

            <footer className="text-center mt-16 py-8 border-t border-gray-800">
                <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} SolQuest.io - Embark on your Solana Adventure.</p>
            </footer>
        </div>
    );
} 