'use client';

import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { QuestPageLayout, QuestListItem } from '@/components/layout/QuestPageLayout';
import { loadQuestCompletions, updateDemoQuestCompletion, calculateEarnedXP, isPathDemo } from '@/lib/questStorage';

// Define the structure for individual quests within a path
export interface DemoQuest extends QuestListItem {
  description?: string;
  component: React.FC<any>;
  xp?: number;
  props?: any;
  isComplete: boolean;
}

interface DemoPathTemplateProps {
  pathKey: string;
  pathTitle: string;
  defaultQuestId: string;
  quests: (completedQuests: Record<string, boolean>) => DemoQuest[];
  children?: ReactNode;
}

export const DemoPathTemplate: React.FC<DemoPathTemplateProps> = ({
  pathKey,
  pathTitle,
  defaultQuestId,
  quests: getQuestsList,
  children,
}) => {
  const [activeQuestId, setActiveQuestId] = useState<string>(defaultQuestId);
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [earnedXP, setEarnedXP] = useState<number>(0);
  const isDemo = true; // Always true for demo paths

  // Load completed quests from localStorage on mount
  useEffect(() => {
    const savedCompletions = loadQuestCompletions(pathKey);
    setCompletedQuests(savedCompletions);
    
    // Set active quest to first incomplete quest or last quest if all complete
    const questsList = getQuestsList(savedCompletions);
    const firstIncompleteQuest = questsList.find(q => !savedCompletions[q.id]);
    if (firstIncompleteQuest) {
      setActiveQuestId(firstIncompleteQuest.id);
    } else if (questsList.length > 0) {
      // If all are completed, show the last quest
      setActiveQuestId(questsList[questsList.length - 1].id);
    }
    
    // Calculate earned XP
    setEarnedXP(calculateEarnedXP(questsList, savedCompletions));
  }, [pathKey, getQuestsList]);

  const quests = useMemo(() => getQuestsList(completedQuests), [getQuestsList, completedQuests]);

  const handleQuestCompletion = (questId: string) => {
    try {
      // Use the demo completion tracker to avoid sending to the backend
      const updatedCompletions = updateDemoQuestCompletion(pathKey, questId);
      setCompletedQuests(updatedCompletions);
      
      // Update earned XP (local state only)
      const quest = quests.find(q => q.id === questId);
      if (quest && !completedQuests[questId]) { // Only add XP if not already completed
        setEarnedXP(prev => prev + (quest.xp || 0));
      }
      
      // Move to next quest if available
      const currentIndex = quests.findIndex(q => q.id === questId);
      if (currentIndex !== -1 && currentIndex < quests.length - 1) {
        const nextQuestId = quests[currentIndex + 1].id;
        setActiveQuestId(nextQuestId);
      } else if (currentIndex === quests.length - 1) {
        // Last quest completed
        console.log(`${pathTitle} Path Completed! (Demo Mode)`);
        // Display completion celebration
        alert(`Congratulations! You've completed the ${pathTitle} learning path!\n\nNOTE: This is a demo path and the XP is not counted toward your real profile.`);
      }
    } catch (error) {
      console.error("Error in quest completion handler:", error);
    }
  };

  const activeQuest = quests.find(q => q.id === activeQuestId);
  const ActiveQuestComponent = activeQuest ? activeQuest.component : null;

  return (
    <QuestPageLayout
      pathTitle={pathTitle}
      quests={quests}
      activeQuestId={activeQuestId}
      onSelectQuest={setActiveQuestId}
      totalXP={quests.reduce((sum, quest) => sum + (quest.xp || 0), 0)}
      earnedXP={earnedXP}
      isDemoPath={isDemo}
    >
      <div className="mb-4 p-3 bg-amber-900/30 border border-amber-600/50 rounded-lg text-amber-300 text-sm">
        <p className="font-medium">⚠️ Demo Path: XP from this path will not be added to your profile or count toward the leaderboard.</p>
      </div>
      
      {children}
      
      {ActiveQuestComponent && activeQuest && (
        <ActiveQuestComponent 
          onQuestComplete={() => handleQuestCompletion(activeQuest.id)}
          xpReward={activeQuest.xp}
          {...activeQuest.props}
        />
      )}
      
      {!ActiveQuestComponent && !children && (
        <div className="p-6 bg-dark-card rounded-lg shadow-md text-gray-300">
          Please select a quest to begin.
        </div>
      )}
    </QuestPageLayout>
  );
};

// Placeholder component for quests under development
export const PlaceholderQuestComponent: React.FC<{ onQuestComplete: () => void, title: string, xpReward?: number }> = ({ 
  onQuestComplete, 
  title,
  xpReward = 0 
}) => (
  <div className="p-6 bg-dark-card rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-gray-100 mb-2">{title}</h3>
    {xpReward > 0 && (
      <p className="text-amber-400 text-sm font-medium mb-4">+{xpReward} XP (Demo)</p>
    )}
    <p className="text-gray-400 mb-6">This quest content is under development.</p>
    <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
      <p className="text-gray-300">
        In the final implementation, this quest will include interactive lessons, code examples, and verification steps.
      </p>
    </div>
    <button 
      onClick={onQuestComplete}
      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
    >
      Mark as Complete (Demo)
    </button>
  </div>
); 