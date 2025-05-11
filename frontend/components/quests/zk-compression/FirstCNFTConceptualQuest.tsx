'use client';

import React, { useState } from 'react';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
}

export const FirstCNFTConceptualQuest: React.FC<QuestProps> = ({ onQuestComplete, title }) => {
  const [reflection, setReflection] = useState('');

  const handleSubmit = () => {
    if (reflection.trim()) {
      console.log("cNFT Conceptualization Reflection:", reflection);
      // In a real app, you might save this reflection or check for keywords.
      onQuestComplete();
    } else {
      alert("Please share your thoughts before completing.");
    }
  };

  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-md text-gray-200">
      <h2 className="text-2xl font-bold text-solana-purple mb-4">{title}</h2>

      <div className="space-y-4 text-gray-300">
        <p>
          Before diving into the code for minting your first Compressed NFT (cNFT), it's crucial to understand the core concepts that make them work. Unlike traditional NFTs where all metadata might be on-chain (or directly linked from on-chain data), cNFTs rely heavily on a Merkle tree structure and a separation of on-chain and off-chain data to achieve their cost efficiency.
        </p>
        
        <h3 className="text-xl font-semibold text-gray-100 mt-4 mb-2">Core Concepts for cNFT Minting:</h3>
        <ul className="list-disc list-inside space-y-3 pl-4">
          <li>
            <strong>Merkle Trees are Key:</strong> As you've learned, ZK Compression uses Merkle trees. For cNFTs, each individual NFT is a "leaf" in this tree. The tree itself has an on-chain account that stores its current "root hash." This root hash is a cryptographic fingerprint of all the cNFTs within that tree. Minting a new cNFT involves adding a new leaf and updating this root hash.
          </li>
          <li>
            <strong>On-Chain Data (The Bare Essentials):</strong>
            <ul className="list-circle list-inside pl-6 mt-1 space-y-1">
              <li><strong>Tree Account:</strong> Stores the Merkle root, tree depth/size, and information about the tree authority.</li>
              <li><strong>Collection NFT:</strong> A standard Metaplex NFT that acts as the "parent" or identifier for a collection of cNFTs. Its address is often used to group cNFTs.</li>
              <li><strong>Ownership:</strong> While the full metadata is off-chain, the ownership of a cNFT (which wallet address owns which leaf/NFT) is implicitly tracked and proven via the Merkle tree and ZK proofs during transfers.
              </li>
            </ul>
          </li>
          <li>
            <strong>Off-Chain Data (The Rich Details):</strong>
            <ul className="list-circle list-inside pl-6 mt-1 space-y-1">
              <li><strong>Metadata URI:</strong> Just like standard NFTs, cNFTs typically point to an off-chain JSON metadata file (often hosted on Arweave or IPFS) via a URI. This JSON contains the name, description, image URL, attributes, etc., of the NFT.</li>
              <li><strong>The cNFT itself (as data):</strong> The actual data representing the cNFT's attributes that gets hashed into a leaf of the Merkle tree is constructed based on this off-chain metadata.</li>
            </ul>
          </li>
          <li>
            <strong>Authorities:</strong>
            <ul className="list-circle list-inside pl-6 mt-1 space-y-1">
              <li><strong>Tree Authority:</strong> Has permissions to update the Merkle tree (e.g., append new leaves/mint new cNFTs).</li>
              <li><strong>Collection Authority:</strong> The update authority of the Collection NFT, which can verify that cNFTs being minted truly belong to that collection.</li>
            </ul>
          </li>
           <li>
            <strong>The Minting Process (Conceptual):</strong>
            <ol className="list-decimal list-inside pl-6 mt-1 space-y-1">
                <li>Prepare your NFT metadata (name, image, attributes) and upload it to a decentralized storage solution (like Arweave/IPFS) to get a URI.</li>
                <li>Construct the leaf data for your cNFT based on this metadata and the target owner's public key.</li>
                <li>Instruct the on-chain program (via an SDK call, often interacting with a program like Metaplex Bubblegum) to append this new leaf to the designated Merkle tree.</li>
                <li>The program verifies permissions (e.g., are you the tree authority? does it match the collection?), updates the tree, and changes the on-chain Merkle root.</li>
                <li>A proof is generated (often by an indexer like Helius' Photon) that can be used to verify the cNFT's existence and details later.</li>
            </ol>
          </li>
        </ul>

        <p className="mt-6">
         The <a href="https://github.com/holyaustin/cNFTs" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">holyaustin/cNFTs GitHub repository</a> provides excellent, well-commented scripts (like `verboseCreateAndMint.ts`) that demonstrate these steps in code.
        </p>

        <h3 className="text-xl font-semibold text-gray-100 mt-6 mb-2">Food for Thought:</h3>
        <p className="mb-2">
          Imagine you are creating your own cNFT collection. Briefly describe:
        </p>
        <ol className="list-decimal list-inside space-y-1 pl-4 mb-3">
          <li>What would your cNFT collection be about?</li>
          <li>What key pieces of metadata would you store off-chain in the JSON URI?</li>
        </ol>
        <textarea 
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Share your cNFT collection idea and its off-chain metadata here..."
          className="w-full h-24 p-2 border border-gray-600 rounded-md bg-dark-input text-gray-200 focus:ring-2 focus:ring-solana-purple focus:border-transparent"
        />
      </div>

      <button 
        onClick={handleSubmit}
        className="mt-6 bg-solana-green hover:bg-solana-green-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-solana-green focus:ring-opacity-50 disabled:opacity-50"
        disabled={!reflection.trim()}
      >
        Complete Conceptualization
      </button>
    </div>
  );
}; 