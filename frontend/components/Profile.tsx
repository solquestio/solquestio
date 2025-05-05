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
  completedQuests: string[];
  createdAt: string; // Dates are often strings in JSON
  updatedAt: string;
}

// Define the backend API endpoint
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const AUTH_TOKEN_KEY = 'solquest_auth_token'; // Key for localStorage

export const Profile: FC = () => {
  // Hooks
  const { connection } = useConnection(); 
  const { publicKey, connected, signMessage, disconnect } = useWallet(); // Added disconnect
  
  // State
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For balance loading
  const [isMounted, setIsMounted] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null); // Store JWT token
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    setIsMounted(true);
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken) {
      console.log('Found existing token, attempting to fetch profile...');
      setAuthToken(storedToken);
      // Note: We don't set isAuthenticated=true yet, fetchUserProfile will do that on success
    } else {
       setUserProfile(null); // Ensure profile is null if no token
    }
  }, []); // Run only once on mount

  // Fetch user profile when authToken changes (or on initial load with token)
  const fetchUserProfile = useCallback(async (token: string) => {
    if (!token) return;
    console.log('Fetching user profile with token...');
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }
      console.log('User profile fetched:', data);
      setUserProfile(data);
      setAuthToken(token); // Confirm token is valid by setting it again
      localStorage.setItem(AUTH_TOKEN_KEY, token); // Re-save in case it was just verified
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setError(`Session Error: ${error.message}. Please verify wallet again.`);
      localStorage.removeItem(AUTH_TOKEN_KEY); // Remove invalid token
      setAuthToken(null);
      setUserProfile(null);
    }
  }, []);

  // Effect to fetch profile when token is found/set
  useEffect(() => {
    if (authToken) {
      fetchUserProfile(authToken);
    }
  }, [authToken, fetchUserProfile]); // Runs when authToken changes

  // Sign In function - Calls the backend
  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      setError('Wallet not connected or signMessage not available.');
      return;
    }

    setIsAuthenticating(true);
    setError(null);
    setUserProfile(null); // Clear old profile during re-auth
    setAuthToken(null); // Clear old token
    localStorage.removeItem(AUTH_TOKEN_KEY);

    try {
      const messageContent = `Sign in to SolQuest.io\n\nWallet: ${publicKey.toString()}\nTimestamp: ${Date.now()}`;
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

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      console.log('Backend verification successful:', data);
      if (data.token) {
        setAuthToken(data.token); // This triggers the useEffect to fetch profile
      } else {
         throw new Error('No token received from backend');
      }

    } catch (error: any) {
      console.error('Error during sign-in process:', error);
      setError(`Authentication Error: ${error.message || 'Unknown error'}`);
      setAuthToken(null);
      setUserProfile(null);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage, fetchUserProfile]);

  // Logout function
  const logout = useCallback(async () => {
    console.log('Logging out...');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
    setUserProfile(null);
    setBalance(null);
    setError(null);
    // Optionally disconnect wallet
    // await disconnect(); 
  }, [disconnect]);

  // Function to fetch balance (only if authenticated and profile exists)
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection || !userProfile) return;

    console.log('Attempting to fetch balance (authenticated user)');
    setIsLoading(true);
    // Keep existing error until balance is fetched or new error occurs
    // setError(null); 

    try {
      const balanceLamports = await connection.getBalance(publicKey, 'confirmed');
      setBalance(balanceLamports / LAMPORTS_PER_SOL);
      setError(null); // Clear error on successful fetch
    } catch (err: any) {
      console.error('Error fetching balance:', err);
      setError(`Failed to fetch balance: ${err.message || 'Unknown error'}`);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection, userProfile]); // Depend on userProfile now

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
  }, [publicKey, connection, connected, isMounted, userProfile, fetchBalance]); // Added userProfile

  // --- Render Logic ---
  if (!isMounted) {
    return null; // Or a loading spinner
  }

  const isAuthenticated = !!authToken && !!userProfile;

  return (
    <div className="min-h-screen py-6 flex flex-col sm:py-12">
      <div className="fixed top-4 left-4">
        <Logo />
      </div>
      {/* Logout Button */} 
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-10">
            <button 
              onClick={logout}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm"
            >
              Logout
            </button>
        </div>
      )}

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-dark-card shadow-lg sm:rounded-3xl sm:p-20 backdrop-blur-lg border border-white/10">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-700">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-200 sm:text-lg sm:leading-7">
                <div className="flex justify-center mb-8">
                  <WalletMultiButtonDynamic className="!bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to hover:opacity-90 transition-opacity" />
                </div>
                
                {/* Show error regardless of connection status if it exists */} 
                {error && !isLoading && (
                  <p className="text-red-500 mb-4 text-sm text-center">{error}</p>
                )}
                
                {connected && publicKey ? (
                  <div className="text-center">
                    {/* Wallet Address always visible when connected */} 
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
                        {userProfile.username && (
                            <p className="mt-4 text-sm text-gray-400">Username: {userProfile.username}</p>
                        )}
                        
                        <p className="mt-4 mb-2 text-gray-300">Balance:</p>
                        {isLoading ? (
                          <span className="text-gray-400">Loading...</span>
                        ) : (
                          balance !== null 
                            ? <p className="text-2xl font-semibold bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to bg-clip-text text-transparent">{`${balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} SOL`}</p>
                            : <p className="text-gray-400">N/A</p>
                        )}
                         {/* TODO: Add completed quests display */}
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