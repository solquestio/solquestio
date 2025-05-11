'use client';

import React from 'react';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
}

export const ZkCompressionToolsQuest: React.FC<QuestProps> = ({ onQuestComplete, title }) => {
  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-md text-gray-200">
      <h2 className="text-2xl font-bold text-solana-purple mb-4">{title}</h2>

      <div className="space-y-4 text-gray-300">
        <p>
          Building with ZK Compression is made accessible through a growing ecosystem of tools and SDKs. These resources abstract away much of the underlying complexity, allowing developers to focus on their application logic.
        </p>
        
        <h3 className="text-xl font-semibold text-gray-100 mt-4 mb-2">Key Developer Resources:</h3>
        <ul className="list-disc list-inside space-y-3 pl-4">
          <li>
            <strong>ZK Compression JS/TS Client (<a href="https://www.zkcompression.com/developers/typescript-client" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">zkcompression.com Docs</a>):</strong> The official documentation provides a TypeScript client designed to work similarly to Solana's web3.js but with full compression support. This is your primary entry point for interacting with compressed accounts programmatically.
          </li>
          <li>
            <strong>Helius APIs & Photon Indexer (<a href="https://www.helius.dev/blog/zk-compression-keynote-breakpoint-2024" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">Helius Blog</a>):</strong> Helius plays a crucial role in providing RPC infrastructure that supports ZK Compression. Their services include:
            <ul className="list-circle list-inside pl-6 mt-1 space-y-1">
              <li>Specialized JSON RPC methods for compressed accounts (e.g., `getCompressedAccount`, `getCompressedBalance`).</li>
              <li>The **Photon Indexer**, an open-source solution that tracks and manages updates to compressed accounts, caches their current state, and can generate proofs. This is vital for efficiently querying compressed state.</li>
              <li>Helius offers a full local development setup including a test validator, Photon indexer, and local prover node.</li>
            </ul>
          </li>
          <li>
            <strong>Light Protocol Resources (<a href="https://docs.lightprotocol.com/" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">Light Protocol Docs</a>):</strong> Light Protocol is a core contributor to ZK Compression. Their documentation and GitHub repositories are valuable for understanding the underlying mechanics and finding example programs.
          </li>
          <li>
            <strong>Airship Tool (<a href="https://www.helius.dev/blog/solana-airdrop" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">Helius Blog on Airdrops</a>):</strong> For a practical application, Airship (by Helius) is an open-source tool (UI and CLI) for conducting large-scale, cost-effective airdrops using compressed tokens. 
          </li>
          <li>
            <strong>Anchor Macros (Work in Progress):</strong> As mentioned in the Helius ZK Compression Keynote, there are efforts to create Anchor macros to make working with compressed accounts as seamless as regular accounts for Solana program development using Anchor. Keep an eye on official channels for updates.
          </li>
          <li>
            <strong>Example Code & Repositories:</strong>
            <ul className="list-circle list-inside pl-6 mt-1 space-y-1">
                <li>The <a href="https://www.zkcompression.com" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">ZK Compression Docs</a> site often links to example programs and client code.</li>
                <li>The <a href="https://github.com/holyaustin/cNFTs" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">cNFTs GitHub repo by holyaustin</a> provides practical examples for creating and interacting with compressed NFTs using Helius APIs.</li>
            </ul>
          </li>
        </ul>

        <p className="mt-6">
          The tooling landscape for ZK Compression is rapidly evolving. Always refer to the official documentation from Light Protocol, Helius, and ZKCompression.com for the latest SDKs, API references, and best practices.
        </p>
      </div>

      <button 
        onClick={onQuestComplete}
        className="mt-8 bg-solana-green hover:bg-solana-green-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-solana-green focus:ring-opacity-50"
      >
        Got It, Ready to Explore Tools!
      </button>
    </div>
  );
}; 