'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Import all quest components
import { SubstreamsIntroQuest } from '@/components/quests/substreams/SubstreamsIntroQuest';
import { SubstreamsVisualQuest } from '@/components/quests/substreams/SubstreamsVisualQuest';
import { SubstreamsQuizQuest } from '@/components/quests/substreams/SubstreamsQuizQuest';
import { SubstreamsSetupQuest } from '@/components/quests/substreams/SubstreamsSetupQuest';
import { SubstreamsBasicQuest } from '@/components/quests/substreams/SubstreamsBasicQuest';
import { SubstreamsTransformQuest } from '@/components/quests/substreams/SubstreamsTransformQuest';
import { SubstreamsDeployQuest } from '@/components/quests/substreams/SubstreamsDeployQuest';
import { SubstreamsWormholeQuest } from '@/components/quests/substreams/SubstreamsWormholeQuest';
import { SubstreamsAIQuest } from '@/components/quests/substreams/SubstreamsAIQuest';

// Quest mapping configuration
const questComponents: Record<string, any> = {
  'entry-point': {
    component: SubstreamsIntroQuest,
    title: 'Substreams Welcome',
    description: 'Start your journey with The Graph Substreams',
    xp: 25,
    type: 'common'
  },
  'visual-explorer': {
    component: SubstreamsVisualQuest,
    title: 'Pipeline Visualizer',
    description: 'See how data flows through a Substreams pipeline',
    xp: 50,
    type: 'beginner'
  },
  'concepts-quiz': {
    component: SubstreamsQuizQuest,
    title: 'Concepts Challenge',
    description: 'Test your understanding of Substreams fundamentals',
    xp: 75,
    type: 'beginner'
  },
  'simple-dashboard': {
    component: SubstreamsVisualQuest, // Placeholder - should create a dashboard component
    title: 'Data Explorer',
    description: 'Create a simple dashboard with pre-indexed Substreams data',
    xp: 100,
    type: 'beginner'
  },
  'explorer-badge': {
    component: SubstreamsIntroQuest, // Placeholder - should create a certificate component
    title: 'Data Explorer Badge',
    description: 'Claim your Data Explorer badge and certificate',
    xp: 125,
    type: 'beginner'
  },
  'dev-setup': {
    component: SubstreamsSetupQuest,
    title: 'Developer Setup',
    description: 'Set up your environment for Substreams development',
    xp: 75,
    type: 'intermediate'
  },
  'first-module': {
    component: SubstreamsBasicQuest,
    title: 'Your First Module',
    description: 'Create your first map module for Solana data',
    xp: 100,
    type: 'intermediate'
  },
  'token-indexer': {
    component: SubstreamsTransformQuest,
    title: 'Token Indexer',
    description: 'Build a token transfer indexer with store modules',
    xp: 150,
    type: 'intermediate'
  },
  'developer-badge': {
    component: SubstreamsDeployQuest,
    title: 'Substreams Developer Badge',
    description: 'Deploy your indexer and claim your developer badge',
    xp: 200,
    type: 'intermediate'
  },
  'advanced-patterns': {
    component: SubstreamsTransformQuest, // Placeholder - should create advanced component
    title: 'Advanced Patterns',
    description: 'Learn advanced module patterns and techniques',
    xp: 100,
    type: 'advanced'
  },
  'cross-chain': {
    component: SubstreamsWormholeQuest,
    title: 'Cross-Chain Bridge',
    description: 'Track Wormhole messages between Solana and other chains',
    xp: 150,
    type: 'advanced'
  },
  'ai-insights': {
    component: SubstreamsAIQuest,
    title: 'AI-Enhanced Insights',
    description: 'Combine Substreams with AI for smarter data analysis',
    xp: 200,
    type: 'advanced'
  },
  'master-badge': {
    component: SubstreamsDeployQuest, // Placeholder - should create master badge component
    title: 'Substreams Master Badge',
    description: 'Create a production-ready project and earn your master badge',
    xp: 250,
    type: 'advanced'
  }
};

export default function QuestPage() {
  const params = useParams();
  const router = useRouter();
  const questId = params?.questId as string;
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load completed quests from localStorage
    const storedCompletions = localStorage.getItem('substreams-quest-completions');
    if (storedCompletions) {
      setCompletedQuests(JSON.parse(storedCompletions));
    }
  }, []);

  // Check if the quest exists
  const questData = questComponents[questId];
  
  if (!questData) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Quest Not Found</h2>
          <p className="text-gray-400 mb-6">
            The quest you're looking for doesn't exist or may have been moved.
          </p>
          <Link href="/paths/substreams" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-block">
            Return to Quest Map
          </Link>
        </div>
      </div>
    );
  }

  const QuestComponent = questData.component;
  const questType = questData.type;
  
  // Function to handle quest completion
  const handleQuestComplete = () => {
    // Mark the quest as completed
    const updatedCompletions = { ...completedQuests, [questId]: true };
    localStorage.setItem('substreams-quest-completions', JSON.stringify(updatedCompletions));
    
    // Wait a short time before redirecting back to the map
    setTimeout(() => {
      router.push('/paths/substreams');
    }, 1500);
  };

  const getHeaderColorClass = (type: string) => {
    switch(type) {
      case 'beginner': return 'bg-emerald-900/40 border-emerald-500/30';
      case 'intermediate': return 'bg-blue-900/40 border-blue-500/30';
      case 'advanced': return 'bg-purple-900/40 border-purple-500/30';
      default: return 'bg-gray-800 border-gray-700';
    }
  };

  const getTextColorClass = (type: string) => {
    switch(type) {
      case 'beginner': return 'text-emerald-400';
      case 'intermediate': return 'text-blue-400';
      case 'advanced': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      {/* Header */}
      <div className={`border-b ${getHeaderColorClass(questType)} p-4 mb-6`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/paths/substreams" className="text-sm text-gray-300 hover:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Quest Map
            </Link>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTextColorClass(questType)} border ${
              questType === 'beginner' ? 'border-emerald-500/30' : 
              questType === 'intermediate' ? 'border-blue-500/30' : 
              'border-purple-500/30'
            }`}>
              {questType.charAt(0).toUpperCase() + questType.slice(1)} Path
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white">{questData.title}</h1>
            <p className="text-gray-400 mt-1">{questData.description}</p>
          </div>
          
          <div className="mt-4 text-yellow-400 text-sm">
            +{questData.xp} XP
          </div>
        </div>
      </div>
      
      {/* Quest Content */}
      <div className="container mx-auto px-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <QuestComponent 
            onQuestComplete={handleQuestComplete}
            xpReward={questData.xp}
          />
        </div>
      </div>
    </div>
  );
} 