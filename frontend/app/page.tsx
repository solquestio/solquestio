'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react'; // Need wallet hook for connect state

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

// Learning Path Card Component
const LearningPathCard: React.FC<{ path: LearningPath }> = ({ path }) => {
    const cardClasses = [
        "block p-5 bg-dark-card border border-white/10 rounded-lg shadow-lg", // Slightly less padding
        "transition-all duration-300 h-full flex flex-col", // Added h-full for consistent height
        path.isLocked
            ? "opacity-60 cursor-not-allowed border-gray-700"
            : "hover:bg-dark-card/80 hover:shadow-solana-glow cursor-pointer"
    ].join(' ');

    const content = (
        <div className="flex flex-col flex-grow"> {/* Added flex-grow */} 
            <div className="flex justify-between items-start mb-2"> {/* Adjusted alignment */} 
                 <h3 className="text-lg font-bold tracking-tight text-white">{path.title}</h3>
                 {path.isLocked && <span className="text-xs bg-gray-600 text-gray-200 px-2 py-0.5 rounded-full ml-2">Coming Soon</span>}
             </div>
            <p className="font-normal text-gray-400 text-sm mb-3 flex-grow">{path.description}</p> {/* Added flex-grow */} 
            <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center"> {/* Footer section */} 
                <QuestCircles count={path.questCount || 0} />
                <p className={`text-sm font-semibold ${path.isLocked ? 'text-gray-500' : 'text-yellow-400'}`}>
                    {path.totalXp || 0} XP
                </p>
            </div>
        </div>
    );

    return path.isLocked ? (
        <div className={cardClasses}>{content}</div>
    ) : (
        <Link href={`/path/${path.id}`} className={cardClasses}>
            {content}
        </Link>
    );
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
                            <LearningPathCard key={path.id} path={path} />
                        ))
                    ) : (
                         <p className="text-gray-500 md:col-span-2 lg:col-span-3 text-center">No learning paths available.</p>
                    )}
                </div>
            )}
        </div>
    );
} 