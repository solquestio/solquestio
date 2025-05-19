import React, { useEffect } from 'react';
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

export const WalletConnectQuest: React.FC<WalletConnectQuestProps> = ({ onQuestComplete, xpReward = 100, title = 'Connect Your Wallet' }) => {
  const { connected } = useWallet();

  useEffect(() => {
    if (connected) {
      onQuestComplete();
    }
  }, [connected, onQuestComplete]);

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <p className="text-gray-300 mb-6">
        To get started with Solana, you'll need to connect your wallet. This will allow you to interact with the Solana blockchain and complete quests.
      </p>
      
      <div className="flex flex-col items-center gap-4">
        <WalletMultiButtonDynamic className="!bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to hover:opacity-90 transition-opacity !rounded-md !h-10" />
        
        {connected ? (
          <div className="text-green-400 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Wallet Connected!
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            Connect your wallet to earn {xpReward} XP
          </p>
        )}
      </div>
    </div>
  );
}; 