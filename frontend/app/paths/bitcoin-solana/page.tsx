'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { QuestPageLayout, QuestListItem } from '@/components/layout/QuestPageLayout'; 
import { IntroToZeusBtcQuest } from '@/components/quests/bitcoin-solana/IntroToZeusBtcQuest';
import { ApolloExchangeQuest } from '@/components/quests/bitcoin-solana/ApolloExchangeQuest';
import { ZeusProgramLibraryQuest } from '@/components/quests/bitcoin-solana/ZeusProgramLibraryQuest';
import { MintingManagingZbtcQuest } from '@/components/quests/bitcoin-solana/MintingManagingZbtcQuest';
import { loadQuestCompletions, updateQuestCompletion, calculateEarnedXP } from '@/lib/questStorage';

// Placeholder for actual quest components - will be created later
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

// Define the structure for individual quests within this path
interface BitcoinSolanaQuest extends QuestListItem {
  description?: string;
  component: React.FC<any>; 
  xp?: number;
  props?: any; 
  isComplete: boolean;
}

const BitcoinSolanaLearningPathPage = () => {
  const [activeQuestId, setActiveQuestId] = useState<string>('btcsol-q1-intro'); // Default to first quest
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const PATH_KEY = 'bitcoinSolana';

  // Load completed quests from localStorage on mount
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
      id: 'btcsol-q1-intro',
      title: 'Introduction to Zeus Network & zBTC',
      description: 'Learn about the Zeus Network ecosystem and how it enables Bitcoin interoperability on Solana through zBTC.',
      component: IntroToZeusBtcQuest,
      xp: 200,
      props: { title: 'Introduction to Zeus Network & zBTC' },
      isComplete: !!completedQuests['btcsol-q1-intro']
    },
    {
      id: 'btcsol-q2-apollo',
      title: 'Understanding APOLLO: The Bitcoin On-Chain Exchange',
      description: 'Explore how APOLLO works to bridge Bitcoin and Solana, enabling seamless movement of BTC to zBTC and back.',
      component: ApolloExchangeQuest,
      xp: 250,
      props: { title: 'Understanding APOLLO: The Bitcoin On-Chain Exchange' },
      isComplete: !!completedQuests['btcsol-q2-apollo']
    },
    {
      id: 'btcsol-q3-zpl',
      title: 'Building with Zeus Program Library (ZPL)',
      description: 'Learn the fundamentals of the Zeus Program Library SDK and how to integrate it into your Solana applications.',
      component: ZeusProgramLibraryQuest,
      xp: 300,
      props: { title: 'Building with Zeus Program Library (ZPL)' },
      isComplete: !!completedQuests['btcsol-q3-zpl']
    },
    {
      id: 'btcsol-q4-minting',
      title: 'Minting and Managing zBTC',
      description: 'Create a simple application to mint, transfer, and manage zBTC tokens within the Solana ecosystem.',
      component: MintingManagingZbtcQuest,
      xp: 350,
      props: { title: 'Minting and Managing zBTC' },
      isComplete: !!completedQuests['btcsol-q4-minting']
    },
    {
      id: 'btcsol-q5-defi',
      title: 'zBTC in DeFi Applications',
      description: 'Explore how to integrate zBTC into DeFi applications like lending platforms, yield farming, and more.',
      component: PlaceholderQuestComponent,
      xp: 400,
      props: { title: 'zBTC in DeFi Applications' },
      isComplete: !!completedQuests['btcsol-q5-defi']
    },
    {
      id: 'btcsol-q6-stablecoins',
      title: 'Creating Bitcoin-Backed Stablecoins',
      description: 'Learn to develop stablecoin solutions backed by zBTC and understand the economic principles behind them.',
      component: PlaceholderQuestComponent,
      xp: 450,
      props: { title: 'Creating Bitcoin-Backed Stablecoins' },
      isComplete: !!completedQuests['btcsol-q6-stablecoins']
    },
    {
      id: 'btcsol-q7-capstone',
      title: 'Capstone: Build a zBTC-Powered Application',
      description: 'Build a complete application that utilizes zBTC in an innovative way, incorporating the Zeus Network infrastructure.',
      component: PlaceholderQuestComponent,
      xp: 500,
      props: { title: 'Capstone: Build a zBTC-Powered Application' },
      isComplete: !!completedQuests['btcsol-q7-capstone']
    }
  ];

  const quests: BitcoinSolanaQuest[] = useMemo(() => getQuestsList(), [completedQuests]);

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
        console.log("Bitcoin on Solana Path Completed!");
        // Display completion celebration
        alert(`Congratulations! You've completed the Bitcoin on Solana learning path! Total XP earned: ${earnedXP}`);
      }
    } catch (error) {
      console.error("Error in quest completion handler:", error);
    }
  };

  const activeQuest = quests.find(q => q.id === activeQuestId);
  const ActiveQuestComponent = activeQuest ? activeQuest.component : null;

  return (
    <QuestPageLayout
      pathTitle="Bitcoin on Solana with Zeus Network"
      quests={quests}
      activeQuestId={activeQuestId}
      onSelectQuest={setActiveQuestId}
      totalXP={quests.reduce((sum, quest) => sum + (quest.xp || 0), 0)}
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

export default BitcoinSolanaLearningPathPage; 