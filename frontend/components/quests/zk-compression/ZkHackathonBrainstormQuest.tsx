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
      // In a real app, you might save this idea to a backend or state.
      onQuestComplete();
    } else {
      alert("Please enter your idea before submitting.");
    }
  };

  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-100 mb-3">{title}</h3>
      <p className="text-gray-400 mb-4">Based on what you've learned about ZK Compression, briefly describe a project idea you could build for the 1000x Hackathon. Focus on a novel application or a significant improvement in scalability/cost for an existing concept.</p>
      <textarea 
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        className="w-full h-32 p-2 border border-gray-600 rounded-md bg-dark-input text-gray-200 focus:ring-solana-purple focus:border-solana-purple"
        placeholder="My innovative ZK Compression project idea is..."
      />
      <button 
        onClick={handleSubmit}
        className="mt-4 bg-solana-green hover:bg-solana-green-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        Submit Idea & Complete Quest
      </button>
    </div>
  );
}; 