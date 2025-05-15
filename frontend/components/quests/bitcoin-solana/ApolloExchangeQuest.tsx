'use client';

import React, { useState } from 'react';
import { SparklesIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
  xpReward?: number;
}

export const ApolloExchangeQuest: React.FC<QuestProps> = ({ onQuestComplete, title, xpReward = 250 }) => {
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasInteractedWithAll, setHasInteractedWithAll] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'overview': true,
    'minting': false,
    'redeeming': false,
    'liquidity': false,
    'security': false
  });
  
  // Track progress through interactive sections
  const [progress, setProgress] = useState({
    watchedVideo: false,
    completedMintingQuiz: false,
    exploredBTCBridge: false,
    reviewedSecurityFeatures: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    
    // Mark as interacted
    checkCompletion();
  };
  
  const markProgress = (key: keyof typeof progress) => {
    setProgress(prev => ({
      ...prev,
      [key]: true
    }));
    
    checkCompletion();
  };
  
  const checkCompletion = () => {
    const allInteracted = Object.values(expandedSections).some(value => value) &&
                         Object.values(progress).filter(value => value).length >= 2;
    
    setHasInteractedWithAll(allInteracted);
  };

  const handleStepComplete = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleCompleteQuest();
    }
  };

  const handleCompleteQuest = () => {
    if (!hasInteractedWithAll) {
      alert("Please interact with at least two sections before completing the quest.");
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
      
      {/* Progress Indicator */}
      <div className="mb-8 relative z-10">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <div 
              key={step}
              className={`flex flex-col items-center w-1/3 relative ${step < currentStep ? 'text-green-400' : step === currentStep ? 'text-yellow-300' : 'text-gray-600'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                step < currentStep 
                  ? 'bg-green-400/20 border-2 border-green-400' 
                  : step === currentStep 
                    ? 'bg-yellow-500/20 border-2 border-yellow-400' 
                    : 'bg-gray-800 border border-gray-600'
              }`}>
                {step < currentStep ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-semibold">{step}</span>
                )}
              </div>
              <div className="text-xs font-medium">
                {step === 1 ? 'Learn' : step === 2 ? 'Explore' : 'Complete'}
              </div>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-yellow-300 h-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-6 text-gray-300 relative z-10">
        {/* Introduction section */}
        <div className="bg-gray-800/50 p-5 rounded-lg border-l-4 border-yellow-500 shadow-md">
          <p className="text-lg">
            Welcome to the APOLLO Exchange quest! Here you'll learn about the Bitcoin on-chain exchange that enables seamless movement between BTC and zBTC on Solana.
          </p>
        </div>
        
        {/* Content based on current step */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Overview Section */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button 
                className="w-full px-5 py-3 bg-gray-800/80 flex justify-between items-center hover:bg-gray-700/80 transition-colors"
                onClick={() => toggleSection('overview')}
              >
                <span className="font-semibold text-yellow-300">APOLLO Overview</span>
                <span className={`transform transition-transform ${expandedSections['overview'] ? 'rotate-90' : ''}`}>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </button>
              
              {expandedSections['overview'] && (
                <div className="p-5 bg-gray-800/40 animate-fadeIn">
                  <p className="mb-4">
                    APOLLO is the first dApp built on the Zeus Program Library (ZPL). It facilitates seamless transfer between native Bitcoin and zBTC on Solana through a secure, non-custodial bridge.
                  </p>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 mb-4">
                    <h4 className="font-semibold text-white mb-2">Key Features:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                        <span><span className="font-medium text-yellow-300">Non-custodial:</span> You always maintain full control of your assets</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                        <span><span className="font-medium text-yellow-300">Permissionless:</span> Anyone can mint or redeem without KYC</span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                        <span><span className="font-medium text-yellow-300">Multichain:</span> Starting with Bitcoin, expanding to other UTXO chains</span>
                      </li>
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => markProgress('watchedVideo')}
                    className={`w-full py-2 rounded-lg transition-colors ${
                      progress.watchedVideo 
                        ? 'bg-green-700/40 text-green-300' 
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {progress.watchedVideo ? 'Video Watched ✓' : 'Watch Demo Video'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Minting zBTC Section */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button 
                className="w-full px-5 py-3 bg-gray-800/80 flex justify-between items-center hover:bg-gray-700/80 transition-colors"
                onClick={() => toggleSection('minting')}
              >
                <span className="font-semibold text-yellow-300">Minting zBTC on Solana</span>
                <span className={`transform transition-transform ${expandedSections['minting'] ? 'rotate-90' : ''}`}>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </button>
              
              {expandedSections['minting'] && (
                <div className="p-5 bg-gray-800/40 animate-fadeIn">
                  <ol className="space-y-4 mb-5">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-900/70 border border-yellow-500/40 text-yellow-300 mr-3 text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-medium text-white">Deposit BTC</h4>
                        <p className="text-gray-400 text-sm">Send Bitcoin to a secure address generated by APOLLO</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-900/70 border border-yellow-500/40 text-yellow-300 mr-3 text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-medium text-white">Wait for Confirmations</h4>
                        <p className="text-gray-400 text-sm">Security-focused process requires multiple confirmations</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-900/70 border border-yellow-500/40 text-yellow-300 mr-3 text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-medium text-white">Receive zBTC</h4>
                        <p className="text-gray-400 text-sm">Your deposited BTC amount is minted as zBTC on Solana</p>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="bg-gray-900/70 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-300 mb-2">Quick Quiz:</h4>
                    <p className="mb-3">What is the peg ratio between zBTC and BTC?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => alert("Incorrect. Try again!")}
                        className="py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        2:1
                      </button>
                      <button 
                        onClick={() => markProgress('completedMintingQuiz')}
                        className={`py-2 px-3 rounded-lg transition-colors ${
                          progress.completedMintingQuiz 
                            ? 'bg-green-700/40 text-green-300' 
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        {progress.completedMintingQuiz ? 'Correct! ✓' : '1:1'}
                      </button>
                      <button 
                        onClick={() => alert("Incorrect. Try again!")}
                        className="py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        1:2
                      </button>
                      <button 
                        onClick={() => alert("Incorrect. Try again!")}
                        className="py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        1.5:1
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Redeeming BTC Section */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button 
                className="w-full px-5 py-3 bg-gray-800/80 flex justify-between items-center hover:bg-gray-700/80 transition-colors"
                onClick={() => toggleSection('redeeming')}
              >
                <span className="font-semibold text-yellow-300">Redeeming BTC from zBTC</span>
                <span className={`transform transition-transform ${expandedSections['redeeming'] ? 'rotate-90' : ''}`}>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </button>
              
              {expandedSections['redeeming'] && (
                <div className="p-5 bg-gray-800/40 animate-fadeIn">
                  <div className="bg-yellow-900/20 p-4 border border-yellow-500/30 rounded-lg mb-4">
                    <p className="text-yellow-300 font-medium">Redemption Process:</p>
                    <p className="text-gray-300">
                      The redemption process is the reverse of minting. You return zBTC and receive native BTC on the Bitcoin network.
                    </p>
                  </div>
                  
                  <div className="space-y-4 mb-5">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 mr-3">
                        <span className="block w-full h-full rounded-full bg-yellow-900/70 border border-yellow-500/40"></span>
                      </div>
                      <div>
                        <p className="text-white">Specify your Bitcoin address for receiving the BTC</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 mr-3 relative">
                        <span className="block w-full h-full rounded-full bg-yellow-900/70 border border-yellow-500/40"></span>
                        <div className="absolute top-1/2 left-0 w-6 h-0.5 bg-yellow-500/40 -translate-y-1/2"></div>
                      </div>
                      <div>
                        <p className="text-white">Burn zBTC from your Solana wallet</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 mr-3">
                        <span className="block w-full h-full rounded-full bg-yellow-900/70 border border-yellow-500/40"></span>
                      </div>
                      <div>
                        <p className="text-white">Receive BTC at your specified address</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => markProgress('exploredBTCBridge')}
                    className={`w-full py-2 rounded-lg transition-colors ${
                      progress.exploredBTCBridge 
                        ? 'bg-green-700/40 text-green-300' 
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {progress.exploredBTCBridge ? 'Explored ✓' : 'Explore Bridge Process'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Step Complete Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleStepComplete}
                className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
              >
                Next Step <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Liquidity Pools Section */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button 
                className="w-full px-5 py-3 bg-gray-800/80 flex justify-between items-center hover:bg-gray-700/80 transition-colors"
                onClick={() => toggleSection('liquidity')}
              >
                <span className="font-semibold text-yellow-300">zBTC Liquidity & DeFi Integration</span>
                <span className={`transform transition-transform ${expandedSections['liquidity'] ? 'rotate-90' : ''}`}>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </button>
              
              {expandedSections['liquidity'] && (
                <div className="p-5 bg-gray-800/40 animate-fadeIn">
                  <div className="mb-4">
                    <h4 className="font-semibold text-white mb-2">Solana DeFi Integration</h4>
                    <p>
                      As a standard SPL token, zBTC can be integrated with all Solana DeFi protocols, allowing you to:
                    </p>
                    <ul className="mt-2 space-y-1 pl-5 list-disc">
                      <li>Provide liquidity in AMM pools</li>
                      <li>Use as collateral in lending platforms</li>
                      <li>Participate in yield farming strategies</li>
                      <li>Trade on Solana DEXes</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-900/50 rounded-lg mb-4">
                    <h4 className="font-semibold text-yellow-300 mb-2">Sample Integration Code:</h4>
                    <pre className="bg-black/50 p-3 rounded-md text-xs overflow-x-auto">
                      <code className="text-gray-300">
{`// Use @solana/web3.js and @solana/spl-token
import { Connection, PublicKey } from '@solana/web3.js';
import { Token } from '@solana/spl-token';

// zBTC token address (example)
const zBTC_ADDRESS = new PublicKey('zbTC1111111111111111111111111111111');

// Initialize zBTC token
const zbtcToken = new Token(
  connection,
  zBTC_ADDRESS,
  TOKEN_PROGRAM_ID,
  payerAccount
);

// Get zBTC balance
const zbtcAccount = await zbtcToken.getAccountInfo(walletAddress);
console.log(\`zBTC Balance: \${zbtcAccount.amount.toNumber() / 10**8}\`);`}
                      </code>
                    </pre>
                  </div>
                  
                  <p className="text-sm text-gray-400 italic">
                    Note: The actual zBTC token address will be different. Always verify addresses from official sources.
                  </p>
                </div>
              )}
            </div>
            
            {/* Security Section */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <button 
                className="w-full px-5 py-3 bg-gray-800/80 flex justify-between items-center hover:bg-gray-700/80 transition-colors"
                onClick={() => toggleSection('security')}
              >
                <span className="font-semibold text-yellow-300">Security & Audit Features</span>
                <span className={`transform transition-transform ${expandedSections['security'] ? 'rotate-90' : ''}`}>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </button>
              
              {expandedSections['security'] && (
                <div className="p-5 bg-gray-800/40 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <h4 className="font-semibold text-white mb-2">Multi-Signature Control</h4>
                      <p className="text-sm text-gray-400">
                        The Zeus Network utilizes multi-signature security for critical operations, requiring multiple approvals for any protocol changes.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <h4 className="font-semibold text-white mb-2">Security Audits</h4>
                      <p className="text-sm text-gray-400">
                        The protocol undergoes regular security audits from leading blockchain security firms.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <h4 className="font-semibold text-white mb-2">Transparent Reserves</h4>
                      <p className="text-sm text-gray-400">
                        All BTC reserves backing zBTC are visible on the Bitcoin blockchain, ensuring full transparency.
                      </p>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <h4 className="font-semibold text-white mb-2">Slippage Protection</h4>
                      <p className="text-sm text-gray-400">
                        Advanced measures to protect users from front-running and unexpected slippage during transactions.
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => markProgress('reviewedSecurityFeatures')}
                    className={`w-full py-2 rounded-lg transition-colors ${
                      progress.reviewedSecurityFeatures 
                        ? 'bg-green-700/40 text-green-300' 
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {progress.reviewedSecurityFeatures ? 'Reviewed ✓' : 'Review Security Features'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Step Complete Button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleStepComplete}
                className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
              >
                Next Step <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 p-5 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-yellow-300">Complete the Quest</h3>
              <p className="mb-4">
                You've explored the APOLLO Exchange and learned how it enables seamless movement between BTC and zBTC. Now it's time to complete the quest and claim your rewards.
              </p>
              
              <div className="bg-gray-800/80 rounded-lg p-4 mb-5">
                <h4 className="font-semibold text-white mb-2">Quest Summary</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className={`inline-block w-5 h-5 rounded-full mr-3 flex items-center justify-center ${hasInteractedWithAll ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                      {hasInteractedWithAll ? '✓' : '!'}
                    </span>
                    <span className={hasInteractedWithAll ? 'text-gray-300' : 'text-gray-500'}>
                      Explored at least two sections
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className={`inline-block w-5 h-5 rounded-full mr-3 flex items-center justify-center ${currentStep >= 3 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                      {currentStep >= 3 ? '✓' : '!'}
                    </span>
                    <span className={currentStep >= 3 ? 'text-gray-300' : 'text-gray-500'}>
                      Completed all tutorial steps
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  Review Again
                </button>
                
                <button 
                  onClick={handleCompleteQuest}
                  disabled={isCompleting || !hasInteractedWithAll}
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