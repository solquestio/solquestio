import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

// Dynamically import the WalletMultiButton with no SSR
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

interface WalletConnectQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
  title?: string;
}

export const WalletConnectQuest: React.FC<WalletConnectQuestProps> = ({ onQuestComplete, xpReward = 50, title = 'Connect Your Wallet' }) => {
  const { connected } = useWallet();
  const [verified, setVerified] = useState(false);

  // Don't auto-complete the quest when connected
  // Instead, require the user to click the verify button
  
  const handleVerify = () => {
    if (connected) {
      setVerified(true);
      onQuestComplete();
    }
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <p className="text-gray-300 mb-6">
        To get started with Solana, you'll need to connect your wallet. This will allow you to interact with the Solana blockchain and complete quests.
      </p>
      
      <div className="space-y-6">
        <div className="bg-dark-card-secondary p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Steps to Complete:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Click the "Select Wallet" button below</li>
            <li>Choose your Solana wallet provider (Phantom, Solflare, etc.)</li>
            <li>Follow the prompts to connect your wallet</li>
            <li>Click the "Verify Connection" button to complete this quest</li>
          </ol>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <WalletMultiButtonDynamic className="!bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to hover:opacity-90 transition-opacity !rounded-md !h-10" />
          
          {!connected ? (
            <p className="text-amber-400 text-sm italic">
              Please connect your wallet to continue
            </p>
          ) : verified ? (
            <div className="text-green-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Wallet verified! You earned {xpReward} XP
            </div>
          ) : (
            <button
              onClick={handleVerify}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
            >
              Verify Connection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 