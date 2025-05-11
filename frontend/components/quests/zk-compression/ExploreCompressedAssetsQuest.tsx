'use client';

import React, { useState } from 'react';

interface ExploreCompressedAssetsQuestProps {
  onQuestComplete: () => void;
  title: string;
}

export const ExploreCompressedAssetsQuest: React.FC<ExploreCompressedAssetsQuestProps> = ({ onQuestComplete, title }) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // In a real scenario, this might be fetched or be more dynamic
  const exampleCnftAddress = "DDCqYFzD25ViotDbikUUhYgWgk1tvzV8u9sNz7XAUH3U"; // Example cNFT, replace if needed
  const explorerLink = `https://xray.helius.xyz/token/${exampleCnftAddress}?network=mainnet`;
  const expectedAnswer = "Helius"; // Example: expecting user to find who provides the Merkle tree for this cNFT or similar.

  const handleSubmit = () => {
    if (answer.trim().toLowerCase().includes(expectedAnswer.toLowerCase())) {
      setFeedback("Correct! You're getting the hang of exploring compressed assets.");
      // Delay completion slightly to show feedback
      setTimeout(() => {
        onQuestComplete();
      }, 1500);
    } else {
      setFeedback("Not quite. Take another look at the explorer, focusing on the Merkle tree details or ownership. The answer might be related to who provides the infrastructure for this NFT.");
    }
  };

  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-md text-gray-200">
      <h2 className="text-2xl font-bold text-solana-purple mb-4">{title}</h2>
      
      <div className="space-y-4 text-gray-300">
        <p>
          Now that you know what ZK compression is, let's see how compressed assets, particularly Compressed NFTs (cNFTs), appear on Solana block explorers. These explorers are crucial tools for verifying on-chain data.
        </p>
        <p>
          Compressed assets are a bit different from their uncompressed counterparts. They don't store all their metadata directly in a traditional token account. Instead, their existence and ownership are secured by a Merkle tree, with only the tree's root hash stored on-chain. Block explorers that support cNFTs will typically show you:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-4">
          <li>The Merkle tree address it belongs to.</li>
          <li>The asset's "leaf ID" within that tree.</li>
          <li>Information about the compression program used.</li>
          <li>The actual owner of the asset.</li>
        </ul>
        <p>
          <strong>Your Task:</strong> Visit the XRAY explorer page for the following example cNFT:
          <br />
          <a 
            href={explorerLink}
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-solana-green hover:text-solana-green-light underline break-all"
          >
            {explorerLink}
          </a>
        </p>
        <p>
          On the explorer page for this cNFT, look for information related to its Merkle tree or the infrastructure providing its compressed state. 
          <strong>Hint:</strong> Sometimes, the authority or creator of the tree gives a clue. Who is a key provider or authority mentioned in relation to this cNFT's compressed data structure on XRAY (often involved with the Merkle tree)?
        </p>
        
        <div>
          <label htmlFor="explorer-answer" className="block text-sm font-medium text-gray-100 mb-1">Provider/Authority Name:</label>
          <input 
            type="text" 
            id="explorer-answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full md:w-1/2 bg-dark-input border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-solana-purple focus:border-solana-purple"
            placeholder="Enter the name"
          />
        </div>

        {feedback && (
          <p className={`mt-2 text-sm ${feedback.startsWith("Correct") ? 'text-green-400' : 'text-red-400'}`}>
            {feedback}
          </p>
        )}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={!answer.trim() || feedback?.startsWith("Correct")}
        className="mt-6 bg-solana-green hover:bg-solana-green-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-solana-green focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Verify Answer
      </button>
    </div>
  );
}; 