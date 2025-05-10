'use client';
import React, { useState } from 'react';
// Remove Solana web3.js and borsh imports as they are no longer used in the reverted handleSendMessage
// import { useConnection, useWallet } from '@solana/wallet-adapter-react'; // Keep if needed for other parts, or remove if exclusively for reverted logic
// import {
//   PublicKey,
//   Transaction,
//   TransactionInstruction,
//   SystemProgram,
//   SYSVAR_RENT_PUBKEY,
// } from '@solana/web3.js';
// import { Buffer } from 'buffer'; 
// import * as borsh from '@coral-xyz/borsh';

interface OmnichainMessengerQuestProps {
  // Changed onComplete to onQuestComplete for consistency, if FaucetQuest uses that
  // Or ensure LayerZeroLearningPathPage handles different prop names if needed.
  onQuestComplete: () => void; 
  xpReward?: number; // Add xpReward prop
}

// Example LayerZero supported testnet EVM chains (IDs might vary, check LayerZero docs)
// These are illustrative. Refer to https://docs.layerzero.network/v2/deployments/deployed-contracts for actual endpoint IDs / chain IDs
const SUPPORTED_DESTINATION_CHAINS = [
  { id: '40161', name: 'Sepolia (Ethereum Testnet)' },
  { id: '40267', name: 'Amoy (Polygon Testnet)' },
  { id: '40231', name: 'Arbitrum Sepolia (Arbitrum Testnet)' },
  { id: '40102', name: 'BSC Testnet (BNB Smart Chain Testnet)' },
  { id: '40106', name: 'Fuji (Avalanche Testnet)' },
  // Note: Solana Devnet (Endpoint ID 40168) is the source chain for this quest.
  // Add more EVM testnets or mainnets as needed from LayerZero V2 documentation.
];

// Remove PublicKey constants as they are not used in the reverted version
// const LAYERZERO_SOLANA_ENDPOINT_PROGRAM_ID = new PublicKey('...');
// const YOUR_OAPP_PROGRAM_ID_MESSENGER = new PublicKey('...');
// const ENDPOINT_SEED = Buffer.from('...');
// const OAPP_CONFIG_SEED = Buffer.from('...');
// const EVENT_AUTHORITY_SEED = Buffer.from('...');

export const OmnichainMessengerQuest: React.FC<OmnichainMessengerQuestProps> = ({ onQuestComplete, xpReward }) => {
  // const { connection } = useConnection(); // Remove if not used elsewhere
  // const { publicKey, sendTransaction } = useWallet(); // Remove if not used elsewhere

  const [destinationChain, setDestinationChain] = useState<string>(SUPPORTED_DESTINATION_CHAINS[0]?.id || '');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendMessage = async () => {
    if (!destinationChain || !recipientAddress || !message) {
      setStatus('Error: Please fill in all fields.');
      return;
    }
    if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        setStatus('Error: Invalid EVM recipient address format.');
        return;
    }

    setIsLoading(true);
    setStatus('Preparing to send message... (Simulated)');

    // Simulate API call / transaction
    await new Promise(resolve => setTimeout(resolve, 2000)); 

    setStatus(`Message submission simulated! Recipient: ${recipientAddress}, Chain ID: ${destinationChain}, Message: "${message.substring(0,30)}..."`);
    setIsLoading(false);
    
    // console.log("Quest 2 completed (simulated), calling onQuestComplete");
    // onQuestComplete(); // Keep this commented unless you want auto-completion on simulation
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Quest 2: Omnichain Messenger</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            Welcome to the world of omnichain communication! This quest demonstrates the fundamental capability of LayerZero: sending messages across different blockchains.
            You'll simulate sending a simple text message from Solana Devnet to a specified EVM-compatible testnet.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>What's happening?</strong> Your Solana application (a "User Application" or UA in LayerZero terms) will prepare a message. This message is then sent to LayerZero's Endpoint on Solana. LayerZero then ensures this message is reliably transported and delivered to the destination chain's LayerZero Endpoint, which can then forward it to a recipient contract or address.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            This basic messaging primitive is the building block for more complex omnichain applications, such as token bridges, cross-chain governance, and much more.
          </span>
        </p>
      </div>
      
      <div className="space-y-4 bg-dark-card-secondary p-6 rounded-lg">
        <div>
          <label htmlFor="destinationChain" className="block text-sm font-medium text-gray-300 mb-1">
            Destination EVM Testnet:
          </label>
          <select
            id="destinationChain"
            name="destinationChain"
            value={destinationChain}
            onChange={(e) => setDestinationChain(e.target.value)}
            disabled={isLoading}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
          >
            {SUPPORTED_DESTINATION_CHAINS.map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.name} (ID: {chain.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-300 mb-1">
            Recipient EVM Address (e.g., 0x...):
          </label>
          <input
            type="text"
            id="recipientAddress"
            name="recipientAddress"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0xAbCdEf1234567890AbCdEf1234567890AbCdEf12"
            disabled={isLoading}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
            Message:
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your cross-chain message here..."
            disabled={isLoading}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
          />
        </div>

        <button 
          onClick={handleSendMessage}
          disabled={isLoading}
          className="w-full bg-solana-purple text-white font-semibold px-6 py-3 rounded-lg hover:bg-solana-purple-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            'Send Cross-Chain Message (Simulated)'
          )}
        </button>
      </div>

      {status && (
        <div className={`mt-4 p-3 rounded-md text-sm ${status.startsWith('Error:') ? 'bg-red-700/30 text-red-300' : 'bg-blue-700/30 text-blue-300'}`}>
          {status}
        </div>
      )}

      <button 
        onClick={onQuestComplete} 
        className="mt-8 bg-solana-green text-white px-6 py-2 rounded-lg hover:bg-solana-green-dark transition-colors text-xs"
      >
        DEBUG: Mark Quest 2 as Complete
      </button>
    </div>
  );
}; 