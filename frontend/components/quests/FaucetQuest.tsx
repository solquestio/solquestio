// frontend/components/quests/FaucetQuest.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Connection } from '@solana/web3.js';
import Link from 'next/link';

interface FaucetQuestProps {
  minRequiredSOL: number;
  onQuestComplete: () => void;
  xpReward?: number;
}

const MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com";

export const FaucetQuest: React.FC<FaucetQuestProps> = ({
  minRequiredSOL,
  onQuestComplete,
  xpReward = 150,
}) => {
  const { publicKey, connected } = useWallet();

  const [currentSolBalance, setCurrentSolBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questAttempted, setQuestAttempted] = useState(false);
  const [isQuestMarkedComplete, setIsQuestMarkedComplete] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Create a direct Mainnet connection
  const mainnetConnection = new Connection(MAINNET_RPC_URL);

  // Automatically check balance when component loads
  useEffect(() => {
    if (connected && publicKey) {
      checkBalance();
    }
  }, [connected, publicKey]);

  const checkBalance = async () => {
    if (!connected || !publicKey) return;
    
    try {
      const balanceLamports = await mainnetConnection.getBalance(publicKey);
      const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
      setCurrentSolBalance(balanceSOL);
      
      // Automatically complete the quest if they already have enough SOL
      if (balanceSOL >= minRequiredSOL) {
        setIsQuestMarkedComplete(true);
        onQuestComplete();
      }
    } catch (error) {
      console.error('Error checking initial balance:', error);
    }
  };

  const handleVerifyBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      alert('Please connect your Solana wallet first.');
      return;
    }

    setIsLoading(true);
    setQuestAttempted(true);
    setCurrentSolBalance(null);

    try {
      // Use direct Mainnet connection
      const balanceLamports = await mainnetConnection.getBalance(publicKey);
      const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
      setCurrentSolBalance(balanceSOL);

      if (balanceSOL >= minRequiredSOL) {
        setIsQuestMarkedComplete(true);
        onQuestComplete();
      } else {
        setIsQuestMarkedComplete(false);
      }
    } catch (error) {
      alert(`Error checking balance: ${error instanceof Error ? error.message : String(error)}`);
      setIsQuestMarkedComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, mainnetConnection, minRequiredSOL, onQuestComplete]);

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
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
              <p className="text-gray-300 mb-3">
                To interact with the Solana blockchain, your wallet needs a small amount of SOL to pay for transaction fees.
              </p>
              
              <div className="flex items-center bg-gray-800/70 rounded p-3 mt-2 mb-3">
                <span className="font-mono text-sm text-gray-300 break-all">{publicKey.toBase58()}</span>
                <button 
                  onClick={() => {navigator.clipboard.writeText(publicKey.toBase58())}}
                  className="ml-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300"
                >
                  Copy
                </button>
              </div>

              <p className="text-gray-300">
                You need <span className="font-bold text-yellow-400">{minRequiredSOL} SOL</span> to complete this quest.
                {currentSolBalance !== null && (
                  <span> Currently, you have <span className={currentSolBalance >= minRequiredSOL ? "text-green-400" : "text-red-400"}>{currentSolBalance.toFixed(4)} SOL</span>.</span>
                )}
              </p>
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
                disabled={isLoading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify My SOL Balance'}
              </button>
            </div>

            {questAttempted && !isLoading && currentSolBalance !== null && !isQuestMarkedComplete && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
                <p>
                  <span className="font-bold">Verification Failed.</span> You currently have {currentSolBalance?.toFixed(4) || '0'} SOL.
                  Please ensure you have at least {minRequiredSOL} SOL and try again.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}; 