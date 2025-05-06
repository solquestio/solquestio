'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react'; // Need wallet hook for connect state
import { Logo } from '@/components/Logo';
import { useWallet as useWalletMultiButton } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

// --- Interfaces --- 
interface LearningPath {
    id: string;
    title: string;
    description: string;
    questCount: number;
    isLocked?: boolean;
    totalXp?: number; // Add total XP
}

interface UserProfile { // Minimal profile needed for homepage display
  id: string;
  username?: string;
  xp: number;
}

// --- Constants --- 
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const AUTH_TOKEN_KEY = 'solquest_auth_token';

// --- Helper Components --- 

// Quest Count Circles Indicator
const QuestCircles: React.FC<{ count: number; completed?: number }> = ({ count, completed = 0 }) => {
  return (
    <div className="flex space-x-1 mt-2">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={`block w-2 h-2 rounded-full ${index < completed ? 'bg-green-500' : 'bg-gray-600'}`}>
        </span>
      ))}
    </div>
  );
};

interface LearningPathCardProps {
    title: string;
    description: string;
    isLocked: boolean;
    pathSlug?: string; // Make slug optional for locked cards
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ title, description, isLocked, pathSlug }) => {
    const cardClasses = isLocked
        ? "bg-dark-card-secondary border-gray-700 cursor-not-allowed opacity-60"
        : "bg-dark-card border-white/10 hover:border-solana-purple transition-colors";

    // Define the inner content separately
    const cardContent = (
        <div className={`p-6 rounded-lg border ${cardClasses}`}>
            <h3 className="text-xl font-semibold mb-2 text-gray-100">{title}</h3>
            <p className="text-gray-400 text-sm mb-4">{description}</p>
            <div className="flex justify-end items-center">
                {isLocked ? (
                    <span className="text-xs text-gray-500 italic">Coming Soon</span>
                ) : (
                    <span className="text-sm font-medium text-solana-purple">Start Path &rarr;</span>
                )}
            </div>
        </div>
    );

    // Conditionally wrap with Link
    if (!isLocked && pathSlug) {
        return (
            <Link href={`/paths/${pathSlug}`} legacyBehavior={false} className="block"> {/* Wrap content with Link */}
                {cardContent}
            </Link>
        );
    } else {
        // Return plain div if locked or no slug
        return cardContent; 
    }
};

// --- Main Homepage Component --- 
export default function HomePage() {
    const { connected, publicKey } = useWallet(); // Use wallet hook
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
    const [isLoadingPaths, setIsLoadingPaths] = useState(true);
    const [pathError, setPathError] = useState<string | null>(null);
    
    // State for user info display
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

     // Check for token on mount
    useEffect(() => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            setAuthToken(token);
        } else {
            setUserProfile(null); // Ensure profile is null if no token
        }
    }, []);

     // Fetch minimal user profile if token exists
    const fetchMinimalUserProfile = useCallback(async (token: string) => {
        if (!token) return;
        setIsLoadingProfile(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/users/me`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            // Only proceed if response is ok, otherwise user stays null
            if (response.ok) {
                const data: UserProfile = await response.json();
                setUserProfile(data);
            } else {
                 console.warn('Homepage: Failed to fetch user profile, user not fully logged in?');
                 setUserProfile(null); // Ensure profile is null on failed fetch
                 // Optionally clear token if invalid?
                 // localStorage.removeItem(AUTH_TOKEN_KEY);
                 // setAuthToken(null);
            }
        } catch (error) {
            console.error('Homepage: Error fetching user profile:', error);
            setUserProfile(null); // Clear profile on error
        } finally {
            setIsLoadingProfile(false);
        }
    }, []);

    useEffect(() => {
        if (authToken) {
            fetchMinimalUserProfile(authToken);
        }
    }, [authToken, fetchMinimalUserProfile]);

    // Effect to reset profile state if wallet disconnects
    useEffect(() => {
        // Use connected state from useWallet hook
        if (!connected) { 
            console.log('Homepage: Wallet disconnected, resetting user profile state...');
            setAuthToken(null); // Clear token state
            setUserProfile(null); // Clear profile state
            // We don't necessarily need to clear localStorage here, 
            // as the primary trigger is the connection state.
        }
    }, [connected]); // Depend on wallet connection status

    // Fetch Learning Paths
    useEffect(() => {
        const fetchPaths = async () => {
            setIsLoadingPaths(true);
            setPathError(null);
            try {
                const response = await fetch(`${BACKEND_URL}/api/paths`);
                if (!response.ok) throw new Error('Failed to fetch learning paths');
                const data = await response.json();
                setLearningPaths(data);
            } catch (err: any) {
                console.error(err);
                setPathError(err.message || 'Could not load paths.');
            } finally {
                setIsLoadingPaths(false);
            }
        };
        fetchPaths();
    }, []); // Fetch paths once on mount

    const isAuthenticated = !!authToken && !!userProfile;

    return (
        <div>
            {/* Conditional User Info Header */} 
            {isLoadingProfile ? (
                 <div className="text-center p-4 mb-6 bg-dark-card/30 rounded-lg animate-pulse"><p className="text-sm text-gray-500">Loading user info...</p></div>
            ) : isAuthenticated ? (
                <div className="p-4 mb-8 bg-dark-card/50 border border-white/10 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="text-gray-300 text-sm">Welcome back,</p>
                        <p className="text-lg font-semibold text-white">{userProfile.username || publicKey?.toBase58().substring(0,8)+'...'}</p> { /* Show username or shortened pubkey */}
                    </div>
                    <div className="text-right">
                         <p className="text-gray-300 text-sm">Your XP</p>
                         <p className="text-lg font-bold text-yellow-400">{userProfile.xp}</p>
                    </div>
                </div>
            ) : null } 
            {/* Only show if not loading profile and not authenticated */} 
            {!isLoadingProfile && !isAuthenticated && (
                 <div className="text-center p-4 mb-6 bg-dark-card/30 rounded-lg border border-dashed border-gray-600">
                     <p className="text-sm text-gray-400">Connect your wallet and verify to track progress and earn XP!</p>
                 </div>
            )}

            {/* Welcome Message */} 
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                    Learning Paths
                </h1>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                    Choose a path below to begin your Solana journey!
                </p>
            </div>

            {/* Learning Path Grid */} 
            {isLoadingPaths && <p className="text-center text-gray-400">Loading paths...</p>}
            {pathError && <p className="text-center text-red-500">Error loading paths: {pathError}</p>}
            {!isLoadingPaths && !pathError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {learningPaths.length > 0 ? (
                        learningPaths.map(path => (
                            <LearningPathCard key={path.id} title={path.title} description={path.description} isLocked={path.isLocked || false} pathSlug={path.id} />
                        ))
                    ) : (
                         <p className="text-gray-500 md:col-span-2 lg:col-span-3 text-center">No learning paths available.</p>
                    )}
                </div>
            )}
        </div>
    );
} 