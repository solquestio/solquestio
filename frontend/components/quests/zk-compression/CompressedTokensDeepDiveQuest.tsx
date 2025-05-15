'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ArrowPathIcon, BeakerIcon, LightBulbIcon } from '@heroicons/react/24/solid';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
  xpReward?: number;
}

export const CompressedTokensDeepDiveQuest: React.FC<QuestProps> = ({ onQuestComplete, title, xpReward = 350 }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [step, setStep] = useState(1);
  const [commandOutput, setCommandOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  
  // Sample terminal command output with typing effect
  const simulateCommand = () => {
    setIsLoading(true);
    setIsTerminalVisible(true);
    
    let output = `> yarn create-ctoken my-compressed-token MCT 6\n\n`;
    let currentOutput = '';
    let outputIndex = 0;
    
    const fullOutput = `${output}🔄 Creating compressed token...\n✅ Merkle tree created: 3Z7A8mrYKnqhMLGbJvuBaVvR9xZTFqLdHFZJk6W9Qy7G\n✅ Mint authority: 8p6zRXKEFS5hHQAjpZXJ1HJpdzPNX4Qf3tKZbKNzvMZF\n✅ Token created with metadata:\n   Name: my-compressed-token\n   Symbol: MCT\n   Decimals: 6\n✅ Compressed token address: EpZ5b6J6BEDafXNBTPYv3aTiV8qBCHC1YRgKPUMVJbhH\n\n🔥 Success! Your compressed token is ready to use.`;
    
    // Simulate typing effect
    const typingInterval = setInterval(() => {
      if (outputIndex < fullOutput.length) {
        currentOutput += fullOutput[outputIndex];
        setCommandOutput(currentOutput);
        outputIndex++;
      } else {
        clearInterval(typingInterval);
        setIsLoading(false);
      }
    }, 20);
  };
  
  // Quiz questions to test understanding
  const quizQuestion = {
    question: "Which protocol is commonly used for cToken operations on Solana?",
    options: [
      "Metaplex",
      "Light Protocol",
      "Solend",
      "Jupiter"
    ],
    correctAnswer: "Light Protocol",
    hint: "This protocol specializes in zero-knowledge proofs and compression technology on Solana."
  };
  
  const handleSubmitAnswer = () => {
    setSubmittedAnswer(selectedAnswer);
    
    // If correct answer and in step 2, show success animation and complete the quest
    if (selectedAnswer === quizQuestion.correctAnswer && step === 2) {
      setShowSuccessAnimation(true);
      setTimeout(() => {
        onQuestComplete();
      }, 2000);
    }
  };
  
  const handleNextStep = () => {
    setStep(2);
    setCommandOutput(null);
    setIsTerminalVisible(false);
  };
  
  // Auto-hide the terminal after showing full output
  useEffect(() => {
    if (commandOutput && commandOutput.includes("Success!") && !isLoading) {
      const timer = setTimeout(() => {
        setIsTerminalVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [commandOutput, isLoading]);
  
  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-lg text-gray-200 relative overflow-hidden">
      {/* Animated success overlay */}
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
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-2xl font-bold text-solana-purple">{title}</h2>
        {xpReward !== undefined && (
          <div className="bg-purple-900/40 px-3 py-1 rounded-full border border-purple-500/50 text-purple-300 font-semibold flex items-center">
            <span className="text-yellow-400 mr-1">+{xpReward}</span> XP
          </div>
        )}
      </div>
      
      {step === 1 ? (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
              <BeakerIcon className="w-6 h-6 mr-2 text-solana-green" />
              Understanding cTokens
            </h3>
            
            <div className="text-gray-300 mb-6 space-y-3">
              <p className="flex items-start">
                <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
                <span>
                  Compressed tokens (cTokens) offer scalable token transactions with minimal storage costs. They're a game-changer for Solana's scalability.
                </span>
              </p>
              
              <p className="flex items-start">
                <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
                <span>
                  With compression, what previously took 3 kilobytes per token holder can now fit thousands in the same space.
                </span>
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 p-5 rounded-lg mb-6 border-l-4 border-solana-green shadow-lg">
              <h4 className="text-lg font-medium text-white mb-3">Key Benefits of cTokens:</h4>
              <ul className="list-none space-y-3 pl-2">
                <li className="flex items-center">
                  <span className="flex-shrink-0 inline-block w-4 h-4 bg-green-500/20 rounded-full mr-3 border border-green-400/50"></span>
                  <span><span className="text-green-400 font-semibold">10-100x lower costs</span> for token creation and transfers</span>
                </li>
                <li className="flex items-center">
                  <span className="flex-shrink-0 inline-block w-4 h-4 bg-green-500/20 rounded-full mr-3 border border-green-400/50"></span>
                  <span><span className="text-green-400 font-semibold">Massive scalability</span> for millions of token holders</span>
                </li>
                <li className="flex items-center">
                  <span className="flex-shrink-0 inline-block w-4 h-4 bg-green-500/20 rounded-full mr-3 border border-green-400/50"></span>
                  <span><span className="text-green-400 font-semibold">Full compatibility</span> with standard SPL tokens</span>
                </li>
                <li className="flex items-center">
                  <span className="flex-shrink-0 inline-block w-4 h-4 bg-green-500/20 rounded-full mr-3 border border-green-400/50"></span>
                  <span><span className="text-green-400 font-semibold">Same security guarantees</span> as the Solana L1</span>
                </li>
              </ul>
            </div>
            
            <h4 className="text-lg font-medium text-white mb-3 mt-6 flex items-center">
              <span className="mr-2">💻</span> Creating a cToken (Command Line Example)
            </h4>
            <p className="mb-3 text-sm text-gray-300">Click the button to see what creating a cToken looks like:</p>
            
            <div className="relative mb-6">
              <button 
                onClick={simulateCommand}
                disabled={isLoading}
                className={`bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 mb-2 flex items-center transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}`}
              >
                {isLoading && <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? 'Running...' : 'Run Example Command'}
              </button>
              
              {isTerminalVisible && (
                <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm whitespace-pre-wrap border border-gray-700 mb-4 shadow-inner transform transition-all duration-500 ease-in-out">
                  {commandOutput}
                </div>
              )}
            </div>
            
            <h4 className="text-lg font-medium text-white mb-3 mt-6 flex items-center">
              <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-400" />
              How cTokens Work Behind the Scenes:
            </h4>
            <div className="relative overflow-hidden my-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 p-5 rounded-lg border border-gray-700/50 shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full filter blur-3xl"></div>
              <ol className="list-decimal list-inside space-y-3 pl-2 relative z-10">
                <li className="transform transition-transform hover:translate-x-1 duration-200">
                  Token data is stored as leaves in a <span className="text-yellow-300 font-semibold">merkle tree</span>
                </li>
                <li className="transform transition-transform hover:translate-x-1 duration-200">
                  Only the <span className="text-yellow-300 font-semibold">root hash</span> is stored on-chain
                </li>
                <li className="transform transition-transform hover:translate-x-1 duration-200">
                  Transfers update leaves and generate <span className="text-yellow-300 font-semibold">ZK proofs</span>
                </li>
                <li className="transform transition-transform hover:translate-x-1 duration-200">
                  Proofs verify transfers without storing full account data
                </li>
              </ol>
            </div>
            
            <button 
              onClick={handleNextStep}
              className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              Continue to Quiz
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
              <span className="text-2xl mr-2">🧠</span>
              Test Your Knowledge
            </h3>
            <p className="mb-5 text-gray-300">Answer the following question correctly to complete this quest:</p>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-lg mb-6 shadow-lg border border-gray-700/50">
              <h4 className="text-lg font-medium text-white mb-4">{quizQuestion.question}</h4>
              
              <div className="space-y-3">
                {quizQuestion.options.map((option) => (
                  <div 
                    key={option} 
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      selectedAnswer === option ? 'bg-purple-900/40 border border-purple-500/50' : 'hover:bg-gray-700/50'
                    } ${
                      submittedAnswer && option === quizQuestion.correctAnswer ? 'bg-green-900/20 border border-green-500/50' : ''
                    }`}
                    onClick={() => setSelectedAnswer(option)}
                  >
                    <div className={`w-5 h-5 rounded-full border flex-shrink-0 mr-3 flex items-center justify-center ${
                      selectedAnswer === option ? 'border-purple-400 bg-purple-500/30' : 'border-gray-500'
                    } ${
                      submittedAnswer && option === quizQuestion.correctAnswer ? 'border-green-400 bg-green-500/30' : ''
                    }`}>
                      {selectedAnswer === option && (
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
                      )}
                      {submittedAnswer && option === quizQuestion.correctAnswer && (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                      )}
                    </div>
                    <label htmlFor={option} className="cursor-pointer flex-grow">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              
              {submittedAnswer && submittedAnswer !== quizQuestion.correctAnswer && (
                <div className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/30">
                  <p>That's not quite right. Try again!</p>
                </div>
              )}
              
              {submittedAnswer && submittedAnswer === quizQuestion.correctAnswer && (
                <div className="mt-4 text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                  <p>Correct! Light Protocol is a leading protocol for compressed token operations on Solana.</p>
                </div>
              )}
              
              <div className="mt-4 flex items-center space-x-3">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-gray-400 hover:text-white underline flex items-center"
                >
                  <LightBulbIcon className="w-4 h-4 mr-1" />
                  {showHint ? "Hide Hint" : "Show Hint"}
                </button>
                
                {showHint && (
                  <div className="text-xs text-gray-400 bg-gray-800/70 p-2 rounded-md border border-gray-700">
                    {quizQuestion.hint}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setStep(1)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Back
              </button>
              
              <button 
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className={`bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex-grow ${!selectedAnswer ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}`}
              >
                Submit Answer
              </button>
            </div>
          </div>
        </>
      )}
      
      <div className="mt-6 border-t border-gray-700 pt-4 text-sm text-gray-400">
        <p>Want to learn more about cTokens?</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <a 
            href="https://docs.lightprotocol.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-solana-green hover:text-solana-green-light underline hover:no-underline transition-all flex items-center"
          >
            Light Protocol Docs
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <span>•</span>
          <a 
            href="https://www.helius.dev/blog/zk-compression-keynote-breakpoint-2024" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-solana-green hover:text-solana-green-light underline hover:no-underline transition-all flex items-center"
          >
            Helius: Compression Guide
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Add custom CSS for small bounce animation */}
      <style jsx global>{`
        @keyframes bounce-small {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-small {
          animation: bounce-small 2s infinite;
        }
      `}</style>
    </div>
  );
}; 