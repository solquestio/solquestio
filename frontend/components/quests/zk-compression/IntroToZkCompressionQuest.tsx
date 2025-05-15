'use client';

import React, { useState } from 'react';
import { SparklesIcon, LightBulbIcon, ArrowTrendingUpIcon, ShieldCheckIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface IntroToZkCompressionQuestProps {
  onQuestComplete: () => void;
  title: string;
  xpReward?: number;
}

export const IntroToZkCompressionQuest: React.FC<IntroToZkCompressionQuestProps> = ({ 
  onQuestComplete, 
  title, 
  xpReward = 200
}) => {
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const handleComplete = () => {
    setShowSuccessAnimation(true);
    setTimeout(() => {
      onQuestComplete();
    }, 2000);
  };
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-lg text-gray-200 relative overflow-hidden">
      {/* Animated background gradient */}
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
          <SparklesIcon className="h-7 w-7 text-purple-400 mr-3" />
          <h2 className="text-2xl font-bold text-solana-purple">{title}</h2>
        </div>
        {xpReward !== undefined && (
          <div className="bg-purple-900/40 px-3 py-1 rounded-full border border-purple-500/50 text-purple-300 font-semibold flex items-center">
            <span className="text-yellow-400 mr-1">+{xpReward}</span> XP
          </div>
        )}
      </div>
      
      <div className="space-y-6 text-gray-300 relative z-10">
        <div className="bg-gray-800/50 p-5 rounded-lg border-l-4 border-blue-500 shadow-md">
          <p className="text-lg">
            Welcome to the world of ZK Compression on Solana! This groundbreaking technology is changing how we think about on-chain data and scalability.
          </p>
        </div>
        
        <div className="bg-gray-800/50 p-5 rounded-lg hover:shadow-md transition-all duration-300">
          <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
            <LightBulbIcon className="h-6 w-6 text-yellow-400 mr-2" />
            What is ZK Compression?
          </h3>
          <p>
            Zero-Knowledge (ZK) Compression allows developers to store certain types of on-chain state in a highly compressed format. Imagine significantly reducing the cost of storing data directly on the Solana blockchain, without sacrificing security or the ability to interact with it as if it were uncompressed.
          </p>
          <div className="mt-3 bg-gray-900/50 p-3 rounded border border-gray-700/50">
            <p className="text-sm text-gray-400">
              This is achieved by using ZK proofs to verify the integrity and authenticity of the compressed state off-chain, with only a small commitment stored on-chain.
            </p>
          </div>
        </div>
        
        <div 
          className={`bg-gray-800/50 rounded-lg transition-all duration-300 overflow-hidden ${
            expandedSection === 'importance' ? 'shadow-lg border border-purple-500/20' : 'cursor-pointer hover:bg-gray-800/70'
          }`}
          onClick={() => toggleSection('importance')}
        >
          <div className="p-5">
            <h3 className="text-xl font-semibold text-white flex items-center justify-between">
              <span className="flex items-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-solana-green mr-2" />
                Why is it important?
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${expandedSection === 'importance' ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </h3>
            
            {expandedSection === 'importance' && (
              <div className="mt-4 space-y-4 animate-fadeIn">
                <div className="bg-gradient-to-r from-green-900/20 to-gray-800/30 p-4 rounded-lg border-l-4 border-green-500 transform transition-all hover:scale-[1.01] duration-200">
                  <h4 className="font-semibold text-green-400 mb-1">Massive Cost Reduction</h4>
                  <p className="text-gray-300">
                    Storing data on Solana (or any blockchain) costs SOL. ZK compression can reduce these storage costs by orders of magnitude (100x, 1000x, or even more for certain use cases!). This makes many previously unfeasible applications economically viable.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-gray-800/30 p-4 rounded-lg border-l-4 border-blue-500 transform transition-all hover:scale-[1.01] duration-200">
                  <h4 className="font-semibold text-blue-400 mb-1">Scalability for Mass Adoption</h4>
                  <p className="text-gray-300">
                    Think about applications that need to manage millions or even billions of items on-chain, like widespread NFT ticketing, loyalty programs with vast user bases, or granular supply chain tracking. ZK compression unlocks this level of scale.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-900/20 to-gray-800/30 p-4 rounded-lg border-l-4 border-purple-500 transform transition-all hover:scale-[1.01] duration-200">
                  <h4 className="font-semibold text-purple-400 mb-1">Preserves L1 Security & Composability</h4>
                  <p className="text-gray-300">
                    Unlike some L2 solutions, ZK compression leverages the full security and composability of the Solana L1. Compressed state can still interact seamlessly with other Solana programs and assets.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 p-5 rounded-lg shadow-md border border-gray-700/50">
          <p>
            In this path, you'll learn more about how ZK compression works, explore its use cases (like compressed NFTs and compressed Tokens), and understand how it can be used to build innovative and highly scalable applications on Solana.
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <ShieldCheckIcon className="h-5 w-5 text-solana-green" />
            <p className="font-semibold text-gray-100">
              Ready to dive deeper? Review the information above.
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleComplete}
        className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        I've Read and Understood!
      </button>
      
      {/* External resources */}
      <div className="mt-6 border-t border-gray-700 pt-4 text-sm text-gray-400">
        <p>Learn more about ZK Compression:</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <a 
            href="https://www.helius.dev/blog/zk-compression-keynote-breakpoint-2024" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-solana-green hover:text-solana-green-light underline hover:no-underline transition-all flex items-center"
          >
            Helius: ZK Compression Guide
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <span>•</span>
          <a 
            href="https://solana.com/developers/guides/javascript/compressed-nfts" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-solana-green hover:text-solana-green-light underline hover:no-underline transition-all flex items-center"
          >
            Solana Docs: Compressed NFTs
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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