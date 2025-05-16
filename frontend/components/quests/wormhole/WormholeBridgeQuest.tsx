import React, { useState } from 'react';

interface WormholeBridgeQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const WormholeBridgeQuest: React.FC<WormholeBridgeQuestProps> = ({ onQuestComplete, xpReward = 400 }) => {
  const [step, setStep] = useState(0);
  const [isBridged, setIsBridged] = useState(false);
  const [bridging, setBridging] = useState(false);

  const handleBridge = async () => {
    setBridging(true);
    // Simulate bridging (replace with real bridge interaction in production)
    setTimeout(() => {
      setIsBridged(true);
      setBridging(false);
      setTimeout(() => onQuestComplete(), 1200);
    }, 2000);
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">Bridging Tokens with Wormhole</h2>
      <ol className="list-decimal pl-6 mb-6 text-gray-400 space-y-2">
        <li>Connect your Solana wallet.</li>
        <li>Choose a token to bridge (e.g., USDC, SOL).</li>
        <li>Enter the amount and destination chain (e.g., Ethereum, Polygon).</li>
        <li>Click the button below to simulate bridging.</li>
      </ol>
      <div className="mb-4">
        <button
          onClick={handleBridge}
          disabled={bridging || isBridged}
          className="bg-solana-purple hover:bg-solana-purple-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-60"
        >
          {bridging ? 'Bridging...' : isBridged ? 'Bridged!' : 'Simulate Bridge'}
        </button>
      </div>
      {isBridged && (
        <div className="text-green-400 font-semibold mt-2">Tokens bridged! +{xpReward} XP</div>
      )}
    </div>
  );
};

export default WormholeBridgeQuest; 