'use client';

import React, { useState, useMemo, useEffect } from 'react';
// Assuming QuestPageLayout and QuestListItem are available and structured similarly to LayerZero path
import { QuestPageLayout, QuestListItem } from '@/components/layout/QuestPageLayout'; 
// We will create these quest components in the next steps
import { IntroToZkCompressionQuest } from '@/components/quests/zk-compression/IntroToZkCompressionQuest';
import { ExploreCompressedAssetsQuest } from '@/components/quests/zk-compression/ExploreCompressedAssetsQuest';
import { CompressedTokensDeepDiveQuest } from '@/components/quests/zk-compression/CompressedTokensDeepDiveQuest';
import { ZkCompressionUseCasesQuest } from '@/components/quests/zk-compression/ZkCompressionUseCasesQuest';
import { ZkCompressionToolsQuest } from '@/components/quests/zk-compression/ZkCompressionToolsQuest';
import { FirstCNFTConceptualQuest } from '@/components/quests/zk-compression/FirstCNFTConceptualQuest';
import { ZkHackathonBrainstormQuest } from '@/components/quests/zk-compression/ZkHackathonBrainstormQuest';
// import { CompressedTokensBenefitsQuest } from '@/components/quests/zk-compression/CompressedTokensBenefitsQuest';

// Define the structure for individual quests within this path
interface ZkCompressionQuest extends QuestListItem {
  description?: string;
  component: React.FC<any>; // The actual quest component (will be placeholder for now)
  xp?: number;
  props?: any; // To hold specific props for each quest component
  // isLocked can be determined dynamically based on completedQuests
  isComplete: boolean;
}

// Placeholder for actual quest components - replace with imports later
const PlaceholderQuestComponent: React.FC<{ onQuestComplete: () => void, title: string }> = ({ onQuestComplete, title }) => (
  <div className="p-6 bg-dark-card rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-gray-100 mb-3">{title}</h3>
    <p className="text-gray-400 mb-4">This quest content is under development.</p>
    <button 
      onClick={onQuestComplete}
      className="bg-solana-purple hover:bg-solana-purple-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
    >
      Mark as Complete (Dev)
    </button>
  </div>
);


const ZkCompressionLearningPathPage = () => {
  const [activeQuestId, setActiveQuestId] = useState<string>('zk-intro'); // Default to first quest
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});

  // Load completed quests from localStorage on mount
  useEffect(() => {
    const storedCompletedQuests = localStorage.getItem('zkCompressionCompletedQuests');
    if (storedCompletedQuests) {
      setCompletedQuests(JSON.parse(storedCompletedQuests));
    }
  }, []);

  // Save completed quests to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('zkCompressionCompletedQuests', JSON.stringify(completedQuests));
  }, [completedQuests]);

  const quests: ZkCompressionQuest[] = useMemo(() => [
    {
      id: 'zk-intro',
      title: '1. What is ZK Compression?',
      description: 'Grasp the fundamentals of ZK Compression on Solana. Learn how it drastically reduces on-chain state costs while maintaining L1 security, and its importance for building scalable applications.',
      component: IntroToZkCompressionQuest, // Replace with IntroToZkCompressionQuest later
      xp: 50,
      props: { title: '1. What is ZK Compression?' },
      isComplete: !!completedQuests['zk-intro']
    },
    {
      id: 'zk-explore-assets',
      title: '2. Compressed Assets on Solana Explorers',
      description: 'Learn how to identify and inspect compressed assets (like cNFTs or cTokens) using Solana block explorers. Understand what to look for.',
      component: ExploreCompressedAssetsQuest, // Replace with ExploreCompressedAssetsQuest later
      xp: 100,
      props: { title: '2. Compressed Assets on Solana Explorers' },
      isComplete: !!completedQuests['zk-explore-assets']
    },
    {
      id: 'zk-ctokens-benefits',
      title: '3. Advantages of Compressed Tokens (cTokens)',
      description: 'Discover the key benefits of using cTokens for various applications, from airdrops to ticketing, and how they compare to regular SPL tokens.',
      component: PlaceholderQuestComponent, // Replace with CompressedTokensBenefitsQuest later
      xp: 150,
      props: { title: '3. Advantages of Compressed Tokens (cTokens)' },
      isComplete: !!completedQuests['zk-ctokens-benefits']
    },
    {
      id: 'zk-ctokens-deep-dive',
      title: "3. Compressed Tokens (cTokens) Deep Dive", // Note: Title was updated to 3, but original plan had this as new 3.
      description: "Explore the specifics of cTokens. How are they minted? What are their limitations compared to standard SPL tokens? Understand their lifecycle and interaction patterns.",
      component: CompressedTokensDeepDiveQuest, 
      xp: 150,
      props: { title: "3. Compressed Tokens (cTokens) Deep Dive" },
      isComplete: !!completedQuests['zk-ctokens-deep-dive']
    },
    {
      id: 'zk-use-cases',
      title: "4. Real-World Use Cases for ZK Compression",
      description: "Discover diverse applications of ZK compression beyond simple token mints. Think about loyalty systems, digital identity, on-chain game assets, and more.",
      component: ZkCompressionUseCasesQuest,
      xp: 150,
      props: { title: "4. Real-World Use Cases for ZK Compression" },
      isComplete: !!completedQuests['zk-use-cases']
    },
    {
      id: 'zk-tools-sdks',
      title: "5. Tools & SDKs for ZK Compression",
      description: "Get introduced to the developer tools and SDKs provided by Light Protocol and Helius that simplify working with ZK compression on Solana.",
      component: ZkCompressionToolsQuest,
      xp: 200,
      props: { title: "5. Tools & SDKs for ZK Compression" },
      isComplete: !!completedQuests['zk-tools-sdks']
    },
    {
      id: 'zk-first-cnft-conceptual',
      title: "6. Conceptualizing Your First cNFT Mint",
      description: "Conceptually walk through the steps of minting a compressed NFT. Understand the roles of Merkle trees, tree authorities, and how the off-chain data relates to the on-chain proof.",
      component: FirstCNFTConceptualQuest,
      xp: 250,
      props: { title: "6. Conceptualizing Your First cNFT Mint" },
      isComplete: !!completedQuests['zk-first-cnft-conceptual']
    },
    {
      id: 'zk-hackathon-brainstorm',
      title: "7. Hackathon Idea with ZK Compression",
      description: "Inspired by what you've learned, brainstorm a simple project idea for the 1000x Hackathon that utilizes ZK compression. Focus on novelty or potential impact.",
      component: ZkHackathonBrainstormQuest,
      xp: 100,
      props: { title: "7. Hackathon Idea with ZK Compression" },
      isComplete: !!completedQuests['zk-hackathon-brainstorm']
    }
  ], [completedQuests]);

  const handleQuestCompletion = (questId: string) => {
    setCompletedQuests(prev => ({ ...prev, [questId]: true }));
    // Potentially unlock next quest or show completion message
    const currentIndex = quests.findIndex(q => q.id === questId);
    if (currentIndex !== -1 && currentIndex < quests.length - 1) {
      setActiveQuestId(quests[currentIndex + 1].id);
    } else if (currentIndex === quests.length - 1) {
      // Last quest completed
      console.log("ZK Compression Path Completed!");
      // Potentially trigger a path completion event / UI update
    }
  };

  const activeQuest = quests.find(q => q.id === activeQuestId);
  const ActiveQuestComponent = activeQuest ? activeQuest.component : null;

  return (
    <QuestPageLayout
      pathTitle="ZK Compression Innovators Path"
      quests={quests}
      activeQuestId={activeQuestId}
      onSelectQuest={setActiveQuestId}
    >
      {ActiveQuestComponent && activeQuest && (
        <ActiveQuestComponent 
          onQuestComplete={() => handleQuestCompletion(activeQuest.id)}
          {...activeQuest.props} // Pass specific props to the quest component
        />
      )}
      {!ActiveQuestComponent && (
        <div className="p-6 bg-dark-card rounded-lg shadow-md text-gray-300">
          Please select a quest to begin.
        </div>
      )}
    </QuestPageLayout>
  );
};

export default ZkCompressionLearningPathPage; 