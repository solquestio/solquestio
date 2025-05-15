'use client';

import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import bs58 from 'bs58';
import { useWallet } from '@solana/wallet-adapter-react';

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
}

interface AuthContextType {
  authToken: string | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

// --- Constants ---
const AUTH_TOKEN_KEY = 'solquest_auth_token';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const SIGN_IN_MESSAGE_TEMPLATE = (wallet: string, timestamp: number) => 
  `Sign in to SolQuest.io\n\nWallet: ${wallet}\nTimestamp: ${timestamp}`;

// --- Context Creation ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- AuthProvider Component ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until initial check is done
  const [error, setError] = useState<string | null>(null);
  const { publicKey, signMessage, disconnect, connected } = useWallet();
  const router = useRouter(); // Use router if needed for redirects

  const fetchUserProfile = useCallback(async (token: string) => {
    console.log('[AuthContext] Fetching profile with token...');
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) { throw new Error(data.message || 'Failed to fetch profile'); }
      console.log('[AuthContext] Profile fetched:', data);
      setUserProfile(data);
      setAuthToken(token); // Ensure token state is also set
      localStorage.setItem(AUTH_TOKEN_KEY, token); // Refresh token in storage just in case
      return data as UserProfile;
    } catch (err: any) {
      console.error('[AuthContext] Error fetching profile:', err);
      // If profile fetch fails with a valid-looking token, clear it
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setAuthToken(null);
      setUserProfile(null);
      setError(`Session invalid: ${err.message}. Please log in again.`);
      return null;
    } finally {
       setIsLoading(false);
    }
  }, []); // No dependencies needed for fetchUserProfile itself

  // Check authentication status on initial load
  const checkAuthStatus = useCallback(async () => {
    console.log('[AuthContext] Checking initial auth status...');
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      console.log('[AuthContext] Found token in storage.');
      await fetchUserProfile(token);
    } else {
      console.log('[AuthContext] No token found in storage.');
      setAuthToken(null);
      setUserProfile(null);
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // Run only once on mount

  // Login Function
  const login = useCallback(async () => {
    if (!publicKey || !signMessage || !connected) {
      setError('Wallet not connected or signMessage not available.');
      console.error('[AuthContext] Login cancelled: Wallet not ready.')
      setIsLoading(false); // Ensure loading stops if wallet wasn't ready
      return;
    }
    console.log('[AuthContext] Starting login process...');
    setIsLoading(true);
    setError(null);
    // Clear previous state before attempting login
    setAuthToken(null);
    setUserProfile(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);

    try {
      const timestamp = Date.now();
      const messageContent = SIGN_IN_MESSAGE_TEMPLATE(publicKey.toString(), timestamp);
      const messageBytes = new TextEncoder().encode(messageContent);
      
      console.log('[AuthContext] Requesting signature...');
      const signedMessageBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signedMessageBytes);
      console.log('[AuthContext] Signature obtained. Verifying with backend...');

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
          console.error('[AuthContext] Backend verification failed:', data);
          throw new Error(data.message || 'Authentication failed on backend'); 
      }
      
      console.log('[AuthContext] Backend verification successful:', data);
      if (data.token && data.user) {
        setAuthToken(data.token);
        setUserProfile(data.user);
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        setError(null);
        console.log('[AuthContext] Login successful. State updated.');
      } else {
        throw new Error('Invalid token or user data received from backend');
      }
    } catch (err: any) {
      console.error('[AuthContext] Error during login process:', err);
      setError(`Login Error: ${err.message || 'Unknown error'}`);
      // Ensure state is clear on error
      setAuthToken(null);
      setUserProfile(null);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signMessage, connected]);

  // Logout Function
  const logout = useCallback(() => {
    console.log('[AuthContext] Logging out...');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
    setUserProfile(null);
    setError(null);
    // Optionally disconnect wallet adapter
    disconnect().catch(err => console.error("Error during wallet disconnect:", err));
    // Optionally redirect
    // router.push('/'); 
  }, [disconnect]);

  // Derived state
  const isAuthenticated = !!authToken && !!userProfile;

  // Value provided by the context
  const value = {
    authToken,
    userProfile,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook to use AuthContext ---
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 