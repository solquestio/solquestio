'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { UserCircleIcon, SparklesIcon, ArrowRightOnRectangleIcon, ArrowPathIcon } from '@heroicons/react/24/solid'; // Added disconnect icon and refresh icon
import Image from 'next/image'; // Import Next Image for wallet icon
import { Connection } from '@solana/web3.js';

// Dynamically import the WalletMultiButton for the disconnected state
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  {
    ssr: false,
    loading: () => <button className="px-4 py-2 h-10 bg-gray-700 rounded-lg animate-pulse text-sm text-gray-400">Loading...</button>
  }
);

// --- Interfaces --- 
interface UserProfile {
  id: string;
  walletAddress: string;
  username?: string;
  completedQuestIds: string[];
  xp: number;
  lastCheckedInAt?: string | Date;
  checkInStreak?: number;
  createdAt: string;
  updatedAt: string;
  ownsOgNft?: boolean;
  telegram?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  };
}

// --- Constants --- 
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.solquest.io';
const AUTH_TOKEN_KEY = 'solquest_auth_token';

export function HeaderWalletButton() {
    const { connected, publicKey, disconnect, wallet } = useWallet();
    const { connection } = useConnection(); // Use connection for balance
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Combined loading state
    const [error, setError] = useState<string | null>(null); // Combined error state

    // Function to fetch user profile from backend
    const fetchUserProfile = useCallback(async (token: string) => {
        if (!token) return;
        try {
            const response = await fetch(`${BACKEND_URL}/api/users?path=me`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (!response.ok) {
                // If fetching profile fails (e.g., expired token), clear auth state
                console.warn('Header: Failed to fetch profile, clearing token.');
                localStorage.removeItem(AUTH_TOKEN_KEY);
                setAuthToken(null);
                setUserProfile(null);
                throw new Error('Failed to fetch profile');
            }
            const data: UserProfile = await response.json();
            setUserProfile(data);
        } catch (err) {
            console.error('Header: Error fetching user profile:', err);
            setUserProfile(null); // Clear profile on error
             setError("Couldn't load profile.");
        }
    }, []);

    // Function to fetch SOL balance
    const fetchSolBalance = useCallback(async () => {
        if (!connected || !publicKey) {
            setSolBalance(null);
            return;
        }
        
        try {
            console.log('[HeaderWallet] Fetching SOL balance for:', publicKey.toString());
            
            // Try multiple RPC endpoints for better reliability
            const rpcEndpoints = [
                process.env.NEXT_PUBLIC_HELIUS_RPC_URL,
                'https://api.mainnet-beta.solana.com',
                'https://solana-mainnet.rpc.extrnode.com',
                'https://mainnet.rpcpool.com'
            ].filter((endpoint): endpoint is string => Boolean(endpoint));
            
            let balanceSOL = null;
            let lastError = null;
            
            for (const endpoint of rpcEndpoints) {
                try {
                    console.log(`[HeaderWallet] Trying RPC endpoint: ${endpoint}`);
                    const tempConnection = new Connection(endpoint, 'confirmed');
                    const balanceLamports = await tempConnection.getBalance(publicKey);
                    balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
                    console.log('[HeaderWallet] Balance fetched successfully:', balanceSOL, 'SOL');
                    break; // Success, exit loop
                } catch (endpointError) {
                    console.warn(`[HeaderWallet] Failed to fetch from ${endpoint}:`, endpointError);
                    lastError = endpointError;
                    continue; // Try next endpoint
                }
            }
            
            if (balanceSOL !== null) {
                setSolBalance(balanceSOL);
                setError(null);
            } else {
                throw lastError || new Error('All RPC endpoints failed');
            }
        } catch (err) {
            console.error('Header: Error fetching SOL balance:', err);
            setSolBalance(null);
            setError("Couldn't load balance.");
        }
    }, [connected, publicKey]);

    // Effect to check auth token on mount and connection change
    useEffect(() => {
        // Clear any cached network settings that might cause devnet balance
        localStorage.removeItem('solana-network');
        localStorage.removeItem('fallback-rpc-endpoint');
        localStorage.setItem('solquestio-network', 'mainnet');
        
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (connected && token) {
            setAuthToken(token);
        } else {
            setAuthToken(null);
            setUserProfile(null); // Clear profile if disconnected or no token
            setSolBalance(null); // Clear balance if disconnected
        }
    }, [connected]);

    // Effect to fetch data when authenticated and connected
    useEffect(() => {
        if (connected && authToken && publicKey) {
            setIsLoading(true);
            setError(null);
            Promise.all([
                fetchUserProfile(authToken),
                fetchSolBalance()
            ]).finally(() => {
                setIsLoading(false);
            });
        } else {
            // Clear data if disconnected or not authenticated
            setUserProfile(null);
            setSolBalance(null);
            setIsLoading(false);
            setError(null);
        }
    }, [connected, authToken, publicKey, fetchUserProfile, fetchSolBalance]); // Rerun if connection, auth, or pubkey changes

    // Auto-refresh balance every 15 seconds when connected
    useEffect(() => {
        if (!connected || !publicKey) return;

        const refreshInterval = setInterval(() => {
            console.log('[HeaderWallet] Auto-refreshing balance...');
            fetchSolBalance();
        }, 15000); // Refresh every 15 seconds

        return () => clearInterval(refreshInterval);
    }, [connected, publicKey, fetchSolBalance]);

    // Listen for account changes to refresh balance immediately
    useEffect(() => {
        if (!connected || !publicKey) return;

        // Create a connection for the account change listener
        const listenerConnection = new Connection(
            process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
            'confirmed'
        );

        const subscriptionId = listenerConnection.onAccountChange(
            publicKey,
            (accountInfo) => {
                console.log('[HeaderWallet] Account changed, refreshing balance...');
                fetchSolBalance();
            },
            'confirmed'
        );

        return () => {
            if (subscriptionId) {
                listenerConnection.removeAccountChangeListener(subscriptionId);
            }
        };
    }, [connected, publicKey, fetchSolBalance]);

    if (!connected) {
        // Show the standard connect button if wallet is not connected
        return (
             <WalletMultiButtonDynamic className="!bg-gradient-to-r from-solana-purple to-solana-green hover:opacity-90 transition-opacity !rounded-lg !h-10 !text-sm !font-semibold" />
        );
    }

    // Wallet is connected, show user info + disconnect button
    const walletIcon = wallet?.adapter?.icon;
    const walletName = wallet?.adapter?.name;

    return (
        <div className="group relative"> {/* Add group for hover state */} 
            <div className="flex items-center space-x-2 bg-dark-card border border-gray-700 p-1.5 rounded-lg transition-colors group-hover:bg-gray-700/80 min-h-[40px]"> {/* Ensure min height */} 
                {/* Wallet Info */} 
                {walletIcon && (
                     <Image src={walletIcon} alt={walletName || 'Wallet Icon'} width={20} height={20} className="rounded-full flex-shrink-0" />
                )}
                {publicKey && (
                    <span className="text-xs font-mono text-gray-400 flex-shrink-0 pr-2 border-r border-gray-600">
                        {publicKey.toBase58().substring(0, 4)}...{publicKey.toBase58().substring(publicKey.toBase58().length - 4)}
                    </span>
                )}

                {/* Loading/Error/User Info */} 
                <div className="flex items-center flex-grow">
                    {isLoading ? (
                        <div className="flex items-center space-x-2 px-1 py-1">
                            <div className="w-5 h-5 bg-gray-600 rounded-full animate-pulse"></div>
                            <div className="w-10 h-4 bg-gray-600 rounded animate-pulse"></div>
                            <div className="w-8 h-4 bg-gray-600 rounded animate-pulse"></div>
                            <div className="w-6 h-4 bg-gray-600 rounded animate-pulse"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center px-1 py-1 text-xs text-red-400">
                            <span>Error</span>
                        </div>
                    ) : userProfile ? (
                        <div className="flex items-center space-x-2 px-1">
                             {/* Username - smaller */}
                            <div className="flex items-center">
                                <span className="text-xs font-medium text-gray-200 truncate max-w-[60px]" title={userProfile.username || publicKey?.toBase58()}>
                                    {userProfile.username || 'User'}
                                </span>
                            </div>
                            {/* XP */} 
                            <div className="flex items-center space-x-0.5 border-l border-gray-600 pl-1.5">
                                <SparklesIcon className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                                <span className="text-xs font-semibold text-yellow-400">{userProfile.xp ?? 0}</span>
                            </div>
                            {/* Balance */}
                            <div className="flex items-center space-x-0.5 border-l border-gray-600 pl-1.5">
                                <span className="text-xs font-semibold text-solana-green">
                                    {solBalance !== null ? solBalance.toFixed(2) : '-'} SOL
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fetchSolBalance();
                                    }}
                                    className="ml-1 p-0.5 hover:bg-gray-600 rounded transition-colors"
                                    title="Refresh balance"
                                >
                                    <ArrowPathIcon className="w-2.5 h-2.5 text-gray-400 hover:text-white" />
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-center px-1 py-1 text-xs text-gray-400">
                             <span className="font-mono">
                                 {publicKey?.toBase58().substring(0, 8)}...{publicKey?.toBase58().substring(publicKey.toBase58().length - 4)}
                             </span>
                         </div>
                    )}
                 </div>
            </div>
            
            {/* Hover element for Disconnect */} 
            <button 
                onClick={disconnect}
                className="absolute inset-0 flex items-center justify-center bg-red-600/90 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                title="Disconnect Wallet"
            >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-1"/>
                Disconnect
            </button>
        </div>
    );
} 