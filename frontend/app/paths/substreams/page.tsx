'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { QuestPageLayout, QuestListItem } from '@/components/layout/QuestPageLayout';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { loadQuestCompletions, updateQuestCompletion, calculateEarnedXP } from '@/lib/questStorage';

// Define the structure for quests
interface SubstreamsQuest extends QuestListItem {
  description?: string;
  xp: number;
  content?: React.ReactNode;
  isHackathon?: boolean; // Flag to identify hackathon quests
  verifications?: QuestVerification[]; // New: Verification tasks for the quest
}

// New: Interface for quest verifications
interface QuestVerification {
  id: string;
  type: 'code' | 'quiz' | 'task';
  title: string;
  description: string;
  codeTemplate?: string; // Starting code for code challenges
  expectedOutput?: string; // For code verification
  options?: { id: string; text: string }[]; // For quizzes
  correctAnswer?: string; // For quizzes (or array of strings)
}

// New: Interface for playground state
interface PlaygroundState {
  code: string;
  output: string;
  isRunning: boolean;
  error: string | null;
}

// Interface for XP celebration popup
interface XPCelebration {
  show: boolean;
  xp: number;
  title: string;
}

// Import individual quest components later when needed
// For now, we'll define them inline

export default function SubstreamsLearningPage() {
  const [activeQuestId, setActiveQuestId] = useState<string>('substreams-intro');
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [showPathCompletion, setShowPathCompletion] = useState(false);
  const [totalPathXP, setTotalPathXP] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [currentQuestIndex, setCurrentQuestIndex] = useState(0);
  const [playground, setPlayground] = useState<PlaygroundState>({
    code: '',
    output: '',
    isRunning: false,
    error: null
  });
  const [verificationStatus, setVerificationStatus] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'content' | 'playground'>('content');
  const [celebration, setCelebration] = useState<XPCelebration>({
    show: false,
    xp: 0,
    title: ''
  });
  const PATH_KEY = 'substreams';

  const quests: SubstreamsQuest[] = useMemo(() => [
    // Core learning path quests
    {
      id: 'substreams-intro',
      title: '1. Substreams Introduction',
      description: 'Learn the basics of The Graph Substreams technology for Solana',
      xp: 25,
      verifications: [
        {
          id: 'intro-quiz',
          type: 'quiz',
          title: 'Understanding Substreams',
          description: 'Test your knowledge of Substreams fundamentals',
          options: [
            { id: 'a', text: 'A blockchain protocol for token transfers' },
            { id: 'b', text: 'A high-throughput blockchain indexing technology' },
            { id: 'c', text: 'A cryptocurrency on The Graph Network' },
            { id: 'd', text: 'A smart contract development framework' }
          ],
          correctAnswer: 'b'
        },
        {
          id: 'intro-task',
          type: 'task',
          title: 'Exploring Substreams Modules',
          description: 'Identify the two main types of modules in Substreams',
          correctAnswer: 'map and store'
        }
      ]
    },
    {
      id: 'setup-environment',
      title: '2. Environment Setup',
      description: 'Set up your development environment for Solana Substreams',
      xp: 50,
      verifications: [
        {
          id: 'setup-task',
          type: 'task',
          title: 'Install Substreams CLI',
          description: 'Install the Substreams CLI and obtain an authentication token',
          correctAnswer: 'installed'
        },
        {
          id: 'setup-code',
          type: 'code',
          title: 'Initialize Your First Solana Substreams Project',
          description: 'Use the command to initialize a Solana Substreams project',
          codeTemplate: '# Type the command to initialize a Solana Substreams project\n',
          expectedOutput: 'substreams init sol-minimal'
        }
      ]
    },
    {
      id: 'data-models',
      title: '3. Defining Data Models',
      description: 'Create Protocol Buffer data models for Solana Substreams',
      xp: 75,
      verifications: [
        {
          id: 'proto-code',
          type: 'code',
          title: 'Write a Protocol Buffer Definition for Solana Transactions',
          description: 'Create a proto definition for a Solana transaction object',
          codeTemplate: 'syntax = "proto3";\npackage solana.tx.v1;\n\nmessage SolanaTransaction {\n  // Add fields here\n}',
          expectedOutput: 'message SolanaTransaction {\n  string signature = 1;\n  string block_hash = 2;\n  repeated string signers = 3;\n  uint64 slot = 4;\n}'
        },
        {
          id: 'anchor-task',
          type: 'task',
          title: 'Solana Anchor Integration',
          description: 'What command would you use to initialize a Substreams project with Anchor IDL?',
          correctAnswer: 'substreams init sol-anchor-beta'
        }
      ]
    },
    {
      id: 'map-module',
      title: '4. First Map Module',
      description: 'Write your first map module to transform Solana blockchain data',
      xp: 100,
      verifications: [
        {
          id: 'map-module-quiz',
          type: 'quiz',
          title: 'Solana Map Modules',
          description: 'Which of the following best describes a Map Module in Solana Substreams?',
          options: [
            { id: 'a', text: 'A module that stores account data between blocks' },
            { id: 'b', text: 'A module that transforms block data into structured outputs' },
            { id: 'c', text: 'A module that routes data to different destinations' },
            { id: 'd', text: 'A module that validates Solana transactions' }
          ],
          correctAnswer: 'b'
        },
        {
          id: 'map-module-code',
          type: 'code',
          title: 'Write a Solana Program Filter',
          description: 'Write code to filter transactions for a specific Solana program ID',
          codeTemplate: '// Function to check if a transaction involves a specific program\nfn is_program_transaction(transaction: &Transaction, program_id: &str) -> bool {\n  // Your code here\n}',
          expectedOutput: 'transaction.message.account_keys.contains(program_id)'
        }
      ]
    },
    {
      id: 'store-module',
      title: '5. State Management',
      description: 'Build a store module to maintain state between Solana blocks',
      xp: 125,
      verifications: [
        {
          id: 'store-module-quiz',
          type: 'quiz',
          title: 'Store Modules Purpose',
          description: 'What is the primary purpose of a Store Module in Substreams?',
          options: [
            { id: 'a', text: 'To validate Solana transactions' },
            { id: 'b', text: 'To connect to external databases' },
            { id: 'c', text: 'To maintain state between blocks' },
            { id: 'd', text: 'To create React components' }
          ],
          correctAnswer: 'c'
        },
        {
          id: 'store-module-task',
          type: 'task',
          title: 'Understanding Solana Account States',
          description: 'What Solana-specific feature makes account state tracking important in Substreams?',
          correctAnswer: 'account model'
        }
      ]
    },
    {
      id: 'module-dependencies',
      title: '6. Module Dependencies',
      description: 'Structure a multi-module Substreams package for Solana data pipelines',
      xp: 150,
      verifications: [
        {
          id: 'module-dep-quiz',
          type: 'quiz',
          title: 'Module Dependency Graph',
          description: 'What is the advantage of a modular dependency graph in Substreams?',
          options: [
            { id: 'a', text: 'It allows for automatic code generation' },
            { id: 'b', text: 'It enables composability and reuse of data transformation modules' },
            { id: 'c', text: 'It reduces the cost of writing Solana transactions' },
            { id: 'd', text: 'It increases the number of available RPC endpoints' }
          ],
          correctAnswer: 'b'
        },
        {
          id: 'yaml-config-code',
          type: 'code',
          title: 'Define Module Dependencies in YAML',
          description: 'Write the YAML configuration for a module that depends on another module',
          codeTemplate: '# Module configuration in substreams.yaml\nmodules:\n  # Complete the configuration below\n  - name: token_transfers\n    kind: map\n    inputs:\n      # Define dependency on another module\n',
          expectedOutput: '- source: sf.solana.type.v1.Block'
        }
      ]
    },
    {
      id: 'debugging-testing',
      title: '7. Debugging and Testing',
      description: 'Learn techniques for debugging and testing Solana Substreams modules',
      xp: 175,
      verifications: [
        {
          id: 'debug-command-task',
          type: 'task',
          title: 'Substreams Run Command',
          description: 'What command would you use to run and test a Substreams module locally?',
          correctAnswer: 'substreams run'
        },
        {
          id: 'mock-data-quiz',
          type: 'quiz',
          title: 'Testing with Solana Data',
          description: 'Which approach is recommended for testing a Solana Substreams locally?',
          options: [
            { id: 'a', text: 'Using mainnet-fork of Solana' },
            { id: 'b', text: 'Running a local Solana validator' },
            { id: 'c', text: 'Testing against specific block ranges of real Solana data' },
            { id: 'd', text: 'Testing only in production' }
          ],
          correctAnswer: 'c'
        }
      ]
    },
    {
      id: 'deployment',
      title: '8. Deployment',
      description: 'Deploy your Solana Substreams to the Graph Network and substreams.dev',
      xp: 200,
      verifications: [
        {
          id: 'package-task',
          type: 'task',
          title: 'Substreams Package Format',
          description: 'What is the file extension for a packaged Substreams?',
          correctAnswer: '.spkg'
        },
        {
          id: 'deploy-command-quiz',
          type: 'quiz',
          title: 'Deploying Substreams',
          description: 'Where should you deploy your Substreams package for the hackathon?',
          options: [
            { id: 'a', text: 'To your local filesystem only' },
            { id: 'b', text: 'To substreams.dev' },
            { id: 'c', text: 'Only to a GitHub repository' },
            { id: 'd', text: 'To a custom Rust crate' }
          ],
          correctAnswer: 'b'
        }
      ]
    },
    {
      id: 'sink-connectors',
      title: '9. Database Sinks',
      description: 'Connect your Solana Substreams to database sinks for analytics and AI applications',
      xp: 225,
      verifications: [
        {
          id: 'sink-options-quiz',
          type: 'quiz',
          title: 'Substreams Sink Options',
          description: 'Which of the following is NOT a supported sink for Substreams?',
          options: [
            { id: 'a', text: 'PostgreSQL' },
            { id: 'b', text: 'MongoDB' },
            { id: 'c', text: 'Elasticsearch' },
            { id: 'd', text: 'Oracle DB' }
          ],
          correctAnswer: 'd'
        },
        {
          id: 'use-case-task',
          type: 'task',
          title: 'Analytics Use Case',
          description: 'For a Solana NFT analytics dashboard, which sink would be most appropriate?',
          correctAnswer: 'postgresql'
        }
      ]
    },
    {
      id: 'performance-optimization',
      title: '10. Performance Optimization',
      description: 'Optimize your Solana Substreams for better performance and scalability',
      xp: 250,
      verifications: [
        {
          id: 'perf-challenge-quiz',
          type: 'quiz',
          title: 'Solana Performance Challenges',
          description: 'What makes Solana data indexing particularly challenging?',
          options: [
            { id: 'a', text: 'Slow block times' },
            { id: 'b', text: 'Limited RPC nodes' },
            { id: 'c', text: 'High throughput and transaction volume' },
            { id: 'd', text: 'Small ecosystem' }
          ],
          correctAnswer: 'c'
        },
        {
          id: 'optimization-task',
          type: 'task',
          title: 'Optimization Techniques',
          description: 'Name one technique to optimize Substreams processing for high-throughput chains like Solana',
          correctAnswer: 'parallelization'
        }
      ]
    },
    {
      id: 'hackathon-project',
      title: '11. Hackathon Project',
      description: 'Prepare your Solana Substreams project for the hackathon submission',
      xp: 300,
      verifications: [
        {
          id: 'project-track-quiz',
          type: 'quiz',
          title: 'Hackathon Tracks',
          description: 'Which tracks are available in the Solana Substreams hackathon?',
          options: [
            { id: 'a', text: 'Only one general track' },
            { id: 'b', text: 'Analytics and NFT tracks' },
            { id: 'c', text: 'AI Agent, Analytics, and Wormhole-specific tracks' },
            { id: 'd', text: 'DeFi, GameFi, and Infrastructure tracks' }
          ],
          correctAnswer: 'c'
        },
        {
          id: 'project-requirements-task',
          type: 'task',
          title: 'Project Requirements',
          description: 'List the three key deliverables required for the hackathon submission',
          correctAnswer: 'github repository spkg substreams.dev'
        },
        {
          id: 'project-idea-code',
          type: 'code',
          title: 'Hackathon Project Idea',
          description: 'Outline your project idea in pseudo-code or a brief description',
          codeTemplate: '# My Solana Substreams Hackathon Project\n\n## Project Title\n[Your title here]\n\n## Track\n[AI Agent/Analytics/Wormhole]\n\n## Description\n[Describe your project]\n\n## Data Pipeline\n[Outline your data flow]',
          expectedOutput: 'description'
        }
      ]
    }
  ], []);

  // Load completed quests from localStorage or reset all completions
  useEffect(() => {
    // Get completed quests from localStorage
    const savedCompletions = loadQuestCompletions(PATH_KEY);
    setCompletedQuests(savedCompletions);
    
    // Calculate earned XP
    const earned = quests
      .filter(quest => savedCompletions[quest.id])
      .reduce((sum, quest) => sum + quest.xp, 0);
    setEarnedXP(earned);

    // Calculate total XP for the path
    const totalXP = quests.reduce((sum, quest) => sum + quest.xp, 0);
    setTotalPathXP(totalXP);

    // Check if all quests are completed to show completion screen
    const allQuestsCompleted = quests.every(q => savedCompletions[q.id]);
    if (allQuestsCompleted) {
      setShowPathCompletion(true);
    }
    
    // Determine initial active quest and its index
    const firstUncompleted = quests.find(q => !savedCompletions[q.id]);
    if (firstUncompleted) {
      setActiveQuestId(firstUncompleted.id);
    }
    setCurrentQuestIndex(quests.findIndex(q => q.id === activeQuestId));
  }, [quests, activeQuestId]);

  const handleQuestSelection = (questId: string) => {
    setActiveQuestId(questId);
    setCurrentQuestIndex(quests.findIndex(q => q.id === questId));
  };

  const completeQuest = (questId: string) => {
    try {
      // Get the quest that's being completed
      const quest = quests.find(q => q.id === questId);
      if (!quest) return;
      
      // Make sure all verifications are complete if the quest has verifications
      if (quest.verifications && quest.verifications.length > 0 && !areAllVerificationsComplete(questId)) {
        return; // Don't complete if verifications aren't done
      }
      
      // Update completion state using utility
      const updatedCompletions = updateQuestCompletion(PATH_KEY, questId);
      setCompletedQuests(updatedCompletions);
      
      // Update earned XP
      if (!completedQuests[questId]) {
        const newXP = quest.xp;
        setEarnedXP(prev => prev + newXP);
        
        // Show celebration popup
        setCelebration({
          show: true,
          xp: newXP,
          title: quest.title.split('. ')[1]
        });
        
        // Auto-hide celebration after 4 seconds
        setTimeout(() => {
          setCelebration(prev => ({ ...prev, show: false }));
        }, 4000);
      }
      
      // Check if this was the last quest
      const allCompleted = quests.every(q => 
        q.id === questId ? true : updatedCompletions[q.id]
      );
      
      if (allCompleted) {
        setShowPathCompletion(true);
      } else {
        // Advance to the next quest when celebration closes
        const currentIndex = quests.findIndex(q => q.id === questId);
        if (currentIndex !== -1 && currentIndex < quests.length - 1) {
          // Wait until celebration is closed to advance
          setTimeout(() => {
            const nextQuest = quests[currentIndex + 1];
            setActiveQuestId(nextQuest.id);
            setCurrentQuestIndex(currentIndex + 1);
          }, 4100); // Just after celebration auto-hides
        }
      }
    } catch (error) {
      console.error("Error in quest completion handler:", error);
    }
  };

  // New: Handle code playground execution
  const runCode = (code: string, verification?: QuestVerification) => {
    setPlayground(prev => ({ ...prev, isRunning: true, error: null }));
    
    // In a real implementation, this would send the code to a secure backend
    // for execution. For the demo, we'll simulate execution.
    setTimeout(() => {
      try {
        // Simple validation for demonstration purposes
        let output = '';
        let success = false;
        
        if (code.includes('substreams') && code.includes('--version')) {
          output = 'substreams v1.1.0';
          success = true;
        } else if (code.includes('substreams') && code.includes('init sol-minimal')) {
          output = 'Initializing Solana Substreams project...\nDone! Your sol-minimal project is ready.';
          success = true;
        } else if (code.includes('message') && code.includes('Transaction')) {
          output = 'Compiled protocol buffer successfully';
          success = true;
        } else if (code.includes('map_nft_transfers') || code.includes('Block')) {
          output = 'Module compiled successfully';
          success = true;
        } else if (code.includes('solana')) {
          output = 'Processing Solana specific code...';
          success = true;
        } else {
          output = 'Command executed with no output';
        }
        
        // If this is for verification, check against expected output
        if (verification && verification.expectedOutput) {
          const isCorrect = code.toLowerCase().includes(verification.expectedOutput.toLowerCase());
          if (isCorrect) {
            output += '\n✅ Verification passed!';
            setVerificationStatus(prev => ({ ...prev, [verification.id]: true }));
          } else {
            output += '\n❌ Verification failed. Try again!';
          }
        }
        
        setPlayground(prev => ({ ...prev, output, isRunning: false }));
      } catch (error) {
        setPlayground(prev => ({ 
          ...prev, 
          isRunning: false, 
          error: typeof error === 'string' ? error : 'An error occurred executing the code',
          output: 'Error during execution'
        }));
      }
    }, 1000);
  };
  
  // New: Check if all verifications for a quest are complete
  const areAllVerificationsComplete = (questId: string): boolean => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.verifications || quest.verifications.length === 0) return true;
    
    return quest.verifications.every(v => verificationStatus[v.id]);
  };
  
  // New: Render code playground component
  const renderPlayground = (verification?: QuestVerification) => {
    const codeTemplate = verification?.codeTemplate || '// Write your code here';
    
    return (
      <div className="bg-gray-800/70 rounded-lg border border-gray-700 mt-4">
        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
          <div className="text-sm font-medium text-white">Code Playground</div>
          <button 
            onClick={() => runCode(playground.code, verification)}
            disabled={playground.isRunning}
            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
          >
            {playground.isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
        
        <div className="p-3">
          <textarea 
            className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 font-mono text-sm h-40"
            placeholder={codeTemplate}
            value={playground.code || codeTemplate}
            onChange={(e) => setPlayground(prev => ({ ...prev, code: e.target.value }))}
          ></textarea>
          
          {(playground.output || playground.error) && (
            <div className="mt-3">
              <div className="text-sm font-medium text-white mb-1">Output:</div>
              <div className="bg-black p-3 rounded-lg font-mono text-sm overflow-auto max-h-40">
                {playground.error ? (
                  <div className="text-red-400">{playground.error}</div>
                ) : (
                  <div className="text-green-400 whitespace-pre-wrap">{playground.output}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // New: Render verification component
  const renderVerification = (verification: QuestVerification) => {
    const isComplete = verificationStatus[verification.id];
    
    return (
      <div className={`p-4 rounded-lg border ${isComplete ? 'border-green-500/50 bg-green-900/10' : 'border-yellow-500/50 bg-yellow-900/10'} mt-4`}>
        <div className="flex items-start">
          <div className={`rounded-full w-5 h-5 mt-0.5 flex-shrink-0 ${isComplete ? 'bg-green-500' : 'bg-yellow-500'} flex items-center justify-center`}>
            {isComplete ? (
              <CheckCircleIcon className="h-4 w-4 text-white" />
            ) : (
              <span className="text-xs font-bold text-black">!</span>
            )}
          </div>
          <div className="ml-3 flex-grow">
            <h4 className="text-white font-medium mb-1">{verification.title}</h4>
            <p className="text-sm text-gray-300 mb-3">{verification.description}</p>
            
            {verification.type === 'quiz' && verification.options && (
              <div className="space-y-2">
                {verification.options.map(option => (
                  <div 
                    key={option.id}
                    onClick={() => {
                      if (option.id === verification.correctAnswer) {
                        setVerificationStatus(prev => ({ ...prev, [verification.id]: true }));
                      }
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isComplete && option.id === verification.correctAnswer
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full border border-gray-500 mr-3 flex-shrink-0 flex items-center justify-center">
                        {isComplete && option.id === verification.correctAnswer && (
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        )}
                      </div>
                      <span className="text-sm text-gray-300">{option.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {verification.type === 'task' && (
              <div className="flex items-center">
                <input 
                  type="text" 
                  placeholder="Enter your answer..."
                  className="flex-grow bg-gray-800 text-white p-2 rounded-l-lg border border-gray-700"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget.value.toLowerCase().trim();
                      const correctAnswer = verification.correctAnswer?.toLowerCase().trim() || '';
                      
                      // Check if all required keywords are present
                      const isCorrect = correctAnswer.split(' ').every(keyword => 
                        input.includes(keyword)
                      );
                      
                      if (isCorrect) {
                        setVerificationStatus(prev => ({ ...prev, [verification.id]: true }));
                      }
                    }
                  }}
                  disabled={isComplete}
                />
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-lg transition-colors"
                  onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement).value.toLowerCase().trim();
                    const correctAnswer = verification.correctAnswer?.toLowerCase().trim() || '';
                    
                    // Check if all required keywords are present
                    const isCorrect = correctAnswer.split(' ').every(keyword => 
                      input.includes(keyword)
                    );
                    
                    if (isCorrect) {
                      setVerificationStatus(prev => ({ ...prev, [verification.id]: true }));
                    }
                  }}
                  disabled={isComplete}
                >
                  {isComplete ? 'Completed' : 'Check'}
                </button>
              </div>
            )}
            
            {verification.type === 'code' && renderPlayground(verification)}
            
            {/* Add hint button if not completed */}
            {!isComplete && <HintButton verification={verification} />}
          </div>
        </div>
      </div>
    );
  };

  // Filter quests - show all quests now that hackathon is removed
  const filteredQuests = quests;
  
  const questListForSidebar: QuestListItem[] = filteredQuests.map((quest, index) => {
    let isLocked = false;
    if (index > 0) { // First quest is never locked
      const previousQuestId = filteredQuests[index - 1].id;
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

  const activeQuestData = quests.find(q => q.id === activeQuestId);

  const renderPathCompletion = () => (
    <div className="bg-gradient-to-b from-blue-900/50 to-green-900/50 p-8 rounded-xl border border-green-500/30 text-center">
      <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
        <CheckCircleIcon className="h-12 w-12 text-green-500" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Path Completed!</h2>
      <p className="text-xl text-gray-300 mb-6">Congratulations! You've completed The Graph Substreams Learning Path</p>
      <div className="bg-dark-card p-6 rounded-lg max-w-md mx-auto">
        <div className="text-3xl font-bold text-green-400 mb-2">{earnedXP} XP</div>
        <p className="text-gray-400">Total experience earned</p>
      </div>
    </div>
  );

  const renderQuestContent = () => {
    if (showPathCompletion) {
      return renderPathCompletion();
    }

    if (!activeQuestData) {
      return <div className="text-center text-gray-400">Select a quest to begin</div>;
    }

    return (
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-4">
              <div className="text-gray-400 text-sm">
                {filteredQuests.indexOf(activeQuestData) + 1} of {filteredQuests.length}
              </div>
            </div>
            <div className="text-right">
              <span className="text-gray-400 text-sm">Total XP Earned</span>
              <div className="text-yellow-400 font-medium">{earnedXP} XP</div>
            </div>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
              style={{ width: `${((filteredQuests.indexOf(activeQuestData) + 1) / filteredQuests.length) * 100}%` }}
            />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">
          {activeQuestData.title.split('. ')[1]}
        </h2>
        <div className="text-yellow-400 text-sm font-medium mb-5">+{activeQuestData.xp} XP</div>
        
        {/* Content/Playground Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'content' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'playground' 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('playground')}
          >
            Playground
          </button>
        </div>
        
        {activeTab === 'playground' ? (
          <div>
            <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 mb-6">
              <h3 className="text-lg font-medium text-white mb-3">Substreams Code Playground</h3>
              <p className="text-gray-300 mb-4">
                Experiment with Substreams code here. This playground allows you to test out concepts
                from {activeQuestData.title.split('. ')[1]} and practice your skills.
              </p>
              
              {renderPlayground()}
              
              <div className="mt-4 bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                <h4 className="text-white font-medium mb-2">Tips for this quest:</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                  {activeQuestData.id === 'substreams-intro' && (
                    <>
                      <li>Try printing the different module types: <code className="text-blue-300">println!("Map and Store modules")</code></li>
                      <li>Experiment with basic Rust syntax that will be used in Substreams development</li>
                    </>
                  )}
                  
                  {activeQuestData.id === 'setup-environment' && (
                    <>
                      <li>Try the command: <code className="text-blue-300">substreams --version</code></li>
                      <li>Review the help documentation: <code className="text-blue-300">substreams --help</code></li>
                    </>
                  )}
                  
                  {activeQuestData.id === 'data-models' && (
                    <>
                      <li>Practice writing a protocol buffer definition</li>
                      <li>Try defining a message with various field types</li>
                    </>
                  )}
                  
                  {activeQuestData.id === 'map-module' && (
                    <>
                      <li>Experiment with a simple map function structure</li>
                      <li>Try processing a mock block input</li>
                    </>
                  )}
                  
                  {activeQuestData.id === 'store-module' && (
                    <>
                      <li>Practice writing a store module with state</li>
                      <li>Try accumulating values across updates</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Original content section */
          <>
            {/* Quest 1: Substreams Introduction */}
            {activeQuestData.id === 'substreams-intro' && (
              <>
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">What are Substreams on Solana?</h3>
                  <p className="text-gray-300 mb-4">
                    Substreams is a powerful blockchain indexing technology developed by The Graph, now available for Solana developers. 
                    It's designed for high-throughput processing of blockchain data, making it ideal for Solana's lightning-fast transactions.
                  </p>
                  
                  <div className="flex items-center mb-4 bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                    <Image 
                      src="/the-graph-grt-logo.svg" 
                      alt="The Graph Logo" 
                      width={30} 
                      height={30} 
                      className="mr-3"
                    />
                    <div>
                      <span className="text-blue-400 font-medium">Why Solana Developers Love Substreams:</span>
                      <ul className="list-disc pl-5 mt-1 text-gray-300 text-sm">
                        <li>100x faster indexing than traditional methods</li>
                        <li>Reusable data transformation modules</li>
                        <li>No more RPC pain with reliable data via gRPC streams</li>
                        <li>Live and historical data support perfect for backtesting</li>
                      </ul>
                    </div>
                  </div>
                  
                  <h4 className="text-white font-medium mt-5 mb-2">Core Concepts</h4>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li>
                      <span className="text-blue-400 font-medium">Map Modules:</span> Extract and transform Solana blockchain data 
                      into structured outputs like JSON, Protocol Buffers, or other formats.
                    </li>
                    <li>
                      <span className="text-green-400 font-medium">Store Modules:</span> Maintain state between blocks, 
                      ideal for tracking Solana's account model changes over time.
                    </li>
                    <li>
                      <span className="text-purple-400 font-medium">Module Graph:</span> Connect multiple modules together to 
                      create complex data transformation pipelines.
                    </li>
                  </ul>
                </div>
                
                {/* Verification components */}
                {activeQuestData.verifications?.map(verification => (
                  <div key={verification.id}>
                    {renderVerification(verification)}
                  </div>
                ))}
                
                {!completedQuests[activeQuestData.id] && (
                  <button
                    onClick={() => completeQuest(activeQuestData.id)}
                    disabled={!areAllVerificationsComplete(activeQuestData.id)}
                    className={`w-full md:w-auto mt-5 py-3 px-6 rounded-lg transition-colors text-center ${
                      areAllVerificationsComplete(activeQuestData.id)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {areAllVerificationsComplete(activeQuestData.id)
                      ? `Complete Introduction (+${activeQuestData.xp} XP)`
                      : 'Complete all verifications to proceed'}
                  </button>
                )}
              </>
            )}
            
            {/* Quest 2: Environment Setup */}
            {activeQuestData.id === 'setup-environment' && (
              <>
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Setting Up Your Environment</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Prerequisites</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                        <li>Rust toolchain (minimum version 1.60)</li>
                        <li>Protocol Buffer compiler (protoc)</li>
                        <li>Substreams CLI</li>
                        <li>Docker (for local testing)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-black/30 p-4 rounded-lg font-mono text-sm">
                      <div className="text-green-400 mb-2"># Install Rust</div>
                      <div className="text-gray-300">curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh</div>
                      
                      <div className="text-green-400 mt-4 mb-2"># Install Protocol Buffer compiler</div>
                      <div className="text-gray-300">brew install protobuf # macOS</div>
                      <div className="text-gray-300">apt-get install protobuf-compiler # Linux</div>
                      
                      <div className="text-green-400 mt-4 mb-2"># Install Substreams CLI</div>
                      <div className="text-gray-300">curl -L https://github.com/streamingfast/substreams/releases/download/v1.1.0/substreams_1.1.0_Linux_x86_64.tar.gz | tar zxf -</div>
                      <div className="text-gray-300">install -m u+rwx,g+rx,o+rx ./substreams /usr/local/bin/substreams</div>
                    </div>
                    
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Verify Installation</h4>
                      <div className="bg-black/30 p-3 rounded font-mono text-sm text-gray-300">
                        substreams --version
                      </div>
                    </div>

                    <div className="bg-blue-800/20 p-4 rounded-lg border border-blue-700/30">
                      <h4 className="text-blue-400 font-medium mb-2">Initialize a Solana Substreams Project</h4>
                      <p className="text-sm text-gray-300 mb-2">
                        Once the CLI is installed, you can initialize a new Solana Substreams project.
                        There are several project types you can create:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                        <li>Minimal Solana Block indexer</li>
                        <li>Solana transactions filtered by program IDs</li>
                        <li>Anchor IDL-based Substreams</li>
                      </ul>
                      <p className="text-sm text-gray-300 mt-2">
                        The command to initialize a project will create the basic folder structure and configuration files.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Verification components */}
                {activeQuestData.verifications?.map(verification => (
                  <div key={verification.id}>
                    {renderVerification(verification)}
                  </div>
                ))}
                
                {!completedQuests[activeQuestData.id] && (
                  <button
                    onClick={() => completeQuest(activeQuestData.id)}
                    disabled={!areAllVerificationsComplete(activeQuestData.id)}
                    className={`w-full md:w-auto mt-5 py-3 px-6 rounded-lg transition-colors text-center ${
                      areAllVerificationsComplete(activeQuestData.id)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {areAllVerificationsComplete(activeQuestData.id)
                      ? `Complete Setup (+${activeQuestData.xp} XP)`
                      : 'Complete all verifications to proceed'}
                  </button>
                )}
              </>
            )}
            
            {/* Quest 3: Defining Data Models */}
            {activeQuestData.id === 'data-models' && (
              <>
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Protocol Buffer Data Models</h3>
                  
                  <p className="text-gray-300 mb-4">
                    Substreams use Protocol Buffers (protobuf) to define structured data models for inputs and outputs.
                    Let's create a simple model for Solana transactions.
                  </p>
                  
                  <div className="bg-black/30 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                    <div className="text-gray-300">syntax = "proto3";</div>
                    <div className="text-gray-300">package solana.tx.v1;</div>
                    <div className="text-gray-300 mt-4">message SolanaTransaction &#123;</div>
                    <div className="text-gray-300 ml-4">string signature = 1;</div>
                    <div className="text-gray-300 ml-4">string block_hash = 2;</div>
                    <div className="text-gray-300 ml-4">repeated string signers = 3;</div>
                    <div className="text-gray-300 ml-4">uint64 slot = 4;</div>
                    <div className="text-gray-300">&#125;</div>
                  </div>
                  
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Proto File Location</h4>
                    <div className="text-sm text-gray-300">
                      Save this file as <span className="text-yellow-400">proto/solana/tx/v1/tx.proto</span> in your Substreams project.
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/50 p-4 rounded-lg mt-4">
                    <h4 className="text-white font-medium mb-2">Using Anchor IDLs</h4>
                    <p className="text-sm text-gray-300 mb-2">
                      For Solana projects using Anchor, you can initialize a special project type that uses your Anchor IDL:
                    </p>
                    <div className="bg-black/30 p-3 rounded font-mono text-sm text-gray-300">
                      substreams init sol-anchor-beta
                    </div>
                    <p className="text-sm text-gray-300 mt-2">
                      This lets you automatically generate protobuf definitions from your Anchor program's IDL.
                    </p>
                  </div>
                </div>
                
                {/* Verification components */}
                {activeQuestData.verifications?.map(verification => (
                  <div key={verification.id}>
                    {renderVerification(verification)}
                  </div>
                ))}
                
                {!completedQuests[activeQuestData.id] && (
                  <button
                    onClick={() => completeQuest(activeQuestData.id)}
                    disabled={!areAllVerificationsComplete(activeQuestData.id)}
                    className={`w-full md:w-auto mt-5 py-3 px-6 rounded-lg transition-colors text-center ${
                      areAllVerificationsComplete(activeQuestData.id)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {areAllVerificationsComplete(activeQuestData.id)
                      ? `Complete Data Models (+${activeQuestData.xp} XP)`
                      : 'Complete all verifications to proceed'}
                  </button>
                )}
              </>
            )}
            
            {/* Quest 4: First Map Module */}
            {activeQuestData.id === 'map-module' && (
              <>
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Writing Your First Map Module</h3>
                  
                  <p className="text-gray-300 mb-4">
                    Map modules transform Solana blockchain data into structured outputs. Let's create a module that extracts NFT transfers from Solana.
                  </p>
                  
                  <div className="bg-black/30 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                    <div className="text-blue-400">#[substreams::handlers::map]</div>
                    <div className="text-white">pub fn map_nft_transfers(block: Block) -&gt; Result&lt;Transfers, substreams::errors::Error&gt; &#123;</div>
                    <div className="text-gray-300 ml-4">let mut transfers = vec![];</div>
                    <div className="text-gray-300 ml-4">for trx in block.transactions() &#123;</div>
                    <div className="text-gray-300 ml-8">// Look for NFT transfer instructions</div>
                    <div className="text-gray-300 ml-8">if let Some(transfer) = extract_nft_transfer(trx) &#123;</div>
                    <div className="text-gray-300 ml-12">transfers.push(transfer);</div>
                    <div className="text-gray-300 ml-8">&#125;</div>
                    <div className="text-gray-300 ml-4">&#125;</div>
                    <div className="text-gray-300 ml-4">Ok(Transfers &#123; transfers &#125;)</div>
                    <div className="text-white">&#125;</div>
                    <div className="text-white mt-4">fn extract_nft_transfer(transaction: &Transaction) -&gt; Option&lt;Transfer&gt; &#123;</div>
                    <div className="text-gray-300 ml-4">// Implementation details here</div>
                    <div className="text-gray-300 ml-4">// ...</div>
                    <div className="text-white">&#125;</div>
                  </div>
                  
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Key Components</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                      <li><span className="text-blue-400">#[substreams::handlers::map]</span> - Annotation that marks this function as a map module</li>
                      <li>Input parameter is a Solana <span className="text-blue-400">Block</span></li>
                      <li>Return type matches our proto definition <span className="text-blue-400">Transfers</span></li>
                      <li>We iterate through transactions to extract relevant data</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-700/50 p-4 rounded-lg mt-4">
                    <h4 className="text-white font-medium mb-2">Module Definition in YAML</h4>
                    <div className="bg-black/30 p-3 rounded font-mono text-sm text-gray-300">
                      modules:<br/>
                      &nbsp;&nbsp;- name: map_nft_transfers<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;kind: map<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;inputs:<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- source: sf.solana.type.v1.Block<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;output:<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;type: nft.v1.Transfers
                    </div>
                  </div>
                </div>
                
                {/* Verification components */}
                {activeQuestData.verifications?.map(verification => (
                  <div key={verification.id}>
                    {renderVerification(verification)}
                  </div>
                ))}
                
                {!completedQuests[activeQuestData.id] && (
                  <button
                    onClick={() => completeQuest(activeQuestData.id)}
                    disabled={!areAllVerificationsComplete(activeQuestData.id)}
                    className={`w-full md:w-auto mt-5 py-3 px-6 rounded-lg transition-colors text-center ${
                      areAllVerificationsComplete(activeQuestData.id)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {areAllVerificationsComplete(activeQuestData.id)
                      ? `Complete Map Module (+${activeQuestData.xp} XP)`
                      : 'Complete all verifications to proceed'}
                  </button>
                )}
              </>
            )}
            
            {/* Quest 5: State Management */}
            {activeQuestData.id === 'store-module' && (
              <>
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">Building a Store Module</h3>
                  
                  <p className="text-gray-300 mb-4">
                    Store modules maintain state between blocks, allowing you to build indexes and aggregations over time.
                  </p>
                  
                  <div className="flex items-center bg-green-900/20 p-3 rounded-lg border border-green-500/30 mb-4">
                    <div className="bg-green-500/20 rounded-full p-1.5 mr-3">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <span className="text-green-400 font-medium">Store Module</span>
                      <p className="text-sm text-gray-300">Accumulates state from previous blocks, allowing for aggregation over time</p>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                    <div className="text-blue-400">use substreams::store::&#123;"StoreAdd", "StoreAddInt64"&#125;;</div>
                    <div className="text-blue-400">use crate::pb::nft::v1::Transfers;</div>
                    <div className="text-blue-400 mt-4">#[substreams::handlers::store]</div>
                    <div className="text-white">pub fn store_nft_stats(transfers: Transfers, s: {"StoreAddInt64"}) &#123;</div>
                    <div className="text-gray-300 ml-4">// Count transfers per collection</div>
                    <div className="text-gray-300 ml-4">for transfer in transfers.transfers &#123;</div>
                    <div className="text-gray-300 ml-8">let collection_key = format!("collection:{}:count", transfer.collection);</div>
                    <div className="text-gray-300 ml-8">s.add(collection_key, 1);</div>
                    <div className="text-gray-300 ml-4">&#125;</div>
                    <div className="text-white">&#125;</div>
                  </div>
                  
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Key Store Types</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                      <li><span className="text-blue-400">StoreAddInt64</span> - Store for adding integer values</li>
                      <li><span className="text-blue-400">StoreAdd</span> - Store for adding new keys/values</li>
                      <li><span className="text-blue-400">StoreSet</span> - Store for setting key/value pairs</li>
                      <li><span className="text-blue-400">StoreDelete</span> - Store for deleting key/value pairs</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-700/50 p-4 rounded-lg mt-4">
                    <h4 className="text-white font-medium mb-2">Module Definition in YAML</h4>
                    <div className="bg-black/30 p-3 rounded font-mono text-sm text-gray-300">
                      modules:<br/>
                      &nbsp;&nbsp;- name: store_nft_stats<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;kind: store<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;updatePolicy: add<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;valueType: int64<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;inputs:<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- map: map_nft_transfers
                    </div>
                  </div>
                </div>
                
                {/* Verification components */}
                {activeQuestData.verifications?.map(verification => (
                  <div key={verification.id}>
                    {renderVerification(verification)}
                  </div>
                ))}
                
                {!completedQuests[activeQuestData.id] && (
                  <button
                    onClick={() => completeQuest(activeQuestData.id)}
                    disabled={!areAllVerificationsComplete(activeQuestData.id)}
                    className={`w-full md:w-auto mt-5 py-3 px-6 rounded-lg transition-colors text-center ${
                      areAllVerificationsComplete(activeQuestData.id)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {areAllVerificationsComplete(activeQuestData.id)
                      ? `Complete Store Module (+${activeQuestData.xp} XP)`
                      : 'Complete all verifications to proceed'}
                  </button>
                )}
              </>
            )}
            
            {/* Default content for other main path quests */}
            {!['substreams-intro', 'setup-environment', 'data-models', 'map-module', 'store-module'].includes(activeQuestData.id) && (
              <>
                <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 mb-6">
                  <h3 className="text-lg font-medium text-white mb-3">{activeQuestData.title}</h3>
                  <p className="text-gray-300 mb-4">{activeQuestData.description}</p>
                  
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 mb-4">
                    <p className="text-gray-300 text-sm">
                      This quest will guide you through {activeQuestData.title.split('. ')[1].toLowerCase()}.
                      Detailed content for this quest is coming soon!
                    </p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg font-mono text-sm">
                    <div className="text-green-400">// Example code snippet will be provided here</div>
                    <div className="text-gray-300">// ...</div>
                  </div>
                </div>
                
                {/* Verification components if present */}
                {activeQuestData.verifications?.map(verification => (
                  <div key={verification.id}>
                    {renderVerification(verification)}
                  </div>
                ))}
                
                {/* For quests without verification, add a direct complete button */}
                {!completedQuests[activeQuestData.id] && (
                  <button
                    onClick={() => completeQuest(activeQuestData.id)}
                    disabled={activeQuestData.verifications && !areAllVerificationsComplete(activeQuestData.id)}
                    className="w-full md:w-auto mt-5 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors text-center"
                  >
                    {`Complete ${activeQuestData.title.split('. ')[1]} (+${activeQuestData.xp} XP)`}
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  // Render XP celebration popup
  const renderXPCelebration = () => {
    if (!celebration.show) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fadeIn">
        <div className="relative bg-gradient-to-br from-blue-900 to-purple-900 p-8 rounded-xl border-2 border-yellow-500 shadow-2xl max-w-md w-full mx-4 transform animate-scale-in">
          {/* Confetti elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className={`absolute w-2 h-6 opacity-80 animate-confetti-fall`}
                style={{
                  top: '-20px',
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#FFD700', '#FF6347', '#00CED1', '#9370DB', '#32CD32'][Math.floor(Math.random() * 5)],
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
          
          <div className="text-center relative z-10">
            <div className="mb-4 text-2xl font-bold text-white">
              🎉 {celebration.title} Completed! 🎉
            </div>
            
            <div className="mb-6 flex items-center justify-center">
              <div className="bg-yellow-500/20 p-4 rounded-full">
                <div className="text-5xl font-bold text-yellow-400 animate-pulse">
                  +{celebration.xp} XP
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-full md:w-auto">
                <button 
                  onClick={() => setCelebration(prev => ({ ...prev, show: false }))}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Continue Your Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-6">
      {/* CSS for custom animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(720deg); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .animate-confetti-fall {
          animation: confettiFall 3s linear infinite;
        }
      `}</style>

      <div className="container mx-auto px-4 mb-6">
        <div className="flex items-center mb-4">
          <Image 
            src="/the-graph-grt-logo.svg" 
            alt="The Graph Logo" 
            width={40} 
            height={40} 
            className="mr-3" 
          />
          <h1 className="text-2xl md:text-3xl font-bold text-white">The Graph Substreams on Solana</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Build powerful data pipelines with Substreams to analyze, transform, and deliver blockchain data from Solana. Complete this learning path to prepare for the Solana Substreams Hackathon!
        </p>
      </div>
      
      <div className="container mx-auto">
        <QuestPageLayout
          pathTitle="Substreams on Solana"
          quests={quests.map(q => ({
            id: q.id,
            title: q.title,
            isComplete: !!completedQuests[q.id],
            isActive: q.id === activeQuestId
          }))}
          activeQuestId={activeQuestId}
          onSelectQuest={(questId) => handleQuestSelection(questId)}
          totalXP={totalPathXP}
          earnedXP={earnedXP}
        >
          {renderQuestContent()}
        </QuestPageLayout>
      </div>

      {renderXPCelebration()}
    </div>
  );
}

// Hint button component
const HintButton = ({ verification }: { verification: QuestVerification }) => {
  const [showHint, setShowHint] = useState(false);
  
  const getHint = () => {
    if (verification.type === 'quiz' && verification.correctAnswer) {
      const correctOption = verification.options?.find(opt => opt.id === verification.correctAnswer);
      return correctOption ? correctOption.text : '';
    } else if (verification.type === 'task' && verification.correctAnswer) {
      return verification.correctAnswer;
    } else if (verification.type === 'code' && verification.expectedOutput) {
      return verification.expectedOutput;
    }
    return '';
  };
  
  return (
    <div className="mt-2">
      <button 
        onClick={() => setShowHint(!showHint)}
        className="text-xs bg-yellow-900/50 hover:bg-yellow-900/70 text-yellow-300 px-3 py-1 rounded border border-yellow-700/50"
      >
        {showHint ? 'Hide Hint' : 'Need a Hint?'}
      </button>
      
      {showHint && (
        <div className="mt-2 bg-yellow-800/20 p-3 rounded-lg border border-yellow-700/30">
          <p className="text-sm text-yellow-300 font-medium mb-1">Hint:</p>
          {verification.type === 'quiz' ? (
            <p className="text-sm text-gray-300">The correct answer is: <span className="text-yellow-300">{
              verification.options?.find(opt => opt.id === verification.correctAnswer)?.text
            }</span></p>
          ) : verification.type === 'task' ? (
            <p className="text-sm text-gray-300">Try entering: <code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">{verification.correctAnswer}</code></p>
          ) : (
            <div className="text-sm text-gray-300">
              <p>Your code should include:</p>
              <pre className="bg-gray-800 p-2 rounded mt-1 text-yellow-300 overflow-x-auto">
                {verification.expectedOutput}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 