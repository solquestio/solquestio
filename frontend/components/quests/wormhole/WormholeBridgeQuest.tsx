import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { wormhole } from '@wormhole-foundation/sdk';
import solana from '@wormhole-foundation/sdk/solana';
import evm from '@wormhole-foundation/sdk/evm';

interface WormholeBridgeQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

const SUPPORTED_TOKENS = [
  { symbol: 'SOL', decimals: 9, address: 'So11111111111111111111111111111111111111112' },
  { symbol: 'USDC', decimals: 6, address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
];

const SUPPORTED_CHAINS = [
  { id: 'Ethereum', name: 'Ethereum' },
  { id: 'Polygon', name: 'Polygon' },
];

// Simple Signer wrapper for Solana Wallet Adapter
class SolanaWalletSigner {
  constructor(wallet: any) {
    this.wallet = wallet;
  }
  chain() { return 'Solana'; }
  address() { return this.wallet.publicKey?.toString(); }
  async sign(txns: any[]) {
    // signAllTransactions expects an array of Transaction objects
    return await this.wallet.signAllTransactions(txns);
  }
}

export const WormholeBridgeQuest: React.FC<WormholeBridgeQuestProps> = ({ onQuestComplete, xpReward = 400 }) => {
  const wallet = useWallet();
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [amount, setAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [isBridged, setIsBridged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleBridge = async () => {
    if (!wallet.publicKey || !wallet.signAllTransactions) {
      setError('Please connect your wallet first');
      return;
    }
    try {
      setIsBridging(true);
      setError(null);
      // 1. Initialize Wormhole
      const wh = await wormhole('Mainnet', [solana, evm]);
      // 2. Get Solana chain context
      const solChain = wh.getChain('Solana');
      // 3. Get TokenBridge client
      const tb = await solChain.getTokenBridge();
      // 4. Prepare transfer
      const recipientChain = selectedChain.id;
      const recipientAddress = wallet.publicKey.toString(); // For demo, send to self
      const transferAmount = parseFloat(amount) * Math.pow(10, selectedToken.decimals);
      // 5. Wrap wallet as Signer
      const signer = new SolanaWalletSigner(wallet);
      // 6. Initiate transfer
      const txids = await tb.transfer(
        signer,
        selectedToken.address,
        transferAmount,
        recipientChain,
        recipientAddress
      );
      setTxHash(txids[0]);
      setIsBridged(true);
      setTimeout(() => onQuestComplete(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bridge tokens');
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">Bridging Tokens with Wormhole</h2>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-gray-400 mb-2">Select Token</label>
          <select
            value={selectedToken.symbol}
            onChange={(e) => setSelectedToken(SUPPORTED_TOKENS.find(t => t.symbol === e.target.value) || SUPPORTED_TOKENS[0])}
            className="w-full bg-gray-800 text-white rounded-lg p-2"
          >
            {SUPPORTED_TOKENS.map(token => (
              <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Select Destination Chain</label>
          <select
            value={selectedChain.id}
            onChange={(e) => setSelectedChain(SUPPORTED_CHAINS.find(c => c.id === e.target.value) || SUPPORTED_CHAINS[0])}
            className="w-full bg-gray-800 text-white rounded-lg p-2"
          >
            {SUPPORTED_CHAINS.map(chain => (
              <option key={chain.id} value={chain.id}>{chain.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-gray-800 text-white rounded-lg p-2"
          />
        </div>
      </div>
      {error && (
        <div className="text-red-400 mb-4">{error}</div>
      )}
      <div className="mb-4">
        <button
          onClick={handleBridge}
          disabled={isBridging || isBridged || !amount || !wallet.publicKey}
          className="bg-solana-purple hover:bg-solana-purple-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-60"
        >
          {isBridging ? 'Bridging...' : isBridged ? 'Bridged!' : 'Bridge Tokens'}
        </button>
      </div>
      {txHash && (
        <div className="text-green-400 font-semibold mt-2">
          <p>Bridge successful! +{xpReward} XP</p>
          <a 
            href={`https://solscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 underline mt-2 inline-block"
          >
            View Transaction
          </a>
        </div>
      )}
    </div>
  );
};

export default WormholeBridgeQuest; 