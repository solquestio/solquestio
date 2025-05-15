'use client';

import { useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { PencilIcon, CheckIcon, XMarkIcon, CalendarDaysIcon, ArrowPathIcon, FireIcon } from '@heroicons/react/24/solid';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useAuth } from '@/context/AuthContext';

// Dynamically import the WalletMultiButton with no SSR
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false, loading: () => <button className="px-4 py-2 bg-gray-600 rounded-md">Loading Wallet...</button> }
);

// Define the Quest structure from backend
interface Quest {
    id: string;
    title: string;
    description: string;
    path: string;
    order: number;
    isCompleted: boolean;
    xpReward: number;
}

// Define the backend API endpoint
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Quest IDs (match backend)
const FUND_WALLET_QUEST_ID = 'fund-wallet';

// --- Helper: Check if eligible for check-in & Calculate Potential XP --- 
const getCheckInStatus = (userProfile?: any): { canCheckIn: boolean; potentialXp: number; currentStreak: number } => {
    const currentStreak = userProfile?.checkInStreak || 0;
    if (!userProfile?.lastCheckedInAt) {
         // Never checked in before
         return { canCheckIn: true, potentialXp: 1, currentStreak: 0 };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1); 
    const lastCheckDate = new Date(userProfile.lastCheckedInAt);

    if (lastCheckDate >= todayStart) {
         // Already checked in today
         return { canCheckIn: false, potentialXp: 0, currentStreak };
    }

    let nextStreak = 0;
    if (lastCheckDate >= yesterdayStart) {
         // Last check-in was yesterday, streak continues
         nextStreak = currentStreak + 1;
    } else {
         // Last check-in was before yesterday, streak resets
         nextStreak = 1;
    }
    
    const potentialXp = Math.min(nextStreak, 30);
    return { canCheckIn: true, potentialXp, currentStreak }; 
};

export default function ProfilePage() { 
  // Use the AuthContext
  const { authToken, userProfile, isAuthenticated, isLoading: isLoadingAuth, error: authError, login } = useAuth();
  
  // Hooks
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  // State
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(true);
  const [questError, setQuestError] = useState<string | null>(null);
  const [isVerifyingQuest, setIsVerifyingQuest] = useState<string | null>(null);

  // State for username editing
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Daily Check-in State
  const [checkInData, setCheckInData] = useState({ canCheckIn: false, potentialXp: 0, currentStreak: 0 });
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [lastXpAwarded, setLastXpAwarded] = useState<number | null>(null);

  // Initialization
  useEffect(() => {
    setIsMounted(true);
    
    // Initialize username when userProfile changes
    if (userProfile) {
      setNewUsername(userProfile.username || '');
    }
  }, [userProfile]);

  // Fetch balance when connected and userProfile is loaded
  useEffect(() => {
    if (connected && publicKey && userProfile) {
      const fetchBalance = async () => {
        try {
          setIsLoadingBalance(true);
          const balanceResponse = await connection.getBalance(publicKey);
          setBalance(balanceResponse / LAMPORTS_PER_SOL);
        } catch (error: any) {
          console.error('Error fetching balance:', error);
        } finally {
          setIsLoadingBalance(false);
        }
      };
      fetchBalance();
    } else {
      setBalance(null);
      setIsLoadingBalance(false);
    }
  }, [connected, publicKey, connection, userProfile]);

  // Fetch quests when user profile is loaded
  useEffect(() => {
    if (userProfile && authToken) {
      const fetchQuests = async () => {
        setIsLoadingQuests(true);
        setQuestError(null);
        try {
          const response = await fetch(`${BACKEND_URL}/api/quests`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` },
          });
          const data = await response.json();
          if (!response.ok) { throw new Error(data.message || 'Failed to fetch quests'); }
          console.log('Quests fetched:', data);
          setQuests(data);
        } catch (error: any) {
          console.error('Error fetching quests:', error);
          setQuestError(`Failed to load quests: ${error.message}`);
          setQuests([]);
        } finally {
          setIsLoadingQuests(false);
        }
      };
      fetchQuests();
    }
  }, [userProfile, authToken]);

  // Update check-in status when userProfile changes
  useEffect(() => {
    if (userProfile) {
      const status = getCheckInStatus(userProfile);
      setCheckInData(status);
    }
  }, [userProfile]);

  // Username editing functions
  const handleEditUsername = () => {
    setIsEditingUsername(true);
    setUsernameError(null);
    setNewUsername(userProfile?.username || '');
  };

  const handleCancelEdit = () => {
    setIsEditingUsername(false);
    setUsernameError(null);
    setNewUsername(userProfile?.username || '');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      {isLoadingAuth ? (
        <div className="mb-6">
          <Skeleton height={30} width={200} />
          <Skeleton height={20} width={150} count={3} />
        </div>
      ) : authError ? (
        <div className="mb-6 text-red-500">
          {authError}
        </div>
      ) : !isAuthenticated ? (
        <div className="mb-6">
          <p className="mb-4">Please sign in to view your profile</p>
          <button 
            onClick={() => login()} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Sign In
          </button>
        </div>
      ) : (
        <>
          {/* User Info Section */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2">
              {!isEditingUsername ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-100 truncate">{userProfile.username || 'Unnamed Explorer'}</h2>
                  <button onClick={handleEditUsername} className="text-xs text-blue-400 hover:text-blue-300">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-gray-700 text-white px-2 py-1 rounded"
                    placeholder="Enter username"
                  />
                  <button 
                    onClick={() => {
                      // Implement save username logic here
                      setIsEditingUsername(false);
                    }} 
                    className="text-green-400 hover:text-green-300"
                    disabled={isUpdatingUsername}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={handleCancelEdit} 
                    className="text-red-400 hover:text-red-300"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            {usernameError && (
              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
            )}
            
            <div className="mt-4">
              <p className="text-gray-300">
                XP: <span className="font-semibold">{userProfile.xp || 0}</span>
              </p>
              
              {/* Wallet Connection Status */}
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Wallet</h3>
                {!connected ? (
                  <div>
                    <p className="text-gray-400 mb-2">Connect your wallet to continue</p>
                    <WalletMultiButtonDynamic />
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 break-all">
                      {publicKey?.toString()}
                    </p>
                    <p className="mt-2">
                      Balance: {isLoadingBalance ? (
                        <Skeleton width={60} />
                      ) : (
                        <span>{balance !== null ? `${balance.toFixed(4)} SOL` : 'Unknown'}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Daily Check-in Section */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center">
                <CalendarDaysIcon className="h-5 w-5 mr-2" />
                Daily Check-in
              </h2>
              <div className="flex items-center">
                <FireIcon className="h-5 w-5 text-orange-500 mr-1" />
                <span className="font-medium">{checkInData.currentStreak} day streak</span>
              </div>
            </div>
            
            <div className="mt-4">
              {checkInData.canCheckIn ? (
                <button
                  onClick={() => {
                    // Implement check-in logic here
                  }}
                  disabled={isCheckingIn}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
                >
                  {isCheckingIn ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                      Checking in...
                    </>
                  ) : (
                    <>
                      Check In (+{checkInData.potentialXp} XP)
                    </>
                  )}
                </button>
              ) : (
                <p className="text-gray-400">
                  You've already checked in today. Come back tomorrow!
                </p>
              )}
              
              {checkInError && (
                <p className="text-red-500 mt-2">{checkInError}</p>
              )}
              
              {lastXpAwarded !== null && (
                <p className="text-green-500 mt-2">
                  +{lastXpAwarded} XP awarded!
                </p>
              )}
            </div>
          </div>
          
          {/* Quests Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">My Quests</h2>
            
            {isLoadingQuests ? (
              <div className="space-y-4">
                <Skeleton height={60} count={3} />
              </div>
            ) : questError ? (
              <p className="text-red-500">{questError}</p>
            ) : quests.length === 0 ? (
              <p className="text-gray-400">No quests available at the moment.</p>
            ) : (
              <div className="space-y-4">
                {quests.map(quest => (
                  <div key={quest.id} className="border border-gray-700 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{quest.title}</h3>
                        <p className="text-gray-400 mt-1">{quest.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Reward: <span className="text-yellow-500">{quest.xpReward} XP</span>
                        </p>
                      </div>
                      <div>
                        {quest.isCompleted ? (
                          <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                            Completed
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              // Implement verify quest logic here
                            }}
                            disabled={isVerifyingQuest === quest.id}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
                          >
                            {isVerifyingQuest === quest.id ? 'Verifying...' : 'Verify'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 