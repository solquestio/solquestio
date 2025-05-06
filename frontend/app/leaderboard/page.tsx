'use client';

import { useState, useEffect, useCallback } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { TrophyIcon, SparklesIcon, UserCircleIcon } from '@heroicons/react/24/solid'; // For rewards section and SparklesIcon
// Remove dynamic import for wallet button
// import dynamic from 'next/dynamic'; 

// Remove definition for WalletMultiButtonDynamic
/*
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  {
    ssr: false,
    loading: () => <button className="px-4 py-2 h-10 bg-gray-600 rounded-md animate-pulse">Loading Wallet...</button> 
  }
);
*/

// Interface for leaderboard user data
interface LeaderboardUser {
    _id: string; // MongoDB ID
    walletAddress: string;
    username?: string;
    xp: number; // Represents score for the current timeframe
    // Add optional boost fields (backend will need to provide these eventually)
    xpBoost?: number; // e.g., 1.2 for +20% XP boost
    rewardBoost?: number; // e.g., 1.1 for +10% SOL reward boost
}

// Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Helper function to shorten wallet address
const shortenAddress = (address: string, chars = 4): string => {
    if (!address) return '';
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

// Define Timeframe type
type Timeframe = 'monthly' | 'total';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<Timeframe>('monthly'); // Default to monthly

    // --- Fetch Leaderboard Data ---
    const fetchLeaderboard = useCallback(async (selectedTimeframe: Timeframe) => {
        setIsLoading(true);
        setError(null);
        console.log(`Fetching leaderboard for timeframe: ${selectedTimeframe}`);
        try {
            // TODO: Update backend to accept timeframe query param
            const response = await fetch(`${BACKEND_URL}/api/users/leaderboard?timeframe=${selectedTimeframe}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch leaderboard');
            }
            let data: LeaderboardUser[] = await response.json();
            setLeaderboard(data); // Assume backend returns sorted data for the timeframe
        } catch (error: any) {
            console.error(`Error fetching ${selectedTimeframe} leaderboard:`, error);
            setError(error.message || `Could not load ${selectedTimeframe} leaderboard data.`);
            setLeaderboard([]);
        } finally {
            setIsLoading(false);
        }
    }, []); // No dependencies needed here as timeframe is passed in

    // Effect to fetch data when timeframe changes
    useEffect(() => {
        fetchLeaderboard(timeframe);
    }, [timeframe, fetchLeaderboard]);

    // --- Skeleton Loader Component ---
    const LeaderboardSkeleton = () => (
        <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-dark-card-secondary/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                        <Skeleton height={24} width={24} /> {/* Rank */}
                        <Skeleton circle height={40} width={40} /> {/* Avatar */}
                        <div className="flex-grow">
                             <Skeleton height={16} width="60%" /> {/* User/Address */}
                             <Skeleton height={12} width="40%" className="mt-1" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Skeleton height={20} width={50} /> {/* Boost */}
                        <Skeleton height={20} width={70} /> {/* Score */}
                    </div>
                </div>
            ))}
        </div>
    );

     // --- Rank Color/Style Helper ---
    const getRankClasses = (rank: number): string => {
        if (rank === 1) return 'bg-yellow-500 text-black';
        if (rank === 2) return 'bg-gray-400 text-black';
        if (rank === 3) return 'bg-orange-600 text-white';
        return 'bg-gray-700 text-gray-300';
    };

    return (
        <SkeletonTheme baseColor="#2a2a2e" highlightColor="#3c3c42"> {/* Darker Skeleton */} 
            <div className="max-w-4xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold mb-4 text-center text-white flex items-center justify-center">
                    <TrophyIcon className="w-8 h-8 mr-2 text-yellow-400"/> Leaderboard
                </h1>
                
                {/* Timeframe Toggle Buttons */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex rounded-md shadow-sm bg-dark-card border border-gray-700/80 p-1">
                        <button
                            onClick={() => setTimeframe('monthly')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-l-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-solana-purple focus:ring-offset-2 focus:ring-offset-dark-card
                                ${timeframe === 'monthly' ? 'bg-solana-purple text-white' : 'text-gray-300 hover:bg-gray-700/50'}
                            `}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setTimeframe('total')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-r-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-solana-purple focus:ring-offset-2 focus:ring-offset-dark-card
                                ${timeframe === 'total' ? 'bg-solana-purple text-white' : 'text-gray-300 hover:bg-gray-700/50'}
                            `}
                        >
                            Total
                        </button>
                    </div>
                </div>
                 
                {/* Rewards Info Section - Now Conditional */}
                 <div className="mb-8 p-4 bg-dark-card rounded-lg border border-white/10 text-center min-h-[60px]">
                    {timeframe === 'monthly' ? (
                        <p className="text-sm text-gray-300">
                            Compete monthly! The <span className="font-semibold text-yellow-300">Top 10</span> ranked Questers win <span className="font-semibold text-solana-green">SOL rewards</span>. 
                            Own a <span className="font-semibold text-solana-purple">SolQuest OG NFT</span> for XP boosts!
                        </p>
                    ) : (
                        <p className="text-sm text-gray-300">
                            View your all-time ranking based on total XP earned. 
                            Own a <span className="font-semibold text-solana-purple">SolQuest OG NFT</span> for XP boosts!
                        </p>
                    )}
                </div>

                {/* Remove Wallet Button from here */}
                {/* 
                <div className="flex justify-center mb-6">
                     <WalletMultiButtonDynamic className="!bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to hover:opacity-90 transition-opacity !rounded-md !h-10" />
                </div>
                 */}

                {error && <p className="text-red-400 text-center mb-4">Error: {error}</p>}

                {/* Leaderboard Container */} 
                <div className="bg-dark-card shadow-xl rounded-lg border border-gray-800/50 overflow-hidden min-h-[300px]"> {/* Added min-height */}
                    {/* Header Row - Optional */} 
                    {/* 
                    <div className="flex items-center justify-between p-4 bg-dark-card-secondary text-xs text-gray-400 font-semibold uppercase border-b border-gray-700/50">
                        <span className="w-12 text-center">Rank</span>
                        <span className="flex-1 ml-4">User</span>
                        <span className="w-32 text-right">Score</span>
                    </div> 
                    */} 

                    {isLoading ? (
                        <div className="p-4">
                            <LeaderboardSkeleton />
                        </div>
                    ) : leaderboard.length > 0 ? (
                        <div className="space-y-0.5"> {/* Minimal space between rows */}
                            {leaderboard.map((user, index) => {
                                const rank = index + 1;
                                const rankClasses = getRankClasses(rank);
                                const truncatedAddress = shortenAddress(user.walletAddress);
                                const gradientBg = rank === 1 ? 'bg-gradient-to-r from-yellow-500/20 via-dark-card-secondary/0 to-dark-card-secondary/0' 
                                                  : rank === 2 ? 'bg-gradient-to-r from-gray-500/20 via-dark-card-secondary/0 to-dark-card-secondary/0'
                                                  : rank === 3 ? 'bg-gradient-to-r from-orange-600/20 via-dark-card-secondary/0 to-dark-card-secondary/0' 
                                                  : 'bg-dark-card-secondary/50';
                                
                                return (
                                    <div 
                                        key={user._id} 
                                        className={`flex items-center justify-between p-3 md:p-4 ${gradientBg} hover:bg-gray-700/40 transition-colors duration-150`}
                                    >
                                        {/* Left Side: Rank, Avatar, User Info */}
                                        <div className="flex items-center space-x-3 md:space-x-4 flex-grow min-w-0 mr-4">
                                            <span className={`flex-shrink-0 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-xs md:text-sm font-bold rounded-md ${rankClasses}`}>
                                                {rank}
                                            </span>
                                            <UserCircleIcon className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 text-gray-500" /> {/* Placeholder Avatar */}
                                            <div className="min-w-0">
                                                <p className="text-sm md:text-base font-medium text-gray-100 truncate">
                                                    {user.username || truncatedAddress} {/* Show username or address */}
                                                </p>
                                                {user.username && (
                                                    <p className="text-xs text-gray-400 font-mono truncate">
                                                        {truncatedAddress} {/* Show address below if username exists */}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Side: Boosts and Score */}
                                        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                                            {/* Boost Badges - using Arkada style */}
                                             {(user.xpBoost && user.xpBoost > 1) && (
                                                <span className="flex items-center text-xs font-semibold bg-black/50 text-purple-300 px-2 py-0.5 rounded-md border border-purple-500/50">
                                                    <SparklesIcon className="h-3.5 w-3.5 mr-1"/> x{user.xpBoost.toFixed(1)}
                                                </span>
                                            )}
                                            {(user.rewardBoost && user.rewardBoost > 1) && (
                                                 <span className="flex items-center text-xs font-semibold bg-black/50 text-teal-300 px-2 py-0.5 rounded-md border border-teal-500/50">
                                                      <TrophyIcon className="h-3.5 w-3.5 mr-1"/> x{user.rewardBoost.toFixed(1)}
                                                </span>
                                             )}
                                             {/* Score (XP) - styled like Arkada score */} 
                                             <div className="bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white px-3 py-1 rounded-md shadow-md min-w-[70px] text-right"> {/* Added min-width and text-right */} 
                                                <span className="text-sm font-bold">
                                                    <SparklesIcon className="w-3.5 h-3.5 inline mr-1 opacity-80"/> {user.xp}
                                                </span>
                                             </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-10">The leaderboard is currently empty.</p>
                    )}
                </div>
            </div>
        </SkeletonTheme>
    );
} 