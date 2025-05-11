'use client';

import React from 'react';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
}

export const CompressedTokensDeepDiveQuest: React.FC<QuestProps> = ({ onQuestComplete, title }) => {
  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-md text-gray-200">
      <h2 className="text-2xl font-bold text-solana-purple mb-4">{title}</h2>

      <div className="space-y-4 text-gray-300">
        <p>
          Compressed Tokens (cTokens) are essentially standard Solana SPL tokens but leveraging the power of ZK Compression. This means they offer the familiar functionality of SPL tokens but with dramatically reduced on-chain costs, especially when dealing with a large number of token accounts.
        </p>
        
        <h3 className="text-xl font-semibold text-gray-100 mt-4 mb-2">Key Characteristics of cTokens:</h3>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>
            <strong>Cost Efficiency:</strong> The primary advantage. Creating and managing cToken accounts is significantly cheaper than traditional SPL token accounts because the bulk of the data is stored off-chain on the Solana ledger, secured by on-chain Merkle tree roots and ZK proofs. This is a game-changer for use cases like large-scale airdrops or applications requiring millions of token accounts.
          </li>
          <li>
            <strong>Functionality Parity (Mostly):</strong> The aim is for cTokens to behave very much like standard SPL tokens. The underlying compressed token program mirrors the standard SPL token program. ([Helius Blog](https://www.helius.dev/blog/zk-compression-keynote-breakpoint-2024))
          </li>
          <li>
            <strong>Decompression for Composability:</strong> While cTokens are designed to be composable, direct interaction with all existing DeFi protocols or exchanges that expect standard SPL token accounts might require a decompression step. This means a cToken can be converted back into a regular SPL token when needed for such interactions, ensuring no lock-in. ([Helius Blog](https://www.helius.dev/blog/zk-compression-keynote-breakpoint-2024))
          </li>
          <li>
            <strong>Lifecycle:</strong> Similar to cNFTs, cTokens are part of a Merkle tree. Their existence, ownership, and transfers are verified using ZK proofs against the on-chain root hash. Minting involves adding a new leaf to the tree, and transfers involve updating the leaf and proving the change.
          </li>
          <li>
            <strong>Ideal Use Cases:</strong> Perfect for scenarios where on-chain state costs for many accounts would be prohibitive. Think airdrops to tens of thousands or millions of users, loyalty points systems, in-game currencies for many players, etc. For very "hot" assets that are constantly interacting with many DeFi protocols, standard SPL tokens might still be preferred unless the protocols natively support cTokens.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-100 mt-4 mb-2">How it Works (Simplified):</h3>
        <p>
          Instead of creating a full on-chain account for every user holding a cToken, their balance and ownership information are recorded as a leaf in an off-chain Merkle tree. Only the root of this tree is stored on-chain. When a cToken transaction happens (e.g., a transfer):
        </p>
        <ol className="list-decimal list-inside space-y-1 pl-4">
          <li>The off-chain tree is updated.</li>
          <li>A ZK proof is generated to attest to this change.</li>
          <li>This small proof is submitted on-chain to update the Merkle root, confirming the transaction's validity without storing all individual account data on expensive account space.</li>
        </ol>
        <p>
          This mechanism is what enables the massive cost savings, as highlighted in articles like "The Cheapest Way to Airdrop Solana Tokens" on the [Helius Blog](https://www.helius.dev/blog/solana-airdrop).
        </p>

        <h3 className="text-xl font-semibold text-gray-100 mt-4 mb-2">Further Reading:</h3>
        <ul className="list-disc list-inside space-y-1 pl-4">
          <li><a href="https://www.zkcompression.com" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">ZK Compression Overview</a></li>
          <li><a href="https://docs.lightprotocol.com/" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">Light Protocol Docs</a></li>
          <li><a href="https://www.helius.dev/blog/zk-compression-keynote-breakpoint-2024" target="_blank" rel="noopener noreferrer" className="text-solana-green hover:text-solana-green-light underline">Helius: ZK Compression Keynote Summary</a></li>
        </ul>
      </div>

      <button 
        onClick={onQuestComplete}
        className="mt-6 bg-solana-green hover:bg-solana-green-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-solana-green focus:ring-opacity-50"
      >
        Mark as Understood
      </button>
    </div>
  );
}; 