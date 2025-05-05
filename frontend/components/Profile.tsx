'use client';

import { FC, useEffect, useState } from 'react';
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

export const Profile: FC = () => {
  const { connection } = useConnection();
  const { publicKey, signMessage, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const signIn = async () => {
    if (!publicKey || !signMessage) return;

    try {
      setIsAuthenticating(true);
      const message = new TextEncoder().encode(
        `Sign in to SolQuest.io\n\nWallet: ${publicKey.toString()}\nTimestamp: ${Date.now()}`
      );

      const signedMessage = await signMessage(message);
      const signature = bs58.encode(signedMessage);
      
      console.log('Message signed successfully:', signature);
      setIsAuthenticated(true);
      // Here you would typically send this signature to your backend
      // along with the original message and wallet address for verification
      
    } catch (error) {
      console.error('Error signing message:', error);
      setError('Failed to authenticate. Please try again.');
      setIsAuthenticated(false);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchBalance = async () => {
    if (!publicKey || !connection) {
      console.log('Wallet not connected or connection object not available from context.');
      return;
    }

    console.log('Attempting to fetch balance for:', publicKey.toString());
    console.log('>>> Using RPC Endpoint from context:', connection.rpcEndpoint);
    
    setIsLoading(true);
    setError(null);

    try {
      const balanceLamports = await connection.getBalance(publicKey, 'confirmed');
      console.log('Raw balance (lamports):', balanceLamports);
      const solBalance = balanceLamports / LAMPORTS_PER_SOL;
      console.log('SOL balance:', solBalance);
      setBalance(solBalance);
    } catch (err: any) {
      console.error('Error fetching balance:', err);
      if (err.message && err.message.includes('401')) {
        setError('RPC Authentication Error: Invalid or missing API key.');
      } else {
        setError(`Failed to fetch balance: ${err.message || 'Unknown error'}`);
      }
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch balance when publicKey or connection changes
  useEffect(() => {
    if (isMounted && connected && publicKey && connection) {
      console.log('Wallet connected, fetching balance...');
      fetchBalance();
      
      const subscriptionId = connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          console.log('Account change detected, new balance:', accountInfo.lamports / LAMPORTS_PER_SOL);
          setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
        },
        'confirmed'
      );

      return () => {
        console.log('Cleaning up account listener...');
        connection.removeAccountChangeListener(subscriptionId).catch(console.error);
      };
    } else if (isMounted) {
      setBalance(null);
      setError(null);
    }
  }, [publicKey, connection, connected, isMounted]);

  // Avoid rendering wallet button until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen py-6 flex flex-col sm:py-12">
        <div className="fixed top-4 left-4">
          <Logo />
        </div>
        {/* Placeholder or null while waiting for mount */}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 flex flex-col sm:py-12">
      <div className="fixed top-4 left-4">
        <Logo />
      </div>
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-dark-card shadow-lg sm:rounded-3xl sm:p-20 backdrop-blur-lg border border-white/10">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-700">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-200 sm:text-lg sm:leading-7">
                <div className="flex justify-center mb-8">
                  <WalletMultiButtonDynamic className="!bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to hover:opacity-90 transition-opacity" />
                </div>
                {connected && publicKey ? (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to bg-clip-text text-transparent">Your Profile</h2>
                    <p className="mb-2 text-gray-300">Wallet Address:</p>
                    <p className="text-sm text-gray-400 break-all mb-4">{publicKey.toString()}</p>
                    
                    {!isAuthenticated ? (
                      <div className="mb-6">
                        <p className="text-gray-400 mb-4">Please sign a message to verify your wallet ownership</p>
                        <button
                          onClick={signIn}
                          disabled={isAuthenticating}
                          className="bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAuthenticating ? 'Verifying...' : 'Verify Wallet'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="mb-2 text-gray-300">Balance:</p>
                        {error ? (
                          <div className="mt-2">
                            <p className="text-red-500 mb-2 text-sm">{error}</p>
                            <button 
                              onClick={fetchBalance}
                              disabled={isLoading}
                              className="text-sm bg-dark-lighter hover:bg-dark-card px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? 'Retrying...' : 'Retry'}
                            </button>
                          </div>
                        ) : (
                          <p className="text-2xl font-semibold bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to bg-clip-text text-transparent">
                            {isLoading ? (
                              <span className="text-gray-400">Loading...</span>
                            ) : (
                              balance !== null ? `${balance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} SOL` : 'N/A'
                            )}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-400">Please connect your wallet to view your profile</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 