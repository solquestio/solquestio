'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaucetQuest } from '@/components/quests/FaucetQuest';
import { OmnichainMessengerQuest } from '@/components/quests/layerzero/OmnichainMessengerQuest';
import { TokenBridgeQuest } from '@/components/quests/layerzero/TokenBridgeQuest';
import { NftTraitRevealQuest } from '@/components/quests/layerzero/NftTraitRevealQuest';
import { OracleSignalQuest } from '@/components/quests/layerzero/OracleSignalQuest';
import { PracticalDevelopmentQuest } from '@/components/quests/layerzero/PracticalDevelopmentQuest';
import { DocsFeedbackQuest } from '@/components/quests/layerzero/DocsFeedbackQuest';
import { PerformanceOptimizationQuest } from '@/components/quests/layerzero/PerformanceOptimizationQuest';
import { QuestPageLayout, QuestListItem } from '@/components/layout/QuestPageLayout';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { loadQuestCompletions, updateQuestCompletion, calculateEarnedXP } from '@/lib/questStorage';

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
  const { connected } = useWallet();
  const [activeQuestId, setActiveQuestId] = useState<string>('fund-devnet'); // Default to first quest
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [showPathCompletion, setShowPathCompletion] = useState(false);
  const [totalPathXP, setTotalPathXP] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const PATH_KEY = 'layerZero';

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
      title: '2. Omnichain Messenger V2',
      description: 'Send a message from Solana to an EVM testnet via LayerZero V2.',
      component: OmnichainMessengerQuest,
      xp: 200,
      props: {} // No specific extra props for OmnichainMessengerQuest other than onQuestComplete
    },
    {
      id: 'oft-bridge',
      title: '3. V2 Token Bridge (OFT)',
      description: 'Bridge a test SPL token to an EVM chain using LayerZero V2 OFT standard.',
      component: TokenBridgeQuest, 
      xp: 300,
      props: {}
    },
    {
      id: 'nft-trait-reveal',
      title: '4. Cross-Chain NFT Trait Reveal',
      description: 'Reveal hidden NFT traits on Solana based on an EVM chain event using LayerZero V2.',
      component: NftTraitRevealQuest,
      xp: 350,
      props: {}
    },
    {
      id: 'oracle-signal',
      title: '5. Decentralized Oracle Signal',
      description: 'Trigger a Solana contract action from an EVM chain signal using LayerZero V2.',
      component: OracleSignalQuest,
      xp: 400,
      props: {}
    },
    {
      id: 'practical-development',
      title: '6. Practical OApp Development',
      description: 'Implement a real LayerZero V2 OApp on Solana with cross-chain messaging capabilities.',
      component: PracticalDevelopmentQuest,
      xp: 500,
      props: {}
    },
    {
      id: 'performance-optimization',
      title: '7. Performance Optimization',
      description: 'Learn how to optimize your LayerZero V2 applications for maximum performance and scalability.',
      component: PerformanceOptimizationQuest,
      xp: 450,
      props: {}
    },
    {
      id: 'docs-feedback',
      title: '8. Documentation & Feedback',
      description: 'Explore the LayerZero V2 documentation and provide feedback (required for hackathon entry).',
      component: DocsFeedbackQuest,
      xp: 300,
      props: {}
    },
  ], []);

  // Calculate total XP for the path
  useEffect(() => {
    const total = quests.reduce((sum, quest) => sum + (quest.xp || 0), 0);
    setTotalPathXP(total);
  }, [quests]);

  // Load completed quests from localStorage on mount (simple persistence for hackathon)
  useEffect(() => {
    const savedCompletions = loadQuestCompletions(PATH_KEY);
    setCompletedQuests(savedCompletions);
    
    // Calculate earned XP
    setEarnedXP(calculateEarnedXP(quests, savedCompletions));
    
    // Check if all quests are completed to show completion screen
    const allQuestsCompleted = quests.every(q => savedCompletions[q.id]);
    setShowPathCompletion(allQuestsCompleted);
    
    // Determine initial active quest (e.g., first uncompleted or first overall)
    const firstUncompleted = quests.find(q => !savedCompletions[q.id]);
    if (firstUncompleted) {
      setActiveQuestId(firstUncompleted.id);
    } else if (quests.length > 0) {
      // If all are completed, show the last quest
      setActiveQuestId(quests[quests.length - 1].id);
    }
  }, [quests]);

  const handleQuestCompletion = (questId: string) => {
    try {
      console.log(`Quest ${questId} completed!`);
      
      // Update completion state using utility
      const updatedCompletions = updateQuestCompletion(PATH_KEY, questId);
      setCompletedQuests(updatedCompletions);
      
      // Update earned XP
      const quest = quests.find(q => q.id === questId);
      if (quest && !updatedCompletions[questId]) { // Only add XP if not already completed
        const newEarnedXP = earnedXP + (quest.xp || 0);
        setEarnedXP(newEarnedXP);
      }

      // Check if this was the last quest
      const allCompleted = quests.every(q => 
        q.id === questId ? true : updatedCompletions[q.id]
      );
      
      if (allCompleted) {
        setShowPathCompletion(true);
      } else {
        // Advance to the next quest
        const currentIndex = quests.findIndex(q => q.id === questId);
        if (currentIndex !== -1 && currentIndex < quests.length - 1) {
          const nextQuest = quests[currentIndex + 1];
          setActiveQuestId(nextQuest.id);
        }
      }
    } catch (error) {
      console.error("Error in quest completion handler:", error);
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

  const handleNextQuest = () => {
    const currentIndex = quests.findIndex(q => q.id === activeQuestId);
    if (currentIndex !== -1 && currentIndex < quests.length - 1) {
      setActiveQuestId(quests[currentIndex + 1].id);
    }
  };

  const handlePreviousQuest = () => {
    const currentIndex = quests.findIndex(q => q.id === activeQuestId);
    if (currentIndex > 0) {
      setActiveQuestId(quests[currentIndex - 1].id);
    }
  };

  const currentQuestIndex = quests.findIndex(q => q.id === activeQuestId);

  const renderPathCompletion = () => (
    <div className="bg-gradient-to-b from-blue-900/50 to-purple-900/50 p-8 rounded-xl border border-purple-500/30 text-center">
      <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
        <CheckCircleIcon className="h-12 w-12 text-green-500" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Path Completed!</h2>
      <p className="text-xl text-gray-300 mb-6">Congratulations! You've completed the LayerZero V2 Omnichain Learning Path</p>
      
      <div className="bg-black/30 p-4 rounded-lg inline-block mb-6">
        <p className="text-2xl font-semibold text-yellow-400 mb-2">+{totalPathXP} XP Earned</p>
        <p className="text-gray-400">You've mastered the essentials of omnichain development with LayerZero V2</p>
      </div>
      
      <div className="space-y-2 mb-8 max-w-md mx-auto">
        {quests.map(quest => (
          <div key={quest.id} className="flex items-center justify-between bg-black/20 p-2 rounded">
            <span className="text-gray-300">{quest.title}</span>
            <span className="text-yellow-400 font-semibold">+{quest.xp} XP</span>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={() => setShowPathCompletion(false)} 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Review Quests
        </button>
        
        <a 
          href="https://layerzeronetwork.typeform.com/builderFeedback" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Submit Hackathon Feedback
        </a>
      </div>
      
      <div className="mt-6 text-sm text-yellow-400">
        <strong>Reminder:</strong> Don't forget to submit your feedback through the official form to qualify for the LayerZero Solana Breakout Track!
      </div>
    </div>
  );

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <div className="bg-dark-card p-8 rounded-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your Solana wallet to access the LayerZero V2 learning path quests.
          </p>
          <p className="text-amber-400 text-sm mb-4">
            Make sure your wallet is set to Solana Devnet for these quests.
          </p>
          <div className="bg-blue-900/20 p-4 rounded-lg text-left text-sm">
            <p className="text-white font-semibold mb-2">🏆 LayerZero Solana Breakout Track</p>
            <p className="text-gray-300">
              This learning path is designed to prepare you for the LayerZero Solana Breakout Track hackathon, with prizes up to $10,000 USDC!
            </p>
            <a 
              href="https://earn.superteam.fun/listing/layerzero-solana-breakout-track/" 
              target="_blank"
              rel="noopener noreferrer" 
              className="text-blue-400 hover:underline mt-2 inline-block"
            >
              View Hackathon Details →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuestPageLayout
      pathTitle="LayerZero V2 Omnichain Path"
      quests={questListForSidebar}
      activeQuestId={activeQuestId}
      onSelectQuest={(questId) => setActiveQuestId(questId)}
      totalXP={totalPathXP}
      earnedXP={earnedXP}
    >
      {showPathCompletion ? (
        renderPathCompletion()
      ) : (
        <>
          {ActiveQuestComponent && activeQuestData && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm text-gray-400">Quest {currentQuestIndex + 1} of {quests.length}</span>
                  <div className="h-1 bg-gray-700 rounded-full w-24 mt-1">
                    <div 
                      className="h-1 bg-blue-500 rounded-full" 
                      style={{ width: `${((currentQuestIndex + 1) / quests.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-400">Total XP Earned</span>
                  <p className="text-yellow-400 font-semibold">{earnedXP} / {totalPathXP} XP</p>
                </div>
              </div>
              
              {activeQuestId === 'fund-devnet' && (
                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-md text-sm">
                  <p className="text-blue-300">
                    <strong>LayerZero V2 Hackathon Path:</strong> This upgraded learning path is designed to help you prepare for the LayerZero Solana Breakout Track hackathon. Complete all quests to gain the knowledge you need to build innovative omnichain applications.
                  </p>
                </div>
              )}
              
              <ActiveQuestComponent 
                {...activeQuestData.props} // Spread the quest-specific props
                xpReward={activeQuestData.xp} // Pass the XP reward
                onQuestComplete={() => handleQuestCompletion(activeQuestId)} // Common completion handler
              />
              
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePreviousQuest}
                  disabled={currentQuestIndex === 0}
                  className={`flex items-center text-sm ${currentQuestIndex === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white'}`}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Previous Quest
                </button>
                
                <button
                  onClick={handleNextQuest}
                  disabled={currentQuestIndex === quests.length - 1 || 
                    (currentQuestIndex < quests.length - 1 && !completedQuests[activeQuestId])}
                  className={`flex items-center text-sm ${
                    currentQuestIndex === quests.length - 1 || 
                    (currentQuestIndex < quests.length - 1 && !completedQuests[activeQuestId])
                      ? 'text-gray-600 cursor-not-allowed' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Next Quest
                  <ArrowRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            </>
          )}
          {!ActiveQuestComponent && (
            <p className="text-gray-400">Select a quest to start, or an error occurred loading the quest.</p>
          )}
        </>
      )}
    </QuestPageLayout>
  );
};

export default LayerZeroLearningPathPage; 