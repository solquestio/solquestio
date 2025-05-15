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
import { loadQuestCompletions, updateQuestCompletion, calculateEarnedXP } from '@/lib/questStorage';
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
  const [activeQuestId, setActiveQuestId] = useState<string>('zk-q1-intro'); // Default to first quest
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const PATH_KEY = 'zkCompression';

  // Load completed quests from localStorage on mount using the utility
  useEffect(() => {
    const savedCompletions = loadQuestCompletions(PATH_KEY);
    setCompletedQuests(savedCompletions);
    
    // Set active quest to first incomplete quest or last quest if all complete
    const questsList = getQuestsList();
    const firstIncompleteQuest = questsList.find(q => !savedCompletions[q.id]);
    if (firstIncompleteQuest) {
      setActiveQuestId(firstIncompleteQuest.id);
    } else if (questsList.length > 0) {
      // If all are completed, show the last quest
      setActiveQuestId(questsList[questsList.length - 1].id);
    }
    
    // Calculate earned XP
    setEarnedXP(calculateEarnedXP(questsList, savedCompletions));
  }, []);

  // Define quests with their XP values
  const getQuestsList = () => [
    {
      id: 'zk-q1-intro',
      title: 'Introduction to ZK Compression',
      description: 'Learn the fundamentals of state compression on Solana, including merkle trees and how ZK proofs enable secure compression on-chain.',
      component: IntroToZkCompressionQuest,
      xp: 200,
      props: { title: 'Introduction to ZK Compression' },
      isComplete: !!completedQuests['zk-q1-intro']
    },
    {
      id: 'zk-q2-setup',
      title: 'Setting Up Your Compression Environment',
      description: 'Configure your developer environment with Solana CLI, Node.js, and specific libraries needed for working with compressed assets.',
      component: ExploreCompressedAssetsQuest,
      xp: 250,
      props: { title: 'Setting Up Your Compression Environment' },
      isComplete: !!completedQuests['zk-q2-setup']
    },
    {
      id: 'zk-q3-compressed-nfts',
      title: 'Creating Your First Compressed NFT',
      description: 'Learn to mint and manage compressed NFTs using Metaplex\'s Bubblegum program, from setting up the merkle tree to minting your first cNFT.',
      component: PlaceholderQuestComponent,
      xp: 300,
      props: { title: 'Creating Your First Compressed NFT' },
      isComplete: !!completedQuests['zk-q3-compressed-nfts']
    },
    {
      id: 'zk-q4-compressed-tokens',
      title: 'Working with Compressed Tokens (cTokens)',
      description: 'Create and transact with compressed fungible tokens, understanding their differences compared to regular SPL tokens.',
      component: CompressedTokensDeepDiveQuest, 
      xp: 350,
      props: { title: 'Working with Compressed Tokens (cTokens)' },
      isComplete: !!completedQuests['zk-q4-compressed-tokens']
    },
    {
      id: 'zk-q5-compression-api',
      title: 'Using the Digital Asset Standard (DAS) API',
      description: 'Learn how to use the Digital Asset Standard API through Helius to query and retrieve data for compressed assets.',
      component: ZkCompressionUseCasesQuest,
      xp: 350,
      props: { title: 'Using the Digital Asset Standard (DAS) API' },
      isComplete: !!completedQuests['zk-q5-compression-api']
    },
    {
      id: 'zk-q6-merkle-tree-advanced',
      title: 'Advanced Merkle Tree Operations',
      description: 'Master merkle tree configurations including canopy depth, maximum depth, and buffer size to optimize for different use cases.',
      component: ZkCompressionToolsQuest,
      xp: 400,
      props: { title: 'Advanced Merkle Tree Operations' },
      isComplete: !!completedQuests['zk-q6-merkle-tree-advanced']
    },
    {
      id: 'zk-q7-integration',
      title: 'Integrating Compression into dApps',
      description: 'Build user interfaces that let users view, transfer, and interact with compressed NFTs and tokens, with wallet integration.',
      component: FirstCNFTConceptualQuest,
      xp: 450,
      props: { title: 'Integrating Compression into dApps' },
      isComplete: !!completedQuests['zk-q7-integration']
    },
    {
      id: 'zk-q8-capstone',
      title: 'Capstone: Build a Compressed Asset Marketplace',
      description: 'Build a simplified marketplace for compressed NFTs with merkle trees, sample cNFTs, and a user interface for browsing and purchasing.',
      component: ZkHackathonBrainstormQuest,
      xp: 500,
      props: { title: 'Capstone: Build a Compressed Asset Marketplace' },
      isComplete: !!completedQuests['zk-q8-capstone']
    }
  ];

  const quests: ZkCompressionQuest[] = useMemo(() => getQuestsList(), [completedQuests]);

  const handleQuestCompletion = (questId: string) => {
    try {
      // Update completion state using utility
      const updatedCompletions = updateQuestCompletion(PATH_KEY, questId);
      setCompletedQuests(updatedCompletions);
      
      // Update earned XP
      const quest = quests.find(q => q.id === questId);
      if (quest && !completedQuests[questId]) { // Only add XP if not already completed
        setEarnedXP(prev => prev + (quest.xp || 0));
      }
      
      // Update UI
      const currentIndex = quests.findIndex(q => q.id === questId);
      if (currentIndex !== -1 && currentIndex < quests.length - 1) {
        // Move to next quest
        const nextQuestId = quests[currentIndex + 1].id;
        setActiveQuestId(nextQuestId);
      } else if (currentIndex === quests.length - 1) {
        // Last quest completed
        console.log("ZK Compression Path Completed!");
        // Display completion celebration
        alert(`Congratulations! You've completed the ZK Compression learning path! Total XP earned: ${earnedXP}`);
      }
    } catch (error) {
      console.error("Error in quest completion handler:", error);
    }
  };

  const activeQuest = quests.find(q => q.id === activeQuestId);
  const ActiveQuestComponent = activeQuest ? activeQuest.component : null;

  // Calculate total XP
  const totalXP = quests.reduce((sum, quest) => sum + (quest.xp || 0), 0);

  return (
    <QuestPageLayout
      pathTitle="ZK Compression Developer Path"
      quests={quests}
      activeQuestId={activeQuestId}
      onSelectQuest={setActiveQuestId}
      totalXP={totalXP}
      earnedXP={earnedXP}
    >
      {ActiveQuestComponent && activeQuest && (
        <ActiveQuestComponent 
          onQuestComplete={() => handleQuestCompletion(activeQuest.id)}
          xpReward={activeQuest.xp}
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