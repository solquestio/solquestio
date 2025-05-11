'use client';

import React, { useState } from 'react';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
}

export const ZkHackathonBrainstormQuest: React.FC<QuestProps> = ({ onQuestComplete, title }) => {
  const [idea, setIdea] = useState('');

  const handleSubmit = () => {
    if (idea.trim()) {
      console.log("Hackathon Idea Submitted:", idea);
      // In a real app, you might save this idea to a backend or user state.
      onQuestComplete();
    } else {
      alert("Please enter your innovative idea before submitting!");
    }
  };

  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-md text-gray-200">
      <h2 className="text-2xl font-bold text-solana-purple mb-4">{title}</h2>
      
      <div className="space-y-4 text-gray-300">
        <p>
          You've learned about the fundamentals of ZK Compression, explored its diverse use cases, familiarized yourself with the tools, and conceptualized what goes into a cNFT. Now it's time to get creative!
        </p>
        <p>
          The core power of ZK Compression is enabling **massive scale at incredibly low cost, directly on Solana's L1**.
          This opens doors to applications previously unfeasible due to state rent and transaction costs.
        </p>

        <div className="p-4 border border-solana-purple rounded-lg bg-dark-card-ternary my-4">
          <h4 className="text-lg font-semibold text-solana-purple mb-2">The 1000x Hackathon: ZK Compression Track</h4>
          <p className="text-sm text-gray-300">
            Remember the challenge: "Build innovative projects on Solana that use zero-knowledge compression to achieve new levels of scalability, privacy, and security. Projects must use compressed tokens or compressed accounts in some capacity."
          </p>
          <p className="text-sm text-gray-300 mt-1">
            Judges will be looking for functionality, potential impact, novelty, design, and extensibility. 
             (<a href="https://earn.superteam.fun/listing/1000x-hackathon/" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">Hackathon Details</a>)
          </p>
        </div>

        <p>
          Think about what you've learned. What kind of project could you build for the 1000x Hackathon that truly showcases the power of ZK Compression? 
          Consider:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-4">
          <li>A novel application not yet widely explored with compression.</li>
          <li>An existing application type reimagined for massive scale thanks to cNFTs/cTokens.</li>
          <li>A solution that significantly improves user experience or accessibility in a specific domain by leveraging low-cost, high-volume on-chain interactions.</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-100 mt-6 mb-2">Your Hackathon Idea:</h3>
        <p className="text-sm text-gray-400 mb-2">Briefly describe your project idea. What problem does it solve, or what new capability does it offer? How does ZK Compression make it uniquely feasible or impactful?</p>
        
        <textarea 
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Unleash your innovative ZK Compression hackathon idea here... Minimum 50 characters."
          className="w-full h-32 p-3 border border-gray-600 rounded-md bg-dark-input text-gray-200 focus:ring-2 focus:ring-solana-purple focus:border-transparent placeholder-gray-500"
          minLength={50}
        />
      </div>

      <button 
        onClick={handleSubmit}
        className="mt-6 bg-solana-green hover:bg-solana-green-dark text-white font-bold py-3 px-8 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-solana-green focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={idea.trim().length < 50}
      >
        Submit My Brilliant Idea!
      </button>
    </div>
  );
}; 