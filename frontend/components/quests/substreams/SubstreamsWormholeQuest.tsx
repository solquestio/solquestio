'use client';
import React, { useState } from 'react';
import { ArrowPathRoundedSquareIcon, CheckCircleIcon, BeakerIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface SubstreamsWormholeQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const SubstreamsWormholeQuest: React.FC<SubstreamsWormholeQuestProps> = ({ onQuestComplete, xpReward = 250 }) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handleComplete = () => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
      setIsCompleted(true);
      setShowSuccessAnimation(true);
      
      setTimeout(() => {
        onQuestComplete();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-lg text-gray-200 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 to-blue-900/10 z-0"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl"></div>
      
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
          <ArrowPathRoundedSquareIcon className="h-7 w-7 text-emerald-400 mr-3" />
          <h3 className="text-2xl font-bold text-white">Wormhole Integration with Substreams</h3>
        </div>
        {xpReward !== undefined && (
          <div className="bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-500/50 text-emerald-300 font-semibold flex items-center">
            <span className="text-yellow-400 mr-1">+{xpReward}</span> XP
          </div>
        )}
      </div>
      
      <div className="text-gray-300 mb-6 space-y-4 relative z-10">
        <div className="bg-gray-800/50 p-5 rounded-lg border-l-4 border-emerald-500 shadow-md">
          <p className="text-lg flex items-start">
            <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
            <span>
              This quest will teach you how to create specialized Substreams for tracking Wormhole cross-chain messages on Solana.
            </span>
          </p>
        </div>

        <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 p-6 rounded-lg shadow-lg border border-gray-700/50">
          <div className="flex items-center mb-4">
            <BeakerIcon className="h-6 w-6 text-emerald-400 mr-2" />
            <h4 className="text-xl font-semibold text-white">Coming Soon!</h4>
          </div>
          
          <p className="text-gray-300 mb-4">
            We're currently developing this specialized quest to show you how to index and track Wormhole's cross-chain activity on Solana using Substreams.
          </p>
          
          <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700/50 mb-4">
            <p className="text-gray-300 mb-3 font-medium">
              Topics will include:
            </p>
            <ul className="space-y-3 pl-2">
              <li className="flex items-start transform transition-transform hover:translate-x-1 duration-200">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-blue-500/20 rounded-full mr-3 border border-blue-400/50 mt-1"></span>
                <span>Understanding Wormhole's architecture on Solana</span>
              </li>
              <li className="flex items-start transform transition-transform hover:translate-x-1 duration-200">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-green-500/20 rounded-full mr-3 border border-green-400/50 mt-1"></span>
                <span>Tracking token bridge transfers across chains</span>
              </li>
              <li className="flex items-start transform transition-transform hover:translate-x-1 duration-200">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-purple-500/20 rounded-full mr-3 border border-purple-400/50 mt-1"></span>
                <span>Indexing cross-chain NFT movements</span>
              </li>
              <li className="flex items-start transform transition-transform hover:translate-x-1 duration-200">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-emerald-500/20 rounded-full mr-3 border border-emerald-400/50 mt-1"></span>
                <span>Monitoring generic message passing</span>
              </li>
              <li className="flex items-start transform transition-transform hover:translate-x-1 duration-200">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-yellow-500/20 rounded-full mr-3 border border-yellow-400/50 mt-1"></span>
                <span>Creating dashboards for cross-chain analytics</span>
              </li>
            </ul>
          </div>
          
          <button
            onClick={handleComplete}
            disabled={isLoading || isCompleted}
            className={`bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </span>
            ) : isCompleted ? (
              <span className="flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-300" />
                Completed!
              </span>
            ) : (
              'Complete Quest (Preview)'
            )}
          </button>
          
          <div className="mt-5 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-md transform transition-all hover:scale-[1.01] duration-200">
            <p className="text-yellow-300 text-sm flex items-start">
              <span className="font-bold mr-2">💡</span>
              <span>
                <strong>Hackathon Tip:</strong> For the hackathon, building tools that track or visualize cross-chain activity via Wormhole can be highly valuable, especially for DeFi applications that need to monitor liquidity across multiple chains.
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-700 pt-4 text-sm text-gray-400 relative z-10">
        <p className="font-medium mb-2">Resources:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a 
            href="https://docs.wormhole.com/wormhole/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all group"
          >
            <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors flex-grow flex items-center">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Wormhole Documentation
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          
          <a 
            href="https://docs.substreams.dev/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all group"
          >
            <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors flex-grow flex items-center">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.5 3H5.5C4.11929 3 3 4.11929 3 5.5V9.5C3 10.8807 4.11929 12 5.5 12H9.5C10.8807 12 12 10.8807 12 9.5V5.5C12 4.11929 10.8807 3 9.5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.5 12H5.5C4.11929 12 3 13.1193 3 14.5V18.5C3 19.8807 4.11929 21 5.5 21H9.5C10.8807 21 12 19.8807 12 18.5V14.5C12 13.1193 10.8807 12 9.5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 3H14.5C13.1193 3 12 4.11929 12 5.5V9.5C12 10.8807 13.1193 12 14.5 12H18.5C19.8807 12 21 10.8807 21 9.5V5.5C21 4.11929 19.8807 3 18.5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18.5H14.5M19.5 18.5H21M17 16V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Substreams Documentation
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          
          <a 
            href="https://wormholescan.io/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all group"
          >
            <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors flex-grow flex items-center">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.5 13.933 8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 16.6944 7.30558 20.5 12 20.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Wormhole Explorer
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
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