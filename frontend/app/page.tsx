'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { SparklesIcon, TrophyIcon, UserCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image'; // For NFT image

// --- Interfaces --- 
interface LearningPath {
    id: string;
    title: string;
    description: string;
    questCount: number;
    isLocked?: boolean;
    totalXp?: number; // Added totalXp
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

// --- Helper Components --- 

interface LearningPathCardProps {
    title: string;
    description: string;
    isLocked: boolean;
    pathSlug?: string;
    totalXp?: number; // Added totalXp
    questCount: number;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ title, description, isLocked, pathSlug, totalXp, questCount }) => {
    const cardClasses = isLocked
        ? "bg-dark-card-secondary border-gray-700 cursor-not-allowed opacity-60"
        : "bg-dark-card border-gray-800 hover:border-solana-purple transition-all duration-200 ease-in-out transform hover:-translate-y-1 shadow-lg hover:shadow-solana-purple/30";

    const cardContent = (
        <div className={`p-6 rounded-xl border ${cardClasses} flex flex-col h-full`}>
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
                ) : (
                    <span className="text-sm font-medium text-solana-purple group-hover:text-solana-purple-light flex items-center">
                        Start Path <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </span>
                )}
            </div>
        </div>
    );

    if (!isLocked && pathSlug) {
        return (
            <Link href={`/paths/${pathSlug}`} legacyBehavior={false} className="block group h-full">
                {cardContent}
            </Link>
        );
    } else {
        return <div className="h-full">{cardContent}</div>; 
    }
};

const OgNftShowcase: React.FC = () => {
    // Placeholder for OG NFT details
    const nftName = "SolQuest OG Pass";
    const nftBenefit = "Unlock exclusive XP boosts, early access to new paths, and special community perks.";
    // Replace with actual image path or a more sophisticated image component
    const nftImageUrl = "/placeholder-nft.png"; // Make sure you have a placeholder in /public

    return (
        <div className="relative bg-gradient-to-br from-purple-600/80 via-solana-purple to-solana-green/80 p-8 md:p-12 rounded-xl shadow-2xl overflow-hidden mb-16">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('/grid-pattern.svg')`, backgroundSize: 'cover'}}></div> {/* Optional pattern overlay */}
            <div className="relative z-10 flex flex-col md:flex-row items-center">
                <div className="md:w-2/3 mb-8 md:mb-0 md:pr-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                        Hold the <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">{nftName}</span>
                    </h2>
                    <p className="text-purple-100 text-lg mb-6">
                        {nftBenefit}
                    </p>
                    <Link 
                        href="/mint" 
                        legacyBehavior={false} 
                        className="inline-block bg-white text-solana-purple font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200"
                    > 
                        Learn More & Mint (Soon)
                    </Link>
                </div>
                <div className="md:w-1/3 flex justify-center md:justify-end">
                    {/* Basic Image - replace with Next/Image for optimization if in /public */}
                    <div className="w-48 h-48 md:w-60 md:h-60 bg-black/20 rounded-lg shadow-xl flex items-center justify-center overflow-hidden animate-float">
                         {/* Using a simple div as placeholder, replace with actual <Image> */}
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
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
    const [isLoadingPaths, setIsLoadingPaths] = useState(true);
    const [pathError, setPathError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaths = async () => {
            setIsLoadingPaths(true);
            setPathError(null);
            try {
                const response = await fetch(`${BACKEND_URL}/api/quests/paths`);
                if (!response.ok) throw new Error('Failed to fetch learning paths');
                setLearningPaths(await response.json());
            } catch (err: any) {
                console.error(err);
                setPathError(err.message || 'Could not load paths.');
            } finally {
                setIsLoadingPaths(false);
            }
        };
        fetchPaths();
    }, []);

    return (
        <div className="space-y-12 md:space-y-16 py-8 px-4 md:px-6 lg:px-8 min-h-screen bg-dark-background text-gray-200">
            
            {/* Combined Showcase and Leaderboard Section */}
            <section className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                {/* OG NFT Showcase (Left Side on Large Screens) */}
                <div className="w-full lg:w-2/3">
                    <OgNftShowcase />
                </div>
                
                {/* Leaderboard Snippet (Right Side on Large Screens) */}
                <div className="w-full lg:w-1/3">
                     <LeaderboardSnippet />
                </div>
            </section>

            {/* Learning Paths Section */}
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
                {pathError && <p className="text-center text-red-500 py-8">Error loading paths: {pathError}</p>}
                {!isLoadingPaths && !pathError && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 max-w-4xl mx-auto">
                        {learningPaths.length > 0 ? (
                            learningPaths.map(path => (
                                <LearningPathCard 
                                    key={path.id} 
                                    title={path.title} 
                                    description={path.description} 
                                    isLocked={path.isLocked || false} 
                                    pathSlug={path.id} 
                                    totalXp={path.totalXp}
                                    questCount={path.questCount}
                                />
                            ))
                        ) : (
                             <p className="text-gray-500 md:col-span-2 text-center py-8">No learning paths available currently. Check back soon!</p>
                        )}
                    </div>
                )}
            </section>

            {/* Footer Placeholder */}
            <footer className="text-center mt-16 py-8 border-t border-gray-800">
                <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} SolQuest.io - Embark on your Solana Adventure.</p>
            </footer>
        </div>
    );
} 