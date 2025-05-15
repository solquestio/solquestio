'use client';

import React, { useState } from 'react';
import { SparklesIcon, CheckCircleIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { BanknotesIcon } from '@heroicons/react/24/outline';

interface QuestProps {
  onQuestComplete: () => void;
  title: string;
  xpReward?: number;
}

export const MintingManagingZbtcQuest: React.FC<QuestProps> = ({ onQuestComplete, title, xpReward = 350 }) => {
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    mintingExplained: false,
    transferDemo: false,
    walletIntegration: false,
    securityBestPractices: false
  });
  
  // Track simulation steps
  const [simulationState, setSimulationState] = useState({
    isStarted: false,
    currentStep: 1,
    totalSteps: 5,
    isComplete: false
  });

  const [btcBalance, setBtcBalance] = useState(0.25);
  const [zbtcBalance, setZbtcBalance] = useState(0);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [simulationMessages, setSimulationMessages] = useState<string[]>([]);

  const handleMarkAsCompleted = (step: keyof typeof completedSteps) => {
    setCompletedSteps(prev => ({
      ...prev,
      [step]: true
    }));
  };

  const hasCompletedRequiredSteps = () => {
    // Check if at least 3 steps are completed
    return Object.values(completedSteps).filter(Boolean).length >= 3;
  };

  // Simulation functions
  const startSimulation = () => {
    setSimulationState(prev => ({
      ...prev,
      isStarted: true
    }));
    
    // Mark the minting step as completed when simulation starts
    handleMarkAsCompleted('mintingExplained');
    
    addSimulationMessage("Simulation started: You have 0.25 BTC in your Bitcoin wallet.");
  };

  const addSimulationMessage = (message: string) => {
    setSimulationMessages(prev => [...prev, message]);
  };

  const handleSimulationNext = () => {
    const nextStep = simulationState.currentStep + 1;
    
    if (nextStep > simulationState.totalSteps) {
      setSimulationState(prev => ({
        ...prev,
        isComplete: true
      }));
      handleMarkAsCompleted('transferDemo');
      return;
    }
    
    processSimulationStep(nextStep);
    
    setSimulationState(prev => ({
      ...prev,
      currentStep: nextStep
    }));
  };
  
  const processSimulationStep = (step: number) => {
    switch (step) {
      case 2:
        addSimulationMessage("Connecting to the Zeus Network bridge...");
        break;
      case 3:
        addSimulationMessage("Generating BTC deposit address for minting zBTC...");
        setWaitingForConfirmation(true);
        setTimeout(() => {
          addSimulationMessage("Bitcoin deposit address generated: bc1q...4xdptv");
          setWaitingForConfirmation(false);
        }, 2000);
        break;
      case 4:
        addSimulationMessage("Sending 0.1 BTC to the deposit address...");
        setBtcBalance(0.15);
        setWaitingForConfirmation(true);
        setTimeout(() => {
          addSimulationMessage("Transaction submitted. Waiting for Bitcoin network confirmations...");
          setTimeout(() => {
            addSimulationMessage("Transaction confirmed! 0.1 zBTC has been minted to your Solana wallet.");
            setZbtcBalance(0.1);
            setWaitingForConfirmation(false);
          }, 3000);
        }, 2000);
        break;
      case 5:
        addSimulationMessage("Minting complete! You now have 0.1 zBTC in your Solana wallet and 0.15 BTC left in your Bitcoin wallet.");
        break;
    }
  };

  const handleCompleteQuest = () => {
    if (!hasCompletedRequiredSteps()) {
      alert("Please complete at least 3 sections before completing the quest.");
      return;
    }

    setIsCompleting(true);
    
    // Simulate completion delay
    setTimeout(() => {
      setIsCompleting(false);
      setShowSuccessAnimation(true);
      
      // Wait for animation before notifying completion
      setTimeout(() => {
        onQuestComplete();
      }, 2000);
    }, 1000);
  };

  return (
    <div className="p-6 bg-dark-card-secondary rounded-lg shadow-lg text-gray-200 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 to-blue-900/10 z-0"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-500/5 rounded-full filter blur-3xl"></div>
      
      {/* Success animation */}
      {showSuccessAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-blue-500/30 flex items-center justify-center z-50 animate-pulse">
          <div className="bg-gray-900/90 rounded-2xl p-8 flex flex-col items-center shadow-2xl transform animate-bounce-small">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Quest Completed!</h3>
            <p className="text-xl font-semibold text-green-400">+{xpReward} XP</p>
          </div>
        </div>
      )}
      
      {/* Header with XP reward */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center">
          <SparklesIcon className="h-7 w-7 text-yellow-500 mr-3" />
          <h2 className="text-2xl font-bold text-yellow-300">{title}</h2>
        </div>
        {xpReward !== undefined && (
          <div className="bg-yellow-900/40 px-3 py-1 rounded-full border border-yellow-500/50 text-yellow-300 font-semibold flex items-center">
            <span className="text-yellow-400 mr-1">+{xpReward}</span> XP
          </div>
        )}
      </div>
      
      <div className="space-y-6 text-gray-300 relative z-10">
        {/* Introduction section */}
        <div className="bg-gray-800/50 p-5 rounded-lg border-l-4 border-yellow-500 shadow-md">
          <p className="text-lg">
            In this quest, you'll learn how to mint, transfer, and manage zBTC tokens within the Solana ecosystem. Follow along with the interactive examples to deepen your understanding.
          </p>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Minting zBTC Section */}
            <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/50">
              <div className="px-5 py-4 bg-gray-800/80 flex justify-between items-center">
                <h3 className="font-semibold text-yellow-300">Minting zBTC Process</h3>
                {completedSteps.mintingExplained && (
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Completed</span>
                )}
              </div>
              
              <div className="p-5">
                <p className="mb-4">
                  Minting zBTC involves bridging your Bitcoin to the Solana blockchain through the Zeus Network. The process requires interactions with both blockchains.
                </p>
                
                <div className="bg-gray-900/50 p-4 rounded-lg mb-5">
                  <h4 className="font-semibold text-white mb-3">Minting Process Steps:</h4>
                  <ol className="space-y-3">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-900/50 border border-yellow-500/40 text-yellow-300 mr-3 text-xs font-bold">1</span>
                      <div>
                        <p className="text-gray-300">Connect to the Zeus Network bridge via APOLLO or using the ZPL SDK.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-900/50 border border-yellow-500/40 text-yellow-300 mr-3 text-xs font-bold">2</span>
                      <div>
                        <p className="text-gray-300">Generate a unique Bitcoin deposit address linked to your Solana wallet.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-900/50 border border-yellow-500/40 text-yellow-300 mr-3 text-xs font-bold">3</span>
                      <div>
                        <p className="text-gray-300">Send BTC to the generated deposit address from your Bitcoin wallet.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-900/50 border border-yellow-500/40 text-yellow-300 mr-3 text-xs font-bold">4</span>
                      <div>
                        <p className="text-gray-300">Wait for Bitcoin network confirmations (usually 2-6 confirmations required).</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-900/50 border border-yellow-500/40 text-yellow-300 mr-3 text-xs font-bold">5</span>
                      <div>
                        <p className="text-gray-300">zBTC tokens are minted on Solana and transferred to your connected wallet.</p>
                      </div>
                    </li>
                  </ol>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    onClick={startSimulation}
                    disabled={simulationState.isStarted}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      simulationState.isStarted
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    Start Interactive Simulation
                  </button>
                  
                  {!simulationState.isStarted && !completedSteps.mintingExplained && (
                    <button 
                      onClick={() => handleMarkAsCompleted('mintingExplained')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Wallet Integration */}
            <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/50">
              <div className="px-5 py-4 bg-gray-800/80 flex justify-between items-center">
                <h3 className="font-semibold text-yellow-300">Wallet Integration</h3>
                {completedSteps.walletIntegration && (
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Completed</span>
                )}
              </div>
              
              <div className="p-5">
                <p className="mb-4">
                  Integrating zBTC with Solana wallets requires proper configuration to handle the token. Below is a code snippet for wallet integration:
                </p>
                
                <div className="bg-black/60 p-4 rounded-lg mb-5 overflow-x-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre">
{`import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getZbtcToken, getZbtcBalance } from '@zeus-network/zeus-client';

function ZBTCWalletIntegration() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(0);
  
  // Get zBTC balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      const fetchBalance = async () => {
        try {
          // Get zBTC token info
          const zbtcToken = await getZbtcToken();
          
          // Query balance
          const balance = await getZbtcBalance(publicKey);
          setBalance(balance);
        } catch (error) {
          console.error('Error fetching zBTC balance:', error);
        }
      };
      
      fetchBalance();
    }
  }, [connected, publicKey]);
  
  return (
    <div>
      <WalletMultiButton />
      {connected && (
        <div>
          <h3>Your zBTC Balance</h3>
          <p>{balance} zBTC</p>
        </div>
      )}
    </div>
  );
}`}
                  </pre>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleMarkAsCompleted('walletIntegration')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      completedSteps.walletIntegration
                        ? 'bg-green-700/40 text-green-300'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {completedSteps.walletIntegration ? 'Completed ✓' : 'Mark as Complete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Simulation Panel (Shows only when simulation is started) */}
            {simulationState.isStarted && (
              <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/50">
                <div className="px-5 py-4 bg-gray-800/80 flex justify-between items-center">
                  <h3 className="font-semibold text-yellow-300">Interactive Minting Simulation</h3>
                  {simulationState.isComplete && (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Completed</span>
                  )}
                </div>
                
                <div className="p-5">
                  {/* Wallet Balances */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900/70 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <BanknotesIcon className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="text-white font-medium">BTC Balance</span>
                        </div>
                        {btcBalance < 0.25 && (
                          <ArrowDownIcon className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-yellow-300">{btcBalance.toFixed(2)} BTC</div>
                      <div className="text-xs text-gray-400 mt-1">Bitcoin Network</div>
                    </div>
                    
                    <div className="bg-gray-900/70 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <img src="/bitcoin/zeusbtc.png" alt="zBTC" className="h-5 w-5 mr-2" />
                          <span className="text-white font-medium">zBTC Balance</span>
                        </div>
                        {zbtcBalance > 0 && (
                          <ArrowUpIcon className="h-4 w-4 text-green-400" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-purple-300">{zbtcBalance.toFixed(2)} zBTC</div>
                      <div className="text-xs text-gray-400 mt-1">Solana Network</div>
                    </div>
                  </div>
                  
                  {/* Simulation Messages */}
                  <div className="bg-black/30 rounded-lg p-4 mb-4 h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {simulationMessages.map((message, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {message}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Simulation Controls */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                      Step {simulationState.currentStep} of {simulationState.totalSteps}
                    </div>
                    
                    <button 
                      onClick={handleSimulationNext}
                      disabled={waitingForConfirmation || simulationState.isComplete}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        waitingForConfirmation || simulationState.isComplete
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      }`}
                    >
                      {waitingForConfirmation ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Waiting...
                        </span>
                      ) : simulationState.isComplete ? (
                        'Simulation Complete'
                      ) : (
                        'Next Step'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* zBTC Transfer Mechanisms */}
            <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/50">
              <div className="px-5 py-4 bg-gray-800/80 flex justify-between items-center">
                <h3 className="font-semibold text-yellow-300">zBTC Transfer Mechanisms</h3>
                {completedSteps.transferDemo && (
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Completed</span>
                )}
              </div>
              
              <div className="p-5">
                <p className="mb-4">
                  zBTC transfers work just like any SPL token on Solana, with the advantage of Solana's high speed and low fees.
                </p>
                
                <div className="bg-gray-900/50 p-4 rounded-lg mb-5">
                  <h4 className="font-semibold text-white mb-3">Transfer Methods:</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-900/50 border border-yellow-500/40 text-yellow-300 mr-3 text-xs font-bold">1</div>
                      <div>
                        <h5 className="font-medium text-yellow-300">Direct Wallet Transfer</h5>
                        <p className="text-sm text-gray-400 mt-1">
                          Standard SPL token transfers between Solana wallets with near-instant finality and minimal fees.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-900/50 border border-yellow-500/40 text-yellow-300 mr-3 text-xs font-bold">2</div>
                      <div>
                        <h5 className="font-medium text-yellow-300">Solana Program Interactions</h5>
                        <p className="text-sm text-gray-400 mt-1">
                          Transfer zBTC programmatically through smart contracts for DeFi applications.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-900/50 border border-yellow-500/40 text-yellow-300 mr-3 text-xs font-bold">3</div>
                      <div>
                        <h5 className="font-medium text-yellow-300">DEX Trading</h5>
                        <p className="text-sm text-gray-400 mt-1">
                          Trade zBTC against SOL or other tokens on Solana DEXes like Jupiter, Orca or Raydium.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/60 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Basic Transfer Code Example:</h4>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
{`import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

async function transferZbtc(
  connection: Connection,
  wallet: any, // Your wallet adapter
  recipient: string,
  amount: number
) {
  // Get zBTC token address
  const zbtcAddress = new PublicKey('ZBTC_TOKEN_ADDRESS');
  
  // Create token instance
  const token = new Token(
    connection,
    zbtcAddress,
    TOKEN_PROGRAM_ID,
    wallet.payer
  );
  
  // Get sender token account
  const senderTokenAccount = await token.getOrCreateAssociatedAccountInfo(
    wallet.publicKey
  );
  
  // Get or create recipient token account
  const recipientPublicKey = new PublicKey(recipient);
  const recipientTokenAccount = await token.getOrCreateAssociatedAccountInfo(
    recipientPublicKey
  );
  
  // Transfer tokens
  const transaction = new Transaction().add(
    Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      senderTokenAccount.address,
      recipientTokenAccount.address,
      wallet.publicKey,
      [],
      amount * 10**8 // Adjust for token decimals
    )
  );
  
  // Sign and send transaction
  const signature = await wallet.sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature);
  
  console.log('Transfer successful:', signature);
}`}
                  </pre>
                </div>
                
                {!simulationState.isStarted && (
                  <div className="flex justify-end mt-4">
                    <button 
                      onClick={() => handleMarkAsCompleted('transferDemo')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        completedSteps.transferDemo
                          ? 'bg-green-700/40 text-green-300'
                          : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      }`}
                    >
                      {completedSteps.transferDemo ? 'Completed ✓' : 'Mark as Complete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Security Best Practices */}
            <div className="bg-gray-800/40 rounded-lg overflow-hidden border border-gray-700/50">
              <div className="px-5 py-4 bg-gray-800/80 flex justify-between items-center">
                <h3 className="font-semibold text-yellow-300">Security Best Practices</h3>
                {completedSteps.securityBestPractices && (
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Completed</span>
                )}
              </div>
              
              <div className="p-5">
                <div className="bg-yellow-900/20 p-4 border border-yellow-500/30 rounded-lg mb-5">
                  <h4 className="font-semibold text-yellow-300 mb-2">Critical Security Considerations</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                      <span><span className="font-medium text-yellow-300">Address Verification:</span> Always triple-check Bitcoin addresses when minting or redeeming.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                      <span><span className="font-medium text-yellow-300">Hardware Wallets:</span> Use hardware wallets for large zBTC holdings whenever possible.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                      <span><span className="font-medium text-yellow-300">Smart Contract Risks:</span> Be cautious when interacting with new or unaudited DeFi protocols.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                      <span><span className="font-medium text-yellow-300">Test Transactions:</span> Always send a small test amount before large transfers.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2"></span>
                      <span><span className="font-medium text-yellow-300">Backup Keys:</span> Keep secure backups of all wallet keys and recovery phrases.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleMarkAsCompleted('securityBestPractices')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      completedSteps.securityBestPractices
                        ? 'bg-green-700/40 text-green-300'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {completedSteps.securityBestPractices ? 'Completed ✓' : 'Mark as Complete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Complete Quest Button */}
        <div className="flex justify-end mt-6">
          <button 
            onClick={handleCompleteQuest}
            disabled={isCompleting || !hasCompletedRequiredSteps()}
            className={`bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${isCompleting ? 'opacity-70' : ''}`}
          >
            {isCompleting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Completing...
              </span>
            ) : (
              'Complete Quest'
            )}
          </button>
        </div>
      </div>
      
      {/* Add custom CSS for animations */}
      <style jsx global>{`
        @keyframes bounce-small {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-small {
          animation: bounce-small 2s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}; 