import React, { useState } from 'react';

interface WormholeSetupQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const WormholeSetupQuest: React.FC<WormholeSetupQuestProps> = ({ onQuestComplete, xpReward = 300 }) => {
  const [step, setStep] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    // Simulate verification (replace with real wallet interaction in production)
    setTimeout(() => {
      setIsVerified(true);
      setVerifying(false);
      setTimeout(() => onQuestComplete(), 1200);
    }, 1500);
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">Setting Up Your Development Environment</h2>
      <ol className="list-decimal pl-6 mb-6 text-gray-400 space-y-2">
        <li>Install <code className="bg-gray-800 px-2 py-1 rounded">Node.js</code> and <code className="bg-gray-800 px-2 py-1 rounded">npm</code> if you haven't already.</li>
        <li>Run <code className="bg-gray-800 px-2 py-1 rounded">npm install -g @certusone/wormhole-sdk</code> to install the Wormhole SDK globally.</li>
        <li>Clone the <a href="https://github.com/wormhole-foundation/wormhole" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Wormhole example repo</a> (optional).</li>
        <li>Connect your Solana wallet to this site.</li>
      </ol>
      <div className="mb-4">
        <button
          onClick={handleVerify}
          disabled={verifying || isVerified}
          className="bg-solana-purple hover:bg-solana-purple-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-60"
        >
          {verifying ? 'Verifying...' : isVerified ? 'Verified!' : 'Verify Setup'}
        </button>
      </div>
      {isVerified && (
        <div className="text-green-400 font-semibold mt-2">Setup verified! +{xpReward} XP</div>
      )}
    </div>
  );
};

export default WormholeSetupQuest; 