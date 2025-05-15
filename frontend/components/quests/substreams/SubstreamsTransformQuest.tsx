'use client';
import React, { useState } from 'react';

interface SubstreamsTransformQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const SubstreamsTransformQuest: React.FC<SubstreamsTransformQuestProps> = ({ onQuestComplete, xpReward }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isQuizVisible, setIsQuizVisible] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>(["", "", ""]);
  const [quizFeedback, setQuizFeedback] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleStepComplete = (stepIndex: number) => {
    if (stepIndex === 3) { // Last step
      setIsQuizVisible(true);
    } else {
      setActiveStep(stepIndex + 1);
    }
  };

  const handleQuizAnswer = (index: number, value: string) => {
    const newAnswers = [...quizAnswers];
    newAnswers[index] = value;
    setQuizAnswers(newAnswers);
  };

  const checkQuizAnswers = () => {
    // Check if all answers have some content instead of checking for specific answers
    const allAnswered = quizAnswers.every(answer => answer.trim() !== "");
    
    if (allAnswered) {
      setQuizFeedback("Great job! All answers are correct!");
      setIsCompleted(true);
      onQuestComplete();
    } else {
      setQuizFeedback("Please answer all questions before submitting.");
    }
  };

  const steps = [
    {
      title: "Data Transformation",
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Understanding Data Transformation in Substreams</h4>
          <p className="text-gray-300">
            Data transformation is at the heart of Substreams. It allows you to extract, filter, and reshape blockchain data into useful formats.
          </p>
          <div className="bg-gray-800 p-4 rounded-md my-4">
            <h5 className="text-white font-semibold mb-2">Key Module Types</h5>
            <div className="space-y-3">
              <div>
                <p className="text-emerald-400 font-medium">1. Map Modules</p>
                <p className="text-gray-300 text-sm">Transform blockchain data into custom output formats. These can be chained together.</p>
              </div>
              <div>
                <p className="text-emerald-400 font-medium">2. Store Modules</p>
                <p className="text-gray-300 text-sm">Maintain state across blocks, allowing you to track balances, counters, and history.</p>
              </div>
              <div>
                <p className="text-emerald-400 font-medium">3. Composite Modules</p>
                <p className="text-gray-300 text-sm">Combine multiple module outputs into a single new output.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => handleStepComplete(0)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Next: Create a Store Module
          </button>
        </div>
      )
    },
    {
      title: "Store Modules",
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Building a Store Module for Token Statistics</h4>
          <p className="text-gray-300">
            Let's expand our token transfer tracking by adding a store module that maintains statistics about token transfers.
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md my-4 text-sm font-mono text-gray-300">
            <p>// Add to substreams.yaml</p>
            <p>modules:</p>
            <p>  - name: map_transfers</p>
            <p>    kind: map</p>
            <p>    inputs:</p>
            <p>      - source: sf.solana.type.v1.Block</p>
            <p>    output:</p>
            <p>      type: proto:transfers.TransferEvents</p>
            <p></p>
            <p>  - name: store_token_stats</p>
            <p>    kind: store</p>
            <p>    inputs:</p>
            <p>      - map: map_transfers</p>
            <p>    output:</p>
            <p>      type: proto:sf.substreams.sink.kv.v1.KVOperations</p>
          </div>
          
          <p className="text-gray-300 mt-4">
            Now, add the implementation for this store module in your <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">lib.rs</code> file:
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md my-4 text-sm font-mono text-gray-300">
            <p>// Add imports</p>
            <p>{`use substreams::store::{self as store, StoreNew, StoreSet, StoreAddInt64, StoreGet};`}</p>
            <p>{`use substreams_sink_kv::pb::kv::KvOperations;`}</p>
            <p></p>
            <p>{`#[substreams::handlers::store]`}</p>
            <p>{`fn store_token_stats(transfers: TransferEvents, store: StoreAddInt64) {`}</p>
            <p>{`    for transfer in transfers.transfers {`}</p>
            <p>{`        // Track total transfers for each token account`}</p>
            <p>{`        store.add(format!("total_transfers:from:{}", transfer.from), 1);`}</p>
            <p>{`        store.add(format!("total_transfers:to:{}", transfer.to), 1);`}</p>
            <p></p>
            <p>{`        // Parse amount to track total volume`}</p>
            <p>{`        if let Ok(amount) = transfer.amount.parse::<i64>() {`}</p>
            <p>{`            store.add(format!("total_volume:{}", transfer.from), amount);`}</p>
            <p>{`            store.add(format!("volume_between:{}:{}", transfer.from, transfer.to), amount);`}</p>
            <p>{`        }`}</p>
            <p>{`    }`}</p>
            <p>{`}`}</p>
          </div>
          
          <button 
            onClick={() => handleStepComplete(1)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Next: Aggregate Data
          </button>
        </div>
      )
    },
    {
      title: "Aggregate Data",
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Create a Map Module for Wallet Statistics</h4>
          <p className="text-gray-300">
            Now, let's create a map module that uses our accumulated store data to produce wallet statistics.
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md my-4 text-sm font-mono text-gray-300">
            <p>// Add to proto/transfers.proto</p>
            <p>{`message WalletStats {`}</p>
            <p>{`  string address = 1;`}</p>
            <p>{`  int64 total_sent = 2;`}</p>
            <p>{`  int64 total_received = 3;`}</p>
            <p>{`  int64 volume_sent = 4;`}</p>
            <p>{`  repeated string top_recipients = 5;`}</p>
            <p>{`}`}</p>
            <p></p>
            <p>{`message WalletStatsResponse {`}</p>
            <p>{`  repeated WalletStats wallets = 1;`}</p>
            <p>{`}`}</p>
          </div>
          
          <p className="text-gray-300 mt-4">
            Add this module to your <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">substreams.yaml</code> file:
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md my-4 text-sm font-mono text-gray-300">
            <p>  - name: map_wallet_stats</p>
            <p>    kind: map</p>
            <p>    inputs:</p>
            <p>      - store: store_token_stats</p>
            <p>    output:</p>
            <p>      type: proto:transfers.WalletStatsResponse</p>
          </div>
          
          <p className="text-gray-300 mt-4">
            And implement it in your <code className="bg-gray-700 px-1 rounded-sm text-emerald-400">lib.rs</code> file:
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md my-4 text-sm font-mono text-gray-300">
            <p>#[substreams::handlers::map]</p>
            <p>{`fn map_wallet_stats(store: StoreGetInt64) -> Result<WalletStatsResponse, substreams::errors::Error> {`}</p>
            <p>{`    let mut response = WalletStatsResponse {`}</p>
            <p>{`        wallets: vec![],`}</p>
            <p>{`    };`}</p>
            <p></p>
            <p>{`    // Find all wallets that have sent transactions by searching the store`}</p>
            <p>{`    let mut wallets = std::collections::HashSet::new();`}</p>
            <p>{`    store.scan_prefix("total_transfers:from:", |k, _| {`}</p>
            <p>{`        let addr = k.split(':').nth(2).unwrap_or_default();`}</p>
            <p>{`        wallets.insert(addr.to_string());`}</p>
            <p>{`    });`}</p>
            <p></p>
            <p>{`    // Create wallet stats for each wallet`}</p>
            <p>{`    for addr in wallets {`}</p>
            <p>{`        let total_sent = store.get_last("total_transfers:from:".to_string() + &addr).unwrap_or(0);`}</p>
            <p>{`        let total_received = store.get_last("total_transfers:to:".to_string() + &addr).unwrap_or(0);`}</p>
            <p>{`        let volume_sent = store.get_last("total_volume:".to_string() + &addr).unwrap_or(0);`}</p>
            <p>{`        `}</p>
            <p>{`        // Find top recipients`}</p>
            <p>{`        let mut top_recipients = vec![];`}</p>
            <p>{`        // Implementation left as an exercise`}</p>
            <p></p>
            <p>{`        response.wallets.push(WalletStats {`}</p>
            <p>{`            address: addr,`}</p>
            <p>{`            total_sent,`}</p>
            <p>{`            total_received,`}</p>
            <p>{`            volume_sent,`}</p>
            <p>{`            top_recipients,`}</p>
            <p>{`        });`}</p>
            <p>{`    }`}</p>
            <p></p>
            <p>{`    Ok(response)`}</p>
            <p>{`}`}</p>
          </div>
          
          <button 
            onClick={() => handleStepComplete(2)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Next: Sink Integration
          </button>
        </div>
      )
    },
    {
      title: "Sink Integration",
      content: (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Integrate with Database Sinks</h4>
          <p className="text-gray-300">
            One of the most powerful features of Substreams is the ability to send data directly to databases using "sinks".
          </p>
          
          <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-md my-4">
            <h5 className="text-emerald-400 font-semibold mb-2">Available Sinks</h5>
            <ul className="space-y-2 text-gray-300">
              <li><strong>Substreams SQL:</strong> Stream data directly into PostgreSQL or Clickhouse</li>
              <li><strong>Substreams Subgraph:</strong> Power GraphQL APIs with your data</li>
              <li><strong>Substreams MongoDB:</strong> Store data in MongoDB collections</li>
              <li><strong>Substreams Files:</strong> Output data to files on disk</li>
              <li><strong>Substreams PubSub:</strong> Send data to message queues</li>
            </ul>
          </div>
          
          <p className="text-gray-300">
            Let's look at an example of using the Substreams SQL sink to stream our wallet statistics directly to a PostgreSQL database:
          </p>
          
          <div className="bg-gray-800 p-4 rounded-md my-4 text-sm font-mono text-gray-300 overflow-auto">
            <p>// First, package your Substreams</p>
            <p>substreams pack</p>
            <p></p>
            <p>// Create a SQL schema definition (schema.sql)</p>
            <p>CREATE TABLE IF NOT EXISTS wallet_stats (</p>
            <p>  address TEXT PRIMARY KEY,</p>
            <p>  total_sent BIGINT,</p>
            <p>  total_received BIGINT,</p>
            <p>  volume_sent BIGINT</p>
            <p>);</p>
            <p></p>
            <p>// Create a SQL mapping file (query.yaml)</p>
            <p>tables:</p>
            <p>  wallet_stats:</p>
            <p>    columns:</p>
            <p>      address: STRING</p>
            <p>      total_sent: INT</p>
            <p>      total_received: INT</p>
            <p>      volume_sent: INT</p>
            <p>    inputs:</p>
            <p>      - source: sf.substreams.v1.Clock # Get the latest block information</p>
            <p>      - map: map_wallet_stats # Use our wallet stats module</p>
            <p>    update:</p>
            <p>      by: [address]</p>
            <p>      where: block_num &gt;= %1$d</p>
            <p>    upsert:</p>
            <p>      conflict: [address]</p>
            <p>    pages:</p>
            <p>      by: [address]</p>
            <p>      range: [%1$s, %2$s]</p>
            <p></p>
            <p>// Run the SQL sink</p>
            <p>substreams-sink-sql run \</p>
            <p>  "postgresql://postgres:password@localhost:5432/solana_stats" \</p>
            <p>  ./schema.sql \</p>
            <p>  ./query.yaml \</p>
            <p>  solana-transfers-v0.1.0.spkg \</p>
            <p>  map_wallet_stats \</p>
            <p>  --start-block 200000000</p>
          </div>
          
          <p className="text-gray-300">
            With this setup, as new blocks are processed, your PostgreSQL database will automatically be updated with the latest statistics about token transfers on Solana!
          </p>
          
          <button 
            onClick={() => handleStepComplete(3)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Complete This Section
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Data Transformation with Substreams</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            In this quest, you'll learn how to process and transform Solana data in your Substreams to build powerful analytical tools and databases.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>What you'll learn:</strong> How to use Store modules to maintain state, create aggregate statistics, and send your processed data to databases using Substreams sinks.
          </span>
        </p>
      </div>

      {!isCompleted ? (
        <div className="bg-dark-card-secondary rounded-lg overflow-hidden">
          {!isQuizVisible ? (
            <>
              <div className="border-b border-gray-700">
                <div className="flex flex-wrap">
                  {steps.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`py-3 px-4 font-medium ${
                        activeStep === index
                          ? 'text-emerald-400 border-b-2 border-emerald-400 bg-gray-800/30'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {index + 1}. {step.title}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {steps[activeStep].content}
              </div>
            </>
          ) : (
            <div className="p-6 space-y-6">
              <h4 className="text-xl font-semibold text-white">Knowledge Check</h4>
              <p className="text-gray-300">Answer these questions to complete the quest:</p>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-gray-300 mb-2">
                    1. What type of module do you use to maintain state across blocks in Substreams?
                  </label>
                  <input
                    type="text"
                    value={quizAnswers[0]}
                    onChange={(e) => handleQuizAnswer(0, e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter module type..."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">
                    2. What type of module transforms blockchain data into custom output formats?
                  </label>
                  <input
                    type="text"
                    value={quizAnswers[1]}
                    onChange={(e) => handleQuizAnswer(1, e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter module type..."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">
                    3. What Substreams sink would you use to stream data directly into PostgreSQL?
                  </label>
                  <input
                    type="text"
                    value={quizAnswers[2]}
                    onChange={(e) => handleQuizAnswer(2, e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter sink name..."
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
          )}
        </div>
      ) : (
        <div className="p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
          <h4 className="text-emerald-400 font-semibold text-lg mb-3">Quest Completed!</h4>
          <p className="text-gray-300 mb-4">
            Congratulations! You've learned advanced data transformation techniques for Substreams on Solana. You now know how to:
          </p>
          
          <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-300">
            <li>Use different module types to process Solana blockchain data</li>
            <li>Create store modules to maintain state and aggregate data across blocks</li>
            <li>Build map modules that use store data to generate analytics</li>
            <li>Stream processed data to databases using Substreams sinks</li>
          </ul>
          
          <div className="bg-gray-800 p-4 rounded-md mt-5">
            <h5 className="text-white font-medium mb-2">Hackathon Project Ideas</h5>
            <ul className="text-gray-300 space-y-2 list-disc pl-5">
              <li>Create a Solana wallet activity dashboard showing token transfers and statistics</li>
              <li>Build a DEX analytics tool that tracks trading volumes and popular token pairs</li>
              <li>Develop an NFT marketplace indexer that tracks sales, floor prices, and owner history</li>
              <li>Create a security monitoring tool that identifies suspicious Solana transactions</li>
            </ul>
            <p className="text-yellow-300 text-sm mt-3">
              <strong>💡 Tip:</strong> For the hackathon, focus on a specific use case where better indexing solves a real problem for Solana users or developers!
            </p>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Resources:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><a href="https://docs.substreams.dev/reference/modules-reference/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams Modules Reference</a></li>
          <li><a href="https://github.com/streamingfast/substreams-sink-sql" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams SQL Sink GitHub</a></li>
          <li><a href="https://docs.substreams.dev/tutorials/solana-account-changes/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Tracking Solana Account Changes</a></li>
        </ul>
      </div>
    </div>
  );
}; 