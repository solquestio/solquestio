'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';

interface QuestNode {
  id: string;
  title: string;
  description: string;
  position: { x: number, y: number };
  type: 'common' | 'beginner' | 'intermediate' | 'advanced';
  xp: number;
  requiredIds?: string[];
  questComponent: string;
}

interface QuestPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  color: string;
  backgroundColor: string;
  questIds: string[];
}

export default function SubstreamsQuestMap() {
  const router = useRouter();
  const { connected } = useWallet();
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [selectedQuest, setSelectedQuest] = useState<QuestNode | null>(null);
  const [showQuestDetails, setShowQuestDetails] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  // Define quest nodes
  const questNodes: QuestNode[] = [
    // Common entry point
    {
      id: 'entry-point',
      title: 'Substreams Welcome',
      description: 'Start your journey with The Graph Substreams',
      position: { x: 50, y: 15 },
      type: 'common',
      xp: 25,
      questComponent: 'SubstreamsIntroQuest'
    },
    
    // Beginner Path
    {
      id: 'visual-explorer',
      title: 'Pipeline Visualizer',
      description: 'See how data flows through a Substreams pipeline',
      position: { x: 30, y: 30 },
      type: 'beginner',
      xp: 50,
      requiredIds: ['entry-point'],
      questComponent: 'SubstreamsVisualQuest'
    },
    {
      id: 'concepts-quiz',
      title: 'Concepts Challenge',
      description: 'Test your understanding of Substreams fundamentals',
      position: { x: 20, y: 45 },
      type: 'beginner',
      xp: 75,
      requiredIds: ['visual-explorer'],
      questComponent: 'SubstreamsQuizQuest'
    },
    {
      id: 'simple-dashboard',
      title: 'Data Explorer',
      description: 'Create a simple dashboard with pre-indexed Substreams data',
      position: { x: 10, y: 65 },
      type: 'beginner',
      xp: 100,
      requiredIds: ['concepts-quiz'],
      questComponent: 'SubstreamsSimpleDashboardQuest'
    },
    {
      id: 'explorer-badge',
      title: 'Data Explorer Badge',
      description: 'Claim your Data Explorer badge and certificate',
      position: { x: 15, y: 85 },
      type: 'beginner',
      xp: 125,
      requiredIds: ['simple-dashboard'],
      questComponent: 'SubstreamsCertificateQuest'
    },

    // Intermediate Path
    {
      id: 'dev-setup',
      title: 'Developer Setup',
      description: 'Set up your environment for Substreams development',
      position: { x: 50, y: 35 },
      type: 'intermediate',
      xp: 75,
      requiredIds: ['entry-point'],
      questComponent: 'SubstreamsSetupQuest'
    },
    {
      id: 'first-module',
      title: 'Your First Module',
      description: 'Create your first map module for Solana data',
      position: { x: 55, y: 50 },
      type: 'intermediate',
      xp: 100,
      requiredIds: ['dev-setup'],
      questComponent: 'SubstreamsBasicQuest'
    },
    {
      id: 'token-indexer',
      title: 'Token Indexer',
      description: 'Build a token transfer indexer with store modules',
      position: { x: 60, y: 65 },
      type: 'intermediate',
      xp: 150,
      requiredIds: ['first-module'],
      questComponent: 'SubstreamsTransformQuest'
    },
    {
      id: 'developer-badge',
      title: 'Substreams Developer Badge',
      description: 'Deploy your indexer and claim your developer badge',
      position: { x: 55, y: 85 },
      type: 'intermediate',
      xp: 200,
      requiredIds: ['token-indexer'],
      questComponent: 'SubstreamsDeployQuest'
    },

    // Advanced Path
    {
      id: 'advanced-patterns',
      title: 'Advanced Patterns',
      description: 'Learn advanced module patterns and techniques',
      position: { x: 70, y: 30 },
      type: 'advanced',
      xp: 100,
      requiredIds: ['entry-point'],
      questComponent: 'SubstreamsAdvancedQuest'
    },
    {
      id: 'cross-chain',
      title: 'Cross-Chain Bridge',
      description: 'Track Wormhole messages between Solana and other chains',
      position: { x: 75, y: 45 },
      type: 'advanced',
      xp: 150,
      requiredIds: ['advanced-patterns'],
      questComponent: 'SubstreamsWormholeQuest'
    },
    {
      id: 'ai-insights',
      title: 'AI-Enhanced Insights',
      description: 'Combine Substreams with AI for smarter data analysis',
      position: { x: 85, y: 65 },
      type: 'advanced',
      xp: 200,
      requiredIds: ['cross-chain'],
      questComponent: 'SubstreamsAIQuest'
    },
    {
      id: 'master-badge',
      title: 'Substreams Master Badge',
      description: 'Create a production-ready project and earn your master badge',
      position: { x: 80, y: 85 },
      type: 'advanced',
      xp: 250,
      requiredIds: ['ai-insights'],
      questComponent: 'SubstreamsHackathonQuest'
    }
  ];

  // Define quest paths
  const questPaths: QuestPath[] = [
    {
      id: 'beginner',
      title: 'Explorer Path',
      description: 'Learn Substreams through visual tools with no coding required',
      difficulty: 'beginner',
      color: 'border-emerald-500',
      backgroundColor: 'from-emerald-900/40 to-emerald-900/5',
      questIds: questNodes.filter(node => node.type === 'beginner').map(node => node.id)
    },
    {
      id: 'intermediate',
      title: 'Developer Path',
      description: 'Build and deploy your own Substreams modules',
      difficulty: 'intermediate',
      color: 'border-blue-500',
      backgroundColor: 'from-blue-900/40 to-blue-900/5',
      questIds: questNodes.filter(node => node.type === 'intermediate').map(node => node.id)
    },
    {
      id: 'advanced',
      title: 'Expert Path',
      description: 'Master advanced techniques for complex data applications',
      difficulty: 'advanced',
      color: 'border-purple-500',
      backgroundColor: 'from-purple-900/40 to-purple-900/5',
      questIds: questNodes.filter(node => node.type === 'advanced').map(node => node.id)
    }
  ];

  // Load completed quests from localStorage
  useEffect(() => {
    const storedCompletions = localStorage.getItem('substreams-quest-completions');
    if (storedCompletions) {
      setCompletedQuests(JSON.parse(storedCompletions));
    } else {
      // For demo purposes, set entry point as completed by default
      setCompletedQuests({ 'entry-point': true });
      localStorage.setItem('substreams-quest-completions', JSON.stringify({ 'entry-point': true }));
    }
  }, []);

  const isQuestAvailable = (questId: string): boolean => {
    const quest = questNodes.find(q => q.id === questId);
    if (!quest) return false;
    
    // If no prerequisites, quest is available
    if (!quest.requiredIds || quest.requiredIds.length === 0) return true;
    
    // Check if all required quests are completed
    return quest.requiredIds.every(reqId => completedQuests[reqId]);
  };

  const startQuest = (questId: string) => {
    // Instead of just showing the modal, navigate to the actual quest
    const questNode = questNodes.find(q => q.id === questId);
    if (questNode && isQuestAvailable(questId)) {
      // First, show details modal
      setSelectedQuest(questNode);
      setShowQuestDetails(true);
      
      // When user clicks start in modal, we'll navigate to the quest
      // This logic is handled in the modal's start button onClick
    }
  };

  const getQuestStatusClass = (questId: string): string => {
    if (completedQuests[questId]) return 'bg-green-500';
    if (isQuestAvailable(questId)) return 'bg-yellow-500';
    return 'bg-gray-700';
  };

  const getNodeColor = (type: string): string => {
    switch (type) {
      case 'common': return 'bg-gradient-to-br from-gray-800 to-gray-900';
      case 'beginner': return 'bg-gradient-to-br from-emerald-900 to-emerald-800';
      case 'intermediate': return 'bg-gradient-to-br from-blue-900 to-blue-800';
      case 'advanced': return 'bg-gradient-to-br from-purple-900 to-purple-800';
      default: return 'bg-gray-800';
    }
  };

  const getNodeBorderColor = (type: string, isAvailable: boolean, isCompleted: boolean): string => {
    if (isCompleted) return 'border-green-500';
    if (isAvailable) return 'border-yellow-500';
    
    switch (type) {
      case 'common': return 'border-gray-600';
      case 'beginner': return 'border-emerald-800';
      case 'intermediate': return 'border-blue-800';
      case 'advanced': return 'border-purple-800';
      default: return 'border-gray-700';
    }
  };

  const getPathColorClass = (pathId: string, isConnection = false): string => {
    const strokeWidth = isConnection ? 'stroke-[3]' : 'stroke-[10]';
    switch (pathId) {
      case 'beginner': return `stroke-emerald-600 ${strokeWidth} ${hoveredPath === 'beginner' ? 'opacity-100' : 'opacity-60'}`;
      case 'intermediate': return `stroke-blue-600 ${strokeWidth} ${hoveredPath === 'intermediate' ? 'opacity-100' : 'opacity-60'}`;
      case 'advanced': return `stroke-purple-600 ${strokeWidth} ${hoveredPath === 'advanced' ? 'opacity-100' : 'opacity-60'}`;
      default: return `stroke-gray-600 ${strokeWidth}`;
    }
  };

  const isNodeInPath = (nodeId: string, pathId: string): boolean => {
    const path = questPaths.find(p => p.id === pathId);
    return path?.questIds.includes(nodeId) || nodeId === 'entry-point';
  };

  return (
    <div className="min-h-screen pt-4 pb-12">
      <div className="container mx-auto px-4">        
        {/* Path Legend */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          {questPaths.map(path => (
            <div 
              key={path.id}
              className={`px-4 py-2 rounded-full border ${path.color} cursor-pointer transition-colors ${
                hoveredPath === path.id ? 'bg-gray-800' : 'bg-gray-900/50'
              }`}
              onMouseEnter={() => setHoveredPath(path.id)}
              onMouseLeave={() => setHoveredPath(null)}
            >
              <span className={`text-sm font-medium ${
                path.id === 'beginner' ? 'text-emerald-400' :
                path.id === 'intermediate' ? 'text-blue-400' : 'text-purple-400'
              }`}>
                {path.title}
              </span>
            </div>
          ))}
        </div>

        {/* Quest Map */}
        <div className="relative h-[700px] bg-gray-900 rounded-xl overflow-hidden border border-gray-800 mb-6">
          {/* Path gradient backgrounds */}
          <div className="absolute inset-0">
            {questPaths.map(path => (
              <div
                key={path.id}
                className={`absolute inset-0 bg-gradient-to-b ${path.backgroundColor} opacity-${hoveredPath === path.id || !hoveredPath ? '100' : '30'} transition-opacity duration-500`}
              />
            ))}
          </div>
          
          {/* Background gridlines */}
          <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 opacity-10">
            {Array(20).fill(0).map((_, i) => (
              <div key={`col-${i}`} className="border-r border-gray-500 h-full" />
            ))}
            {Array(20).fill(0).map((_, i) => (
              <div key={`row-${i}`} className="border-b border-gray-500 w-full" />
            ))}
          </div>
          
          {/* Path curves and connections */}
          <svg className="absolute inset-0 w-full h-full">
            {/* Beginner path curve */}
            <path
              d="M50,15 C40,20 35,25 30,30 C25,35 22,40 20,45 C18,50 15,55 10,65 C8,75 12,80 15,85"
              fill="none"
              className={`${getPathColorClass('beginner')} opacity-20`}
              strokeLinecap="round"
            />
            
            {/* Intermediate path curve */}
            <path
              d="M50,15 C50,20 50,25 50,35 C50,40 52,45 55,50 C58,55 59,60 60,65 C60,75 57,80 55,85"
              fill="none"
              className={`${getPathColorClass('intermediate')} opacity-20`}
              strokeLinecap="round"
            />
            
            {/* Advanced path curve */}
            <path
              d="M50,15 C60,20 65,25 70,30 C72,35 74,40 75,45 C78,50 82,55 85,65 C83,75 81,80 80,85"
              fill="none"
              className={`${getPathColorClass('advanced')} opacity-20`}
              strokeLinecap="round"
            />
            
            {/* Node connections */}
            {questNodes.map(quest => {
              if (!quest.requiredIds) return null;
              
              return quest.requiredIds.map(reqId => {
                const sourceQuest = questNodes.find(q => q.id === reqId);
                if (!sourceQuest) return null;
                
                // Determine path type for styling
                let pathType = 'common';
                if (quest.type === 'beginner' || sourceQuest.type === 'beginner') pathType = 'beginner';
                if (quest.type === 'intermediate' || sourceQuest.type === 'intermediate') pathType = 'intermediate';
                if (quest.type === 'advanced' || sourceQuest.type === 'advanced') pathType = 'advanced';
                
                return (
                  <line 
                    key={`${reqId}-${quest.id}`}
                    x1={`${sourceQuest.position.x}%`}
                    y1={`${sourceQuest.position.y}%`}
                    x2={`${quest.position.x}%`}
                    y2={`${quest.position.y}%`}
                    className={getPathColorClass(pathType, true)}
                    strokeDasharray={completedQuests[reqId] ? "none" : "6,3"}
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(255,255,255,0.1))",
                      opacity: (!hoveredPath || hoveredPath === pathType) ? 1 : 0.3
                    }}
                  />
                );
              });
            })}
          </svg>

          {/* Quest nodes */}
          {questNodes.map(quest => {
            const isAvailable = isQuestAvailable(quest.id);
            const isCompleted = !!completedQuests[quest.id];
            const opacity = hoveredPath && !isNodeInPath(quest.id, hoveredPath) ? 'opacity-30' : 'opacity-100';
            
            return (
              <div 
                key={quest.id}
                className={`absolute rounded-xl w-28 h-28 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110 ${opacity}`}
                style={{ 
                  left: `${quest.position.x}%`, 
                  top: `${quest.position.y}%`,
                  boxShadow: isCompleted 
                    ? '0 0 15px rgba(16, 185, 129, 0.5)' 
                    : isAvailable 
                      ? '0 0 15px rgba(202, 138, 4, 0.3)' 
                      : 'none'
                }}
                onClick={() => {
                  if (isAvailable) {
                    startQuest(quest.id);
                  }
                }}
              >
                <div 
                  className={`w-full h-full rounded-xl flex flex-col items-center justify-center p-3 ${getNodeColor(quest.type)} border-2 ${getNodeBorderColor(quest.type, isAvailable, isCompleted)}`}
                >
                  <div className={`w-4 h-4 rounded-full mb-2 ${getQuestStatusClass(quest.id)}`}></div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-white mb-1">{quest.title}</p>
                    <p className="text-[10px] text-yellow-400">+{quest.xp} XP</p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Entry Point Label */}
          <div className="absolute" style={{ top: '5%', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="bg-gray-800/80 rounded-md px-3 py-1 text-white text-sm font-medium">
              START HERE
            </div>
          </div>
        </div>
        
        {/* Path Descriptions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {questPaths.map(path => {
            const pathQuests = questNodes.filter(q => path.questIds.includes(q.id));
            const completedCount = pathQuests.filter(q => completedQuests[q.id]).length;
            const progressPercent = pathQuests.length ? (completedCount / pathQuests.length) * 100 : 0;
            
            return (
              <div 
                key={path.id}
                className={`bg-gray-800/80 rounded-xl p-5 border ${path.color} ${hoveredPath === path.id ? 'ring-2' : ''}`}
                onMouseEnter={() => setHoveredPath(path.id)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <h3 className={`text-lg font-bold mb-2 ${
                  path.id === 'beginner' ? 'text-emerald-400' :
                  path.id === 'intermediate' ? 'text-blue-400' : 'text-purple-400'
                }`}>{path.title}</h3>
                
                <p className="text-gray-300 text-sm mb-4">{path.description}</p>
                
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-gray-300">{completedCount}/{pathQuests.length} quests</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full ${
                      path.id === 'beginner' ? 'bg-emerald-500' :
                      path.id === 'intermediate' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                
                <button 
                  className={`mt-3 w-full py-2 rounded-md text-white text-sm font-medium ${
                    path.id === 'beginner' ? 'bg-emerald-700 hover:bg-emerald-800' :
                    path.id === 'intermediate' ? 'bg-blue-700 hover:bg-blue-800' : 
                    'bg-purple-700 hover:bg-purple-800'
                  } transition-colors`}
                  onClick={() => {
                    const firstIncompleteQuest = pathQuests.find(q => !completedQuests[q.id] && isQuestAvailable(q.id));
                    if (firstIncompleteQuest) {
                      startQuest(firstIncompleteQuest.id);
                    } else if (pathQuests.length > 0) {
                      // If all completed, start the first one again
                      startQuest(pathQuests[0].id);
                    }
                  }}
                >
                  Continue Path
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quest Details Modal */}
      {showQuestDetails && selectedQuest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md border border-gray-700 overflow-hidden">
            <div className={`p-3 ${
              selectedQuest.type === 'beginner' ? 'bg-emerald-900/50' :
              selectedQuest.type === 'intermediate' ? 'bg-blue-900/50' : 
              selectedQuest.type === 'advanced' ? 'bg-purple-900/50' : 'bg-gray-900/50'
            }`}>
              <h3 className="text-lg font-bold">{selectedQuest.title}</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-300 mb-4">{selectedQuest.description}</p>
              
              <div className="flex items-center justify-between mb-6">
                <div className="text-yellow-400 font-medium">+{selectedQuest.xp} XP</div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedQuest.type === 'beginner' ? 'bg-emerald-900/50 text-emerald-400' :
                  selectedQuest.type === 'intermediate' ? 'bg-blue-900/50 text-blue-400' : 
                  selectedQuest.type === 'advanced' ? 'bg-purple-900/50 text-purple-400' :
                  'bg-gray-900/50 text-gray-400'
                }`}>
                  {selectedQuest.type.charAt(0).toUpperCase() + selectedQuest.type.slice(1)}
                </div>
              </div>
              
              {selectedQuest.requiredIds && selectedQuest.requiredIds.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Prerequisites:</p>
                  <div className="space-y-2">
                    {selectedQuest.requiredIds.map(reqId => {
                      const req = questNodes.find(q => q.id === reqId);
                      return (
                        <div key={reqId} className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${completedQuests[reqId] ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                          <span className={`text-sm ${completedQuests[reqId] ? 'text-gray-300' : 'text-gray-500'}`}>
                            {req?.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowQuestDetails(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
                >
                  Close
                </button>
                
                <button
                  onClick={() => {
                    if (isQuestAvailable(selectedQuest.id)) {
                      // Instead of just marking as completed, navigate to the actual quest page
                      router.push(`/quests/substreams/${selectedQuest.id}`);
                      setShowQuestDetails(false);
                    }
                  }}
                  disabled={!isQuestAvailable(selectedQuest.id)}
                  className={`px-4 py-2 rounded-md text-sm ${
                    isQuestAvailable(selectedQuest.id)
                      ? 'bg-blue-600 hover:bg-blue-700 transition-colors'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {completedQuests[selectedQuest.id] ? 'Replay Quest' : 'Start Quest'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 