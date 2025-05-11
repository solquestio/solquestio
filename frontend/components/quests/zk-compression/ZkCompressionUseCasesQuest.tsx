'use client';

import React from 'react';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
}

export const ZkCompressionUseCasesQuest: React.FC<QuestProps> = ({ onQuestComplete, title }) => {
  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-100 mb-3">{title}</h3>
      <p className="text-gray-400 mb-4">Content for Real-World Use Cases for ZK Compression is under development. This quest will cover loyalty systems, digital identity, on-chain game assets, etc.</p>
      <button 
        onClick={onQuestComplete}
        className="mt-4 bg-solana-green hover:bg-solana-green-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Mark as Complete (Dev)
      </button>
    </div>
  );
}; 