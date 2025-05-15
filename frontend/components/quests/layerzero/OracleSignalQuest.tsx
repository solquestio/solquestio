'use client';
import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { CheckCircleIcon, ArrowPathIcon, BellAlertIcon, CubeTransparentIcon } from '@heroicons/react/24/solid';
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

export const OracleSignalQuest: React.FC<OracleSignalQuestProps> = ({ onQuestComplete, xpReward = 400 }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [signalType, setSignalType] = useState<string>('price_update');
  const [sourceEvmChainId, setSourceEvmChainId] = useState<string>(EVM_SIGNAL_SOURCE_CHAINS[0]?.id || '');
  const [signalValue, setSignalValue] = useState<string>('150.75'); // Example value
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

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
      setStatus(`✅ Success: Message sent to ${selectedChainInfo?.name} (helper: ${EVM_ORACLE_HELPER_CONTRACT_ADDRESS_PLACEHOLDER.substring(0,10)}...) to request it to send a '${signalType}' signal (value: ${signalValue}) back to Solana OApp ${YOUR_ORACLE_OAPP_PROGRAM_ID_PLACEHOLDER.substring(0,10)}...`);
      setIsLoading(false);
      setIsCompleted(true);
      
      // Show success animation and complete the quest
      setShowSuccessAnimation(true);
      setTimeout(() => {
        onQuestComplete();
      }, 2000);

    } catch (error: any) {
      console.error("Simulated Oracle Signal error:", error);
      setStatus(`Error during simulated oracle signal request: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-lg text-gray-200 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 z-0"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl"></div>
      
      {/* Success animation */}
      {showSuccessAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-blue-500/30 flex items-center justify-center z-10 animate-pulse">
          <div className="bg-gray-900/90 rounded-2xl p-8 flex flex-col items-center shadow-2xl transform animate-bounce-small">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Quest Complete!</h3>
            <p className="text-xl font-semibold text-green-400">+{xpReward} XP</p>
          </div>
        </div>
      )}
      
      {/* Header with XP reward */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center">
          <BellAlertIcon className="h-7 w-7 text-purple-400 mr-3" />
          <h3 className="text-2xl font-bold text-white">Quest 5: Decentralized Oracle Signal</h3>
        </div>
        {xpReward !== undefined && (
          <div className="bg-purple-900/40 px-3 py-1 rounded-full border border-purple-500/50 text-purple-300 font-semibold flex items-center">
            <span className="text-yellow-400 mr-1">+{xpReward}</span> XP
          </div>
        )}
      </div>
      
      <div className="space-y-6 relative z-10">
        <div className="text-gray-300 space-y-3">
          <div className="bg-gray-800/50 p-5 rounded-lg border-l-4 border-purple-500 shadow-md">
            <p className="flex items-start">
              <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
              <span>
                This quest delves into using LayerZero for cross-chain oracle interactions. Oracles are essential for bringing real-world data (like prices, weather, or event outcomes) onto the blockchain. Here, you'll simulate a Solana OApp requesting an oracle signal from an EVM chain.
              </span>
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/30 p-5 rounded-lg shadow-md">
            <p className="flex items-start">
              <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
              <span>
                <strong className="text-white">Why Cross-Chain Oracles?</strong> Many dApps rely on timely and accurate external data. If this data originates or is processed on one chain, LayerZero can help relay it or signals about it to other chains. This enables your Solana application to react to information or triggers from the broader blockchain ecosystem.
              </span>
            </p>
          </div>
          
          <div className="bg-gray-800/50 p-5 rounded-lg shadow-md">
            <p className="flex items-start">
              <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
              <span>
                <strong className="text-white">Simulated Flow:</strong> Your Solana OApp will send a message to a "helper" contract on a target EVM chain. This message requests the helper contract to obtain or generate a specific piece of data (the "signal") and send it back to your Solana OApp via a LayerZero message. This pattern can be used for price feeds, cross-chain attestations, and more.
              </span>
            </p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 p-6 rounded-lg shadow-lg border border-gray-700/50">
          <div className="flex items-center mb-5">
            <CubeTransparentIcon className="h-6 w-6 text-purple-400 mr-2" />
            <h4 className="text-xl font-semibold text-white">Oracle Signal Request Simulator</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Signal Type to Request:</label>
              <select 
                value={signalType}
                onChange={(e) => setSignalType(e.target.value)}
                disabled={isLoading || isCompleted}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="price_update">Mock Price Update (e.g., SOL/USD)</option>
                <option value="event_flag">Generic Event Flag</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">EVM Chain for Oracle Source/Helper Contract:</label>
              <select 
                value={sourceEvmChainId}
                onChange={(e) => setSourceEvmChainId(e.target.value)}
                disabled={isLoading || isCompleted}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                {EVM_SIGNAL_SOURCE_CHAINS.map(chain => (
                  <option key={chain.id} value={chain.id}>{chain.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Signal Value/Parameter to Request:</label>
              <input 
                type="text"
                value={signalValue}
                onChange={(e) => setSignalValue(e.target.value)}
                disabled={isLoading || isCompleted}
                placeholder="e.g., 150.75 or true"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            <button 
              onClick={handleSendSignal}
              disabled={isLoading || isCompleted}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed mt-3"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Sending Request via LayerZero...
                </span>
              ) : isCompleted ? (
                <span className="flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-green-300" />
                  Oracle Signal Request Complete!
                </span>
              ) : (
                'Request Oracle Signal from EVM via LayerZero'
              )}
            </button>
            
            <p className="text-xs text-gray-400 mt-1">
              This sends a message to an EVM contract (e.g., at <span className='font-mono text-xs'>{EVM_ORACLE_HELPER_CONTRACT_ADDRESS_PLACEHOLDER}</span> on selected chain) to request it to send a signal back to your Solana OApp.
            </p>
          </div>
        </div>

        {status && (
          <div className={`p-4 rounded-lg text-sm border ${status.startsWith('Error:') ? 'bg-red-700/30 text-red-300 border-red-500/30' : 'bg-blue-700/30 text-blue-300 border-blue-500/30'} shadow-md transform transition-all duration-300 ease-in-out animate-fadeIn`}>
            {status}
          </div>
        )}

        {isCompleted && (
          <div className="p-5 bg-green-900/20 border border-green-500/30 rounded-lg shadow-md transform transition-all hover:scale-[1.01] duration-200">
            <h4 className="text-green-400 font-semibold mb-3 flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Quest Complete!
            </h4>
            <p className="text-gray-300">
              You've successfully simulated cross-chain oracle signal coordination using LayerZero. This pattern 
              enables Solana applications to leverage data and events from EVM chains for various use cases like 
              price feeds, external event notifications, and cross-chain coordination.
            </p>
            <p className="text-gray-300 mt-3">
              In a real application, you would implement:
            </p>
            <ul className="mt-2 space-y-2">
              <li className="flex items-start">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-green-500/20 rounded-full mr-3 border border-green-400/50 mt-1"></span>
                <span>A Solana program to receive and process the oracle data</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-blue-500/20 rounded-full mr-3 border border-blue-400/50 mt-1"></span>
                <span>An EVM contract that generates or relays oracle data</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-purple-500/20 rounded-full mr-3 border border-purple-400/50 mt-1"></span>
                <span>LayerZero endpoints configuration on both chains</span>
              </li>
            </ul>
          </div>
        )}
      </div>
      
      {/* Add custom CSS for animations */}
      <style jsx global>{`
        @keyframes bounce-small {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-small {
          animation: bounce-small 2s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}; 