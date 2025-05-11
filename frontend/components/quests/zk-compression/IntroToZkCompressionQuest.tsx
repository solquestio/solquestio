'use client';

import React from 'react';

interface IntroToZkCompressionQuestProps {
  onQuestComplete: () => void;
  title: string;
  // We can add more props like links to articles, etc.
}

export const IntroToZkCompressionQuest: React.FC<IntroToZkCompressionQuestProps> = ({ onQuestComplete, title }) => {
  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-md text-gray-200">
      <h2 className="text-2xl font-bold text-solana-purple mb-4">{title}</h2>
      
      <div className="space-y-4 text-gray-300">
        <p>
          Welcome to the world of ZK Compression on Solana! This groundbreaking technology is changing how we think about on-chain data and scalability.
        </p>
        <p>
          <strong>What is it?</strong> Zero-Knowledge (ZK) Compression allows developers to store certain types of on-chain state in a highly compressed format. Imagine significantly reducing the cost of storing data directly on the Solana blockchain, without sacrificing security or the ability to interact with it as if it were uncompressed. This is achieved by using ZK proofs to verify the integrity and authenticity of the compressed state off-chain, with only a small commitment stored on-chain.
        </p>
        <p>
          <strong>Why is it important?</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 pl-4">
          <li>
            <strong>Massive Cost Reduction:</strong> Storing data on Solana (or any blockchain) costs SOL. ZK compression can reduce these storage costs by orders of magnitude (100x, 1000x, or even more for certain use cases!). This makes many previously unfeasible applications economically viable.
          </li>
          <li>
            <strong>Scalability for Mass Adoption:</strong> Think about applications that need to manage millions or even billions of items on-chain, like widespread NFT ticketing, loyalty programs with vast user bases, or granular supply chain tracking. ZK compression unlocks this level of scale.
          </li>
          <li>
            <strong>Preserves L1 Security & Composability:</strong> Unlike some L2 solutions, ZK compression leverages the full security and composability of the Solana L1. Compressed state can still interact seamlessly with other Solana programs and assets.
          </li>
        </ul>
        <p>
          In this path, you'll learn more about how ZK compression works, explore its use cases (like compressed NFTs and compressed Tokens), and understand how it can be used to build innovative and highly scalable applications on Solana.
        </p>
        <p className="font-semibold text-gray-100">
          Ready to dive deeper? Review the information above.
        </p>
      </div>

      <button 
        onClick={onQuestComplete}
        className="mt-6 bg-solana-green hover:bg-solana-green-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-solana-green focus:ring-opacity-50"
      >
        I've Read and Understood!
      </button>
    </div>
  );
}; 