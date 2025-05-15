'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SparklesIcon, CheckCircleIcon, LightBulbIcon, FireIcon, BookOpenIcon } from '@heroicons/react/24/solid';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
  xpReward?: number;
}

export const ZkHackathonBrainstormQuest: React.FC<QuestProps> = ({ onQuestComplete, title, xpReward = 500 }) => {
  const [idea, setIdea] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (idea.trim().length >= 50) {
      setIsSubmitting(true);
      
      // Simulate submission delay
      setTimeout(() => {
        setIsSubmitting(false);
        setShowSuccessAnimation(true);
        
        console.log("Hackathon Idea Submitted:", idea);
        // In a real app, you might save this idea to a backend or user state.
        
        setTimeout(() => {
          onQuestComplete();
        }, 2000);
      }, 1500);
    } else {
      alert("Please enter your innovative idea with at least 50 characters before submitting!");
    }
  };

  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-lg text-gray-200 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 z-0"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl"></div>
      
      {/* Success animation */}
      {showSuccessAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-blue-500/30 flex items-center justify-center z-10 animate-pulse">
          <div className="bg-gray-900/90 rounded-2xl p-8 flex flex-col items-center shadow-2xl transform animate-bounce-small">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Brilliant Idea Submitted!</h3>
            <p className="text-xl font-semibold text-green-400">+{xpReward} XP</p>
          </div>
        </div>
      )}
      
      {/* Header with XP reward */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center">
          <FireIcon className="h-7 w-7 text-orange-400 mr-3" />
          <h2 className="text-2xl font-bold text-solana-purple">{title}</h2>
        </div>
        {xpReward !== undefined && (
          <div className="bg-purple-900/40 px-3 py-1 rounded-full border border-purple-500/50 text-purple-300 font-semibold flex items-center">
            <span className="text-yellow-400 mr-1">+{xpReward}</span> XP
          </div>
        )}
      </div>
      
      <div className="space-y-5 text-gray-300 relative z-10">
        <div className="bg-gray-800/50 p-5 rounded-lg border-l-4 border-blue-500 shadow-md">
          <p className="text-lg">
            You've learned about the fundamentals of ZK Compression, explored its diverse use cases, familiarized yourself with the tools, and conceptualized what goes into a cNFT. Now it's time to get creative!
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/30 p-5 rounded-lg shadow-md">
          <p className="text-lg flex items-center">
            <SparklesIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
            <span>The core power of ZK Compression is enabling <span className="font-semibold text-white">massive scale at incredibly low cost, directly on Solana's L1</span>. This opens doors to applications previously unfeasible due to state rent and transaction costs.</span>
          </p>
        </div>

        <div className="p-5 border border-solana-purple/30 rounded-lg bg-purple-900/10 shadow-lg transform transition-all hover:scale-[1.01] duration-200">
          <h4 className="text-xl font-semibold text-solana-purple mb-3 flex items-center">
            <BookOpenIcon className="h-6 w-6 mr-2 text-solana-purple" />
            The 1000x Hackathon: ZK Compression Track
          </h4>
          
          <div className="mb-4 flex justify-center">
            <div className="relative w-full max-w-lg h-48 rounded-lg overflow-hidden">
              <Image 
                src="/1000x.png" 
                alt="1000x Hackathon" 
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg transform transition-all hover:scale-105 duration-500"
              />
            </div>
          </div>
          
          <p className="text-gray-300 mb-3">
            Remember the challenge: "Build innovative projects on Solana that use zero-knowledge compression to achieve new levels of scalability, privacy, and security. Projects must use compressed tokens or compressed accounts in some capacity."
          </p>
          <div className="bg-gray-900/50 p-3 rounded border border-gray-700/50">
            <p className="text-gray-300">
              Judges will be looking for:
              <span className="flex items-center mt-2">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span className="text-green-300 font-semibold">Functionality</span>
              </span>
              <span className="flex items-center mt-1">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                <span className="text-blue-300 font-semibold">Potential impact</span>
              </span>
              <span className="flex items-center mt-1">
                <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                <span className="text-purple-300 font-semibold">Novelty</span>
              </span>
              <span className="flex items-center mt-1">
                <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                <span className="text-yellow-300 font-semibold">Design</span>
              </span>
              <span className="flex items-center mt-1">
                <span className="inline-block w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                <span className="text-red-300 font-semibold">Extensibility</span>
              </span>
            </p>
          </div>
          <div className="mt-3 text-right">
            <a 
              href="https://earn.superteam.fun/listing/1000x-hackathon/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-solana-green hover:text-solana-green-light underline hover:no-underline transition-all flex items-center inline-block"
            >
              Hackathon Details
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <div className="bg-gray-800/50 p-5 rounded-lg shadow-md">
          <p className="mb-3">
            Think about what you've learned. What kind of project could you build for the 1000x Hackathon that truly showcases the power of ZK Compression?
          </p>
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 p-4 rounded-lg border border-gray-700/50">
            <h5 className="font-semibold text-white mb-2 flex items-center">
              <LightBulbIcon className="h-5 w-5 text-yellow-400 mr-2" />
              Consider these approaches:
            </h5>
            <ul className="space-y-3 pl-2">
              <li className="flex items-start transform transition-transform hover:translate-x-1 duration-200">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-green-500/20 rounded-full mr-3 border border-green-400/50 mt-1"></span>
                <span>A novel application not yet widely explored with compression.</span>
              </li>
              <li className="flex items-start transform transition-transform hover:translate-x-1 duration-200">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-blue-500/20 rounded-full mr-3 border border-blue-400/50 mt-1"></span>
                <span>An existing application type reimagined for massive scale thanks to cNFTs/cTokens.</span>
              </li>
              <li className="flex items-start transform transition-transform hover:translate-x-1 duration-200">
                <span className="flex-shrink-0 inline-block w-4 h-4 bg-purple-500/20 rounded-full mr-3 border border-purple-400/50 mt-1"></span>
                <span>A solution that significantly improves user experience or accessibility in a specific domain by leveraging low-cost, high-volume on-chain interactions.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 p-5 rounded-lg shadow-lg border border-gray-700/50 mt-6">
          <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
            <SparklesIcon className="h-6 w-6 text-yellow-400 mr-2" />
            Your Hackathon Idea:
          </h3>
          <p className="text-sm text-gray-400 mb-3">
            Briefly describe your project idea. What problem does it solve, or what new capability does it offer? How does ZK Compression make it uniquely feasible or impactful?
          </p>
          
          <textarea 
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Unleash your innovative ZK Compression hackathon idea here... Minimum 50 characters."
            className="w-full h-36 p-4 border border-gray-600 rounded-md bg-dark-input text-gray-200 focus:ring-2 focus:ring-solana-purple focus:border-transparent placeholder-gray-500 shadow-inner transition-all"
            minLength={50}
          />
          <div className="text-right mt-2 text-sm text-gray-400">
            {idea.length < 50 ? (
              <span className={`${idea.length >= 30 ? 'text-yellow-400' : idea.length >= 10 ? 'text-orange-500' : 'text-red-400'}`}>
                {50 - idea.length} more characters required
              </span>
            ) : (
              <span className="text-green-400">
                ✓ Ready to submit!
              </span>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={idea.trim().length < 50 || isSubmitting}
        className={`mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto ${isSubmitting ? 'opacity-70' : ''}`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting Idea...
          </span>
        ) : (
          'Submit My Brilliant Idea!'
        )}
      </button>
      
      {/* External resources */}
      <div className="mt-6 border-t border-gray-700 pt-4 text-sm text-gray-400">
        <p>Resources for inspiration:</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <a 
            href="https://www.helius.dev/blog/zk-compression-keynote-breakpoint-2024" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-solana-green hover:text-solana-green-light underline hover:no-underline transition-all flex items-center"
          >
            Helius: ZK Compression Use Cases
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <span>•</span>
          <a 
            href="https://solana.com/news/compressed-nfts-light-protocol" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-solana-green hover:text-solana-green-light underline hover:no-underline transition-all flex items-center"
          >
            Solana: cNFTs & Light Protocol
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