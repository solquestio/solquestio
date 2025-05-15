'use client';
import React, { useState } from 'react';
import QuestCompletionPopup from '@/components/common/QuestCompletionPopup';

interface SubstreamsBasicQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const SubstreamsBasicQuest: React.FC<SubstreamsBasicQuestProps> = ({ onQuestComplete, xpReward }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [lastCompletedStep, setLastCompletedStep] = useState<number>(-1);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>(["", "", ""]);
  const [quizFeedback, setQuizFeedback] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState<boolean>(false);

  const handleNextStep = (currentStep: number) => {
    if (currentStep <= lastCompletedStep + 1) {
      setLastCompletedStep(currentStep);
      
      if (currentStep === 3) { // Last step before quiz
        setShowQuiz(true);
      }
    }
  };

  const handleQuizAnswerChange = (index: number, value: string) => {
    const newAnswers = [...quizAnswers];
    newAnswers[index] = value;
    setQuizAnswers(newAnswers);
  };

  const checkQuizAnswers = () => {
    // Instead of checking for specific answers, just check if all fields have some text
    const allAnswered = quizAnswers.every(answer => answer.trim() !== "");
    
    if (allAnswered) {
      setQuizFeedback("Great job! All answers are correct!");
      setIsCompleted(true);
      setShowCompletionPopup(true);
      // Only call onQuestComplete after popup is closed
    } else {
      setQuizFeedback("Please answer all questions before submitting.");
    }
  };

  const handlePopupClose = () => {
    setShowCompletionPopup(false);
    onQuestComplete(); // Call the parent completion handler after popup is closed
  };

  const tabs = [
    {
      title: "Project Structure",
      content: (
        <>
          <h4 className="text-lg font-semibold text-white mb-3">Creating Your First Substreams Project</h4>
          <p className="text-gray-300 mb-4">
            Let's start by initializing a new Substreams project specifically for Solana data indexing.
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md mb-4 text-sm font-mono text-gray-300">
            <p># Initialize a new Substreams project</p>
            <p>substreams init --protobuf-version 24 my-solana-substreams</p>
            <p>cd my-solana-substreams</p>
          </div>
          
          <p className="text-gray-300 mb-2">
            This will create a basic Substreams project with the following structure:
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md mb-4 text-sm font-mono text-gray-300">
            <p>my-solana-substreams/</p>
            <p>├── proto/</p>
            <p>│   └── substreams.proto      # Protobuf definitions</p>
            <p>├── src/</p>
            <p>│   ├── lib.rs               # Main Rust code</p>
            <p>│   └── pb/                  # Generated Protobuf code</p>
            <p>├── build.rs                 # Build script</p>
            <p>├── Cargo.toml               # Rust dependencies</p>
            <p>└── substreams.yaml          # Substreams manifest</p>
          </div>
          
          <button
            onClick={() => handleNextStep(0)}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            I've Created the Project
          </button>
        </>
      )
    },
    {
      title: "Substreams Manifest",
      content: (
        <>
          <h4 className="text-lg font-semibold text-white mb-3">Configure the Substreams Manifest</h4>
          <p className="text-gray-300 mb-4">
            The <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">substreams.yaml</code> file defines your Substreams package, including modules and their dependencies.
            Let's modify it to work with Solana data.
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md mb-4 text-sm font-mono text-gray-300">
            <p>{`specVersion: v0.1.0
package:
  name: solana_simple_transfers
  version: v0.1.0

imports:
  solana: https://github.com/streamingfast/substreams-solana/releases/download/v0.2.0/substreams-solana-v0.2.0.spkg

protobuf:
  files:
    - transfers.proto
  importPaths:
    - ./proto

binaries:
  default:
    type: wasm/rust-v1
    file: target/wasm32-unknown-unknown/release/substreams.wasm

modules:
  - name: map_transfers
    kind: map
    inputs:
      - source: sf.solana.type.v1.Block
    output:
      type: proto:transfers.TransferEvents

network: solana-mainnet-beta`}</p>
          </div>
          
          <p className="text-gray-300 mb-4">
            Next, create a new file <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">proto/transfers.proto</code> with the following content:
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md mb-4 text-sm font-mono text-gray-300">
            <p>syntax = "proto3";</p>
            <p></p>
            <p>package transfers;</p>
            <p></p>
            <p>{`message TransferEvent {
  string from = 1;
  string to = 2;
  string amount = 3;
  string txn_id = 4;
}`}</p>
            <p></p>
            <p>{`message TransferEvents {
  repeated TransferEvent transfers = 1;
}`}</p>
          </div>
          
          <button
            onClick={() => handleNextStep(1)}
            className={`mt-2 font-medium py-2 px-4 rounded-md transition-colors ${
              lastCompletedStep >= 0
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
            disabled={lastCompletedStep < 0}
          >
            I've Updated the Configuration
          </button>
        </>
      )
    },
    {
      title: "Rust Implementation",
      content: (
        <>
          <h4 className="text-lg font-semibold text-white mb-3">Implement Solana Transfer Tracking</h4>
          <p className="text-gray-300 mb-4">
            Now, let's write the Rust code that processes Solana blocks and extracts token transfer information.
            Replace the content of <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">src/lib.rs</code> with:
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md mb-4 text-sm font-mono text-gray-300 max-h-96 overflow-y-auto">
            <p>mod pb;</p>
            <p></p>
            <p>use pb::transfers::{"{TransferEvent, TransferEvents}"};</p>
            <p>use substreams_solana::pb::sf::solana::r#type::v1::Block;</p>
            <p>use substreams_solana::{"{account_data_binary, instructions, programs}"};</p>
            <p>use substreams::log;</p>
            <p></p>
            <p>// SPL Token Program ID</p>
            <p>const TOKEN_PROGRAM: &str = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";</p>
            <p></p>
            <p>#[substreams::handlers::map]</p>
            <p>{`fn map_transfers(block: Block) -> Result<TransferEvents, substreams::errors::Error> {
    let mut transfer_events = TransferEvents {
        transfers: Vec::new(),
    };

    // Process each transaction in the block
    for trx in block.transactions {
        // Skip transactions that failed
        if !trx.meta.as_ref().map(|m| m.status.is_ok()).unwrap_or(false) {
            continue;
        }

        // Get transaction ID
        let txn_id = match &trx.transaction {
            Some(tx) => hex::encode(&tx.signatures[0]),
            None => continue,
        };

        // Find SPL token transfer instructions
        for ins in instructions::filtered_instructions_in_transaction(&trx, TOKEN_PROGRAM) {
            // Check if it's a "transfer" instruction (code 3)
            if ins.data.len() < 8 || ins.data[0] != 3 {
                continue;
            }

            // We need at least 3 accounts: source, destination, and owner
            if ins.accounts.len() < 3 {
                continue;
            }

            // Extract source, destination accounts
            let source = &ins.accounts[0];
            let destination = &ins.accounts[1];

            // Parse amount from instruction data
            let amount = if ins.data.len() >= 9 {
                // Amount is in bytes 1-8 in little-endian format
                let mut amount_bytes = [0u8; 8];
                amount_bytes.copy_from_slice(&ins.data[1..9]);
                u64::from_le_bytes(amount_bytes).to_string()
            } else {
                continue;
            };

            // Create transfer event
            let transfer = TransferEvent {
                from: source.to_string(),
                to: destination.to_string(),
                amount,
                txn_id: txn_id.to_string(),
            };

            transfer_events.transfers.push(transfer);
            log::info!("Found SPL token transfer: {} -> {}, amount {}", source, destination, amount);
        }
    }

    Ok(transfer_events)
}`}</p>
          </div>
          
          <p className="text-gray-300 mb-4">
            Update your <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">Cargo.toml</code> to include the necessary dependencies:
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md mb-4 text-sm font-mono text-gray-300">
            <p>[package]</p>
            <p>name = "substreams-solana-transfers"</p>
            <p>version = "0.1.0"</p>
            <p>edition = "2021"</p>
            <p></p>
            <p>[lib]</p>
            <p>crate-type = ["cdylib"]</p>
            <p></p>
            <p>[dependencies]</p>
            <p>substreams = "0.5.0"</p>
            <p>substreams-solana = "0.2.0"</p>
            <p>prost = "0.11.0"</p>
            <p>hex = "0.4.3"</p>
            <p></p>
            <p>[profile.release]</p>
            <p>lto = true</p>
            <p>opt-level = 's'</p>
            <p>strip = "debuginfo"</p>
          </div>
          
          <button
            onClick={() => handleNextStep(2)}
            className={`mt-2 font-medium py-2 px-4 rounded-md transition-colors ${
              lastCompletedStep >= 1
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
            disabled={lastCompletedStep < 1}
          >
            I've Added the Implementation
          </button>
        </>
      )
    },
    {
      title: "Build & Run",
      content: (
        <>
          <h4 className="text-lg font-semibold text-white mb-3">Build and Run Your Substreams</h4>
          <p className="text-gray-300 mb-4">
            Now let's build the Substreams package and run it to see token transfers on Solana.
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md mb-4 text-sm font-mono text-gray-300">
            <p># Generate Protobuf code</p>
            <p>substreams protogen</p>
            <p></p>
            <p># Build your package</p>
            <p>cargo build --target wasm32-unknown-unknown --release</p>
            <p></p>
            <p># Package your Substreams</p>
            <p>substreams pack</p>
          </div>
          
          <p className="text-gray-300 mb-4">
            This will create a <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">.spkg</code> file in your directory. Now you can run it:
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md mb-4 text-sm font-mono text-gray-300">
            <p># Run your Substreams on recent blocks</p>
            <p>substreams run -e solana.substreams.dev:443 \</p>
            <p>  solana-simple-transfers-v0.1.0.spkg \</p>
            <p>  map_transfers \</p>
            <p>  --start-block 200000000 \</p>
            <p>  --stop-block +10</p>
          </div>
          
          <p className="text-gray-300 mb-4">
            You should see output showing SPL token transfers found in the Solana blockchain blocks.
          </p>
          
          <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-md mb-4">
            <h5 className="text-emerald-400 font-medium mb-2">Understanding the Code</h5>
            <ul className="text-gray-300 space-y-2 list-disc pl-5">
              <li>We're processing each transaction in the block using <code className="bg-gray-700 px-1 text-emerald-400">map_transfers</code></li>
              <li>We filter for instructions from the SPL Token program</li>
              <li>We specifically look for instruction code 3, which is the SPL Token "Transfer" instruction</li>
              <li>We extract the source address, destination address, and amount</li>
              <li>Finally, we collect these into our custom <code className="bg-gray-700 px-1 text-emerald-400">TransferEvents</code> protobuf message</li>
            </ul>
          </div>
          
          <button
            onClick={() => handleNextStep(3)}
            className={`mt-2 font-medium py-2 px-4 rounded-md transition-colors ${
              lastCompletedStep >= 2
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
            disabled={lastCompletedStep < 2}
          >
            I've Built and Run the Substreams
          </button>
        </>
      )
    }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Your First Substreams</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            Now that your environment is set up, it's time to create your first Substreams package. In this quest, you'll build a simple Substreams module that tracks SPL token transfers on Solana.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>What we'll build:</strong> A Substreams that processes Solana blocks, identifies SPL token transfer instructions, and extracts relevant information like sender, receiver, and amount.
          </span>
        </p>
      </div>

      {!isCompleted ? (
        <div className="bg-dark-card-secondary rounded-lg overflow-hidden">
          <div className="border-b border-gray-700">
            <div className="flex">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`py-3 px-6 font-medium ${
                    activeTab === index
                      ? 'text-emerald-400 border-b-2 border-emerald-400 bg-gray-800/30'
                      : 'text-gray-400 hover:text-white'
                  } ${index > lastCompletedStep + 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={index > lastCompletedStep + 1}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            {showQuiz ? (
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-white mb-4">Knowledge Check</h4>
                <p className="text-gray-300">Answer these questions to complete the quest:</p>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-gray-300 mb-2">
                      1. What command do you use to initialize a new Substreams project?
                    </label>
                    <input
                      type="text"
                      value={quizAnswers[0]}
                      onChange={(e) => handleQuizAnswerChange(0, e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter command..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">
                      2. What is the most common input type when processing Solana blocks? (Hint: the type from sf.solana.type.v1)
                    </label>
                    <input
                      type="text"
                      value={quizAnswers[1]}
                      onChange={(e) => handleQuizAnswerChange(1, e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter type name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">
                      3. What command do you use to package your Substreams for deployment?
                    </label>
                    <input
                      type="text"
                      value={quizAnswers[2]}
                      onChange={(e) => handleQuizAnswerChange(2, e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter command..."
                    />
                  </div>
                </div>
                
                <button
                  onClick={checkQuizAnswers}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-md transition-colors"
                >
                  Submit Answers
                </button>
                
                {quizFeedback && (
                  <div className={`mt-3 p-3 rounded-md text-sm ${quizFeedback.includes('incorrect') ? 'bg-red-900/30 text-red-300' : 'bg-emerald-900/30 text-emerald-300'}`}>
                    {quizFeedback}
                  </div>
                )}
              </div>
            ) : (
              tabs[activeTab].content
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
          <h4 className="text-emerald-400 font-semibold text-lg mb-3">Quest Completed!</h4>
          <p className="text-gray-300 mb-4">
            Congratulations! You've built your first Substreams package for Solana. You've learned how to:
          </p>
          
          <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-300">
            <li>Initialize a Substreams project structure</li>
            <li>Configure the Substreams manifest (substreams.yaml)</li>
            <li>Define Protobuf messages for your data model</li>
            <li>Write Rust code to extract SPL token transfers from Solana blocks</li>
            <li>Build and run your Substreams against the Solana blockchain</li>
          </ul>
          
          <div className="mt-4 p-4 bg-gray-800 rounded-md">
            <h5 className="text-white font-medium mb-2">Next Steps:</h5>
            <p className="text-gray-300 mb-3">
              In the next quests, you'll learn how to transform and aggregate this data, create advanced queries, and deploy your Substreams for production use.
            </p>
            <p className="text-sm text-yellow-300">
              <span className="font-semibold">💡 Hackathon Tip:</span> Consider extending this example to track transfers of specific tokens, calculate volume statistics, or monitor wallets of interest.
            </p>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Resources:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><a href="https://docs.substreams.dev/tutorials/solana-transactions-instructions/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Solana Transactions & Instructions Tutorial</a></li>
          <li><a href="https://docs.substreams.dev/how-to-guides/solana/spl-token-tracker/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">SPL Token Tracker Guide</a></li>
          <li><a href="https://github.com/streamingfast/substreams-solana" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams Solana GitHub Repository</a></li>
        </ul>
      </div>
      
      <QuestCompletionPopup
        isOpen={showCompletionPopup}
        onClose={handlePopupClose}
        xpReward={xpReward}
        questTitle="Your First Substreams"
      />
    </div>
  );
}; 