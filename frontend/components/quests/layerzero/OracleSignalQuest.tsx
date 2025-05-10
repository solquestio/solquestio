'use client';
import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import {
// PublicKey,
// Transaction,
// TransactionInstruction,
// SystemProgram,
// SYSVAR_RENT_PUBKEY
// } from '@solana/web3.js';
// import { Buffer } from 'buffer';
// import * as borsh from '@coral-xyz/borsh';

// --- PLACEHOLDERS - Replace with your actual values ---
const YOUR_ORACLE_OAPP_PROGRAM_ID_PLACEHOLDER = 'OracleOAppProgram11111111111111111111111111';
// EVM chains that could be the source of an oracle signal (or where our Solana OApp sends a request to)
const EVM_SIGNAL_SOURCE_CHAINS = [
  { id: '40161', name: 'Sepolia (Ethereum Testnet)' },
  { id: '40102', name: 'BSC Testnet' },
];
// Placeholder for your contract on the EVM chain that would generate/relay the signal (or receive requests from Solana)
const EVM_ORACLE_HELPER_CONTRACT_ADDRESS_PLACEHOLDER = '0xBeefBeefBeefBeefBeefBeefBeefBeefBeefBeef';

// const LAYERZERO_SOLANA_ENDPOINT_PROGRAM_ID = new PublicKey('76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6');
// const OAPP_CONFIG_SEED_ORACLE = Buffer.from('oracle_oapp_cfg');
// const LZ_ENDPOINT_SEED = Buffer.from('lz_endpoint_seed');
// const LZ_EVENT_AUTHORITY_SEED = Buffer.from("__event_authority");
// ----------------------------------------------------

interface OracleSignalQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const OracleSignalQuest: React.FC<OracleSignalQuestProps> = ({ onQuestComplete, xpReward }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [signalType, setSignalType] = useState<string>('price_update');
  const [sourceEvmChainId, setSourceEvmChainId] = useState<string>(EVM_SIGNAL_SOURCE_CHAINS[0]?.id || '');
  const [signalValue, setSignalValue] = useState<string>('150.75'); // Example value

  const handleSendSignal = async () => {
    if (!signalType || !sourceEvmChainId || !signalValue) {
      setStatus('Error: Please fill in all signal fields.');
      return;
    }
    setIsLoading(true);
    setStatus('Simulating oracle signal coordination message...');

    if (!publicKey) {
      setStatus('Error: Wallet not connected.');
      setIsLoading(false);
      return;
    }

    // Simulate API call or transaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const selectedChainInfo = EVM_SIGNAL_SOURCE_CHAINS.find(c => c.id === sourceEvmChainId);
      setStatus(`✅ Simulated: Message sent to ${selectedChainInfo?.name} (helper: ${EVM_ORACLE_HELPER_CONTRACT_ADDRESS_PLACEHOLDER}) to request it to send a '${signalType}' signal (value: ${signalValue}) back to Solana OApp ${YOUR_ORACLE_OAPP_PROGRAM_ID_PLACEHOLDER.substring(0,10)}...`);
      setIsLoading(false);

    } catch (error: any) {
      console.error("Simulated Oracle Signal error:", error);
      setStatus(`Error during simulated oracle signal request: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Quest 5: Decentralized Oracle Signal</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            This quest delves into using LayerZero for cross-chain oracle interactions. Oracles are essential for bringing real-world data (like prices, weather, or event outcomes) onto the blockchain. Here, you'll simulate a Solana OApp requesting an oracle signal from an EVM chain.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>Why Cross-Chain Oracles?</strong> Many dApps rely on timely and accurate external data. If this data originates or is processed on one chain, LayerZero can help relay it or signals about it to other chains. This enables your Solana application to react to information or triggers from the broader blockchain ecosystem.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>Simulated Flow:</strong> Your Solana OApp will send a message to a "helper" contract on a target EVM chain. This message requests the helper contract to obtain or generate a specific piece of data (the "signal") and send it back to your Solana OApp via a LayerZero message. This pattern can be used for price feeds, cross-chain attestations, and more.
          </span>
        </p>
      </div>
      
      <div className="space-y-4 bg-dark-card-secondary p-6 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Signal Type to Request:</label>
          <select 
            value={signalType}
            onChange={(e) => setSignalType(e.target.value)}
            disabled={isLoading}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
          >
            <option value="price_update">Mock Price Update (e.g., SOL/USD)</option>
            <option value="event_flag">Generic Event Flag</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">EVM Chain for Oracle Source/Helper Contract:</label>
          <select 
            value={sourceEvmChainId}
            onChange={(e) => setSourceEvmChainId(e.target.value)}
            disabled={isLoading}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
          >
            {EVM_SIGNAL_SOURCE_CHAINS.map(chain => (
              <option key={chain.id} value={chain.id}>{chain.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Signal Value/Parameter to Request:</label>
          <input 
            type="text"
            value={signalValue}
            onChange={(e) => setSignalValue(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., 150.75 or true"
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
          />
        </div>

        <button 
          onClick={handleSendSignal}
          disabled={isLoading}
          className="w-full bg-solana-purple text-white font-semibold px-6 py-3 rounded-lg hover:bg-solana-purple-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending Request to EVM via LZ...' : 'Request Oracle Signal from EVM via LayerZero'}
        </button>
         <p className="text-xs text-gray-400 mt-1">
            This sends a message to an EVM contract (e.g., at <span className='font-mono text-xs'>{EVM_ORACLE_HELPER_CONTRACT_ADDRESS_PLACEHOLDER}</span> on selected chain) to request it to send a signal back to your Solana OApp.
          </p>
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
        DEBUG: Mark Quest 5 as Complete
      </button>
    </div>
  );
}; 