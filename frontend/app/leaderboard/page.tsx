'use client';

import { useState, useEffect } from 'react';
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
    xp: number;
}

// Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Helper function to shorten wallet address
const shortenAddress = (address: string, chars = 4): string => {
    if (!address) return '';
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BACKEND_URL}/api/users/leaderboard?limit=20`); // Fetch top 20
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch leaderboard');
                }
                const data: LeaderboardUser[] = await response.json();
                setLeaderboard(data);
            } catch (err: any) {
                console.error('Error fetching leaderboard:', err);
                setError(err.message || 'Could not load leaderboard data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []); // Fetch once on component mount

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                Leaderboard
            </h1>

            {/* Remove Wallet Button from here */}
            {/* 
            <div className="flex justify-center mb-6">
                 <WalletMultiButtonDynamic className="!bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to hover:opacity-90 transition-opacity !rounded-md !h-10" />
            </div>
             */}

            {isLoading && <p className="text-center text-gray-400">Loading leaderboard...</p>}
            {error && <p className="text-center text-red-500">Error: {error}</p>}

            {!isLoading && !error && (
                <div className="bg-dark-card shadow-lg rounded-lg overflow-hidden border border-white/10">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-dark-card/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-16 text-center">Rank</th>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3 text-right">XP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.length > 0 ? (
                                leaderboard.map((user, index) => (
                                    <tr key={user._id} className="border-b border-gray-700 hover:bg-dark-card/30">
                                        <td className="px-6 py-4 font-medium text-white text-center">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            {user.username || shortenAddress(user.walletAddress)}
                                            {/* Optionally show full address in tooltip or small print */}
                                            {user.username && <span className="block text-xs text-gray-500">{shortenAddress(user.walletAddress)}</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-yellow-400">{user.xp}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-4 text-gray-500">Leaderboard is empty.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
} 