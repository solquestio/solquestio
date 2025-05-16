import React, { useState } from 'react';

interface WormholeExplorerQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const WormholeExplorerQuest: React.FC<WormholeExplorerQuestProps> = ({ onQuestComplete, xpReward = 200 }) => {
  const [isViewed, setIsViewed] = useState(false);
  const [viewing, setViewing] = useState(false);

  const handleView = async () => {
    setViewing(true);
    // Simulate viewing (replace with real explorer interaction in production)
    setTimeout(() => {
      setIsViewed(true);
      setViewing(false);
      setTimeout(() => onQuestComplete(), 1200);
    }, 1200);
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">Exploring Wormhole Transactions</h2>
      <ol className="list-decimal pl-6 mb-6 text-gray-400 space-y-2">
        <li>Visit the <a href="https://wormholescan.io/" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Wormhole Explorer</a>.</li>
        <li>Search for a recent cross-chain transaction (e.g., a bridge or NFT mint).</li>
        <li>Click the button below to simulate viewing a transaction.</li>
      </ol>
      <div className="mb-4">
        <button
          onClick={handleView}
          disabled={viewing || isViewed}
          className="bg-solana-purple hover:bg-solana-purple-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-60"
        >
          {viewing ? 'Viewing...' : isViewed ? 'Viewed!' : 'Simulate View'}
        </button>
      </div>
      {isViewed && (
        <div className="text-green-400 font-semibold mt-2">Transaction viewed! +{xpReward} XP</div>
      )}
    </div>
  );
};

export default WormholeExplorerQuest; 