'use client';
import React, { useState } from 'react';
import QuestCompletionPopup from '@/components/common/QuestCompletionPopup';

interface SubstreamsVisualQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

// Types for our visual pipeline
interface DataNode {
  id: string;
  type: 'source' | 'map' | 'store' | 'sink';
  label: string;
  description: string;
  inputs?: string[];
  outputs?: string[];
  isSelected?: boolean;
}

interface PipelineConnection {
  from: string;
  to: string;
}

export const SubstreamsVisualQuest: React.FC<SubstreamsVisualQuestProps> = ({ onQuestComplete, xpReward }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCompletionPopup, setShowCompletionPopup] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  
  // Pre-defined pipeline for Solana token transfers
  const [nodes, setNodes] = useState<DataNode[]>([
    {
      id: 'solana-block',
      type: 'source',
      label: 'Solana Block',
      description: 'Raw data from the Solana blockchain containing transactions and instructions.',
    },
    {
      id: 'transfers-mapper',
      type: 'map',
      label: 'Map Transfers',
      description: 'Extracts token transfer events from Solana instructions.',
      inputs: ['solana-block'],
    },
    {
      id: 'token-stats',
      type: 'store',
      label: 'Token Stats Store',
      description: 'Maintains running statistics about token transfers.',
      inputs: ['transfers-mapper'],
    },
    {
      id: 'wallet-mapper',
      type: 'map',
      label: 'Wallet Stats Mapper',
      description: 'Aggregates statistics per wallet from the store.',
      inputs: ['token-stats'],
    },
    {
      id: 'postgres',
      type: 'sink',
      label: 'PostgreSQL',
      description: 'Streams processed data to a PostgreSQL database.',
      inputs: ['wallet-mapper'],
    }
  ]);

  // Pre-defined connections
  const connections: PipelineConnection[] = [
    { from: 'solana-block', to: 'transfers-mapper' },
    { from: 'transfers-mapper', to: 'token-stats' },
    { from: 'token-stats', to: 'wallet-mapper' },
    { from: 'wallet-mapper', to: 'postgres' },
  ];

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      const newCompletedSteps = [...completedSteps, step];
      setCompletedSteps(newCompletedSteps);
      
      if (newCompletedSteps.length === exercises.length) {
        setShowCompletionPopup(true);
      } else {
        setActiveStep(step + 1);
      }
    }
  };
  
  const handlePopupClose = () => {
    setShowCompletionPopup(false);
    onQuestComplete();
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
  };

  const checkAnswers = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return false;
    
    let allCorrect = true;
    Object.entries(exercise.correctAnswers).forEach(([questionId, correctAnswer]) => {
      if (userAnswers[questionId] !== correctAnswer) {
        allCorrect = false;
      }
    });
    
    if (allCorrect) {
      const stepIndex = exercises.findIndex(ex => ex.id === exerciseId);
      handleStepComplete(stepIndex);
    }
    
    return allCorrect;
  };

  // Visual exercises
  const exercises = [
    {
      id: 'pipeline-understanding',
      title: 'Understanding Substreams Pipeline',
      description: 'Learn how data flows through a Substreams pipeline',
      task: 'Explore the pipeline by clicking on each node to understand its role.',
      questions: [
        {
          id: 'q1-1',
          text: 'Which component receives raw blockchain data?',
          options: ['Map Module', 'Store Module', 'Source Input', 'Sink']
        },
        {
          id: 'q1-2',
          text: 'What does the Map Transfers module do?',
          options: [
            'Stores data in a database', 
            'Extracts specific events from raw blocks', 
            'Maintains statistics',
            'Creates visualizations'
          ]
        },
        {
          id: 'q1-3',
          text: 'Why do we need a Store module?',
          options: [
            'To process raw blocks',
            'To connect to a database',
            'To maintain state across blocks',
            'To visualize data'
          ]
        }
      ],
      correctAnswers: {
        'q1-1': 'Source Input',
        'q1-2': 'Extracts specific events from raw blocks',
        'q1-3': 'To maintain state across blocks'
      }
    },
    {
      id: 'data-transformation',
      title: 'Data Transformation Flow',
      description: 'See how data is transformed at each step',
      task: 'Match the input and output data formats for each module.',
      questions: [
        {
          id: 'q2-1',
          text: 'What type of data comes out of the Map Transfers module?',
          options: [
            'Raw Solana blocks', 
            'Token transfer events', 
            'Wallet statistics',
            'SQL database records'
          ]
        },
        {
          id: 'q2-2',
          text: 'What information can the Token Stats Store track?',
          options: [
            'Smart contract code', 
            'User interface elements', 
            'Transfer counts and volumes',
            'Block validator information'
          ]
        },
        {
          id: 'q2-3',
          text: 'Which module is responsible for sending data to external systems?',
          options: [
            'Source', 
            'Map', 
            'Store',
            'Sink'
          ]
        }
      ],
      correctAnswers: {
        'q2-1': 'Token transfer events',
        'q2-2': 'Transfer counts and volumes',
        'q2-3': 'Sink'
      }
    },
    {
      id: 'module-configuration',
      title: 'Configuring Substreams Modules',
      description: 'Learn how to configure different types of modules',
      task: 'Select the appropriate configuration options for each module type.',
      questions: [
        {
          id: 'q3-1',
          text: 'What YAML configuration specifies the input for a map module?',
          options: [
            'output: type', 
            'inputs: source', 
            'kind: map',
            'module: map'
          ]
        },
        {
          id: 'q3-2',
          text: 'How does a Store module specify what it stores?',
          options: [
            'Through its output type', 
            'By its input connections', 
            'With database schema',
            'Using key-value pairs in code'
          ]
        },
        {
          id: 'q3-3',
          text: 'What do you need to configure to stream data to PostgreSQL?',
          options: [
            'HTML template', 
            'GraphQL schema', 
            'SQL table schema',
            'Python script'
          ]
        }
      ],
      correctAnswers: {
        'q3-1': 'inputs: source',
        'q3-2': 'Using key-value pairs in code',
        'q3-3': 'SQL table schema'
      }
    }
  ];

  // Helper function to get appropriate colors for node types
  const getNodeColor = (type: string, isSelected: boolean = false) => {
    const baseColors = {
      source: 'bg-blue-500',
      map: 'bg-emerald-500',
      store: 'bg-purple-500',
      sink: 'bg-amber-500'
    };
    
    const hoverColors = {
      source: 'bg-blue-600',
      map: 'bg-emerald-600',
      store: 'bg-purple-600',
      sink: 'bg-amber-600'
    };
    
    return isSelected ? hoverColors[type as keyof typeof hoverColors] : baseColors[type as keyof typeof baseColors];
  };

  // Get icon for node type
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'source':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        );
      case 'map':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      case 'store':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
          </svg>
        );
      case 'sink':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderPipeline = () => {
    return (
      <div className="mb-8 overflow-x-auto">
        <div className="min-w-[700px] p-4">
          {/* Pipeline visualization */}
          <div className="flex justify-between items-center relative my-6">
            {nodes.map((node, index) => (
              <div 
                key={node.id} 
                className={`flex-shrink-0 w-32 rounded-lg p-3 ${getNodeColor(node.type, selectedNodeId === node.id)} text-white cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg`}
                onClick={() => handleNodeClick(node.id)}
              >
                <div className="flex items-center justify-center mb-2">
                  <div className="mr-2">{getNodeIcon(node.type)}</div>
                  <div className="text-sm font-medium">{node.label}</div>
                </div>
                
                <div className="text-xs opacity-80 text-center">
                  {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                </div>
              </div>
            ))}
            
            {/* Connection lines */}
            <svg className="absolute top-1/2 left-0 w-full h-0 -z-10" style={{ height: '2px' }}>
              {connections.map((conn, i) => {
                const fromNode = nodes.findIndex(n => n.id === conn.from);
                const toNode = nodes.findIndex(n => n.id === conn.to);
                if (fromNode === -1 || toNode === -1) return null;
                
                const totalNodes = nodes.length;
                const startX = (fromNode + 0.5) * (100 / totalNodes);
                const endX = (toNode + 0.5) * (100 / totalNodes);
                
                return (
                  <line 
                    key={`${conn.from}-${conn.to}`}
                    x1={`${startX}%`} 
                    y1="50%" 
                    x2={`${endX}%`} 
                    y2="50%" 
                    stroke="white" 
                    strokeWidth="2"
                    strokeDasharray={selectedNodeId && (selectedNodeId === conn.from || selectedNodeId === conn.to) ? "none" : "4"}
                    opacity={selectedNodeId && (selectedNodeId === conn.from || selectedNodeId === conn.to) ? "1" : "0.4"}
                  />
                );
              })}
            </svg>
          </div>
          
          {/* Selected node details */}
          {selectedNodeId && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mt-4 mb-6">
              <h4 className="text-lg font-medium text-white mb-2">
                {nodes.find(n => n.id === selectedNodeId)?.label}
              </h4>
              <p className="text-sm text-gray-300 mb-4">
                {nodes.find(n => n.id === selectedNodeId)?.description}
              </p>
              
              {/* Data flow visualization */}
              <div className="grid grid-cols-2 gap-4 bg-gray-900 p-3 rounded-md">
                <div>
                  <h5 className="text-sm font-medium text-blue-400 mb-2">Input Data</h5>
                  {selectedNodeId === 'solana-block' ? (
                    <pre className="text-xs text-gray-400 bg-gray-950 p-2 rounded">
                      {`{
  "header": { "slot": 12345, ... },
  "transactions": [
    {
      "signatures": ["3xTZ..."],
      "message": { ... }
    },
    ...
  ]
}`}
                    </pre>
                  ) : selectedNodeId === 'transfers-mapper' ? (
                    <pre className="text-xs text-gray-400 bg-gray-950 p-2 rounded">
                      {`{
  "header": { "slot": 12345, ... },
  "transactions": [
    {
      "signatures": ["3xTZ..."],
      "message": { ... }
    },
    ...
  ]
}`}
                    </pre>
                  ) : selectedNodeId === 'token-stats' ? (
                    <pre className="text-xs text-gray-400 bg-gray-950 p-2 rounded">
                      {`{
  "transfers": [
    {
      "from": "DYw8j...",
      "to": "B42wY...",
      "amount": "1000000",
      "txn_id": "3xTZ..."
    },
    ...
  ]
}`}
                    </pre>
                  ) : selectedNodeId === 'wallet-mapper' ? (
                    <pre className="text-xs text-gray-400 bg-gray-950 p-2 rounded">
                      {`{
  // Store data
  "key": "total_transfers:from:DYw8j...",
  "value": 37
},
{
  "key": "total_volume:DYw8j...",
  "value": 2345678
},
...`}
                    </pre>
                  ) : selectedNodeId === 'postgres' ? (
                    <pre className="text-xs text-gray-400 bg-gray-950 p-2 rounded">
                      {`{
  "wallets": [
    {
      "address": "DYw8j...",
      "total_sent": 37,
      "total_received": 12,
      "volume_sent": 2345678
    },
    ...
  ]
}`}
                    </pre>
                  ) : null}
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-emerald-400 mb-2">Output Data</h5>
                  {selectedNodeId === 'solana-block' ? (
                    <div className="text-xs text-center text-gray-500 p-2">
                      Raw blockchain data has no output processing
                    </div>
                  ) : selectedNodeId === 'transfers-mapper' ? (
                    <pre className="text-xs text-gray-400 bg-gray-950 p-2 rounded">
                      {`{
  "transfers": [
    {
      "from": "DYw8j...",
      "to": "B42wY...",
      "amount": "1000000",
      "txn_id": "3xTZ..."
    },
    ...
  ]
}`}
                    </pre>
                  ) : selectedNodeId === 'token-stats' ? (
                    <pre className="text-xs text-gray-400 bg-gray-950 p-2 rounded">
                      {`{
  // Store data
  "key": "total_transfers:from:DYw8j...",
  "value": 37
},
{
  "key": "total_volume:DYw8j...",
  "value": 2345678
},
...`}
                    </pre>
                  ) : selectedNodeId === 'wallet-mapper' ? (
                    <pre className="text-xs text-gray-400 bg-gray-950 p-2 rounded">
                      {`{
  "wallets": [
    {
      "address": "DYw8j...",
      "total_sent": 37,
      "total_received": 12,
      "volume_sent": 2345678
    },
    ...
  ]
}`}
                    </pre>
                  ) : selectedNodeId === 'postgres' ? (
                    <div className="text-xs text-center text-gray-500 p-2">
                      Data is stored in PostgreSQL database
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExercise = (exercise: typeof exercises[0]) => {
    return (
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">{exercise.title}</h3>
        <p className="text-gray-300 mb-4">{exercise.description}</p>
        <div className="bg-gray-900/70 p-4 rounded-lg mb-6">
          <p className="text-emerald-400 font-medium mb-3">Task: {exercise.task}</p>
          
          <div className="space-y-6 mt-6">
            {exercise.questions.map(question => (
              <div key={question.id} className="bg-gray-800/70 p-4 rounded-lg">
                <p className="text-gray-200 mb-3">{question.text}</p>
                <div className="space-y-2">
                  {question.options.map((option, i) => (
                    <div
                      key={i}
                      onClick={() => handleAnswerSelect(question.id, option)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        userAnswers[question.id] === option
                          ? 'bg-emerald-900/40 border border-emerald-500/40'
                          : 'bg-gray-700/40 border border-gray-600/40 hover:bg-gray-700/70'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${
                          userAnswers[question.id] === option
                            ? 'bg-emerald-500'
                            : 'bg-gray-600'
                        }`}>
                          {userAnswers[question.id] === option && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-300">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => checkAnswers(exercise.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Check Answers
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Visual Substreams Explorer</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            In this quest, you'll visually explore how Substreams processes Solana blockchain data.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-emerald-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>What you'll learn:</strong> How data flows through a Substreams pipeline, from raw blockchain events to databases.
          </span>
        </p>
      </div>
      
      <div className="mb-8 bg-dark-card-secondary rounded-xl p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Substreams Data Pipeline Explorer</h3>
        <p className="text-gray-300 mb-6">
          Click on each component in the pipeline below to see how it processes Solana blockchain data.
        </p>
        
        {renderPipeline()}
        
        <div className="bg-gray-800/40 p-4 rounded-lg">
          <h4 className="text-emerald-400 font-medium flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            How It Works
          </h4>
          <p className="text-gray-300 text-sm">
            Substreams provide a powerful way to process blockchain data in real-time. The pipeline above shows how a Substreams package 
            captures Solana token transfers and stores analytics in a database.
          </p>
        </div>
      </div>
      
      {/* Exercise sections */}
      <div className="mb-6">
        <div className="flex mb-4 border-b border-gray-700">
          {exercises.map((exercise, index) => (
            <button
              key={exercise.id}
              onClick={() => setActiveStep(index)}
              className={`py-2 px-4 font-medium border-b-2 ${
                activeStep === index
                  ? 'text-emerald-400 border-emerald-400'
                  : completedSteps.includes(index)
                  ? 'text-green-500 border-transparent'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {index + 1}. {exercise.title}
              {completedSteps.includes(index) && (
                <span className="ml-2">✓</span>
              )}
            </button>
          ))}
        </div>
        
        {renderExercise(exercises[activeStep])}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Resources:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li><a href="https://docs.substreams.dev/concepts/visual-representation/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams Visual Representation</a></li>
          <li><a href="https://docs.substreams.dev/tutorials/modules-tutorial/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Substreams Modules Tutorial</a></li>
          <li><a href="https://docs.substreams.dev/tutorials/solana-account-changes/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Tracking Solana Account Changes</a></li>
        </ul>
      </div>
      
      <QuestCompletionPopup
        isOpen={showCompletionPopup}
        onClose={handlePopupClose}
        xpReward={xpReward}
        questTitle="Visual Substreams Explorer"
      />
    </div>
  );
}; 