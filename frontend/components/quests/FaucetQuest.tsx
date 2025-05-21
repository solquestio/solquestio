// frontend/components/quests/FaucetQuest.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import Link from 'next/link';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface FaucetQuestProps {
  minRequiredSOL: number;
  onQuestComplete: () => void;
  xpReward?: number;
}

// RPC endpoints - use the same ones as in profile page for consistency
const MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com";
const HELIUS_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || "https://mainnet.helius-rpc.com/?api-key=15319bbd-8d8b-443b-a9c3-9f4af6459add";

export const FaucetQuest: React.FC<FaucetQuestProps> = ({
  minRequiredSOL,
  onQuestComplete,
  xpReward = 150,
}) => {
  const { publicKey, connected } = useWallet();

  const [currentSolBalance, setCurrentSolBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [questAttempted, setQuestAttempted] = useState(false);
  const [isQuestMarkedComplete, setIsQuestMarkedComplete] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rpcError, setRpcError] = useState(false);

  // Check balance with improved reliability
  const checkBalance = async (isManualRefresh = false) => {
    if (!connected || !publicKey) return;
    
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    setRpcError(false);
    
    try {
      // Try to get the balance with a small retry mechanism
      let attempts = 0;
      let success = false;
      let balanceSOL = 0;
      
      // Try Helius RPC first (more reliable), then fallback to public RPC
      const endpoints = [HELIUS_RPC_URL, MAINNET_RPC_URL];
      
      while (attempts < endpoints.length && !success) {
        try {
          const endpoint = endpoints[attempts];
          console.log(`Attempting to fetch balance from: ${endpoint.substring(0, 30)}...`);
          
          // Create a fresh connection for each attempt
          const connection = new Connection(endpoint, 'confirmed');
          const balanceLamports = await connection.getBalance(publicKey);
          balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
          
          success = true;
          console.log(`Successfully fetched balance: ${balanceSOL} SOL`);
        } catch (retryError: any) {
          // Handle 403 errors specifically
          if (retryError.message && (retryError.message.includes('403') || retryError.message.includes('forbidden'))) {
            console.warn(`Access forbidden (403) from RPC endpoint. Trying next endpoint.`);
          } else {
            console.warn(`Balance fetch attempt ${attempts + 1} failed:`, retryError);
          }
          attempts++;
        }
      }
      
      if (success) {
        setCurrentSolBalance(balanceSOL);
        setRpcError(false);
        
        // No longer auto-complete the quest - user must manually verify
        if (balanceSOL >= minRequiredSOL) {
          setQuestAttempted(true);
        }
      } else {
        console.error('Failed to fetch balance - All RPC endpoints failed');
        setRpcError(true);
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      setRpcError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Automatically check balance when component loads
  useEffect(() => {
    if (connected && publicKey) {
      checkBalance();
    }
  }, [connected, publicKey]);

  const handleVerifyBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      return;
    }

    setQuestAttempted(true);
    await checkBalance();
    
    // Only mark as complete after user manually verifies
    if (currentSolBalance !== null && currentSolBalance >= minRequiredSOL) {
      setIsQuestMarkedComplete(true);
      onQuestComplete();
      
      // Dispatch custom event to trigger profile update for XP
      window.dispatchEvent(new CustomEvent('quest-completed', { 
        detail: { 
          questId: 'fund-wallet', 
          xpAmount: xpReward 
        } 
      }));
    }
  }, [connected, publicKey, minRequiredSOL, currentSolBalance, xpReward, onQuestComplete, checkBalance]);

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  if (!connected || !publicKey) {
    return (
      <div className="p-6 bg-dark-card rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-white mb-4">Fund Your Wallet</h2>
        <p className="text-gray-300 mb-6">Please connect your Solana wallet to begin this quest.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-1">Fund Your Wallet</h2>
      <p className="text-yellow-400 text-sm font-medium mb-4">+{xpReward} XP</p>
      
      {isQuestMarkedComplete ? (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-green-300">
          <h3 className="font-bold text-lg mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Quest Complete!
          </h3>
          <p>You have {currentSolBalance?.toFixed(4)} SOL in your wallet.</p>
          <p className="mt-2">You've earned {xpReward} XP and can now proceed to the next quest.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {/* Balance card with refresh button */}
            <div className="bg-dark-card-secondary rounded-lg p-4 border border-white/10 mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-white">Your Wallet</h3>
                <button 
                  onClick={() => checkBalance(true)}
                  disabled={isRefreshing}
                  className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white disabled:opacity-50"
                  title="Refresh Balance"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <div className="flex items-center bg-gray-800/70 rounded p-3 mb-4">
                <span className="font-mono text-sm text-gray-300 break-all">{publicKey.toBase58()}</span>
                <button 
                  onClick={() => {navigator.clipboard.writeText(publicKey.toBase58())}}
                  className="ml-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300"
                >
                  Copy
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sol-gradient-from to-sol-gradient-to flex items-center justify-center">
                  <span className="text-white text-lg font-bold">SOL</span>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Balance</p>
                  {isLoading ? (
                    <div className="h-7 w-24 bg-gray-700 animate-pulse rounded-md"></div>
                  ) : rpcError ? (
                    <p className="text-red-400 text-sm">Error loading balance</p>
                  ) : (
                    <p className="text-xl font-bold bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to bg-clip-text text-transparent">
                      {currentSolBalance !== null ? `${currentSolBalance.toFixed(4)} SOL` : 'N/A'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
              <p className="text-gray-300 mb-3">
                To interact with the Solana blockchain, your wallet needs a small amount of SOL to pay for transaction fees.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <div className="bg-blue-900/40 px-3 py-2 rounded-lg flex-grow">
                  <p className="text-gray-300">
                    You need <span className="font-bold text-yellow-400">{minRequiredSOL} SOL</span> to complete this quest.
                    {currentSolBalance !== null && !isLoading && (
                      <span> Currently, you have <span className={currentSolBalance >= minRequiredSOL ? "text-green-400" : "text-red-400"}>{currentSolBalance.toFixed(4)} SOL</span>.</span>
                    )}
                  </p>
                </div>
              </div>
              
              {currentSolBalance !== null && currentSolBalance >= minRequiredSOL && !isQuestMarkedComplete && (
                <div className="mt-4 bg-amber-900/20 border border-amber-600/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-amber-300">You have enough SOL! Click verify to complete this quest:</p>
                    <button
                      onClick={handleVerifyBalance}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-amber-600/30 rounded-lg overflow-hidden">
              <button 
                onClick={toggleSuggestions}
                className="w-full bg-amber-700/40 hover:bg-amber-700/60 py-3 px-4 text-left text-white font-medium flex justify-between items-center"
              >
                <span>Need SOL? Here's how to get it</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showSuggestions && (
                <div className="p-4 bg-gray-800/50">
                  <h4 className="font-medium text-white mb-3">Ways to acquire SOL:</h4>
                  <ul className="space-y-4">
                    <li className="flex">
                      <span className="text-amber-500 mr-2">1.</span>
                      <div>
                        <p className="text-white font-medium">Cryptocurrency Exchanges</p>
                        <p className="text-gray-300 text-sm">Buy SOL from exchanges like <a href="https://www.coinbase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Coinbase</a>, <a href="https://www.binance.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Binance</a>, or <a href="https://www.kraken.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Kraken</a>.</p>
                      </div>
                    </li>
                    <li className="flex">
                      <span className="text-amber-500 mr-2">2.</span>
                      <div>
                        <p className="text-white font-medium">Get some from a friend</p>
                        <p className="text-gray-300 text-sm">If you know someone with SOL, they can send you a small amount to get started.</p>
                      </div>
                    </li>
                    <li className="flex">
                      <span className="text-amber-500 mr-2">3.</span>
                      <div>
                        <p className="text-white font-medium">Use a Solana faucet (Devnet only)</p>
                        <p className="text-gray-300 text-sm">If you're on Devnet, you can use <a href="https://solfaucet.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">solfaucet.com</a>.</p>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 bg-gray-900/60 rounded-lg text-amber-300 text-sm">
                    <p className="font-medium">Note: For this tutorial you only need a tiny amount of SOL!</p>
                    <p>Just {minRequiredSOL} SOL (about $0.02 USD) is needed for this quest.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleVerifyBalance}
                disabled={isLoading || isRefreshing}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || isRefreshing ? 'Verifying...' : 'Verify My SOL Balance'}
              </button>
            </div>

            {questAttempted && !isLoading && !isRefreshing && currentSolBalance !== null && !isQuestMarkedComplete && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
                <p>
                  <span className="font-bold">Verification Failed.</span> You currently have {currentSolBalance?.toFixed(4) || '0'} SOL.
                  Please ensure you have at least {minRequiredSOL} SOL and try again.
                </p>
              </div>
            )}
            
            {rpcError && (
              <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-4 text-amber-300 text-sm">
                <p className="font-bold">Network Issue</p>
                <p>We're having trouble connecting to the Solana network. This may be temporary. Please try again in a moment.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}; 