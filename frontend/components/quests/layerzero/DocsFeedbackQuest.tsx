'use client';
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface DocsFeedbackQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const DocsFeedbackQuest: React.FC<DocsFeedbackQuestProps> = ({ onQuestComplete, xpReward }) => {
  const { publicKey } = useWallet();
  
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    overview: false,
    contracts: false,
    examples: false,
    advanced: false,
  });
  const [feedback, setFeedback] = useState<string>('');
  
  const handleDocsCheck = (key: string) => {
    setCheckedDocs({
      ...checkedDocs,
      [key]: !checkedDocs[key]
    });
  };
  
  const allDocsChecked = Object.values(checkedDocs).every(Boolean);
  
  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  };
  
  const handleSubmitFeedback = () => {
    if (!feedback.trim()) {
      setStatus('Error: Please provide some feedback before submitting.');
      return;
    }
    
    setIsLoading(true);
    setStatus('Submitting your feedback...');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setFeedbackSubmitted(true);
      setStatus('Feedback submitted successfully!');
      
      // If all docs are also checked, complete the quest
      if (allDocsChecked) {
        setIsCompleted(true);
        onQuestComplete();
      }
    }, 1500);
  };
  
  const handleOpenFeedbackForm = () => {
    window.open('https://layerzeronetwork.typeform.com/builderFeedback', '_blank');
  };
  
  const handleCompleteQuest = () => {
    if (!allDocsChecked) {
      setStatus('Error: Please review all documentation sections first.');
      return;
    }
    
    if (!feedbackSubmitted) {
      setStatus('Error: Please submit your feedback to complete this quest.');
      return;
    }
    
    setIsCompleted(true);
    onQuestComplete();
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Quest 7: Documentation & Feedback</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            This quest is critical for hackathon participation. LayerZero requires all participants to review documentation 
            and submit valuable feedback to improve their developer experience.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>Important:</strong> Submitting the official feedback form is a requirement for your hackathon entry to be considered.
            The best feedback submissions will also be eligible for $100 USDC prizes.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>Goal:</strong> Explore the LayerZero V2 documentation thoroughly, check out example implementations, and provide 
            constructive feedback on your experience with the tooling and documentation.
          </span>
        </p>
      </div>
      
      <div className="space-y-6 bg-dark-card-secondary p-6 rounded-lg">
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">1. Review Documentation</h4>
          <p className="text-gray-400 mb-3">
            Explore the following key sections of the LayerZero V2 documentation to understand the protocol thoroughly.
            Check each box after reviewing the corresponding section:
          </p>
          
          <div className="space-y-3 mt-4">
            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="overview" 
                className="mt-1 h-4 w-4 text-solana-purple border-gray-600 rounded bg-gray-800 focus:ring-solana-purple"
                checked={checkedDocs.overview}
                onChange={() => handleDocsCheck('overview')}
                disabled={isCompleted}
              />
              <label htmlFor="overview" className="ml-2 block text-gray-300">
                <a 
                  href="https://docs.layerzero.network/v2/developers/overview" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  LayerZero V2 Overview & Architecture
                </a>
                <span className="block text-xs text-gray-500 mt-1">
                  Understand the core components, message flow, and protocol architecture.
                </span>
              </label>
            </div>
            
            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="contracts" 
                className="mt-1 h-4 w-4 text-solana-purple border-gray-600 rounded bg-gray-800 focus:ring-solana-purple"
                checked={checkedDocs.contracts}
                onChange={() => handleDocsCheck('contracts')}
                disabled={isCompleted}
              />
              <label htmlFor="contracts" className="ml-2 block text-gray-300">
                <a 
                  href="https://docs.layerzero.network/v2/deployments/deployed-contracts" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Deployed Contracts & Network Info
                </a>
                <span className="block text-xs text-gray-500 mt-1">
                  Review the contract addresses and endpoint IDs for Solana and other networks.
                </span>
              </label>
            </div>
            
            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="examples" 
                className="mt-1 h-4 w-4 text-solana-purple border-gray-600 rounded bg-gray-800 focus:ring-solana-purple"
                checked={checkedDocs.examples}
                onChange={() => handleDocsCheck('examples')}
                disabled={isCompleted}
              />
              <label htmlFor="examples" className="ml-2 block text-gray-300">
                <a 
                  href="https://github.com/LayerZero-Labs/devtools/tree/main/examples/oft-solana" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Solana OFT Examples
                </a>
                <span className="block text-xs text-gray-500 mt-1">
                  Explore the example implementations for Omnichain Fungible Tokens on Solana.
                </span>
              </label>
            </div>
            
            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="advanced" 
                className="mt-1 h-4 w-4 text-solana-purple border-gray-600 rounded bg-gray-800 focus:ring-solana-purple"
                checked={checkedDocs.advanced}
                onChange={() => handleDocsCheck('advanced')}
                disabled={isCompleted}
              />
              <label htmlFor="advanced" className="ml-2 block text-gray-300">
                <a 
                  href="https://docs.layerzero.network/v2/developers/guides/send-a-message" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Advanced Messaging & Guides
                </a>
                <span className="block text-xs text-gray-500 mt-1">
                  Learn about message configuration, fees, and specialized use cases.
                </span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-700">
          <h4 className="text-xl font-semibold text-white mb-4">2. Submit Feedback</h4>
          <p className="text-gray-400 mb-3">
            After reviewing the documentation, please provide your feedback on your experience with the 
            LayerZero V2 tooling, documentation, and examples. What worked well? What was challenging? 
            What improvements would you suggest?
          </p>
          
          <div className="mb-4">
            <textarea
              value={feedback}
              onChange={handleFeedbackChange}
              disabled={isCompleted || feedbackSubmitted}
              placeholder="Enter your feedback here..."
              className="w-full h-32 bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
            />
          </div>
          
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            <button
              onClick={handleSubmitFeedback}
              disabled={!feedback.trim() || isLoading || isCompleted || feedbackSubmitted}
              className="bg-solana-purple text-white px-4 py-2 rounded-md hover:bg-solana-purple-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : feedbackSubmitted ? (
                'Feedback Submitted ✓'
              ) : (
                'Submit Feedback (Demo)'
              )}
            </button>
            
            <button
              onClick={handleOpenFeedbackForm}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Open Official Feedback Form
            </button>
          </div>
          
          <div className="mt-3 text-xs text-yellow-400">
            <strong>Note:</strong> For hackathon participation, you must submit feedback through the official form linked above.
            The demo submission here is just for this quest's completion.
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-700">
          <h4 className="text-xl font-semibold text-white mb-4">3. Complete Quest</h4>
          
          <div className="flex flex-col space-y-2">
            <div className={`p-2 rounded ${allDocsChecked ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
              <span className="flex items-center">
                {allDocsChecked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                )}
                Documentation Review: {allDocsChecked ? 'Complete' : 'Incomplete'}
              </span>
            </div>
            
            <div className={`p-2 rounded ${feedbackSubmitted ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
              <span className="flex items-center">
                {feedbackSubmitted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                )}
                Feedback Submission: {feedbackSubmitted ? 'Complete' : 'Incomplete'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleCompleteQuest}
            disabled={!allDocsChecked || !feedbackSubmitted || isCompleted}
            className="w-full mt-4 bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompleted ? 'Quest Completed!' : 'Complete Quest'}
          </button>
        </div>
      </div>

      {status && (
        <div className={`mt-4 p-3 rounded-md text-sm ${status.startsWith('Error:') ? 'bg-red-700/30 text-red-300' : 'bg-blue-700/30 text-blue-300'}`}>
          {status}
        </div>
      )}

      {isCompleted && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <h4 className="text-green-400 font-semibold mb-2">Quest Completed!</h4>
          <p className="text-gray-300 text-sm">
            Excellent work! You've explored the LayerZero V2 documentation and provided valuable feedback.
            Remember that submitting feedback through the official form is a requirement for the LayerZero 
            Solana Breakout Track hackathon. Your insights will help improve the platform for all developers.
          </p>
        </div>
      )}
    </div>
  );
}; 