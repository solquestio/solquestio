import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';

interface TransactionExplorerQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
  title?: string;
}

export const TransactionExplorerQuest: React.FC<TransactionExplorerQuestProps> = ({ 
  onQuestComplete, 
  xpReward = 200, 
  title = 'Explore a Transaction' 
}) => {
  const { publicKey } = useWallet();
  const [hasExplored, setHasExplored] = useState(false);
  const [selectedExplorerTask, setSelectedExplorerTask] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const explorerTasks = [
    { 
      id: 'wallet',
      title: 'Explore Your Wallet', 
      description: 'View your account balance, token holdings, and transaction history',
      url: publicKey ? `https://explorer.solana.com/address/${publicKey.toString()}` : '',
    },
    { 
      id: 'transaction',
      title: 'Examine a Transaction', 
      description: 'Understand the structure and details of a sample transaction',
      url: 'https://explorer.solana.com/tx/5xiwwxEzkDWDsVpWxEwvt4WFY8Yfy1xtHFtPEqfNzBC9gUKp6ugPVpQN3EVkxQycnGZ1MjsukrWARA4ZY8PGdNx4',
    },
    { 
      id: 'program',
      title: 'Explore a Token Program', 
      description: 'See how token programs (SPL) work on Solana',
      url: 'https://explorer.solana.com/address/TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    }
  ];

  const handleExploreClick = (taskId: string, url: string) => {
    window.open(url, '_blank');
    
    // Mark task as completed
    if (!completedTasks.includes(taskId)) {
      const newCompletedTasks = [...completedTasks, taskId];
      setCompletedTasks(newCompletedTasks);
      setSelectedExplorerTask(taskId);
      
      // If all tasks are completed, complete the quest
      if (newCompletedTasks.length === explorerTasks.length) {
        setHasExplored(true);
        onQuestComplete();
      }
    }
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
      <p className="text-yellow-400 text-sm font-medium mb-4">+{xpReward} XP</p>
      
      <div className="space-y-6">
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
          <p className="text-gray-300">
            The Solana Explorer is a powerful tool that lets you view all activity on the Solana blockchain.
            It provides detailed information about accounts, transactions, tokens, and programs.
          </p>
          
          <div className="mt-4 text-gray-300">
            <h4 className="font-medium text-white">In this quest, you'll:</h4>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Explore your wallet's transactions and holdings</li>
              <li>Examine the details of a real Solana transaction</li>
              <li>Learn about Solana programs and how they work</li>
            </ul>
          </div>

          {hasExplored ? (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-600/50 rounded-lg">
              <p className="text-green-300 font-medium">Well done! You've completed all exploration tasks.</p>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-amber-900/30 border border-amber-600/50 rounded-lg">
              <p className="text-amber-300 font-medium">Complete all three exploration tasks below to earn {xpReward} XP!</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {explorerTasks.map((task) => (
            <div 
              key={task.id}
              className={`p-4 border rounded-lg transition-all ${
                completedTasks.includes(task.id) 
                  ? 'border-green-500/50 bg-green-900/10' 
                  : 'border-gray-700 bg-gray-800/30 hover:border-blue-500/50 hover:bg-blue-900/10'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white">{task.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                </div>
                <button
                  onClick={() => handleExploreClick(task.id, task.url)}
                  disabled={!publicKey && task.id === 'wallet'}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    completedTasks.includes(task.id)
                      ? 'bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {completedTasks.includes(task.id) ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      Open Explorer
                    </>
                  )}
                </button>
              </div>
              
              {/* Show additional info when a task is selected */}
              {selectedExplorerTask === task.id && (
                <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-gray-300">
                  <h4 className="font-medium text-white mb-1">What to look for:</h4>
                  {task.id === 'wallet' && (
                    <ul className="list-disc list-inside ml-1 space-y-1">
                      <li>Your SOL balance shown at the top</li>
                      <li>Token Accounts section showing any SPL tokens you own</li>
                      <li>Transaction history with timestamps and status</li>
                    </ul>
                  )}
                  {task.id === 'transaction' && (
                    <ul className="list-disc list-inside ml-1 space-y-1">
                      <li>The Transaction signature (like a transaction ID)</li>
                      <li>Fee information and which account paid the fee</li>
                      <li>Account inputs and outputs that were affected</li>
                      <li>The program(s) that processed the transaction</li>
                    </ul>
                  )}
                  {task.id === 'program' && (
                    <ul className="list-disc list-inside ml-1 space-y-1">
                      <li>This is the SPL Token Program</li>
                      <li>Notice it's a "Program" account type</li>
                      <li>See the transaction volume showing how widely used it is</li>
                      <li>Browse transactions to see the various actions it handles</li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {hasExplored && (
          <div className="text-center">
            <div className="inline-block bg-green-900/30 border border-green-700 rounded-lg px-4 py-3 text-green-300">
              <p className="font-bold text-lg flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Quest Complete! You've earned {xpReward} XP
              </p>
              <p className="text-sm mt-1">You can now proceed to the next quest in your Solana journey.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 