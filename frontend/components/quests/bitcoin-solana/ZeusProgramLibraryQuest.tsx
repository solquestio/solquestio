'use client';

import React, { useState } from 'react';
import { SparklesIcon, CheckCircleIcon, CodeBracketIcon, BookOpenIcon } from '@heroicons/react/24/solid';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
  xpReward?: number;
}

export const ZeusProgramLibraryQuest: React.FC<QuestProps> = ({ onQuestComplete, title, xpReward = 300 }) => {
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [codePreviewIndex, setCodePreviewIndex] = useState(0);
  const [markedAsRead, setMarkedAsRead] = useState({
    overview: false,
    installation: false,
    examples: false,
    advanced: false
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const markTabAsRead = (tab: keyof typeof markedAsRead) => {
    setMarkedAsRead(prev => ({
      ...prev,
      [tab]: true
    }));
  };

  const allTabsRead = () => {
    return Object.values(markedAsRead).filter(Boolean).length >= 3;
  };

  const handleCompleteQuest = () => {
    if (!allTabsRead()) {
      alert("Please read at least 3 sections before completing the quest.");
      return;
    }

    setIsCompleting(true);
    
    // Simulate completion delay
    setTimeout(() => {
      setIsCompleting(false);
      setShowSuccessAnimation(true);
      
      // Wait for animation before notifying completion
      setTimeout(() => {
        onQuestComplete();
      }, 2000);
    }, 1000);
  };

  // Sample code examples
  const codeExamples = [
    {
      title: "Initialize Zeus Client",
      description: "Setting up the Zeus client to interact with the protocol",
      code: `// Import the Zeus Program Library
import { ZeusClient } from '@zeus-network/zeus-client';
import { Connection, PublicKey } from '@solana/web3.js';

// Initialize connection to Solana
const connection = new Connection('https://api.mainnet-beta.solana.com');

// Initialize Zeus client with your wallet
const zeusClient = new ZeusClient({
  connection,
  wallet: yourWallet, // Your wallet adapter
  env: 'mainnet'     // or 'devnet' for testing
});

// Check connection
console.log("Zeus client initialized:", zeusClient.isReady());`
    },
    {
      title: "Query zBTC Token Info",
      description: "Fetch details about zBTC token and reserves",
      code: `// Get zBTC token details
const zBTCInfo = await zeusClient.getTokenInfo('zbtc');

console.log("zBTC token address:", zBTCInfo.mintAddress.toString());
console.log("zBTC decimals:", zBTCInfo.decimals);
console.log("zBTC current supply:", zBTCInfo.totalSupply);

// Get Bitcoin reserve status
const reserveStatus = await zeusClient.getReserveStatus('zbtc');

console.log("BTC reserves:", reserveStatus.totalBtcLocked);
console.log("Reserve ratio:", reserveStatus.reserveRatio);`
    },
    {
      title: "Minting zBTC",
      description: "Create a transaction for minting zBTC from BTC",
      code: `// Create a minting transaction
const mintingTx = await zeusClient.createMintTransaction({
  tokenSymbol: 'zbtc',
  amount: 0.1,  // BTC amount to deposit
  btcAddress: 'YOUR_GENERATED_BTC_ADDRESS', 
  solanaReceiver: wallet.publicKey // Your solana wallet
});

// Get deposit instructions
console.log("BTC deposit address:", mintingTx.btcDepositAddress);
console.log("Deposit amount:", mintingTx.amount);
console.log("Estimated fees:", mintingTx.estimatedFees);

// After BTC confirmation, claim your zBTC
const claimTx = await zeusClient.claimMintedTokens({
  mintingId: mintingTx.id
});

await claimTx.confirm();
console.log("zBTC minting complete!");`
    },
    {
      title: "Redeeming BTC",
      description: "Create a transaction to redeem native BTC from zBTC",
      code: `// Create a redemption transaction
const redemptionTx = await zeusClient.createRedemptionTransaction({
  tokenSymbol: 'zbtc',
  amount: 0.05,  // zBTC amount to redeem
  btcReceivingAddress: 'YOUR_BTC_WALLET_ADDRESS'
});

// Sign and send the transaction
const signature = await wallet.sendTransaction(redemptionTx);
await connection.confirmTransaction(signature);

// Check redemption status
const redemptionStatus = await zeusClient.getRedemptionStatus(signature);
console.log("Redemption status:", redemptionStatus.status);
console.log("BTC transaction hash:", redemptionStatus.btcTxHash);`
    },
    {
      title: "Monitoring Transactions",
      description: "Listen for updates on your cross-chain transactions",
      code: `// Subscribe to transaction updates
const unsubscribe = zeusClient.subscribeToTransactionUpdates(
  'YOUR_TRANSACTION_ID',
  (update) => {
    console.log("Transaction status:", update.status);
    
    if (update.status === 'completed') {
      console.log("Transaction complete!");
      console.log("Final settlement:", update.settlementDetails);
      unsubscribe(); // Stop listening
    }
    
    if (update.status === 'failed') {
      console.error("Transaction failed:", update.error);
      unsubscribe(); // Stop listening
    }
  }
);`
    }
  ];

  const handleNextCode = () => {
    setCodePreviewIndex((prevIndex) => (prevIndex + 1) % codeExamples.length);
  };

  const handlePrevCode = () => {
    setCodePreviewIndex((prevIndex) => (prevIndex - 1 + codeExamples.length) % codeExamples.length);
  };

  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-lg text-gray-200 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 to-blue-900/10 z-0"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-500/5 rounded-full filter blur-3xl"></div>
      
      {/* Success animation */}
      {showSuccessAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-blue-500/30 flex items-center justify-center z-50 animate-pulse">
          <div className="bg-gray-900/90 rounded-2xl p-8 flex flex-col items-center shadow-2xl transform animate-bounce-small">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Quest Completed!</h3>
            <p className="text-xl font-semibold text-green-400">+{xpReward} XP</p>
          </div>
        </div>
      )}
      
      {/* Header with XP reward */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center">
          <SparklesIcon className="h-7 w-7 text-yellow-500 mr-3" />
          <h2 className="text-2xl font-bold text-yellow-300">{title}</h2>
        </div>
        {xpReward !== undefined && (
          <div className="bg-yellow-900/40 px-3 py-1 rounded-full border border-yellow-500/50 text-yellow-300 font-semibold flex items-center">
            <span className="text-yellow-400 mr-1">+{xpReward}</span> XP
          </div>
        )}
      </div>
      
      <div className="space-y-6 text-gray-300 relative z-10">
        {/* Introduction section */}
        <div className="bg-gray-800/50 p-5 rounded-lg border-l-4 border-yellow-500 shadow-md">
          <p className="text-lg">
            Welcome to the Zeus Program Library (ZPL) quest! Learn how to build applications that integrate Bitcoin with Solana using the Zeus SDK.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex flex-wrap -mb-px">
            <button
              className={`mr-2 py-2 px-4 font-medium text-sm rounded-t-lg ${
                activeTab === 'overview'
                  ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
              onClick={() => handleTabChange('overview')}
            >
              Overview
            </button>
            <button
              className={`mr-2 py-2 px-4 font-medium text-sm rounded-t-lg ${
                activeTab === 'installation'
                  ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
              onClick={() => handleTabChange('installation')}
            >
              Installation
            </button>
            <button
              className={`mr-2 py-2 px-4 font-medium text-sm rounded-t-lg ${
                activeTab === 'examples'
                  ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
              onClick={() => handleTabChange('examples')}
            >
              Code Examples
            </button>
            <button
              className={`mr-2 py-2 px-4 font-medium text-sm rounded-t-lg ${
                activeTab === 'advanced'
                  ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
              onClick={() => handleTabChange('advanced')}
            >
              Advanced Topics
            </button>
          </div>
        </div>
        
        {/* Tab content */}
        <div className="bg-gray-800/40 rounded-lg p-5">
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xl font-semibold text-white mb-3">Zeus Program Library Overview</h3>
              
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <div className="flex items-start mb-3">
                  <BookOpenIcon className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">What is the Zeus Program Library?</h4>
                    <p className="text-gray-300 mt-1">
                      The Zeus Program Library (ZPL) is a set of development tools and Solana programs that enable developers to build applications that integrate Bitcoin functionality on Solana. It provides the infrastructure needed to interact with zBTC and other cross-chain assets.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Key Components:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                    <div>
                      <span className="font-medium text-yellow-300">Zeus Client:</span>
                      <span className="text-gray-300"> JavaScript/TypeScript SDK for interacting with the Zeus Network</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                    <div>
                      <span className="font-medium text-yellow-300">Zeus Programs:</span>
                      <span className="text-gray-300"> On-chain Solana programs for managing cross-chain assets</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                    <div>
                      <span className="font-medium text-yellow-300">ZPL Assets:</span>
                      <span className="text-gray-300"> Token standards and interfaces for Bitcoin-pegged assets</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                    <div>
                      <span className="font-medium text-yellow-300">Security Components:</span>
                      <span className="text-gray-300"> Tools for verifying cross-chain transactions and reserves</span>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-yellow-900/20 p-4 border border-yellow-500/30 rounded-lg">
                <h4 className="font-semibold text-yellow-300 mb-2">Use Cases:</h4>
                <p className="text-gray-300 mb-3">
                  With ZPL, developers can build:
                </p>
                <ul className="space-y-2 pl-5 list-disc text-gray-300">
                  <li>Decentralized exchanges for zBTC trading</li>
                  <li>Lending platforms with Bitcoin collateral</li>
                  <li>Yield farming protocols for zBTC liquidity providers</li>
                  <li>Cross-chain payment applications</li>
                  <li>Bitcoin-backed stablecoins on Solana</li>
                </ul>
              </div>
              
              <button 
                onClick={() => markTabAsRead('overview')}
                className={`mt-4 w-full py-2 rounded-lg transition-colors ${
                  markedAsRead.overview
                    ? 'bg-green-700/40 text-green-300'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {markedAsRead.overview ? 'Marked as Read ✓' : 'Mark as Read'}
              </button>
            </div>
          )}
          
          {activeTab === 'installation' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xl font-semibold text-white mb-3">Setting Up the Zeus Program Library</h3>
              
              <div className="p-4 bg-gray-900/70 rounded-lg mb-4">
                <h4 className="font-semibold text-white mb-3">Prerequisites</h4>
                <ul className="space-y-2 pl-5 list-disc text-gray-300">
                  <li>Node.js (v16 or higher)</li>
                  <li>Solana CLI (v1.10 or higher)</li>
                  <li>A Solana wallet (like Phantom or Solflare)</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-900/70 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Installation Steps</h4>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-yellow-300 mb-2">1. Install the ZPL package</h5>
                    <pre className="bg-black/50 p-3 rounded-md text-xs overflow-x-auto">
                      <code className="text-gray-300">
{`# Using npm
npm install @zeus-network/zeus-client

# Using yarn
yarn add @zeus-network/zeus-client`}
                      </code>
                    </pre>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-yellow-300 mb-2">2. Configure environment</h5>
                    <pre className="bg-black/50 p-3 rounded-md text-xs overflow-x-auto">
                      <code className="text-gray-300">
{`// Create a .env file with:
ZEUS_API_KEY=your_api_key_here  // Optional, for advanced features
SOLANA_NETWORK=mainnet-beta     // or devnet for testing`}
                      </code>
                    </pre>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-yellow-300 mb-2">3. Import and initialize</h5>
                    <pre className="bg-black/50 p-3 rounded-md text-xs overflow-x-auto">
                      <code className="text-gray-300">
{`import { ZeusClient } from '@zeus-network/zeus-client';
import { Connection } from '@solana/web3.js';

const connection = new Connection(process.env.SOLANA_NETWORK || 'https://api.mainnet-beta.solana.com');
const zeusClient = new ZeusClient({ connection, wallet: yourWallet });

// Verify connection
async function checkConnection() {
  const isReady = await zeusClient.isReady();
  console.log('Zeus client ready:', isReady);
}

checkConnection();`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <h4 className="font-semibold text-yellow-300 mb-2">Developer Resources</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-yellow-500/20 rounded-full mr-2 flex-shrink-0"></span>
                    <span className="text-gray-300">
                      <a href="#" className="text-yellow-400 hover:underline">ZPL Official Documentation</a>
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-yellow-500/20 rounded-full mr-2 flex-shrink-0"></span>
                    <span className="text-gray-300">
                      <a href="#" className="text-yellow-400 hover:underline">GitHub Repository</a>
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-4 h-4 bg-yellow-500/20 rounded-full mr-2 flex-shrink-0"></span>
                    <span className="text-gray-300">
                      <a href="#" className="text-yellow-400 hover:underline">Developer Discord</a>
                    </span>
                  </li>
                </ul>
              </div>
              
              <button 
                onClick={() => markTabAsRead('installation')}
                className={`mt-4 w-full py-2 rounded-lg transition-colors ${
                  markedAsRead.installation
                    ? 'bg-green-700/40 text-green-300'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {markedAsRead.installation ? 'Marked as Read ✓' : 'Mark as Read'}
              </button>
            </div>
          )}
          
          {activeTab === 'examples' && (
            <div className="space-y-5 animate-fadeIn">
              <h3 className="text-xl font-semibold text-white mb-3">ZPL Code Examples</h3>
              
              <div className="bg-gray-900/70 rounded-lg overflow-hidden">
                <div className="bg-black/40 px-4 py-3 flex justify-between items-center">
                  <h4 className="font-medium text-yellow-300">{codeExamples[codePreviewIndex].title}</h4>
                  <div className="flex space-x-2">
                    <button
                      className="p-1 rounded hover:bg-gray-700 transition-colors"
                      onClick={handlePrevCode}
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-700 transition-colors"
                      onClick={handleNextCode}
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="p-2">
                  <p className="text-sm text-gray-400 px-3 pb-2">{codeExamples[codePreviewIndex].description}</p>
                  <pre className="bg-black/70 p-4 rounded-md text-xs overflow-x-auto">
                    <code className="text-gray-300 whitespace-pre">
                      {codeExamples[codePreviewIndex].code}
                    </code>
                  </pre>
                </div>
                
                <div className="bg-black/40 px-4 py-3 text-xs text-gray-400">
                  Example {codePreviewIndex + 1} of {codeExamples.length}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/60 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Key Points</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-1.5"></span>
                      <span className="text-gray-300">Always handle errors and transaction failures</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-1.5"></span>
                      <span className="text-gray-300">Use async/await for all ZPL API calls</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-1.5"></span>
                      <span className="text-gray-300">Set proper gas fees for optimal transaction speed</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-800/60 p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Important Notes</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-1.5"></span>
                      <span className="text-gray-300">Test on devnet before mainnet deployment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-1.5"></span>
                      <span className="text-gray-300">Keep your Solana wallet secure</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-1.5"></span>
                      <span className="text-gray-300">Always verify Bitcoin addresses carefully</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <button 
                onClick={() => markTabAsRead('examples')}
                className={`mt-4 w-full py-2 rounded-lg transition-colors ${
                  markedAsRead.examples
                    ? 'bg-green-700/40 text-green-300'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {markedAsRead.examples ? 'Marked as Read ✓' : 'Mark as Read'}
              </button>
            </div>
          )}
          
          {activeTab === 'advanced' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xl font-semibold text-white mb-3">Advanced Topics</h3>
              
              <div className="bg-gray-900/50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-white mb-2">Custom ZPL Integration Strategies</h4>
                <p className="text-gray-300 mb-3">
                  Learn how to implement advanced integration patterns for enterprise applications:
                </p>
                
                <div className="space-y-4">
                  <div className="p-3 bg-gray-800/60 rounded-lg">
                    <h5 className="font-medium text-yellow-300 mb-1">Multi-wallet Transaction Batching</h5>
                    <p className="text-sm text-gray-400">
                      Optimize gas fees by batching multiple operations in a single transaction, ideal for high-volume applications.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-800/60 rounded-lg">
                    <h5 className="font-medium text-yellow-300 mb-1">ZPL Security Best Practices</h5>
                    <p className="text-sm text-gray-400">
                      Implement proper transaction validation, security checks, and backup strategies for production applications.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-800/60 rounded-lg">
                    <h5 className="font-medium text-yellow-300 mb-1">Custom UI Components</h5>
                    <p className="text-sm text-gray-400">
                      Build user-friendly interfaces for Bitcoin deposits, redemptions, and transaction monitoring.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-900/20 p-4 border border-yellow-500/30 rounded-lg">
                <h4 className="font-semibold text-yellow-300 mb-2">Advanced Integration Challenge</h4>
                <p className="text-gray-300 mb-3">
                  Test your knowledge by thinking through this scenario:
                </p>
                <div className="bg-gray-900/30 p-3 rounded-lg mb-3">
                  <p className="text-gray-300">
                    You're building a DeFi application that requires users to stake zBTC for a fixed period to earn yield. 
                    How would you implement:
                  </p>
                  <ul className="space-y-2 pl-5 list-disc text-gray-300 mt-2">
                    <li>Secure zBTC locking mechanism</li>
                    <li>Yield distribution based on time-locked amount</li>
                    <li>Early withdrawal penalties</li>
                    <li>Emergency withdrawal in case of security issues</li>
                  </ul>
                </div>
                <p className="text-sm italic text-gray-400">
                  Think about how you would approach this problem using the ZPL SDK. The solution would involve time-locked token accounts, SPL token interactions, and secure program instructions.
                </p>
              </div>
              
              <button 
                onClick={() => markTabAsRead('advanced')}
                className={`mt-4 w-full py-2 rounded-lg transition-colors ${
                  markedAsRead.advanced
                    ? 'bg-green-700/40 text-green-300'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                {markedAsRead.advanced ? 'Marked as Read ✓' : 'Mark as Read'}
              </button>
            </div>
          )}
        </div>
        
        {/* Complete Quest Button */}
        <div className="flex justify-end mt-6">
          <button 
            onClick={handleCompleteQuest}
            disabled={isCompleting || !allTabsRead()}
            className={`bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${isCompleting ? 'opacity-70' : ''}`}
          >
            {isCompleting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Completing...
              </span>
            ) : (
              'Complete Quest'
            )}
          </button>
        </div>
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