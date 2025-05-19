'use client';

import { useEffect, useState, useCallback, useContext } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { PencilIcon, CheckIcon, XMarkIcon, CalendarDaysIcon, ArrowPathIcon, FireIcon } from '@heroicons/react/24/solid';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useAuth } from '@/context/AuthContext';
import NetworkSwitcher, { NetworkContext, useNetwork } from '@/components/NetworkSwitcher';
import TelegramConnectCard from '@/components/social/TelegramConnectCard';

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
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-dark-card shadow-lg rounded-lg backdrop-blur-lg border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <NetworkSwitcher />
            <WalletMultiButtonDynamic className="!bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to hover:opacity-90 transition-opacity !rounded-md !h-10" />
          </div>

          <div className="p-6">
            {authError && <p className="text-red-500 mb-4 text-sm text-center">Error: {authError}</p>}

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-solana-purple to-solana-green rounded-full flex items-center justify-center text-xl font-bold">
                {userProfile?.username ? userProfile.username.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                {isEditingUsername ? (
                  <div className="relative">
                    <input 
                      type="text" 
                      value={newUsername} 
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-3 py-1.5 bg-dark-input border border-gray-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-solana-purple text-sm"
                      maxLength={15}
                      placeholder="Enter username"
                    />
                    {usernameError && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{usernameError}</p>}
                    <div className="flex items-center space-x-1 absolute top-1/2 right-2 transform -translate-y-1/2">
                      <button onClick={handleUpdateUsername}> 
                        {isUpdatingUsername ? <span className="text-xs">...</span> : <CheckIcon className="h-4 w-4" />}
                      </button>
                      <button onClick={handleCancelEdit}> 
                        <XMarkIcon className="h-4 w-4" /> 
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-100 truncate">{userProfile?.username || 'Unnamed User'}</h2>
                    <button onClick={handleEditUsername} className="text-xs text-blue-400 hover:text-blue-300" title="Edit Username">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* --- Social Connect Cards --- */}
            <div className="flex flex-wrap gap-4 mb-8">
              <TelegramConnectCard userId={userProfile?.id || ''} connectedTelegram={userProfile?.telegram} />
              {/* Add GitHubConnectCard, TwitterHandleCard, etc. here in the future */}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/10 mb-6 border-t border-b border-white/10"> 
              <div className="bg-dark-card p-4 text-center">
                <p className="text-xs text-gray-400 uppercase mb-1">XP</p>
                <p className="text-xl font-bold text-yellow-400">{userProfile?.xp ?? 0}</p>
              </div>
              <div className="bg-dark-card p-4 text-center">
                <p className="text-xs text-gray-400 uppercase mb-1">Balance</p>
                {isLoadingBalance ? (
                  <Skeleton height={28} width="60%" className="mx-auto mt-1"/>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className="text-xl font-bold bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to bg-clip-text text-transparent">
                      {balance !== null 
                        ? `${balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 9 })} SOL` 
                        : (rpcError ? 'RPC Error' : 'Connect Wallet')}
                    </p>
                    {balance !== null && (
                      <div className="flex flex-col items-center mt-1">
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-gray-400">Updated automatically</p>
                          <button 
                            onClick={refreshBalanceManually} 
                            disabled={isManuallyRefreshing}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-0.5 disabled:opacity-50 flex items-center"
                          >
                            {isManuallyRefreshing ? (
                              <ArrowPathIcon className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <ArrowPathIcon className="h-3 w-3 mr-1" />
                            )}
                            Refresh
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">{network} network</p>
                      </div>
                    )}
                  </div>
                )}
                {rpcError && (
                  <div className="mt-1">
                    <p className="text-xs text-red-400">RPC endpoint is rate limited.</p>
                    <button 
                      onClick={refreshBalanceManually}
                      disabled={isManuallyRefreshing}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white rounded px-2 py-0.5 mt-1 disabled:opacity-50 flex items-center mx-auto"
                    >
                      {isManuallyRefreshing ? (
                        <ArrowPathIcon className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <ArrowPathIcon className="h-3 w-3 mr-1" />
                      )}
                      Try direct connection
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-dark-card p-4 text-center col-span-2 md:col-span-1">
                <p className="text-xs text-gray-400 uppercase mb-1">Quests Completed</p>
                <p className="text-xl font-bold text-gray-100">{completedQuestsCount}</p>
              </div>
            </div>

            <div className="mb-8 p-4 bg-dark-card-secondary rounded-lg border border-white/10">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-100">Daily Check-in</h3>
                {checkInData.currentStreak > 0 && (
                  <div className="flex items-center text-sm text-orange-400 font-medium bg-orange-900/30 px-2 py-1 rounded">
                    <FireIcon className="h-4 w-4 mr-1"/>
                    {checkInData.currentStreak} Day Streak
                  </div>
                )}
              </div>

              {checkInError && <p className="text-red-500 text-xs mb-2">Error: {checkInError}</p>}
              {lastXpAwarded && <p className="text-green-400 text-xs mb-2">+{lastXpAwarded} XP awarded!</p>}

              <button 
                onClick={handleCheckIn}
                disabled={!checkInData.canCheckIn || isCheckingIn}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 rounded-md text-sm font-medium transition-opacity ${checkInData.canCheckIn ? 'bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to text-white hover:opacity-90' : 'bg-gray-600 text-gray-400 cursor-not-allowed'} disabled:opacity-50`}
              >
                {isCheckingIn ? <ArrowPathIcon className="animate-spin h-4 w-4 mr-2"/> : <CalendarDaysIcon className="h-4 w-4 mr-2"/>}
                {isCheckingIn ? 'Checking in...' : 
                  (checkInData.canCheckIn ? `Check In (+${checkInData.potentialXp} XP)` : 'Checked in Today')
                }
              </button>
              {!checkInData.canCheckIn && !isCheckingIn && userProfile?.lastCheckedInAt && (
                <p className="text-xs text-gray-500 mt-2">Last check-in: {new Date(userProfile.lastCheckedInAt).toLocaleString()}</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-100">Completed Quest History</h3>
              {(() => {
                if (questError && !isLoadingQuests) {
                  return <p className="text-red-500 text-sm">Error loading quest history: {questError}</p>;
                }
                if (isLoadingQuests) {
                  return (
                    <ul className="space-y-3">
                      <li><Skeleton height={50} /></li>
                      <li><Skeleton height={50} /></li>
                    </ul>
                  );
                }
                if (completedQuests.length > 0) {
                  return (
                    <ul className="space-y-3">
                      {completedQuests.map((quest) => (
                        <li key={quest.id} className="p-3 rounded-lg border border-green-700/50 bg-green-900/20 flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-green-300">{quest.title}</h4>
                          </div>
                          <span className="text-sm font-medium text-yellow-500 whitespace-nowrap ml-4">+{quest.xpReward} XP</span>
                        </li>
                      ))}
                    </ul>
                  );
                } else {
                  return <p className="text-gray-500 text-sm italic">No quests completed yet.</p>;
                }
              })()}
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
} 
