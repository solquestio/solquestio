'use client';
import React, { useState } from 'react';

interface SubstreamsAIQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const SubstreamsAIQuest: React.FC<SubstreamsAIQuestProps> = ({ onQuestComplete, xpReward }) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleComplete = () => {
    setIsCompleted(true);
    onQuestComplete();
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">AI Integration with Substreams</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            This quest will teach you how to integrate Substreams data with AI models to create intelligent applications.
          </span>
        </p>
      </div>

      <div className="p-6 bg-dark-card-secondary rounded-lg mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Coming Soon!</h4>
        <p className="text-gray-300">
          We're currently developing this exciting quest to show you how to combine Solana blockchain data from Substreams with AI models.
        </p>
        <p className="text-gray-300 mt-4">
          Topics will include:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-300">
          <li>Feeding Substreams data to machine learning models</li>
          <li>Using AI to detect patterns and anomalies in blockchain data</li>
          <li>Building predictive models for token prices or user behavior</li>
          <li>Implementing language models to summarize on-chain activity</li>
        </ul>
        
        <button
          onClick={handleComplete}
          className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          {isCompleted ? "Completed!" : "Complete Quest (Preview)"}
        </button>
        
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-md">
          <p className="text-yellow-300 text-sm">
            <strong>💡 Hackathon Tip:</strong> For the hackathon, integrating AI with your Substreams data can make your project stand out. Consider using LLMs to analyze transaction patterns or implement anomaly detection.
          </p>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>Resources:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><a href="https://docs.substreams.dev/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams Documentation</a></li>
          <li><a href="https://platform.openai.com/docs/introduction" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">OpenAI API Documentation</a></li>
        </ul>
      </div>
    </div>
  );
}; 