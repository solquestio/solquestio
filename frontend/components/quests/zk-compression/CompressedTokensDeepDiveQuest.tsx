'use client';

import React from 'react';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
}

export const CompressedTokensDeepDiveQuest: React.FC<QuestProps> = ({ onQuestComplete, title }) => {
  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-100 mb-3">{title}</h3>
      <p className="text-gray-400 mb-4">Content for Compressed Tokens (cTokens) Deep Dive is under development. This quest will explore minting, limitations, lifecycle, and interaction patterns for cTokens.</p>
      <button 
        onClick={onQuestComplete}
        className="mt-4 bg-solana-green hover:bg-solana-green-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Mark as Complete (Dev)
      </button>
    </div>
  );
}; 