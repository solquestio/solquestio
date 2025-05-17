import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { wormhole, Wormhole, Chain, toNative } from '@wormhole-foundation/sdk';
import solana from '@wormhole-foundation/sdk/solana';
import evm from '@wormhole-foundation/sdk/evm';
import { ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

interface WormholeBridgeQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

const SUPPORTED_TOKENS = [
  { symbol: 'SOL', decimals: 9, address: 'So11111111111111111111111111111111111111112', logo: '/solana-logo.svg' },
  { symbol: 'USDC', decimals: 6, address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', logo: '/ethereum-eth-logo.svg' },
];

const SUPPORTED_CHAINS = [
  { id: 'Ethereum' as Chain, name: 'Ethereum', logo: '/ethereum-eth-logo.svg' },
  { id: 'Polygon' as Chain, name: 'Polygon', logo: '/polygon-matic-logo.svg' },
];

const DidYouKnowCard = ({ fact }: { fact: string }) => (
  <div className="bg-gradient-to-r from-purple-700/80 to-blue-700/80 rounded-lg p-4 mb-6 shadow-lg flex items-center">
    <span className="text-3xl mr-4">💡</span>
    <span className="text-white text-lg font-medium">{fact}</span>
  </div>
);

const AnimatedBridgeDiagram = () => (
  <div className="flex flex-col items-center mb-8">
    <img src="/bridge-animated.svg" alt="Bridge Animation" className="h-32 mb-2 rounded-lg shadow-lg bg-gradient-to-br from-purple-900/60 to-blue-900/60" />
    <div className="flex space-x-4 mt-2">
      <img src="/solana-logo.svg" alt="Solana" className="h-8" />
      <ArrowRightIcon className="h-8 w-8 text-purple-400 animate-pulse" />
      <img src="/ethereum-eth-logo.svg" alt="Ethereum" className="h-8" />
      <ArrowRightIcon className="h-8 w-8 text-blue-400 animate-pulse" />
      <img src="/polygon-matic-logo.svg" alt="Polygon" className="h-8" />
    </div>
    <p className="text-gray-300 text-sm mt-2">Wormhole bridges assets and messages between major blockchains.</p>
  </div>
);

export const WormholeBridgeQuest: React.FC<WormholeBridgeQuestProps> = ({ onQuestComplete, xpReward = 400 }) => {
  const wallet = useWallet();
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [amount, setAmount] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [isBridged, setIsBridged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handleBridge = async () => {
    if (!wallet.publicKey || !wallet.signAllTransactions) {
      setError('Please connect your wallet first.');
      return;
    }
    try {
      setIsBridging(true);
      setError(null);
      setStep(3);
      const wh = await wormhole('Mainnet', [solana, evm]);
      const sourceAddress = toNative('Solana', wallet.publicKey.toString());
      const destinationAddress = toNative(
        selectedChain.id,
        selectedChain.id === 'Solana'
          ? wallet.publicKey.toString()
          : '0x0000000000000000000000000000000000000000' // TODO: real EVM address
      );
      const transferAmount = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, selectedToken.decimals)));
      const tokenId = Wormhole.tokenId('Solana', selectedToken.address);
      const xfer = await wh.tokenTransfer(
        tokenId,
        transferAmount,
        { chain: 'Solana' as Chain, address: sourceAddress },
        { chain: selectedChain.id, address: destinationAddress },
        true // automatic delivery
      );
      const signer = {
        chain: () => 'Solana' as const,
        address: () => wallet.publicKey?.toString() || '',
        async signAndSend(txns: any[]) {
          const signedTxns = await wallet.signAllTransactions!(txns);
          const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com');
          const txids: string[] = [];
          for (const signed of signedTxns) {
            const txid = await connection.sendRawTransaction(signed.serialize());
            await connection.confirmTransaction(txid);
            txids.push(txid);
          }
          return txids;
        },
      };
      const txids = await xfer.initiateTransfer(signer);
      setTxHash(txids[0]);
      setIsBridged(true);
      setStep(4);
      setTimeout(() => onQuestComplete(), 1200);
    } catch (err: any) {
      setError(
        err?.message?.includes('403')
          ? 'Access forbidden: The RPC endpoint you are using does not allow this action. Please check your network (devnet/testnet/mainnet) and try again, or use a different RPC provider.'
          : err?.message || 'Failed to bridge tokens.'
      );
      setStep(2);
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-purple-900 to-blue-900 min-h-screen rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-col items-center py-8 px-4">
        <h2 className="text-3xl font-bold text-white mb-2 text-center drop-shadow-lg">Bridging Tokens with Wormhole</h2>
        <p className="text-blue-200 mb-4 text-center max-w-xl">
          Experience real cross-chain bridging! Move tokens from Solana to Ethereum or Polygon using Wormhole's powerful protocol.
        </p>
      </div>
      <AnimatedBridgeDiagram />
      <DidYouKnowCard fact="Wormhole has facilitated billions of dollars in cross-chain transfers!" />
      <div className="max-w-xl mx-auto bg-dark-card/80 rounded-lg p-6 shadow-xl mt-6 mb-8">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-600' : 'bg-gray-700'}`}>1</div>
            <div className="flex-1 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-2" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`}>2</div>
            <div className="flex-1 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-2" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600' : 'bg-gray-700'}`}>3</div>
            <div className="flex-1 h-1 bg-gradient-to-r from-green-600 to-emerald-600 mx-2" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-emerald-600' : 'bg-gray-700'}`}>4</div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Select Token</span>
            <span>Enter Amount</span>
            <span>Bridge</span>
            <span>Done</span>
          </div>
        </div>
        <div className="mb-4 flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-gray-400 mb-2">Select Token</label>
            <div className="flex items-center space-x-2">
              <img src={selectedToken.logo} alt={selectedToken.symbol} className="h-6 w-6" />
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
          </div>
          <div className="flex-1">
            <label className="block text-gray-400 mb-2">Select Destination Chain</label>
            <div className="flex items-center space-x-2">
              <img src={selectedChain.logo} alt={selectedChain.name} className="h-6 w-6" />
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
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-gray-800 text-white rounded-lg p-2"
          />
        </div>
        {error && (
          <div className="bg-red-900/80 text-red-200 rounded-lg p-4 mt-4 flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            <div>
              <div className="font-bold">Bridge Error</div>
              <div>{error}</div>
              <a href="https://docs.solquest.io/troubleshooting#bridge-errors" target="_blank" className="text-blue-300 underline text-sm">Learn more</a>
            </div>
          </div>
        )}
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleBridge}
            disabled={isBridging || isBridged || !amount || !wallet.publicKey}
            className="bg-solana-purple hover:bg-solana-purple-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-60"
          >
            {isBridging ? 'Bridging...' : isBridged ? 'Bridged!' : 'Bridge Tokens'}
          </button>
        </div>
        {isBridged && txHash && (
          <div className="text-green-400 font-semibold mt-2 text-center">
            <p>Bridge successful! +{xpReward} XP</p>
            <a
              href={`https://wormholescan.io/#/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 underline mt-2 inline-block"
            >
              View on WormholeScan
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default WormholeBridgeQuest; 