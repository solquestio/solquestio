'use client';

import { FC, useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import { Logo } from './Logo';
import bs58 from 'bs58';

// Dynamically import the WalletMultiButton with no SSR
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false, loading: () => <button className="px-4 py-2 bg-gray-600 rounded-md">Loading Wallet...</button> }
);

// Define the expected user structure from backend
interface UserProfile {
  id: string;
  walletAddress: string;
  username?: string;
  completedQuestIds: string[]; // Updated field name
  xp: number; // Add XP field
  createdAt: string;
  updatedAt: string;
}

// Define the Quest structure from backend
interface Quest {
    id: string;
    title: string;
    description: string;
    path: string;
    order: number;
    isCompleted: boolean;
    xpReward: number; // Add XP reward field
}

// Define the backend API endpoint
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const AUTH_TOKEN_KEY = 'solquest_auth_token'; // Key for localStorage

// Quest IDs (match backend)
const FUND_WALLET_QUEST_ID = 'fund-wallet';

export const Profile: FC = () => {
  // Hooks
  const { connection } = useConnection();
  const { publicKey, connected, signMessage, disconnect } = useWallet();

  // State
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false); // Renamed for clarity
  const [isMounted, setIsMounted] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]); // State for quests
  const [isLoadingQuests, setIsLoadingQuests] = useState(false); // Loading state for quests
  const [questError, setQuestError] = useState<string | null>(null); // Error state for quests
  const [isVerifyingQuest, setIsVerifyingQuest] = useState<string | null>(null); // Track which quest verification is in progress


  // Check for existing token on mount
  useEffect(() => {
    setIsMounted(true);
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken) {
      console.log('Found existing token, attempting to fetch profile...');
      setAuthToken(storedToken);
      // Profile fetch triggered by authToken change effect
    } else {
      setUserProfile(null);
      setQuests([]); // Clear quests if no token
    }
  }, []);

  // Fetch user profile when authToken changes (or on initial load with token)
  const fetchUserProfile = useCallback(async (token: string) => {
    if (!token) return;
    console.log('Fetching user profile with token...');
    setError(null);
    setQuestError(null); // Clear quest error too
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || 'Failed to fetch profile'); }
      console.log('User profile fetched:', data);
      setUserProfile(data); // Set profile state
      setAuthToken(token); // Confirm token validity
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      // Fetch quests is triggered by userProfile change effect now
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setError(`Session Error: ${error.message}. Please verify wallet again.`);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setAuthToken(null);
      setUserProfile(null);
      setQuests([]); // Clear quests on profile error
    }
  }, []); // Removed fetchQuests dependency

  // Effect to fetch profile when token is found/set
  useEffect(() => {
    if (authToken && !userProfile) { // Only fetch if token exists but profile doesn't
      fetchUserProfile(authToken);
    }
  }, [authToken, userProfile, fetchUserProfile]); // Added userProfile to dependencies


  // Fetch quests when user profile is loaded
  const fetchQuests = useCallback(async (token: string) => {
    if (!token) return;
    console.log('Fetching quests...');
    setIsLoadingQuests(true);
    setQuestError(null);
    try {
        const response = await fetch(`${BACKEND_URL}/api/quests`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.message || 'Failed to fetch quests'); }
        console.log('Quests fetched:', data);
        setQuests(data);
    } catch (error: any) {
        console.error('Error fetching quests:', error);
        setQuestError(`Failed to load quests: ${error.message}`);
        setQuests([]); // Clear quests on error
    } finally {
        setIsLoadingQuests(false);
    }
  }, []); // Removed userProfile dependency, called manually

  // Effect to fetch quests AFTER user profile is successfully loaded
  useEffect(() => {
    if (userProfile && authToken) {
        fetchQuests(authToken);
    }
  }, [userProfile, authToken, fetchQuests]);


  // Sign In function - Calls the backend
  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setError('Wallet not connected or signMessage not available.');
      return;
    }

    setIsAuthenticating(true);
    setError(null);
    setQuestError(null);
    setUserProfile(null); // Clear old profile
    setQuests([]); // Clear old quests
    setAuthToken(null); // Clear old token
    localStorage.removeItem(AUTH_TOKEN_KEY);

    try {
      const messageContent = `Sign in to SolQuest.io\\n\\nWallet: ${publicKey.toString()}\\nTimestamp: ${Date.now()}`;
      const messageBytes = new TextEncoder().encode(messageContent);
      const signedMessageBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signedMessageBytes);

      const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          signature,
          message: messageContent
        }),
      });
      const data = await response.json();

      if (!response.ok) { throw new Error(data.message || 'Authentication failed'); }

      console.log('Backend verification successful:', data);
      if (data.token && data.user) {
        setAuthToken(data.token); // This triggers profile/quest fetch via effects
        setUserProfile(data.user); // Set profile state immediately from auth response
        localStorage.setItem(AUTH_TOKEN_KEY, data.token); // Store token
      } else {
        throw new Error('Invalid response from backend during authentication');
      }

    } catch (error: any) {
      console.error('Error during sign-in process:', error);
      setError(`Authentication Error: ${error.message || 'Unknown error'}`);
      setAuthToken(null);
      setUserProfile(null);
      setQuests([]);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage]); // Removed fetchUserProfile dependency, set state directly

  // Logout function
  const logout = useCallback(async () => {
    console.log('Logging out...');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
    setUserProfile(null);
    setBalance(null);
    setQuests([]); // Clear quests on logout
    setError(null);
    setQuestError(null);
    // await disconnect(); // Optional: disconnect wallet
  }, [disconnect]);

  // Function to fetch balance (only if authenticated and profile exists)
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection || !userProfile) return;

    console.log('Attempting to fetch balance (authenticated user)');
    setIsLoadingBalance(true);

    try {
      const balanceLamports = await connection.getBalance(publicKey, 'confirmed');
      setBalance(balanceLamports / LAMPORTS_PER_SOL);
      setError(null); // Clear general error on successful balance fetch
    } catch (err: any) {
      console.error('Error fetching balance:', err);
      setError(`Failed to fetch balance: ${err.message || 'Unknown error'}`);
      setBalance(null);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [publicKey, connection, userProfile]);

  // Effect to fetch balance ONLY when user profile is loaded
  useEffect(() => {
    if (isMounted && connected && publicKey && connection && userProfile) {
      console.log('Profile loaded, fetching initial balance...');
      fetchBalance();

      const subscriptionId = connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          console.log('Account change detected, updating balance...');
          setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
        },
        'confirmed'
      );

      return () => {
        console.log('Cleaning up balance listener...');
        connection.removeAccountChangeListener(subscriptionId).catch(console.error);
      };
    } else if (isMounted) {
      setBalance(null);
    }
  }, [publicKey, connection, connected, isMounted, userProfile, fetchBalance]);

  // Function to verify balance for Quest 2
  const verifyBalanceQuest = useCallback(async () => {
      if (!authToken) {
          setQuestError('Authentication token not found. Please re-verify wallet.');
          return;
      }
      console.log(`Attempting to verify quest: ${FUND_WALLET_QUEST_ID}`);
      setIsVerifyingQuest(FUND_WALLET_QUEST_ID);
      setQuestError(null); // Clear previous quest errors
      try {
          const response = await fetch(`${BACKEND_URL}/api/quests/check-balance`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json' // Though no body, good practice
              },
          });
          const data = await response.json();
          if (!response.ok) { throw new Error(data.message || 'Failed to verify balance quest'); }

          console.log('Balance quest verification response:', data);
          // Update user profile and quests state based on response
          if (data.user) {
            setUserProfile(data.user); // Update profile with latest completedQuestIds
            // Refetch quests to update completion status visually
            fetchQuests(authToken);
          }

      } catch (error: any) {
          console.error('Error verifying balance quest:', error);
          setQuestError(`Quest Verification Error: ${error.message}`);
      } finally {
          setIsVerifyingQuest(null); // Clear verifying state
      }
  }, [authToken, fetchQuests]); // Added fetchQuests dependency


  // --- Render Logic ---
  if (!isMounted) {
    return null; // Or a loading spinner
  }

  const isAuthenticated = !!authToken && !!userProfile;

  return (
    <div className="min-h-screen py-6 flex flex-col sm:py-12">
      <div className="fixed top-4 left-4"> <Logo /> </div>
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-10">
          <button onClick={logout} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm"> Logout </button>
        </div>
      )}

      <div className="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4"> {/* Added w-full and px-4 */}
        <div className="relative px-4 py-10 bg-dark-card shadow-lg sm:rounded-3xl sm:p-10 md:p-20 backdrop-blur-lg border border-white/10"> {/* Adjusted padding */}
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-700">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-200 sm:text-lg sm:leading-7">
                <div className="flex justify-center mb-8">
                  <WalletMultiButtonDynamic className="!bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to hover:opacity-90 transition-opacity" />
                </div>

                {error && !isLoadingBalance && (
                  <p className="text-red-500 mb-4 text-sm text-center">{error}</p>
                )}

                {connected && publicKey ? (
                  <div className="text-center">
                    <p className="mb-2 text-gray-300">Wallet Address:</p>
                    <p className="text-sm text-gray-400 break-all mb-4">{publicKey.toString()}</p>

                    {!isAuthenticated ? (
                      <div className="mb-6">
                        <p className="text-gray-400 mb-4 text-sm">Sign message to verify ownership & view details.</p>
                        <button
                          onClick={signIn}
                          disabled={isAuthenticating}
                          className="bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAuthenticating ? 'Verifying...' : 'Verify Wallet'}
                        </button>
                      </div>
                    ) : (
                      <> {/* Authenticated Content */}
                        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to bg-clip-text text-transparent">Your Profile</h2>
                        {userProfile.username && ( <p className="mt-4 text-sm text-gray-400">Username: {userProfile.username}</p> )}

                        <p className="mt-4 mb-2 text-gray-300">Balance:</p>
                        {isLoadingBalance ? (
                          <span className="text-gray-400">Loading...</span>
                        ) : (
                          balance !== null
                            ? <p className="text-2xl font-semibold bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to bg-clip-text text-transparent">{`${balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} SOL`}</p>
                            : <p className="text-gray-400">N/A</p>
                        )}

                        {/* Display User XP */}
                        <p className="mt-4 mb-2 text-gray-300">XP:</p>
                        <p className="text-2xl font-semibold text-yellow-400">{userProfile.xp ?? 0}</p>

                        {/* --- Quest Section --- */}
                        <div className="mt-10 pt-6 border-t border-gray-700">
                            <h3 className="text-xl font-semibold mb-4 text-gray-100">Quests</h3>
                            {questError && (
                                <p className="text-red-500 mb-4 text-sm text-center">{questError}</p>
                            )}
                            {isLoadingQuests ? (
                                <p className="text-gray-400 text-center">Loading Quests...</p>
                            ) : quests.length > 0 ? (
                                <ul className="space-y-4 text-left">
                                    {quests.sort((a, b) => a.order - b.order).map((quest) => (
                                        <li key={quest.id} className={`p-4 rounded-lg border ${quest.isCompleted ? 'border-green-500/50 bg-green-900/20' : 'border-gray-600 bg-gray-800/30'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className={`font-semibold ${quest.isCompleted ? 'text-green-400' : 'text-gray-100'}`}>{quest.title}</h4>
                                                {/* Display XP Reward */} 
                                                <span className={`text-xs font-medium ${quest.isCompleted ? 'text-green-600' : 'text-yellow-400'}`}>
                                                    {quest.isCompleted ? 'COMPLETED' : `+${quest.xpReward} XP`}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-3">{quest.description}</p>
                                            {/* Specific action for fund-wallet quest */}
                                            {quest.id === FUND_WALLET_QUEST_ID && !quest.isCompleted && (
                                                <button
                                                    onClick={verifyBalanceQuest}
                                                    disabled={isVerifyingQuest === quest.id}
                                                    className="w-full mt-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isVerifyingQuest === quest.id ? 'Verifying...' : 'Verify Balance'}
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center">No quests available.</p>
                            )}
                        </div>
                        {/* --- End Quest Section --- */}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-400">Please connect your wallet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 