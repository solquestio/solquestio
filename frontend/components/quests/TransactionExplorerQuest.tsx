import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';

interface TransactionExplorerQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
  title?: string;
}

export const TransactionExplorerQuest: React.FC<TransactionExplorerQuestProps> = ({ 
  onQuestComplete, 
  xpReward = 200, 
  title = 'Explore a Transaction' 
}) => {
  const { publicKey } = useWallet();
  const [hasExplored, setHasExplored] = useState(false);

  const handleExploreClick = () => {
    if (publicKey) {
      // Open Solana Explorer in a new tab with the user's address
      window.open(`https://explorer.solana.com/address/${publicKey.toString()}`, '_blank');
      setHasExplored(true);
      onQuestComplete();
    }
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      
      <div className="space-y-6">
        <p className="text-gray-300">
          The Solana Explorer is a powerful tool that lets you view all activity on the Solana blockchain. 
          Let's explore your wallet's transaction history!
        </p>

        <div className="bg-dark-card-secondary p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Steps to Complete:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Click the "Explore My Wallet" button below</li>
            <li>This will open Solana Explorer in a new tab</li>
            <li>Browse through your transaction history</li>
            <li>Look at different transaction types and their details</li>
          </ol>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleExploreClick}
            disabled={!publicKey || hasExplored}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            Explore My Wallet
          </button>

          {hasExplored ? (
            <div className="text-green-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Quest Completed! +{xpReward} XP
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              Explore your wallet to earn {xpReward} XP
            </p>
          )}
        </div>
      </div>
    </div>
  );
}; 