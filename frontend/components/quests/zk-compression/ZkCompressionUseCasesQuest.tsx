'use client';

import React from 'react';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
}

export const ZkCompressionUseCasesQuest: React.FC<QuestProps> = ({ onQuestComplete, title }) => {
  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-md text-gray-200">
      <h2 className="text-2xl font-bold text-solana-purple mb-4">{title}</h2>

      <div className="space-y-4 text-gray-300">
        <p>
          ZK Compression isn't just about making existing things cheaper; it unlocks entirely new possibilities and scales current applications to an unprecedented degree. By drastically reducing on-chain state costs, developers can now build applications that were previously too expensive or complex to implement directly on L1.
        </p>
        
        <h3 className="text-xl font-semibold text-gray-100 mt-4 mb-2">Exploring the Design Space:</h3>
        <ul className="list-disc list-inside space-y-3 pl-4">
          <li>
            <strong>Hyper-Scale Airdrops & Token Distributions:</strong> As highlighted by Helius in their article on <a href="https://www.helius.dev/blog/solana-airdrop" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">cheap Solana airdrops</a>, ZK compression (using tools like AirShip) allows projects to distribute tokens to millions of users for a fraction of the traditional cost. This is crucial for community building and initial token distributions.
          </li>
          <li>
            <strong>Massive Loyalty Programs & Reward Systems:</strong> Imagine a retail brand or online service with millions of customers. ZK compression allows for each customer to have an on-chain (compressed) account for loyalty points, digital collectibles, or personalized rewards without incurring massive state rent fees. Boba Guys' "Passport" program on Solana, mentioned in a <a href="https://solana.com/news/case-study-boba-guys" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">Solana Case Study</a>, while not explicitly stated as using ZK compression at its inception, is the type of large-scale loyalty initiative that becomes even more viable with it.
          </li>
          <li>
            <strong>Next-Gen Gaming & In-Game Assets:</strong> Games like Star Atlas, aiming for vast universes with countless in-game items, characters, and land plots, can leverage cNFTs and cTokens. This allows for millions of unique, player-owned assets to exist on-chain, enhancing player ownership and enabling true in-game economies. ([Medium Article on ZK Compression](https://medium.com/@CaseFlyn/solanas-zk-compression-the-blockchain-game-changer-52dfdb53d707))
          </li>
          <li>
            <strong>Decentralized Physical Infrastructure Networks (DePIN):</strong> Projects like Helium or Hivemapper, which involve many distributed physical devices (hotspots, sensors, cameras) contributing to a network, can use ZK compression to manage the state, identity, and rewards for each participating node efficiently. The <a href="https://solana.com/developers/guides/depin/getting-started" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">Solana DePIN Guide</a> discusses ZK compression for rewards distribution.
          </li>
          <li>
            <strong>Digital Identity & Verifiable Credentials:</strong> Issuing and managing on-chain credentials (e.g., educational certificates, professional licenses, event tickets) for a large population becomes feasible. Each credential can be a cNFT, owned by the individual, offering a secure and verifiable way to manage identity attributes.
          </li>
          <li>
            <strong>On-Chain Social Media & Content:</strong> While still nascent, ZK compression could enable on-chain social graphs or content ownership at a scale that was previously unimaginable, where each post, like, or follow could be an on-chain (compressed) interaction.
          </li>
          <li>
            <strong>Supply Chain & Logistics:</strong> Tracking individual items through a supply chain often requires managing state for millions of distinct units. ZK compression can make it affordable to have an on-chain representation for each item, enhancing transparency and traceability.
          </li>
        </ul>

        <p className="mt-6">
          The core theme across these use cases is **scale**. ZK Compression allows Solana to maintain its L1 security and composability while enabling applications to interact with and manage state for a vastly larger number of users, items, or data points than ever before. As Swen Schäferjohann of Light Protocol mentioned, this is about enabling applications "to go on the L1 and benefit from the L1, while still scaling to a lot of users." ([Solana Compass Podcast Notes](https://solanacompass.com/learn/Lightspeed/the-next-era-of-solana-scaling-swen-schaferjohann))
        </p>

        <h3 className="text-xl font-semibold text-gray-100 mt-6 mb-2">Think Bigger!</h3>
        <p>
          The examples above are just the beginning. What other applications can you imagine that become possible when the cost of on-chain state is no longer a primary constraint?
        </p>
      </div>

      <button 
        onClick={onQuestComplete}
        className="mt-8 bg-solana-green hover:bg-solana-green-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-solana-green focus:ring-opacity-50"
      >
        I Understand the Potential!
      </button>
    </div>
  );
}; 