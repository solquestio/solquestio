import React, { useState } from 'react';

interface WormholeNFTQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const WormholeNFTQuest: React.FC<WormholeNFTQuestProps> = ({ onQuestComplete, xpReward = 500 }) => {
  const [isMinted, setIsMinted] = useState(false);
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    setMinting(true);
    // Simulate minting (replace with real mint interaction in production)
    setTimeout(() => {
      setIsMinted(true);
      setMinting(false);
      setTimeout(() => onQuestComplete(), 1200);
    }, 2000);
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">Minting a Cross-Chain NFT</h2>
      <ol className="list-decimal pl-6 mb-6 text-gray-400 space-y-2">
        <li>Connect your Solana wallet.</li>
        <li>Click the button below to simulate minting a cross-chain NFT using Wormhole.</li>
        <li>View your NFT in your wallet or on a block explorer.</li>
      </ol>
      <div className="mb-4">
        <button
          onClick={handleMint}
          disabled={minting || isMinted}
          className="bg-solana-purple hover:bg-solana-purple-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-60"
        >
          {minting ? 'Minting...' : isMinted ? 'Minted!' : 'Simulate Mint'}
        </button>
      </div>
      {isMinted && (
        <div className="text-green-400 font-semibold mt-2">NFT minted! +{xpReward} XP</div>
      )}
    </div>
  );
};

export default WormholeNFTQuest; 