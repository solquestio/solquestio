'use client';
import React, { useState } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import {
//   PublicKey,
//   Transaction,
//   TransactionInstruction,
//   SystemProgram,
//   SYSVAR_RENT_PUBKEY
// } from '@solana/web3.js';
// import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
// import { Buffer } from 'buffer';
// import * as borsh from '@coral-xyz/borsh';

interface TokenBridgeQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

const EVM_TESTNETS_FOR_BRIDGE = [
  { id: '40161', name: 'Sepolia (Ethereum Testnet)' },
  { id: '40267', name: 'Amoy (Polygon Testnet)' },
  { id: '40102', name: 'BSC Testnet (BNB Smart Chain Testnet)' },
];

// Remove PublicKey constants and other Solana-specific constants
// const YOUR_OFT_PROGRAM_ID = new PublicKey('...'); 
// const MOCK_SPL_OFT_MINT_ADDRESS = new PublicKey('...');
// const MOCK_SPL_OFT_DECIMALS = 9; 
// const LAYERZERO_SOLANA_ENDPOINT_PROGRAM_ID = new PublicKey('...');
// const OFT_CONFIG_SEED = Buffer.from('...');
// const LZ_ENDPOINT_SEED = Buffer.from('...');
// const LZ_EVENT_AUTHORITY_SEED = Buffer.from("...");

export const TokenBridgeQuest: React.FC<TokenBridgeQuestProps> = ({ onQuestComplete, xpReward }) => {
  // const { connection } = useConnection();
  // const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [destinationChain, setDestinationChain] = useState<string>(EVM_TESTNETS_FOR_BRIDGE[0]?.id || '');
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleBridgeToken = async () => {
    if (!destinationChain || !tokenAmount || !recipientAddress || parseFloat(tokenAmount) <= 0) {
      setStatus('Error: Please select a destination, enter a valid amount, and recipient address.');
      return;
    }
    if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        setStatus('Error: Invalid EVM recipient address format.');
        return;
    }

    setIsLoading(true);
    setStatus('Preparing to bridge token... (Simulated)');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000)); 

    setStatus(`Token bridge successful! ${tokenAmount} [MockSPL] sent to ${recipientAddress} on chain ID ${destinationChain}.`);
    setIsLoading(false);
    setIsCompleted(true);
    
    // Automatically complete the quest
    onQuestComplete();
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Quest 3: Solana SPL Token Bridge (OFT)</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            This quest introduces you to bridging tokens using LayerZero's Omnichain Fungible Token (OFT) standard. You'll simulate bridging a mock SPL (Solana Program Library) token from Solana Devnet to an EVM testnet.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>Why bridge tokens?</strong> Token bridging allows assets to move between different blockchains, enhancing liquidity and enabling users to interact with dApps on various ecosystems with their preferred tokens. The OFT standard simplifies this by allowing a token to maintain a unified supply across multiple chains, appearing as a native token on each.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>How it works (simplified):</strong> When you bridge tokens using an OFT contract, your tokens on the source chain (Solana) are typically locked or burned. An equivalent amount is then minted or unlocked on the destination EVM chain, facilitated by LayerZero messages coordinating the state between the OFT contracts on both chains.
          </span>
        </p>
      </div>
      
      <div className="space-y-4 bg-dark-card-secondary p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Mock SPL Token to Bridge:</label>
          <div className="p-2 bg-gray-700 rounded-md text-gray-300">
            SOLQUEST-MOCK (SQM) - <span className="text-xs">(Balance: Fetchable if mint exists)</span>
          </div>
        </div>

        <div>
          <label htmlFor="tokenAmount" className="block text-sm font-medium text-gray-300 mb-1">
            Amount to Bridge:
          </label>
          <input
            type="number"
            id="tokenAmount"
            name="tokenAmount"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            placeholder="e.g., 100"
            disabled={isLoading || isCompleted}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
          />
        </div>

        <div>
          <label htmlFor="destinationChainBridge" className="block text-sm font-medium text-gray-300 mb-1">
            Destination EVM Testnet:
          </label>
          <select
            id="destinationChainBridge"
            name="destinationChainBridge"
            value={destinationChain}
            onChange={(e) => setDestinationChain(e.target.value)}
            disabled={isLoading || isCompleted}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
          >
            {EVM_TESTNETS_FOR_BRIDGE.map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.name} (ID: {chain.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="recipientAddressBridge" className="block text-sm font-medium text-gray-300 mb-1">
            Recipient EVM Address (on destination chain):
          </label>
          <input
            type="text"
            id="recipientAddressBridge"
            name="recipientAddressBridge"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0xAbCdEf1234567890AbCdEf1234567890AbCdEf12"
            disabled={isLoading || isCompleted}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
          />
        </div>

        <button 
          onClick={handleBridgeToken}
          disabled={isLoading || isCompleted}
          className="w-full bg-solana-purple text-white font-semibold px-6 py-3 rounded-lg hover:bg-solana-purple-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Bridging Token...
            </>
          ) : isCompleted ? (
            'Token Bridged Successfully!'
          ) : (
            'Bridge Token via LayerZero (Simulated)'
          )}
        </button>
      </div>

      {status && (
        <div className={`mt-4 p-3 rounded-md text-sm ${status.startsWith('Error:') ? 'bg-red-700/30 text-red-300' : 'bg-blue-700/30 text-blue-300'}`}>
          {status}
        </div>
      )}

      {isCompleted && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <h4 className="text-green-400 font-semibold mb-2">Quest Completed!</h4>
          <p className="text-gray-300 text-sm">
            You've successfully simulated bridging tokens using LayerZero's OFT standard. In a real application, 
            your tokens would be locked on Solana and an equivalent amount would be minted or unlocked on the destination chain.
          </p>
        </div>
      )}
    </div>
  );
}; 