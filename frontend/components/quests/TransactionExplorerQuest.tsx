import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowTopRightOnSquareIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram } from '@solana/web3.js';

interface TransactionExplorerQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
  title?: string;
}

// RPC endpoint
const MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com";

export const TransactionExplorerQuest: React.FC<TransactionExplorerQuestProps> = ({ 
  onQuestComplete, 
  xpReward = 200, 
  title = 'Explore a Transaction' 
}) => {
  const { publicKey, connected } = useWallet();
  const [hasExplored, setHasExplored] = useState(false);
  const [selectedExplorerTask, setSelectedExplorerTask] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [simulationTx, setSimulationTx] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState("transfer");

  // Sample transaction values
  const sampleTxs = {
    transfer: {
      description: "SOL Transfer",
      txid: "5xiwwxEzkDWDsVpWxEwvt4WFY8Yfy1xtHFtPEqfNzBC9gUKp6ugPVpQN3EVkxQycnGZ1MjsukrWARA4ZY8PGdNx4",
      details: "A simple SOL transfer between two wallets"
    },
    swap: {
      description: "Token Swap",
      txid: "4oBFNe4qr71hRBcGZyZN8KDXBSUjRc9tXGBrjJKmTf5TZ1NYa8uatRJxj6Kduh2Gq6U7xQiQz3QpCK3NHZKRDiXN",
      details: "A swap transaction on a decentralized exchange"
    },
    nft: {
      description: "NFT Mint",
      txid: "4YdZ6fQBa6JkLDcPxQaaxvuPncr2LYWwdGnhrvP1RgMKz9MpLHSCNEsJFWQdytUWZMBRvAhZGQ7GsKZofvWbwwHh",
      details: "An NFT mint transaction"
    }
  };
  
  // Explorer tasks that the user can complete
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
    },
    { 
      id: 'simulation',
      title: 'Simulate a Transaction', 
      description: 'Learn how transactions work by simulating one',
      url: '',
    }
  ];

  // Create a simulated transaction for educational purposes
  const simulateTransaction = async () => {
    // Reset previous simulation
    setSimulationResult(null);
    setSimulationError(null);
    setIsSimulating(true);
    
    try {
      // Basic simulation of a transaction
      const connection = new Connection(MAINNET_RPC_URL);
      
      // Fetch transaction info for the selected example
      const txid = sampleTxs[selectedExample as keyof typeof sampleTxs].txid;
      
      try {
        // Get transaction details
        const tx = await connection.getParsedTransaction(txid);
        
        // Show simplified version of the transaction data
        if (tx) {
          // Extract key information for educational display
          const basicInfo = {
            signature: txid,
            blockTime: tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'Unknown',
            fee: tx.meta?.fee ? `${tx.meta.fee / LAMPORTS_PER_SOL} SOL` : 'Unknown',
            status: tx.meta?.err ? 'Failed' : 'Success',
            instructions: tx.transaction.message.instructions.length,
            accounts: tx.transaction.message.accountKeys.length,
            // Simplify the accounts for display
            accountsInvolved: tx.transaction.message.accountKeys.map((key, index) => {
              return {
                index,
                address: key.pubkey.toString().substring(0, 12) + '...',
                isSigner: key.signer,
                isWritable: key.writable
              };
            }).slice(0, 5) // Limit to first 5 for simplicity
          };
          
          setSimulationResult(basicInfo);
          
          // Mark simulation task as completed
          if (!completedTasks.includes('simulation')) {
            const newCompletedTasks = [...completedTasks, 'simulation'];
            setCompletedTasks(newCompletedTasks);
            
            // If all tasks are completed, complete the quest
            if (newCompletedTasks.length === explorerTasks.length) {
              setHasExplored(true);
              onQuestComplete();
              // Dispatch custom event to trigger profile update for XP
              window.dispatchEvent(new CustomEvent('quest-completed', { 
                detail: { 
                  questId: 'explorer-quest', 
                  xpAmount: xpReward 
                } 
              }));
            }
          }
        } else {
          setSimulationError("Couldn't fetch transaction details. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
        setSimulationError("Error fetching transaction. The RPC endpoint may be rate-limited.");
      }
    } catch (err) {
      console.error("Simulation error:", err);
      setSimulationError(String(err));
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExploreClick = (taskId: string, url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
    
    // Mark task as completed
    if (!completedTasks.includes(taskId)) {
      const newCompletedTasks = [...completedTasks, taskId];
      setCompletedTasks(newCompletedTasks);
      setSelectedExplorerTask(taskId);
      
      // If all tasks are completed, complete the quest
      if (newCompletedTasks.length === explorerTasks.length) {
        setHasExplored(true);
        onQuestComplete();
        // Dispatch custom event to trigger profile update for XP
        window.dispatchEvent(new CustomEvent('quest-completed', { 
          detail: { 
            questId: 'explorer-quest', 
            xpAmount: xpReward 
          } 
        }));
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
              <li>Simulate a transaction to understand the process</li>
            </ul>
          </div>

          {hasExplored ? (
            <div className="mt-4 p-3 bg-green-900/30 border border-green-600/50 rounded-lg">
              <p className="text-green-300 font-medium">Well done! You've completed all exploration tasks.</p>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-amber-900/30 border border-amber-600/50 rounded-lg">
              <p className="text-amber-300 font-medium">Complete all four exploration tasks below to earn {xpReward} XP!</p>
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
                {task.id !== 'simulation' ? (
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
                ) : (
                  <button
                    onClick={() => setSelectedExplorerTask('simulation')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      completedTasks.includes('simulation')
                        ? 'bg-green-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {completedTasks.includes('simulation') ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Completed
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                        Try Simulation
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Show additional info when a task is selected */}
              {selectedExplorerTask === task.id && (
                <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-gray-300">
                  {task.id === 'wallet' && (
                    <div>
                      <h4 className="font-medium text-white mb-1">What to look for:</h4>
                      <ul className="list-disc list-inside ml-1 space-y-1">
                        <li>Your SOL balance shown at the top</li>
                        <li>Token Accounts section showing any SPL tokens you own</li>
                        <li>Transaction history with timestamps and status</li>
                      </ul>
                    </div>
                  )}
                  {task.id === 'transaction' && (
                    <div>
                      <h4 className="font-medium text-white mb-1">What to look for:</h4>
                      <ul className="list-disc list-inside ml-1 space-y-1">
                        <li>The Transaction signature (like a transaction ID)</li>
                        <li>Fee information and which account paid the fee</li>
                        <li>Account inputs and outputs that were affected</li>
                        <li>The program(s) that processed the transaction</li>
                      </ul>
                    </div>
                  )}
                  {task.id === 'program' && (
                    <div>
                      <h4 className="font-medium text-white mb-1">What to look for:</h4>
                      <ul className="list-disc list-inside ml-1 space-y-1">
                        <li>This is the SPL Token Program</li>
                        <li>Notice it's a "Program" account type</li>
                        <li>See the transaction volume showing how widely used it is</li>
                        <li>Browse transactions to see the various actions it handles</li>
                      </ul>
                    </div>
                  )}
                  {task.id === 'simulation' && (
                    <div className="mt-3">
                      <h4 className="font-medium text-white mb-2">Transaction Simulator</h4>
                      <p className="mb-4">Select a transaction type to examine and understand its structure.</p>
                      
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <label className="text-white font-medium">Transaction Type:</label>
                          <select 
                            value={selectedExample}
                            onChange={(e) => setSelectedExample(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="transfer">SOL Transfer</option>
                            <option value="swap">Token Swap</option>
                            <option value="nft">NFT Mint</option>
                          </select>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={simulateTransaction}
                            disabled={isSimulating}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-1 disabled:opacity-50"
                          >
                            {isSimulating ? (
                              <>
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                Simulating...
                              </>
                            ) : (
                              <>Examine Transaction</>
                            )}
                          </button>
                          
                          <a 
                            href={`https://explorer.solana.com/tx/${sampleTxs[selectedExample as keyof typeof sampleTxs].txid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-1"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                            View in Explorer
                          </a>
                        </div>
                        
                        <div className="p-2 bg-gray-800 rounded-md mb-2">
                          <p className="text-sm text-blue-300">{sampleTxs[selectedExample as keyof typeof sampleTxs].details}</p>
                        </div>
                      </div>
                      
                      {simulationError && (
                        <div className="p-3 bg-red-900/30 border border-red-600 rounded-md mb-4 text-red-300 text-sm">
                          <p className="font-medium">Error:</p>
                          <p>{simulationError}</p>
                        </div>
                      )}
                      
                      {simulationResult && (
                        <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4">
                          <h5 className="font-medium text-white mb-3">Transaction Details</h5>
                          
                          <div className="space-y-3">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400">Signature</span>
                              <span className="text-sm text-white font-mono">{simulationResult.signature.substring(0, 12)}...{simulationResult.signature.substring(simulationResult.signature.length - 4)}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400">Status</span>
                                <span className={`text-sm font-medium ${simulationResult.status === 'Success' ? 'text-green-400' : 'text-red-400'}`}>
                                  {simulationResult.status}
                                </span>
                              </div>
                              
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400">Fee</span>
                                <span className="text-sm text-white">{simulationResult.fee}</span>
                              </div>
                              
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400">Time</span>
                                <span className="text-sm text-white">{simulationResult.blockTime}</span>
                              </div>
                              
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400">Instructions</span>
                                <span className="text-sm text-white">{simulationResult.instructions}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col mt-2">
                              <span className="text-xs text-gray-400 mb-1">Accounts Involved</span>
                              <div className="bg-gray-800 rounded-md p-2">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-gray-400 border-b border-gray-700">
                                      <th className="pb-1 text-left">Index</th>
                                      <th className="pb-1 text-left">Address</th>
                                      <th className="pb-1 text-left">Signer</th>
                                      <th className="pb-1 text-left">Writable</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {simulationResult.accountsInvolved.map((account: any) => (
                                      <tr key={account.index} className="text-white">
                                        <td className="py-1">{account.index}</td>
                                        <td className="py-1 font-mono">{account.address}</td>
                                        <td className="py-1">{account.isSigner ? '✅' : '❌'}</td>
                                        <td className="py-1">{account.isWritable ? '✅' : '❌'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 bg-gray-800/70 p-3 rounded-md">
                            <p className="text-xs text-gray-300">
                              <span className="text-purple-400 font-medium">Tip:</span> Every transaction on Solana requires at least one 
                              signer (the account paying the fee) and modifies one or more accounts (writable accounts). Programs execute 
                              instructions that read and write to these accounts.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
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