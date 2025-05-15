'use client';
import React, { useState } from 'react';

interface SubstreamsIntroQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const SubstreamsIntroQuest: React.FC<SubstreamsIntroQuestProps> = ({ onQuestComplete, xpReward }) => {
  const [questionAnswers, setQuestionAnswers] = useState<{[key: string]: string}>({
    q1: '',
    q2: '',
    q3: ''
  });
  const [status, setStatus] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showCompletionForm, setShowCompletionForm] = useState<boolean>(false);

  const handleAnswerChange = (question: string, answer: string) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  const correctAnswers = {
    q1: 'indexing',
    q2: 'rust',
    q3: 'substreams'
  };

  const checkAnswers = () => {
    const isQ1Correct = questionAnswers.q1.toLowerCase() === correctAnswers.q1;
    const isQ2Correct = questionAnswers.q2.toLowerCase() === correctAnswers.q2;
    const isQ3Correct = questionAnswers.q3.toLowerCase() === correctAnswers.q3;

    if (isQ1Correct && isQ2Correct && isQ3Correct) {
      setStatus('Great job! All answers are correct.');
      setIsCompleted(true);
      onQuestComplete();
    } else {
      setStatus('Some answers are incorrect. Please try again.');
    }
  };

  return (
    <div className="bg-dark-card rounded-xl border border-gray-700 p-6">
      <h3 className="text-2xl font-bold text-white mb-1">Introduction to The Graph Substreams</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}

      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            Welcome to The Graph Substreams learning path! Substreams is a new powerful indexing technology developed by StreamingFast, a core developer in The Graph ecosystem, designed to efficiently extract and process blockchain data.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>What are Substreams?</strong> Substreams are a new layer in The Graph's architecture that focuses on efficiently transforming blockchain data. With Substreams, you can build protocol-specific data streams, analytical datasets, power real-time notifications, display time-series information, and more.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>Substreams on Solana:</strong> The Graph now supports Solana with Substreams, allowing developers to efficiently extract and interpret on-chain data from Solana's mainnet-beta to feed their applications. This technology is crucial for building lightning-fast dapps on Solana.
          </span>
        </p>
      </div>

      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mb-6">
        <h4 className="text-emerald-400 font-semibold mb-2">Key Benefits of Substreams</h4>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start">
            <span className="text-emerald-400 mr-2">▸</span>
            <span><strong>Massive Performance:</strong> Through parallelization, Substreams can increase historical indexing performance by more than 100x</span>
          </li>
          <li className="flex items-start">
            <span className="text-emerald-400 mr-2">▸</span>
            <span><strong>Reuse Solana Program Code:</strong> Your existing Rust code from Solana programs can be reused to read on-chain data</span>
          </li>
          <li className="flex items-start">
            <span className="text-emerald-400 mr-2">▸</span>
            <span><strong>Composability:</strong> Build on top of others' Substreams modules to accelerate development</span>
          </li>
          <li className="flex items-start">
            <span className="text-emerald-400 mr-2">▸</span>
            <span><strong>Reliable Streams:</strong> Cursor-based streaming ensures you never miss data, even during reconnections</span>
          </li>
          <li className="flex items-start">
            <span className="text-emerald-400 mr-2">▸</span>
            <span><strong>Multiple Output Sinks:</strong> Feed your data into SQL databases, Subgraphs, PubSub, MongoDB, and more</span>
          </li>
        </ul>
      </div>

      <div className="mb-6">
        <h4 className="text-xl font-semibold text-white mb-3">Use Cases for Substreams on Solana</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h5 className="text-emerald-400 font-medium mb-2">Data Analytics</h5>
            <p className="text-gray-400 text-sm">Build cross-chain analytics dashboards tracking token flows, DeFi metrics, and user activity with millisecond latency.</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h5 className="text-emerald-400 font-medium mb-2">Trading Bots</h5>
            <p className="text-gray-400 text-sm">Power high-frequency trading bots with real-time on-chain data from DEXs, lending protocols, and other financial primitives.</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h5 className="text-emerald-400 font-medium mb-2">Block Explorers</h5>
            <p className="text-gray-400 text-sm">Create rich block explorers with specialized views for NFTs, tokens, and protocol-specific transactions.</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h5 className="text-emerald-400 font-medium mb-2">Cross-Chain Applications</h5>
            <p className="text-gray-400 text-sm">Build applications that track and react to events across multiple chains including Solana, Ethereum, and others.</p>
          </div>
        </div>
      </div>

      {!isCompleted ? (
        <div className="bg-dark-card-secondary p-5 rounded-lg mt-6">
          <h4 className="text-white font-semibold mb-3">Knowledge Check</h4>
          <p className="text-gray-300 mb-4">Answer these questions to complete this quest:</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">
                1. Substreams is a technology that focuses on ________ blockchain data efficiently.
              </label>
              <input
                type="text"
                value={questionAnswers.q1}
                onChange={(e) => handleAnswerChange('q1', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Fill in the blank"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">
                2. Substreams modules are coded in what programming language?
              </label>
              <input
                type="text"
                value={questionAnswers.q2}
                onChange={(e) => handleAnswerChange('q2', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Programming language"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">
                3. A Subgraph can be powered by ________ to greatly increase syncing speeds.
              </label>
              <input
                type="text"
                value={questionAnswers.q3}
                onChange={(e) => handleAnswerChange('q3', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Fill in the blank"
              />
            </div>
          </div>
          
          <button
            onClick={checkAnswers}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Submit Answers
          </button>
          
          {status && (
            <div className={`mt-3 p-3 rounded-md text-sm ${status.includes('incorrect') ? 'bg-red-900/30 text-red-300' : 'bg-emerald-900/30 text-emerald-300'}`}>
              {status}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
          <h4 className="text-emerald-400 font-semibold mb-2">Quest Completed!</h4>
          <p className="text-gray-300">
            You've mastered the fundamentals of The Graph Substreams! In the next quests, you'll learn how to set up your development environment and create your first Substreams on Solana.
          </p>
          <div className="mt-4 p-3 bg-gray-800 rounded-md">
            <p className="text-sm text-gray-300">
              <span className="text-emerald-400">💡 Hackathon Tip:</span> The Graph's Substreams on Solana hackathon track offers prizes up to $5,000 USDC for innovative indexing solutions. Projects like cross-chain analytics dashboards, NFT marketplaces with real-time data, and DeFi monitoring tools are highly valued.
            </p>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Resources:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><a href="https://thegraph.com/docs/en/substreams/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">The Graph Substreams Documentation</a></li>
          <li><a href="https://thegraph.com/blog/indexing-solana-substreams/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">The Graph Now Supports Solana with Substreams</a></li>
          <li><a href="https://substreams.streamingfast.io/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams Developer Guide</a></li>
        </ul>
      </div>
    </div>
  );
}; 