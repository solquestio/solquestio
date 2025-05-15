'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SparklesIcon, CheckCircleIcon, LightBulbIcon, FireIcon, BookOpenIcon } from '@heroicons/react/24/solid';
import { QuestHeader, QuestCompletionAnimation } from '@/components/common/QuestHeader';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
  xpReward?: number;
}

export const IntroToZeusBtcQuest: React.FC<QuestProps> = ({ onQuestComplete, title, xpReward = 200 }) => {
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [hasReadContent, setHasReadContent] = useState(false);

  const handleMarkAsRead = () => {
    setHasReadContent(true);
  };

  const handleCompleteQuest = () => {
    if (!hasReadContent) {
      alert("Please read through the content and mark it as read before completing the quest.");
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
      <QuestCompletionAnimation show={showSuccessAnimation} xpReward={xpReward} />
      
      {/* Header with XP reward */}
      <QuestHeader 
        title={title} 
        xpReward={xpReward} 
        icon={<SparklesIcon className="h-7 w-7 text-yellow-500 mr-3" />}
      />
      
      <div className="space-y-6 text-gray-300 relative z-10">
        {/* Introduction section */}
        <div className="bg-gray-800/50 p-5 rounded-lg border-l-4 border-yellow-500 shadow-md">
          <p className="text-lg">
            Welcome to the Bitcoin on Solana learning path! In this quest, you'll learn about Zeus Network and how it enables Bitcoin interoperability on Solana through zBTC.
          </p>
        </div>
        
        {/* Zeus Network Logo and Info */}
        <div className="flex justify-center mb-4">
          <div className="w-full max-w-md p-4 bg-gray-800/80 rounded-lg shadow-md border border-gray-700">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2 text-yellow-300">Zeus Network</h3>
              <p className="text-gray-300 mb-4">
                A multichain layer built on Solana, enabling permissionless Bitcoin interoperability across leading blockchain ecosystems.
              </p>
              <div className="flex justify-center mb-4">
                <span className="inline-block px-3 py-1 bg-yellow-900/50 text-yellow-300 rounded-full text-sm font-semibold">
                  <SparklesIcon className="h-4 w-4 inline mr-1" />
                  Bitcoin + Solana
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* What is Zeus Network */}
        <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/30 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-white">What is Zeus Network?</h3>
          <p className="mb-4">
            Zeus Network is a multichain layer built on Solana that enables permissionless Bitcoin interoperability across leading blockchain ecosystems. Its first dApp, APOLLO, is now live, introducing 1:1 pegged zBTC on Solana, unlocking seamless Bitcoin liquidity.
          </p>
          <p>
            The network is set to expand, integrating other UTXO-based assets like LTC and DOGE on Solana. The Zeus Program Library (ZPL) is the SDK for builders to develop Bitcoin dApps on Solana.
          </p>
        </div>

        {/* APOLLO Section */}
        <div className="p-5 border border-yellow-500/30 rounded-lg bg-yellow-900/10 shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-white">APOLLO: The Bitcoin On-Chain Exchange</h3>
          <p className="mb-4">
            APOLLO, the first dApp on ZPL (Zeus Program Library), leverages Zeus Network's permissionless cross-chain infrastructure. It allows Bitcoin holders to manage their BTC across chains with two main functions:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Lock BTC on Bitcoin to mint zBTC on Solana</li>
            <li>Return zBTC on Solana to unlock BTC on Bitcoin</li>
          </ul>
          <div className="flex justify-end">
            <a 
              href="https://apollo.zeusnetwork.io/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition-colors underline hover:no-underline flex items-center"
            >
              Launch APOLLO dApp
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* zBTC Section */}
        <div className="bg-gray-800/50 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-white">Understanding zBTC</h3>
          <p className="mb-3">
            Each zBTC follows the ZPL-asset standard and is pegged 1:1 with native BTC, which stays transparently locked on the Bitcoin network.
          </p>
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 p-4 rounded-lg border border-gray-700/50 mb-4">
            <h4 className="font-semibold text-white mb-2 flex items-center">
              <SparklesIcon className="h-5 w-5 text-yellow-400 mr-2" />
              Key Advantages of zBTC:
            </h4>
            <ul className="space-y-3 pl-2">
              <li className="flex items-start">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-yellow-500/20 rounded-full mr-3 border border-yellow-400/50 mt-1"></span>
                <span><span className="font-bold text-yellow-300">Programmable:</span> Seamlessly integrates with the Solana ecosystem.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-yellow-500/20 rounded-full mr-3 border border-yellow-400/50 mt-1"></span>
                <span><span className="font-bold text-yellow-300">Decentralized:</span> Full ownership of assets across both Bitcoin and Solana networks.</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-yellow-500/20 rounded-full mr-3 border border-yellow-400/50 mt-1"></span>
                <span><span className="font-bold text-yellow-300">No-KYC:</span> Unrestricted minting of zBTC and withdrawal of BTC.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Resources Section */}
        <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/30 p-5 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-white">Key Resources</h3>
          <ul className="space-y-3">
            <li>
              <a 
                href="https://zeusnetwork.io/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 transition-colors underline hover:no-underline flex items-center"
              >
                Zeus Network Website
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </li>
            <li>
              <a 
                href="https://docs.zeusnetwork.io/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 transition-colors underline hover:no-underline flex items-center"
              >
                Zeus Network Documentation
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </li>
            <li>
              <a 
                href="https://github.com/zeus-network" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 transition-colors underline hover:no-underline flex items-center"
              >
                Zeus Program Library (ZPL)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
        
        {/* Mark as Read Button */}
        <div className="flex justify-between items-center">
          <button 
            onClick={handleMarkAsRead}
            disabled={hasReadContent}
            className={`px-4 py-2 rounded-lg transition-all ${hasReadContent ? 'bg-green-700/50 text-green-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {hasReadContent ? 'Content Read ✓' : 'Mark as Read'}
          </button>
          
          <button 
            onClick={handleCompleteQuest}
            disabled={isCompleting || !hasReadContent}
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