'use client';
import React, { useState } from 'react';
import CodePlayground from '@/components/common/CodePlayground';
import QuestCompletionPopup from '@/components/common/QuestCompletionPopup';

interface SubstreamsCodeQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const SubstreamsCodeQuest: React.FC<SubstreamsCodeQuestProps> = ({ onQuestComplete, xpReward }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCompletionPopup, setShowCompletionPopup] = useState<boolean>(false);
  
  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
    
    // If all steps are completed, show the completion popup
    if (completedSteps.length === challenges.length - 1) {
      setShowCompletionPopup(true);
    } else {
      // Move to the next step
      setActiveStep(stepIndex + 1);
    }
  };
  
  const handlePopupClose = () => {
    setShowCompletionPopup(false);
    onQuestComplete();
  };

  const challenges = [
    {
      title: "Store Module Implementation",
      description: "Implement a store module that tracks token transfer counts",
      initialCode: `#[substreams::handlers::store]
fn store_transfer_stats(transfers: TransferEvents, store: StoreAddInt64) {
    // Your implementation here
    // Hint: Use store.add() to track metrics for each transfer
}`,
      expectedPatterns: [
        /for.*in.*transfers\.transfers/,
        /store\.add\(/,
        /transfer\.(from|to)/,
      ],
      hintText: "Iterate through transfers.transfers using 'for transfer in transfers.transfers {...}' and track counts with store.add() for each from/to address.",
      taskDescription: "Complete the store module function to track token transfer statistics",
    },
    {
      title: "Mapping Wallet Activity",
      description: "Create a map function that aggregates wallet activity",
      initialCode: `#[substreams::handlers::map]
fn map_wallet_activity(store: StoreGetInt64) -> Result<WalletActivity, substreams::errors::Error> {
    let mut response = WalletActivity {
        addresses: vec![],
    };
    
    // Your implementation here
    // Hint: Use store.scan_prefix() to find all wallets
    
    Ok(response)
}`,
      expectedPatterns: [
        /store\.scan_prefix\(/,
        /\.push\(/,
        /Ok\(response\)/,
      ],
      hintText: "Use store.scan_prefix(\"total_transfers:from:\", |k, v| {...}) to find all wallets, then push wallet stats to the response.",
      taskDescription: "Implement the map function to collect wallet activity from the store",
    },
    {
      title: "SQL Query Development",
      description: "Write a SQL query to analyze token transfers",
      initialCode: `-- Create a SQL query to show the top 10 wallets by transaction count
-- Table: wallet_stats(address, tx_count, volume_sent, volume_received)

`,
      expectedPatterns: [
        /SELECT[\s\S]*FROM[\s\S]*wallet_stats/i,
        /ORDER\s+BY.*tx_count/i,
        /LIMIT\s+10/i,
      ],
      hintText: "Write a query like: SELECT address, tx_count, volume_sent, volume_received FROM wallet_stats ORDER BY tx_count DESC LIMIT 10",
      taskDescription: "Write a SQL query to find the top 10 most active wallets by transaction count",
    }
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Interactive Substreams Coding</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            In this quest, you'll practice writing real Substreams code to transform and process Solana blockchain data.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>What you'll build:</strong> Store modules, map functions, and SQL queries for analyzing token transfers.
          </span>
        </p>
      </div>

      <div className="bg-dark-card-secondary rounded-lg overflow-hidden mb-6">
        <div className="border-b border-gray-700">
          <div className="flex flex-wrap">
            {challenges.map((challenge, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`py-3 px-4 font-medium ${
                  activeStep === index
                    ? 'text-emerald-400 border-b-2 border-emerald-400 bg-gray-800/30'
                    : completedSteps.includes(index)
                    ? 'text-green-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {index + 1}. {challenge.title}
                {completedSteps.includes(index) && (
                  <span className="ml-2">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          <h4 className="text-lg font-semibold text-white mb-3">{challenges[activeStep].description}</h4>
          
          <CodePlayground
            initialCode={challenges[activeStep].initialCode}
            expectedPatterns={challenges[activeStep].expectedPatterns}
            hintText={challenges[activeStep].hintText}
            taskDescription={challenges[activeStep].taskDescription}
            onValidCode={() => handleStepComplete(activeStep)}
          />
          
          <div className="mt-4 bg-gray-800/50 p-4 rounded-md">
            <h5 className="text-white font-medium mb-2">Example Output:</h5>
            <div className="bg-gray-900 text-gray-300 p-3 rounded text-sm font-mono max-h-40 overflow-y-auto">
              {activeStep === 0 && (
                <>
                  <p className="text-emerald-400">INFO substreams: Store key: total_transfers:from:DYw8jMTAZKdBLnVjjkXD7PRMLVC7hshD6aJzXWdEHt8N count: 1</p>
                  <p className="text-emerald-400">INFO substreams: Store key: total_transfers:to:B42wYYSxm1XkyGbS3qGmD4Z3mX8syLcuCF7sK3J3Yq8F count: 1</p>
                  <p className="text-emerald-400">INFO substreams: Store key: total_volume:DYw8jMTAZKdBLnVjjkXD7PRMLVC7hshD6aJzXWdEHt8N value: 1000000</p>
                  <p className="text-gray-500 mt-3">// Example solution:</p>
                  <p className="text-gray-400">#[substreams::handlers::store]</p>
                  <p className="text-gray-400">{`fn store_transfer_stats(transfers: TransferEvents, store: StoreAddInt64) {`}</p>
                  <p className="text-gray-400">{`    for transfer in transfers.transfers {`}</p>
                  <p className="text-gray-400">{`        store.add(format!("total_transfers:from:{}", transfer.from), 1);`}</p>
                  <p className="text-gray-400">{`        store.add(format!("total_transfers:to:{}", transfer.to), 1);`}</p>
                  <p className="text-gray-400">{`        if let Ok(amount) = transfer.amount.parse::<i64>() {`}</p>
                  <p className="text-gray-400">{`            store.add(format!("total_volume:{}", transfer.from), amount);`}</p>
                  <p className="text-gray-400">{`        }`}</p>
                  <p className="text-gray-400">{`    }`}</p>
                  <p className="text-gray-400">{`}`}</p>
                </>
              )}
              {activeStep === 1 && (
                <>
                  <p className="text-emerald-400">INFO substreams: Found 143 wallets with activity</p>
                  <p className="text-blue-400">INFO substreams: Wallet DYw8jMTAZKdBLnVjjkXD7PRMLVC7hshD6aJzXWdEHt8N has sent 37 transactions</p>
                  <p className="text-blue-400">INFO substreams: Wallet B42wYYSxm1XkyGbS3qGmD4Z3mX8syLcuCF7sK3J3Yq8F has received 42 transactions</p>
                  <p className="text-gray-500 mt-3">// Example solution:</p>
                  <p className="text-gray-400">#[substreams::handlers::map]</p>
                  <p className="text-gray-400">{`fn map_wallet_activity(store: StoreGetInt64) -> Result<WalletActivity, substreams::errors::Error> {`}</p>
                  <p className="text-gray-400">{`    let mut response = WalletActivity {`}</p>
                  <p className="text-gray-400">{`        addresses: vec![],`}</p>
                  <p className="text-gray-400">{`    };`}</p>
                  <p className="text-gray-400">{`    `}</p>
                  <p className="text-gray-400">{`    store.scan_prefix("total_transfers:from:", |k, v| {`}</p>
                  <p className="text-gray-400">{`        let addr = k.split(':').nth(2).unwrap_or_default();`}</p>
                  <p className="text-gray-400">{`        let stats = WalletStats {`}</p>
                  <p className="text-gray-400">{`            address: addr.to_string(),`}</p>
                  <p className="text-gray-400">{`            tx_count: v,`}</p>
                  <p className="text-gray-400">{`        };`}</p>
                  <p className="text-gray-400">{`        response.addresses.push(stats);`}</p>
                  <p className="text-gray-400">{`    });`}</p>
                  <p className="text-gray-400">{`    `}</p>
                  <p className="text-gray-400">{`    Ok(response)`}</p>
                  <p className="text-gray-400">{`}`}</p>
                </>
              )}
              {activeStep === 2 && (
                <>
                  <p className="text-gray-400">address | tx_count | volume_sent | volume_received</p>
                  <p className="text-white">----------------------------------------------</p>
                  <p className="text-blue-400">DYw8j...DEHt8N | 47 | 2345678 | 1234567</p>
                  <p className="text-blue-400">B42wY...J3Yq8F | 42 | 1234567 | 2345678</p>
                  <p className="text-blue-400">7zRzG...Naw3ke | 39 | 9876543 | 3456789</p>
                  <p className="text-gray-500 mt-3">-- Example solution:</p>
                  <p className="text-gray-400">SELECT</p>
                  <p className="text-gray-400">  address,</p>
                  <p className="text-gray-400">  tx_count,</p>
                  <p className="text-gray-400">  volume_sent,</p>
                  <p className="text-gray-400">  volume_received</p>
                  <p className="text-gray-400">FROM</p>
                  <p className="text-gray-400">  wallet_stats</p>
                  <p className="text-gray-400">ORDER BY</p>
                  <p className="text-gray-400">  tx_count DESC</p>
                  <p className="text-gray-400">LIMIT 10;</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Resources:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><a href="https://docs.substreams.dev/reference/modules-reference/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams Modules Reference</a></li>
          <li><a href="https://github.com/streamingfast/substreams-sink-sql" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams SQL Sink GitHub</a></li>
          <li><a href="https://docs.substreams.dev/tutorials/solana-account-changes/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Tracking Solana Account Changes</a></li>
        </ul>
      </div>
      
      <QuestCompletionPopup
        isOpen={showCompletionPopup}
        onClose={handlePopupClose}
        xpReward={xpReward}
        questTitle="Interactive Substreams Coding"
      />
    </div>
  );
}; 