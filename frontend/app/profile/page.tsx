'use client';

import { useEffect, useState, useCallback, useContext } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { PencilIcon, CheckIcon, XMarkIcon, CalendarDaysIcon, ArrowPathIcon, FireIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useAuth } from '@/context/AuthContext';
import NetworkSwitcher, { NetworkContext, useNetwork } from '@/components/NetworkSwitcher';
import TelegramConnectCard from '@/components/social/TelegramConnectCard';
import { XpIcon } from '@/components/icons/XpIcon';

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

// Define reliable RPC endpoints for both networks
const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=0abb48db-ebdd-4297-aa63-5f4d79234d9e';
const DEVNET_RPC_URL = 'https://api.devnet.solana.com'; // Reliable devnet endpoint

// Define the UserProfile interface
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
  xpHistory?: { description: string; timestamp: string; amount: number }[];
  social?: {
    github?: string;
    twitter?: string;
    photo_url?: string;
  };
}

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

// --- Mock XP/Points History ---
const mockXpHistory = [
  { date: '2024-05-19T14:37:21Z', type: 'Check-in', description: 'Daily check-in', amount: 5 },
  { date: '2024-05-18T13:12:00Z', type: 'Quest', description: 'Completed "Connect Your Wallet"', amount: 100 },
  { date: '2024-05-18T12:00:00Z', type: 'Quest', description: 'Completed "Explore a Transaction"', amount: 150 },
  // Add more mock events as needed
];

export default function ProfilePage() { 
  // Use the AuthContext and NetworkContext
  const { authToken, userProfile, isAuthenticated, isLoading: isLoadingAuth, error: authError, login } = useAuth();
  const { network } = useNetwork();
  
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

  // Add a state for RPC errors
  const [rpcError, setRpcError] = useState<boolean>(false);

  // Track wallet connection state in localStorage
  useEffect(() => {
    if (connected) {
      localStorage.setItem('walletConnectionState', 'connected');
      console.log("Wallet connected - saved connection state");
    } else {
      // Only clear if we're not in the middle of a network switch
      // This prevents the wallet from disconnecting during network changes
      const savedNetwork = localStorage.getItem('solana-network');
      const currentNetworkIsMainnet = network === 'mainnet';
      const savedNetworkIsMainnet = savedNetwork === 'mainnet-beta';
      
      // Don't clear connection state if networks don't match (indicating we're switching)
      if (currentNetworkIsMainnet === savedNetworkIsMainnet) {
        localStorage.removeItem('walletConnectionState');
        console.log("Wallet disconnected - cleared connection state");
      }
    }
  }, [connected, network]);

  // Initialization
  useEffect(() => {
    setIsMounted(true);
    
    // Initialize username when userProfile changes
    if (userProfile) {
      setNewUsername(userProfile.username || '');
    }

    // Force a connection refresh when component mounts
    if (connected && publicKey) {
      try {
        const refreshConnection = async () => {
          console.log(`Forcing connection refresh for balance update on ${network}`);
          const currentProvider = connection.rpcEndpoint;
          // Small delay to ensure wallet is fully connected
          await new Promise(resolve => setTimeout(resolve, 500));
          setIsLoadingBalance(true);
          
          try {
            const balanceResponse = await connection.getBalance(publicKey);
            setBalance(balanceResponse / LAMPORTS_PER_SOL);
            console.log(`Initial balance fetch: ${balanceResponse / LAMPORTS_PER_SOL} SOL from ${currentProvider} (${network})`);
          } catch (balanceError: any) {
            // Handle 403 errors gracefully
            if (balanceError.message && (balanceError.message.includes('403') || balanceError.message.includes('forbidden'))) {
              console.warn('Initial balance fetch failed: RPC endpoint returned 403 forbidden. This may be due to rate limiting.');
              setRpcError(true);
              // Don't throw - let the user see the UI without balance temporarily
            } else {
              // For other errors, log them but don't throw
              console.error("Balance fetch error:", balanceError);
            }
          } finally {
            setIsLoadingBalance(false);
          }
        };
        refreshConnection();
      } catch (error) {
        console.error("Initial balance refresh error:", error);
        setIsLoadingBalance(false);
      }
    }
  }, [userProfile, connected, publicKey, connection, network]);

  // Fetch balance when connected and userProfile is loaded
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (connected && publicKey && userProfile) {
      const fetchBalance = async () => {
        try {
          setIsLoadingBalance(true);
          setRpcError(false);
          
          // Determine which RPC endpoint to use - always use direct connections for reliability
          let balanceConnection;
          let rpcEndpoint;
          
          if (network === 'mainnet') {
            console.log('Using direct Helius RPC connection for mainnet');
            rpcEndpoint = HELIUS_RPC_URL;
          } else {
            console.log('Using direct devnet RPC connection');
            rpcEndpoint = DEVNET_RPC_URL;
          }
          
          // Create a fresh connection for each request to avoid stale connection issues
          balanceConnection = new Connection(rpcEndpoint, 'confirmed');
          console.log(`Attempting to fetch balance from: ${rpcEndpoint} (${network})`);
          
          // Try to get the balance with a small retry mechanism
          let attempts = 0;
          let success = false;
          let balanceResponse = 0;
          
          while (attempts < 3 && !success) {
            try {
              balanceResponse = await balanceConnection.getBalance(publicKey);
              success = true;
            } catch (retryError: any) {
              // Handle 403 errors specifically
              if (retryError.message && (retryError.message.includes('403') || retryError.message.includes('forbidden'))) {
                console.warn(`Access forbidden (403) from RPC endpoint. This may be due to rate limiting.`);
                // Don't retry on 403 - it's likely to continue failing
                attempts = 3;
                setRpcError(true);
              } else {
                console.warn(`Balance fetch attempt ${attempts + 1} failed on ${network}:`, retryError);
                attempts++;
                // Small delay before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
          
          if (success) {
            console.log(`Successfully fetched balance: ${balanceResponse / LAMPORTS_PER_SOL} SOL on ${network} network`);
            setBalance(balanceResponse / LAMPORTS_PER_SOL);
            setRpcError(false);
          } else {
            // Show a more user-friendly message
            console.error('Failed to fetch balance - RPC endpoint may be rate limited or unavailable');
            setRpcError(true);
          }
        } catch (error: any) {
          console.error(`Error fetching balance on ${network}:`, error);
          setRpcError(true);
        } finally {
          setIsLoadingBalance(false);
        }
      };
      
      // Fetch immediately
      fetchBalance();
      
      // Set up an interval to refresh every 15 seconds
      intervalId = setInterval(fetchBalance, 15000);
    } else {
      setBalance(null);
      setIsLoadingBalance(false);
    }
    
    // Clean up interval on unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connected, publicKey, connection, userProfile, network]);

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

  // --- Username Update Handler ---
  const handleUpdateUsername = async () => {
    if (!authToken || !userProfile) return;
    
    const username = newUsername?.trim();
    
    // Reset state for this operation
    setUsernameError(null);
    setIsUpdatingUsername(true);
    
    // Empty username is not allowed
    if (!username) {
      setUsernameError('Username cannot be empty');
      setIsUpdatingUsername(false);
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/me`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ username })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update username');
      }
      
      console.log('Username updated:', data);
      
      // Refresh profile data - we can update the local data directly without a full refresh
      // Note: in a proper implementation we'd update the AuthContext's userProfile
      setIsEditingUsername(false);
      
    } catch (error: any) {
      console.error('Failed to update username:', error);
      setUsernameError(`Update failed: ${error.message}`);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  // --- Daily Check-in Handler ---
  const handleCheckIn = async () => {
    if (!authToken || !checkInData.canCheckIn) return;

    setIsCheckingIn(true);
    setCheckInError(null);
    setLastXpAwarded(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/users?path=check-in`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.message && data.message.includes('Already checked in')) {
          setCheckInData(getCheckInStatus(data.user)); 
        }
        throw new Error(data.message || 'Failed to check in');
      }

      console.log('Check-in successful:', data);
      setLastXpAwarded(data.xpAwarded || null); 

    } catch (err: any) {
      console.error('Check-in error:', err);
      setCheckInError(err.message || 'An error occurred during check-in.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // --- Redirect Effect ---
  useEffect(() => {
    // Only redirect if mounted AND wallet is not connected
    if (isMounted && !connected) {
      console.log('Wallet not connected, redirecting to homepage...');
      router.push('/');
    }
    // Depend on isMounted and connected status
  }, [isMounted, connected, router]);

  // Listen for network changes and try to reconnect wallet if needed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleNetworkChange = async (event: any) => {
      console.log(`Network change detected to ${event.detail.network}, attempting to restore wallet connection`);
      
      // Wait for connection provider to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // If we have a wallet but not connected, try to reconnect
      if (publicKey && !connected) {
        console.log('Attempting to reconnect wallet after network change');
        // This forces a state update in wallet components
        window.dispatchEvent(new Event('wallet-adapter-reconnect'));
      }
      
      // Refresh balance after network change
      if (publicKey) {
        setIsLoadingBalance(true);
        try {
          const balanceResponse = await connection.getBalance(publicKey);
          setBalance(balanceResponse / LAMPORTS_PER_SOL);
          console.log(`Balance refreshed after network change: ${balanceResponse / LAMPORTS_PER_SOL} SOL`);
        } catch (error) {
          console.error('Error refreshing balance after network change:', error);
        }
        setIsLoadingBalance(false);
      }
    };
    
    // Listen for our custom network change event
    window.addEventListener('wallet-network-change', handleNetworkChange);
    
    return () => {
      window.removeEventListener('wallet-network-change', handleNetworkChange);
    };
  }, [publicKey, connected, connection]);

  // Add a new state for manually refreshing balance
  const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);

  // Function to manually refresh balance using direct connections for both networks
  const refreshBalanceManually = async () => {
    if (!publicKey || !connected) return;
    
    setIsManuallyRefreshing(true);
    setRpcError(false);
    
    try {
      // Select the appropriate endpoint based on network
      const rpcEndpoint = network === 'mainnet' 
        ? HELIUS_RPC_URL 
        : DEVNET_RPC_URL;
      
      console.log(`Manual refresh: Using direct ${network} connection`);
      const directConnection = new Connection(rpcEndpoint, 'confirmed');
      
      const balanceResponse = await directConnection.getBalance(publicKey);
      console.log(`Manual refresh: Balance: ${balanceResponse / LAMPORTS_PER_SOL} SOL`);
      setBalance(balanceResponse / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Manual balance refresh failed:', error);
      setRpcError(true);
    } finally {
      setIsManuallyRefreshing(false);
    }
  };

  // --- Social Connect Section ---
  // Place this section after the username/wallet info, before stats/quests
  // You may want to add more social cards later (GitHub, Twitter, etc)

  // Calculate completed quests count
  const completedQuestsCount = isAuthenticated ? quests.filter(q => q.isCompleted).length : 0;

  // --- Completed Quest History ---
  // Only show quests that are in userProfile.completedQuestIds
  const completedQuests = quests.filter(
    (quest) => userProfile?.completedQuestIds?.includes(quest.id)
  );

  // Add console log here to inspect userProfile before render
  console.log("ProfilePage - userProfile state:", userProfile);

  if (isLoadingAuth) {
    return (
      <div className="w-full max-w-md mx-auto mt-10 p-6 bg-dark-card rounded-xl shadow-lg border border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Loading Profile...</h1>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto mt-10 p-6 bg-dark-card rounded-xl shadow-lg border border-gray-700">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-gray-400 mt-2">Connect your wallet to view your profile</p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <WalletMultiButtonDynamic className="wallet-button" />
          <button 
            onClick={login}
            className="px-4 py-2 bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Authenticate with Wallet
          </button>
          {authError && (
            <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded-lg mt-4 text-sm">
              {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <SkeletonTheme baseColor="#2d3748" highlightColor="#4a5568">
      <div className="max-w-3xl mx-auto py-10 flex flex-col gap-8">
        {/* Profile Header Card */}
        <div className="bg-dark-card rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 border border-white/10">
          <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {userProfile?.username ? userProfile.username.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-gray-100 truncate">{userProfile?.username || 'Unnamed User'}</h2>
              <button onClick={handleEditUsername} className="text-xs text-blue-400 hover:text-blue-300 transition-colors" title="Edit Username">
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            {publicKey && (
              <p className="text-xs text-gray-400 font-mono">{publicKey.toString()}</p>
            )}
            {userProfile?.ownsOgNft && (
              <span className="inline-flex items-center text-xs font-semibold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                <SparklesIcon className="h-3 w-3 mr-1"/> OG NFT Holder
              </span>
            )}
          </div>
          <div className="flex-shrink-0">
            <WalletMultiButtonDynamic className="!bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to hover:opacity-90 transition-opacity !rounded-md !h-10" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-card-secondary rounded-lg p-4 text-center border border-white/10 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-2">
              <XpIcon className="w-5 h-5 text-yellow-400" />
              <p className="text-xs text-gray-400 uppercase">Total XP</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{userProfile?.xp ?? 0}</p>
          </div>
          <div className="bg-dark-card-secondary rounded-lg p-4 text-center border border-white/10 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CalendarDaysIcon className="w-5 h-5 text-blue-400" />
              <p className="text-xs text-gray-400 uppercase">Check-in Streak</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{userProfile?.checkInStreak ?? 0} days</p>
          </div>
          <div className="bg-dark-card-secondary rounded-lg p-4 text-center border border-white/10 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <p className="text-xs text-gray-400 uppercase">Quests Completed</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{completedQuestsCount}</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-dark-card-secondary rounded-lg p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sol-gradient-from to-sol-gradient-to flex items-center justify-center">
                <span className="text-white text-lg font-bold">SOL</span>
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider">Wallet Balance</p>
                {isLoadingBalance ? (
                  <Skeleton height={32} width={150} />
                ) : (
                  <p className="text-3xl font-bold bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to bg-clip-text text-transparent">
                    {balance !== null ? `${balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} SOL` : 'N/A'}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={refreshBalanceManually}
              disabled={isManuallyRefreshing}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh Balance"
            >
              <ArrowPathIcon className={`w-6 h-6 ${isManuallyRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Social Connections */}
        <div className="bg-dark-card rounded-xl shadow-lg p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            Social Connections
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 bg-dark-card-secondary rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-100">Connect GitHub</p>
                <p className="text-xs text-gray-400">Link your GitHub account</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="flex items-center gap-3 p-4 bg-dark-card-secondary rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-100">Connect Twitter</p>
                <p className="text-xs text-gray-400">Link your Twitter account</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* XP History */}
        <div className="bg-dark-card rounded-xl shadow-lg p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <XpIcon className="w-5 h-5 text-yellow-400" />
            XP History
          </h3>
          <div className="space-y-4">
            {userProfile?.xpHistory?.map((entry: { description: string; timestamp: string; amount: number }, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-dark-card-secondary rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <XpIcon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-100">{entry.description}</p>
                    <p className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-yellow-400">+{entry.amount} XP</span>
              </div>
            ))}
            {(!userProfile?.xpHistory || userProfile.xpHistory.length === 0) && (
              <p className="text-gray-500 text-center py-4">No XP history available yet.</p>
            )}
          </div>
        </div>

        {/* Completed Quests Section */}
        <div className="bg-dark-card rounded-xl shadow-lg p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            Completed Quests
          </h3>
          {completedQuests.length > 0 ? (
            <div className="space-y-3">
              {completedQuests.map((quest) => (
                <div key={quest.id} className="bg-dark-card-secondary rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-100">{quest.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                        {quest.xpReward} XP
                      </span>
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No quests completed yet. Start your journey!</p>
          )}
        </div>
      </div>
    </SkeletonTheme>
  );
} 
