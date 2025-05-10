'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaucetQuest } from '@/components/quests/FaucetQuest';
import { OmnichainMessengerQuest } from '@/components/quests/layerzero/OmnichainMessengerQuest';
import { TokenBridgeQuest } from '@/components/quests/layerzero/TokenBridgeQuest';
import { NftTraitRevealQuest } from '@/components/quests/layerzero/NftTraitRevealQuest';
import { OracleSignalQuest } from '@/components/quests/layerzero/OracleSignalQuest';
import { QuestPageLayout, QuestListItem } from '@/components/layout/QuestPageLayout';

// Define the structure for individual quests within this path
interface LayerZeroQuest extends QuestListItem {
  // id and title are from QuestListItem
  description?: string;
  component: React.FC<any>; // The actual quest component
  xp?: number;
  props?: any; // To hold specific props for each quest component
  // isLocked can be determined dynamically
}

const LayerZeroLearningPathPage = () => {
  const [activeQuestId, setActiveQuestId] = useState<string>('fund-devnet'); // Default to first quest
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({
    // 'fund-devnet': true, // Example if loaded from storage
  });

  const quests: LayerZeroQuest[] = useMemo(() => [
    {
      id: 'fund-devnet',
      title: '1. Fund Devnet Wallet',
      description: 'Ensure your Solana Devnet wallet has enough SOL for transactions.',
      component: FaucetQuest,
      xp: 50,
      props: { minRequiredSOL: 0.01 } // Specific props for FaucetQuest
    },
    {
      id: 'omni-messenger',
      title: '2. Omnichain Messenger',
      description: 'Send a message from Solana to an EVM testnet via LayerZero.',
      component: OmnichainMessengerQuest,
      xp: 200,
      props: {} // No specific extra props for OmnichainMessengerQuest other than onQuestComplete
    },
    {
      id: 'oft-bridge',
      title: '3. Token Bridge (OFT)',
      description: 'Bridge a test SPL token to an EVM chain and back.',
      component: TokenBridgeQuest, 
      xp: 300,
      props: {}
    },
    {
      id: 'nft-trait-reveal',
      title: '4. Cross-Chain NFT Trait Reveal',
      description: 'Reveal hidden NFT traits on Solana based on an EVM chain event.',
      component: NftTraitRevealQuest,
      xp: 350,
      props: {}
    },
    {
      id: 'oracle-signal',
      title: '5. Decentralized Oracle Signal',
      description: 'Trigger a Solana contract action from an EVM chain signal.',
      component: OracleSignalQuest,
      xp: 400,
      props: {}
    },
  ], []);

  // Load completed quests from localStorage on mount (simple persistence for hackathon)
  useEffect(() => {
    const storedCompletions = localStorage.getItem('layerzero-quest-completions');
    if (storedCompletions) {
      setCompletedQuests(JSON.parse(storedCompletions));
    }
    // Determine initial active quest (e.g., first uncompleted or first overall)
    const firstUncompleted = quests.find(q => !JSON.parse(storedCompletions || '{}')[q.id]);
    if (firstUncompleted) {
      setActiveQuestId(firstUncompleted.id);
    } else if (quests.length > 0) {
      setActiveQuestId(quests[0].id);
    }

  }, [quests]); // Rerun if quests definition changes, though it's stable here

  const handleQuestCompletion = (questId: string) => {
    console.log(`Quest ${questId} completed!`);
    const newCompletions = { ...completedQuests, [questId]: true };
    setCompletedQuests(newCompletions);
    localStorage.setItem('layerzero-quest-completions', JSON.stringify(newCompletions));

    // Advance to the next quest or show completion message
    const currentIndex = quests.findIndex(q => q.id === questId);
    if (currentIndex !== -1 && currentIndex < quests.length - 1) {
      const nextQuest = quests[currentIndex + 1];
      // Optionally, only auto-advance if the next quest isn't locked by other means
      setActiveQuestId(nextQuest.id);
    } else {
      // All quests in this path are complete (or this was the last one)
      console.log("LayerZero Path Complete!");
      // Potentially show a path completion summary
    }
  };

  const activeQuestData = quests.find(q => q.id === activeQuestId);
  const ActiveQuestComponent = activeQuestData?.component;

  const questListForSidebar: QuestListItem[] = quests.map((quest, index) => {
    let isLocked = false;
    if (index > 0) { // First quest is never locked by a previous one in its own path
        const previousQuestId = quests[index - 1].id;
        isLocked = !completedQuests[previousQuestId];
    }
    return {
        id: quest.id,
        title: quest.title,
        isComplete: !!completedQuests[quest.id],
        isActive: quest.id === activeQuestId,
        isLocked: isLocked,
    };
  });

  return (
    <QuestPageLayout
      pathTitle="LayerZero Learning Path"
      quests={questListForSidebar}
      activeQuestId={activeQuestId}
      onSelectQuest={(questId) => setActiveQuestId(questId)}
    >
      {ActiveQuestComponent && activeQuestData && (
        <ActiveQuestComponent 
          {...activeQuestData.props} // Spread the quest-specific props
          xpReward={activeQuestData.xp} // Pass the XP reward
          onQuestComplete={() => handleQuestCompletion(activeQuestId)} // Common completion handler
        />
      )}
      {!ActiveQuestComponent && <p>Select a quest to start, or an error occurred loading the quest.</p>}
    </QuestPageLayout>
  );
};

export default LayerZeroLearningPathPage; 