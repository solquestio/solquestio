'use client';

import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface QuestHeaderProps {
  title: string;
  icon?: React.ReactNode;
  xpReward?: number;
  className?: string;
}

/**
 * A standardized header component for quest pages that displays the title and XP reward
 */
export const QuestHeader: React.FC<QuestHeaderProps> = ({ 
  title, 
  icon = <SparklesIcon className="h-7 w-7 text-purple-400 mr-3" />,
  xpReward,
  className = "" 
}) => {
  return (
    <div className={`flex items-start justify-between mb-6 relative z-10 ${className}`}>
      <div className="flex items-center">
        {icon}
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      {xpReward !== undefined && (
        <div className="bg-purple-900/40 px-3 py-1 rounded-full border border-purple-500/50 text-purple-300 font-semibold flex items-center">
          <span className="text-yellow-400 mr-1">+{xpReward}</span> XP
        </div>
      )}
    </div>
  );
};

/**
 * A reusable success animation component for quests
 */
export const QuestCompletionAnimation: React.FC<{ show: boolean; xpReward?: number }> = ({ 
  show, 
  xpReward 
}) => {
  if (!show) return null;
  
  return (
    <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-blue-500/30 flex items-center justify-center z-50 animate-pulse">
      <div className="bg-gray-900/90 rounded-2xl p-8 flex flex-col items-center shadow-2xl transform animate-bounce-small">
        <svg className="w-16 h-16 text-green-400 mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        <h3 className="text-2xl font-bold text-white mb-2">Quest Completed!</h3>
        {xpReward !== undefined && (
          <p className="text-xl font-semibold text-green-400">+{xpReward} XP</p>
        )}
      </div>
    </div>
  );
}; 