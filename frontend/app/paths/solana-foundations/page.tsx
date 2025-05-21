'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { QuestPageLayout, QuestListItem } from '@/components/layout/QuestPageLayout';
import { loadQuestCompletions, updateQuestCompletion, calculateEarnedXP } from '@/lib/questStorage';
import { FaucetQuest } from '@/components/quests/FaucetQuest';
import { WalletConnectQuest } from '@/components/quests/WalletConnectQuest';
import { NFTVerificationQuest } from '@/components/quests/NFTVerificationQuest';

// Define the structure for individual quests within this path
interface SolanaExplorerQuest extends QuestListItem {
  description?: string;
  component: React.FC<any>;
  xp?: number;
  props?: any;
  isComplete: boolean;
}

const SolanaExplorerPathPage = () => {
  const { connected } = useWallet();
  const [activeQuestId, setActiveQuestId] = useState<string>('connect-wallet'); // Default to first quest
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const PATH_KEY = 'solanaExplorer';

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
      id: 'connect-wallet',
      title: '1. Connect Your Wallet',
      description: 'Connect your Solana wallet to get started with your learning journey.',
      component: WalletConnectQuest,
      xp: 50,
      props: { title: 'Connect Your Wallet' },
      isComplete: !!completedQuests['connect-wallet']
    },
    {
      id: 'fund-wallet',
      title: '2. Fund Your Wallet',
      description: 'Get some SOL from the faucet to start interacting with the Solana network.',
      component: FaucetQuest,
      xp: 150,
      props: { minRequiredSOL: 0.01 },
      isComplete: !!completedQuests['fund-wallet']
    },
    {
      id: 'verify-og-nft',
      title: '3. Mint and Verify OG NFT',
      description: 'Claim your exclusive SolQuest OG NFT and verify ownership.',
      component: NFTVerificationQuest,
      xp: 300,
      props: { title: 'Mint and Verify SolQuest OG NFT' },
      isComplete: !!completedQuests['verify-og-nft']
    }
  ];

  const quests: SolanaExplorerQuest[] = useMemo(() => getQuestsList(), [completedQuests]);

  // Handle quest completion
  const handleQuestCompletion = (questId: string) => {
    const newCompletedQuests = { ...completedQuests, [questId]: true };
    setCompletedQuests(newCompletedQuests);
    updateQuestCompletion(PATH_KEY, questId);
    setEarnedXP(calculateEarnedXP(quests, newCompletedQuests));
  };

  // Get the active quest component
  const activeQuest = quests.find(q => q.id === activeQuestId);
  const ActiveQuestComponent = activeQuest?.component;

  return (
    <div className="min-h-screen bg-dark-background">
      <div className="container mx-auto">
        <QuestPageLayout
          pathTitle="Solana Explorer Path"
          quests={quests.map(q => ({
            id: q.id,
            title: q.title,
            isComplete: q.isComplete,
            isActive: q.id === activeQuestId
          }))}
          activeQuestId={activeQuestId}
          onSelectQuest={setActiveQuestId}
          totalXP={quests.reduce((sum, quest) => sum + (quest.xp || 0), 0)}
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
      </div>
    </div>
  );
};

export default SolanaExplorerPathPage; 