import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface WormholeExplorerQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

interface WormholeTransaction {
  id: string;
  timestamp: string;
  emitterChain: number;
  emitterAddress: string;
  sequence: number;
  status: string;
  type: string;
}

export const WormholeExplorerQuest: React.FC<WormholeExplorerQuestProps> = ({ onQuestComplete, xpReward = 200 }) => {
  const { publicKey } = useWallet();
  const [isViewed, setIsViewed] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [transactions, setTransactions] = useState<WormholeTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<WormholeTransaction | null>(null);

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch('https://api.wormholescan.io/api/v1/vaas?pageSize=10');
      const data = await response.json();
      setTransactions(data.data || []);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error(err);
    }
  };

  const handleView = async (tx: WormholeTransaction) => {
    setViewing(true);
    setSelectedTx(tx);
    
    try {
      // Fetch detailed transaction info
      const response = await fetch(`https://api.wormholescan.io/api/v1/vaas/${tx.id}`);
      const data = await response.json();
      
      if (data.data) {
        setIsViewed(true);
        setTimeout(() => onQuestComplete(), 1200);
      }
    } catch (err) {
      setError('Failed to fetch transaction details');
    } finally {
      setViewing(false);
    }
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">Exploring Wormhole Transactions</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Recent Cross-Chain Transactions</h3>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div 
              key={tx.id}
              className="bg-gray-800 p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => handleView(tx)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Type: {tx.type}</p>
                  <p className="text-gray-400 text-sm">Chain: {tx.emitterChain}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Status: {tx.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-400 mb-4">{error}</div>
      )}

      {selectedTx && (
        <div className="mb-4">
          <button
            onClick={() => window.open(`https://wormholescan.io/#/tx/${selectedTx.id}`, '_blank')}
            className="bg-solana-purple hover:bg-solana-purple-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            View on Wormhole Explorer
          </button>
        </div>
      )}

      {isViewed && (
        <div className="text-green-400 font-semibold mt-2">
          <p>Transaction analyzed! +{xpReward} XP</p>
          {selectedTx && (
            <a 
              href={`https://wormholescan.io/#/tx/${selectedTx.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 underline mt-2 inline-block"
            >
              View Full Details
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default WormholeExplorerQuest; 