import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { wormhole, Wormhole, Chain, toNative } from '@wormhole-foundation/sdk';
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
  { id: 'Ethereum' as Chain, name: 'Ethereum' },
  { id: 'Polygon' as Chain, name: 'Polygon' },
];

// SignAndSendSigner implementation for Solana Wallet Adapter
class SolanaWalletSigner {
  private _wallet: ReturnType<typeof useWallet>;
  constructor(wallet: ReturnType<typeof useWallet>) {
    this._wallet = wallet;
  }
  chain(): 'Solana' { return 'Solana'; }
  address(): string { return this._wallet.publicKey?.toString() || ''; }
  async signAndSend(txns: any[]): Promise<string[]> {
    if (!this._wallet.signAllTransactions) {
      throw new Error('Wallet does not support signing transactions');
    }
    const signedTxns = await this._wallet.signAllTransactions(txns);
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com');
    const txids: string[] = [];
    for (const signed of signedTxns) {
      const txid = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(txid);
      txids.push(txid);
    }
    return txids;
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
      const wh = await wormhole('Mainnet', [solana, evm]);
      const sourceAddress = toNative('Solana', wallet.publicKey.toString());
      const destinationAddress = toNative(
        selectedChain.id,
        selectedChain.id === 'Solana'
          ? wallet.publicKey.toString()
          : '0x0000000000000000000000000000000000000000' // TODO: real EVM address
      );
      const transferAmount = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, selectedToken.decimals)));
      // Use Wormhole.tokenId for the token
      const tokenId = Wormhole.tokenId('Solana', selectedToken.address);
      // 1. Create the transfer object
      const xfer = await wh.tokenTransfer(
        tokenId,
        transferAmount,
        { chain: 'Solana' as Chain, address: sourceAddress },
        { chain: selectedChain.id, address: destinationAddress },
        true // automatic delivery
      );
      // 2. Wrap wallet as SignAndSendSigner
      const signer = new SolanaWalletSigner(wallet);
      // 3. Initiate transfer
      const txids = await xfer.initiateTransfer(signer);
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