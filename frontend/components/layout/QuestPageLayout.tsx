'use client';
import React, { ReactNode } from 'react';

// Ensure this interface is exported
export interface QuestListItem {
  id: string;
  title: string;
  isComplete?: boolean;
  isActive?: boolean;
  isLocked?: boolean;
}

interface QuestPageLayoutProps {
  pathTitle: string;
  quests: QuestListItem[];
  activeQuestId: string | null;
  onSelectQuest: (questId: string) => void;
  children: ReactNode;
  totalXP?: number;
  earnedXP?: number;
  isDemoPath?: boolean;
}

// Ensure the component is exported
export const QuestPageLayout: React.FC<QuestPageLayoutProps> = ({
  pathTitle,
  quests,
  activeQuestId,
  onSelectQuest,
  children,
  totalXP,
  earnedXP,
  isDemoPath = false,
}) => {
  // ... (JSX from your current version, ensure it's correct)
  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <nav className="w-full md:w-1/4 lg:w-1/5 bg-dark-card p-4 rounded-xl shadow-lg h-fit sticky top-24">
        <h2 className="text-xl font-semibold mb-5 text-gray-100 border-b border-gray-700 pb-3">
          {pathTitle}
          {isDemoPath && (
            <span className="ml-2 px-2 py-0.5 bg-amber-700/60 text-amber-300 text-xs font-medium uppercase rounded tracking-wide">
              Demo
            </span>
          )}
        </h2>
        
        {/* XP Progress if provided */}
        {totalXP && earnedXP !== undefined && (
          <div className="mb-5 bg-gray-800/50 p-3 rounded-lg">
            <div className="flex justify-between text-sm font-medium mb-1.5">
              <span className="text-gray-300">Progress</span>
              <span className={isDemoPath ? "text-amber-300" : "text-blue-300"}>
                {earnedXP} / {totalXP} XP
                {isDemoPath && <span className="ml-1 text-xs">(Demo)</span>}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isDemoPath 
                    ? "bg-gradient-to-r from-amber-500 to-amber-400" 
                    : "bg-gradient-to-r from-blue-500 to-blue-400"
                }`}
                style={{ width: `${Math.min(100, (earnedXP / totalXP) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <ul className="space-y-1.5">
          {quests.map((quest) => (
            <li key={quest.id}>
              <button
                onClick={() => !quest.isLocked && onSelectQuest(quest.id)}
                disabled={quest.isLocked}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out flex items-center group ${
                  activeQuestId === quest.id 
                    ? (isDemoPath ? 'bg-amber-600 text-white shadow-md' : 'bg-solana-purple text-white shadow-md') 
                    : quest.isComplete 
                      ? (isDemoPath ? 'bg-amber-700/40 text-amber-300 hover:bg-amber-600/60 hover:text-amber-100' : 'bg-green-700/40 text-green-300 hover:bg-green-600/60 hover:text-green-100') 
                      : quest.isLocked 
                        ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed' 
                        : 'text-gray-300 hover:bg-gray-700/60 hover:text-gray-100'
                }`}
              >
                <span className={`mr-2 text-lg transition-transform duration-200 ${activeQuestId === quest.id ? 'rotate-0' : 'group-hover:rotate-[10deg]'}`}>
                  {quest.isComplete ? '✅' : quest.isLocked ? '🔒' : '➡️'}
                </span>
                {quest.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="w-full md:w-3/4 lg:w-4/5 bg-dark-card p-6 md:p-8 rounded-xl shadow-lg">
        {children}
      </main>
    </div>
  );
}; 