'use client';
import React, { useState } from 'react';

interface SubstreamsAnalyticsQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const SubstreamsAnalyticsQuest: React.FC<SubstreamsAnalyticsQuestProps> = ({ onQuestComplete, xpReward }) => {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleComplete = () => {
    setIsCompleted(true);
    onQuestComplete();
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Analytics Dashboard with Substreams</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            This quest will guide you through building analytical interfaces using Substreams data from Solana.
          </span>
        </p>
      </div>

      <div className="p-6 bg-dark-card-secondary rounded-lg mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Coming Soon!</h4>
        <p className="text-gray-300">
          We're currently developing this in-depth quest to teach you how to create powerful analytics dashboards using Substreams data.
        </p>
        <p className="text-gray-300 mt-4">
          Topics will include:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-300">
          <li>Setting up a database for analytics with Substreams SQL</li>
          <li>Creating real-time visualizations with D3.js or Chart.js</li>
          <li>Building KPI dashboards for Solana token activity</li>
          <li>Implementing time-series analysis on blockchain data</li>
          <li>Deploying your analytics dashboard to the web</li>
        </ul>
        
        <button
          onClick={handleComplete}
          className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          {isCompleted ? "Completed!" : "Complete Quest (Preview)"}
        </button>
        
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-md">
          <p className="text-yellow-300 text-sm">
            <strong>💡 Hackathon Tip:</strong> For the hackathon, consider building a specialized analytics dashboard focusing on a specific aspect of Solana's ecosystem, such as NFT trading, DeFi activity, or validator performance.
          </p>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>Resources:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><a href="https://docs.substreams.dev/how-to-guides/sinks/sql/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams SQL Sink Documentation</a></li>
          <li><a href="https://d3js.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">D3.js Data Visualization Library</a></li>
          <li><a href="https://www.chartjs.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Chart.js Documentation</a></li>
        </ul>
      </div>
    </div>
  );
}; 