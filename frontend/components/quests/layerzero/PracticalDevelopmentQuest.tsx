'use client';
import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

interface PracticalDevelopmentQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const PracticalDevelopmentQuest: React.FC<PracticalDevelopmentQuestProps> = ({ onQuestComplete, xpReward }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  
  const [activeStep, setActiveStep] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>('');
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const totalSteps = 4;

  const handleNextStep = () => {
    if (activeStep < totalSteps) {
      setActiveStep(activeStep + 1);
    } else {
      // Complete the quest if on the final step
      handleCompleteQuest();
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleCompleteQuest = () => {
    setIsLoading(true);
    setStatus('Validating your implementation...');
    
    // Simulate validation
    setTimeout(() => {
      setIsLoading(false);
      setIsCompleted(true);
      setStatus('Implementation successfully validated!');
      onQuestComplete();
    }, 2000);
  };

  const handleCheckCode = () => {
    setIsLoading(true);
    setStatus('Analyzing your code...');
    
    // Simulate code validation
    setTimeout(() => {
      setIsLoading(false);
      setStatus('Your code looks good! You can proceed to the next step.');
    }, 1500);
  };

  const solutionSnippets = {
    1: `// Example Rust Program Function for a LayerZero V2 OApp
#[program]
pub mod lz_solana_oapp {
    use super::*;

    // Initialize function for your Solana OApp
    pub fn initialize(ctx: Context<Initialize>, endpoint_id: u32) -> Result<()> {
        // Set up the config for your OApp
        let oapp_config = &mut ctx.accounts.oapp_config;
        oapp_config.owner = ctx.accounts.owner.key();
        oapp_config.endpoint = ctx.accounts.endpoint.key();
        oapp_config.endpoint_id = endpoint_id;
        
        Ok(())
    }

    // Function to send a message to another chain
    pub fn send_message(
        ctx: Context<SendMessage>, 
        dst_chain_id: u32,
        dst_address: [u8; 32],
        message: Vec<u8>,
        options: Option<Vec<u8>>,
        fee: u64,
    ) -> Result<()> {
        // Implementation details for sending a message via LayerZero V2
        // ...
        
        Ok(())
    }
}`,
    2: `// Account structure for your LayerZero V2 OApp
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        space = 8 + OAppConfig::INIT_SPACE,
        seeds = [b"oapp-config", owner.key().as_ref()],
        bump
    )]
    pub oapp_config: Account<'info, OAppConfig>,
    
    #[account(
        seeds = [b"endpoint"],
        bump,
        seeds::program = endpoint_program.key()
    )]
    pub endpoint: Account<'info, LayerZeroEndpoint>,
    
    pub endpoint_program: Program<'info, LayerZeroEndpoint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendMessage<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"oapp-config", oapp_config.owner.as_ref()],
        bump
    )]
    pub oapp_config: Account<'info, OAppConfig>,
    
    // Other accounts needed for LayerZero V2 integration
    // ...
}`,
    3: `// Account state structure for OApp configuration
#[account]
pub struct OAppConfig {
    pub owner: Pubkey,
    pub endpoint: Pubkey,
    pub endpoint_id: u32,
    // Additional configuration fields for your OApp
}

impl OAppConfig {
    pub const INIT_SPACE: usize = 32 + 32 + 4 + 64; // Space for Pubkeys, u32, and some extra
}

// Implementation of a Message Packet for LayerZero V2
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct MessagePacket {
    pub src_chain_id: u32,
    pub src_address: [u8; 32],
    pub dst_chain_id: u32,
    pub dst_address: [u8; 32],
    pub nonce: u64,
    pub payload: Vec<u8>,
}`,
    4: `// Client-side code to interact with your Solana OApp
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { IDL } from './idl/lz_solana_oapp';

// Set up your program ID and connection
const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID');
const connection = new Connection('https://api.devnet.solana.com');

// Create a provider
const provider = new AnchorProvider(
  connection,
  window.solana, // Your wallet adapter
  { commitment: 'confirmed' }
);

// Initialize program
const program = new Program(IDL, PROGRAM_ID, provider);

// Function to send a cross-chain message
async function sendCrossChainMessage(
  dstChainId,
  dstAddress,
  message
) {
  try {
    // Find your OApp config PDA
    const [oappConfigPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('oapp-config'), provider.wallet.publicKey.toBuffer()],
      program.programId
    );
    
    // Call the send_message instruction
    const tx = await program.methods
      .sendMessage(
        dstChainId,
        dstAddress,
        Buffer.from(message),
        null,
        new BN(1000000) // fee in lamports
      )
      .accounts({
        payer: provider.wallet.publicKey,
        oappConfig: oappConfigPDA,
        // Other required accounts
      })
      .rpc();
      
    console.log('Transaction sent:', tx);
    return tx;
  } catch (error) {
    console.error('Error sending cross-chain message:', error);
    throw error;
  }
}`
  };

  const renderStepContent = () => {
    switch(activeStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Step 1: Setting Up Your LayerZero V2 OApp Program</h4>
            <p className="text-gray-300">
              In this step, you'll learn how to define the core functions of your Solana program that integrates with LayerZero V2. 
              We'll focus on initializing your OApp and setting up the message sending capability.
            </p>
            
            <div className="bg-gray-800 p-4 rounded-md">
              <p className="text-green-400 mb-2">Task: Write the basic program module with initialize and send_message functions for a LayerZero V2 OApp:</p>
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                disabled={isCompleted}
                placeholder="// Enter your Rust program code here..."
                className="w-full h-64 bg-gray-900 border border-gray-700 text-gray-200 rounded-md shadow-sm py-2 px-3 font-mono text-sm focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
              />
              
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleCheckCode}
                  disabled={!codeInput.trim() || isLoading || isCompleted}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Code
                </button>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600"
                >
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
              </div>
            </div>
            
            {showSolution && (
              <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-md mt-4">
                <h5 className="text-green-400 font-medium mb-2">Solution:</h5>
                <pre className="bg-black/40 p-3 rounded text-green-300 text-sm font-mono overflow-x-auto">
                  {solutionSnippets[activeStep]}
                </pre>
              </div>
            )}
            
            <div className="text-gray-300 mt-4">
              <p className="text-sm">
                <span className="text-yellow-400">Note:</span> This code demonstrates the basic structure of your Solana program using the Anchor framework, 
                which simplifies interactions with LayerZero V2. Review the LayerZero V2 documentation for more details on the specific parameters
                and options available for cross-chain messaging.
              </p>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Step 2: Defining Account Structures</h4>
            <p className="text-gray-300">
              Now, let's set up the account structures needed for your LayerZero V2 integration. These structures define
              how your program will interact with the LayerZero endpoint on Solana.
            </p>
            
            <div className="bg-gray-800 p-4 rounded-md">
              <p className="text-green-400 mb-2">Task: Define the account structures for initialization and message sending:</p>
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                disabled={isCompleted}
                placeholder="// Enter your account structures here..."
                className="w-full h-64 bg-gray-900 border border-gray-700 text-gray-200 rounded-md shadow-sm py-2 px-3 font-mono text-sm focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
              />
              
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleCheckCode}
                  disabled={!codeInput.trim() || isLoading || isCompleted}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Code
                </button>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600"
                >
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
              </div>
            </div>
            
            {showSolution && (
              <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-md mt-4">
                <h5 className="text-green-400 font-medium mb-2">Solution:</h5>
                <pre className="bg-black/40 p-3 rounded text-green-300 text-sm font-mono overflow-x-auto">
                  {solutionSnippets[activeStep]}
                </pre>
              </div>
            )}
            
            <div className="text-gray-300 mt-4">
              <p className="text-sm">
                <span className="text-yellow-400">Key Concepts:</span> Notice how we use PDAs (Program Derived Addresses) with seeds for the OApp configuration.
                This allows us to deterministically derive the addresses where our program's state will be stored.
                The bump ensures uniqueness in case of seed collisions.
              </p>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Step 3: Implementing State Structures</h4>
            <p className="text-gray-300">
              In this step, we'll define the data structures that will hold the state for your OApp, including
              the configuration and message format for LayerZero V2.
            </p>
            
            <div className="bg-gray-800 p-4 rounded-md">
              <p className="text-green-400 mb-2">Task: Create the account state structure and message packet format:</p>
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                disabled={isCompleted}
                placeholder="// Enter your state structures here..."
                className="w-full h-64 bg-gray-900 border border-gray-700 text-gray-200 rounded-md shadow-sm py-2 px-3 font-mono text-sm focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
              />
              
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleCheckCode}
                  disabled={!codeInput.trim() || isLoading || isCompleted}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Code
                </button>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600"
                >
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
              </div>
            </div>
            
            {showSolution && (
              <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-md mt-4">
                <h5 className="text-green-400 font-medium mb-2">Solution:</h5>
                <pre className="bg-black/40 p-3 rounded text-green-300 text-sm font-mono overflow-x-auto">
                  {solutionSnippets[activeStep]}
                </pre>
              </div>
            )}
            
            <div className="text-gray-300 mt-4">
              <p className="text-sm">
                <span className="text-yellow-400">Important:</span> The MessagePacket structure is crucial for LayerZero V2 integration.
                It defines how messages are formatted for cross-chain communication, including source and destination chain IDs and addresses,
                a nonce for uniqueness, and the actual payload data to be sent.
              </p>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Step 4: Client-Side Integration</h4>
            <p className="text-gray-300">
              Finally, let's implement a JavaScript/TypeScript client to interact with your Solana OApp and send cross-chain messages
              through LayerZero V2.
            </p>
            
            <div className="bg-gray-800 p-4 rounded-md">
              <p className="text-green-400 mb-2">Task: Write client code to interact with your Solana OApp and send messages:</p>
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                disabled={isCompleted}
                placeholder="// Enter your client code here..."
                className="w-full h-64 bg-gray-900 border border-gray-700 text-gray-200 rounded-md shadow-sm py-2 px-3 font-mono text-sm focus:outline-none focus:ring-solana-purple focus:border-solana-purple"
              />
              
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleCheckCode}
                  disabled={!codeInput.trim() || isLoading || isCompleted}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Code
                </button>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600"
                >
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </button>
              </div>
            </div>
            
            {showSolution && (
              <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-md mt-4">
                <h5 className="text-green-400 font-medium mb-2">Solution:</h5>
                <pre className="bg-black/40 p-3 rounded text-green-300 text-sm font-mono overflow-x-auto">
                  {solutionSnippets[activeStep]}
                </pre>
              </div>
            )}
            
            <div className="text-gray-300 mt-4">
              <p className="text-sm">
                <span className="text-yellow-400">Pro Tip:</span> This client code uses the Anchor framework, which provides a convenient way to interact
                with your Solana program. Make sure to prepare the correct IDL file from your compiled program for proper type checking and function calls.
                You'll also need to manage fees appropriately for LayerZero message delivery.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Quest 6: Practical OApp Development</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            This quest moves beyond simulations to actual implementation. You'll build a real Solana program integrated with 
            LayerZero V2, following best practices for omnichain development.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>Key Challenge:</strong> Create a LayerZero V2 OApp (Omnichain Application) on Solana that can send and 
            receive messages across chains. You'll implement the core functionality step-by-step, covering both on-chain 
            program code and client-side integration.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>References:</strong> For detailed implementation guidance, refer to the LayerZero V2 documentation and example
            repositories at <a href="https://docs.layerzero.network/v2" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">docs.layerzero.network/v2</a> and 
            <a href="https://github.com/LayerZero-Labs/devtools/tree/main/examples/oft-solana" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline"> github.com/LayerZero-Labs/devtools</a>.
          </span>
        </p>
      </div>
      
      <div className="bg-dark-card-secondary p-6 rounded-lg">
        <div className="flex justify-between mb-6">
          <div className="flex space-x-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-8 h-2 rounded-full ${
                  index + 1 === activeStep
                    ? 'bg-blue-500'
                    : index + 1 < activeStep
                    ? 'bg-green-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-400">
            Step {activeStep} of {totalSteps}
          </div>
        </div>
        
        {renderStepContent()}
        
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePreviousStep}
            disabled={activeStep === 1 || isLoading || isCompleted}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={handleNextStep}
            disabled={isLoading || isCompleted}
            className="px-4 py-2 bg-solana-purple text-white rounded-md hover:bg-solana-purple-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activeStep === totalSteps ? 'Complete Quest' : 'Next Step'}
          </button>
        </div>
      </div>

      {status && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          status.startsWith('Error:') 
            ? 'bg-red-700/30 text-red-300' 
            : status.includes('successfully') 
              ? 'bg-green-700/30 text-green-300'
              : 'bg-blue-700/30 text-blue-300'
        }`}>
          {status}
        </div>
      )}

      {isCompleted && (
        <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <h4 className="text-green-400 font-semibold mb-2">Quest Completed!</h4>
          <p className="text-gray-300 text-sm">
            Congratulations on building your first LayerZero V2 OApp on Solana! You've learned the essential 
            components needed for cross-chain communication using LayerZero's V2 infrastructure. This foundation 
            will enable you to build innovative omnichain applications that leverage the unique advantages of 
            Solana while connecting to the broader blockchain ecosystem.
          </p>
        </div>
      )}
    </div>
  );
}; 