'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { QuestPageLayout, QuestListItem } from '@/components/layout/QuestPageLayout';
import { loadQuestCompletions, updateQuestCompletion, calculateEarnedXP } from '@/lib/questStorage';

// Define the structure for individual quests within this path
interface WormholeQuest extends QuestListItem {
  description?: string;
  component: React.FC<any>;
  xp?: number;
  props?: any;
  isComplete: boolean;
}

// Placeholder component until we create specific quest components
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

const WormholePathPage = () => {
  const [activeQuestId, setActiveQuestId] = useState<string>('intro'); 
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const PATH_KEY = 'wormhole';

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
      id: 'intro',
      title: 'Introduction to Wormhole and Multichain Concepts',
      description: 'Learn the fundamentals of cross-chain communication and how Wormhole enables secure messaging between blockchains.',
      component: PlaceholderQuestComponent,
      xp: 250,
      props: { title: 'Introduction to Wormhole and Multichain Concepts' },
      isComplete: !!completedQuests['intro']
    },
    {
      id: 'setup',
      title: 'Setting Up Your Development Environment',
      description: 'Configure your environment with the necessary tools and SDKs for Wormhole development.',
      component: PlaceholderQuestComponent,
      xp: 300,
      props: { title: 'Setting Up Your Development Environment' },
      isComplete: !!completedQuests['setup']
    },
    {
      id: 'first-transfer',
      title: 'Building Your First Cross-Chain Transfer',
      description: 'Learn to transfer tokens between Solana and another blockchain using Wormhole.',
      component: PlaceholderQuestComponent,
      xp: 350,
      props: { title: 'Building Your First Cross-Chain Transfer' },
      isComplete: !!completedQuests['first-transfer']
    },
    {
      id: 'connect',
      title: 'Integrating Wormhole Connect',
      description: 'Implement the Wormhole Connect widget into a web application for easy cross-chain transfers.',
      component: PlaceholderQuestComponent,
      xp: 350,
      props: { title: 'Integrating Wormhole Connect' },
      isComplete: !!completedQuests['connect']
    },
    {
      id: 'verify',
      title: 'Submitting and Verifying Cross-Chain Transactions',
      description: 'Learn to track and verify the status of messages sent through Wormhole.',
      component: PlaceholderQuestComponent,
      xp: 400,
      props: { title: 'Submitting and Verifying Cross-Chain Transactions' },
      isComplete: !!completedQuests['verify']
    },
    {
      id: 'capstone',
      title: 'Capstone: Launch a Multichain Quest',
      description: 'Build a small multichain application that demonstrates the concepts you\'ve learned.',
      component: PlaceholderQuestComponent,
      xp: 450,
      props: { title: 'Capstone: Launch a Multichain Quest' },
      isComplete: !!completedQuests['capstone']
    }
  ];

  const quests: WormholeQuest[] = useMemo(() => getQuestsList(), [completedQuests]);

  const handleQuestCompletion = (questId: string) => {
    try {
      // Update completion state
      const updatedCompletions = updateQuestCompletion(PATH_KEY, questId);
      setCompletedQuests(updatedCompletions);
      
      // Update earned XP
      const quest = quests.find(q => q.id === questId);
      if (quest && !completedQuests[questId]) {
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
        console.log("Wormhole Path Completed!");
        // Display completion celebration
        alert(`Congratulations! You've completed the Wormhole learning path! Total XP earned: ${earnedXP}`);
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
      pathTitle="Wormhole Multichain Path"
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
          {...activeQuest.props}
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

export default WormholePathPage; 