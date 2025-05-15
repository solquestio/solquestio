'use client';
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface PerformanceOptimizationQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const PerformanceOptimizationQuest: React.FC<PerformanceOptimizationQuestProps> = ({ 
  onQuestComplete, 
  xpReward 
}) => {
  const { publicKey } = useWallet();
  
  const [activeTab, setActiveTab] = useState<string>('gas');
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answer
    });
  };

  const checkQuizAnswers = () => {
    const correctAnswers = {
      'q1': 'b', // Optimizing message size
      'q2': 'c', // Pre-computation of PDAs
      'q3': 'a', // Batching transactions
      'q4': 'b', // LayerZero Scan
      'q5': 'c', // Solana programming model
    };
    
    const allQuestionsAnswered = Object.keys(correctAnswers).every(q => quizAnswers[q]);
    
    if (!allQuestionsAnswered) {
      setStatus('Error: Please answer all questions before submitting.');
      return;
    }
    
    let score = 0;
    for (const [q, a] of Object.entries(correctAnswers)) {
      if (quizAnswers[q] === a) {
        score++;
      }
    }
    
    const passingScore = 4; // 4 out of 5 correct to pass
    const passed = score >= passingScore;
    
    setStatus(`You scored ${score} out of ${Object.keys(correctAnswers).length}. ${passed ? 'Great job!' : 'Try again!'}`);
    setShowResults(true);
    
    if (passed) {
      setIsQuizCompleted(true);
      // Don't auto-complete the quest yet - we'll require the user to confirm they've reviewed all sections
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setShowResults(false);
    setStatus('');
  };

  const handleCompleteQuest = () => {
    if (!isQuizCompleted) {
      setStatus('Error: Please complete the optimization quiz first.');
      return;
    }
    
    setIsLoading(true);
    setStatus('Finalizing quest completion...');
    
    // Simulate completion process
    setTimeout(() => {
      setIsLoading(false);
      setIsCompleted(true);
      setStatus('Quest completed successfully!');
      onQuestComplete();
    }, 1000);
  };

  // Quiz questions
  const quizQuestions = [
    {
      id: 'q1',
      question: 'What is the most effective way to reduce costs when sending LayerZero messages from Solana?',
      options: [
        { value: 'a', text: 'Always use the highest gas price to ensure delivery' },
        { value: 'b', text: 'Minimize the size of the message payload data' },
        { value: 'c', text: 'Send as many messages as possible in parallel' },
      ]
    },
    {
      id: 'q2',
      question: 'Which technique improves Solana OApp performance when handling LayerZero messages?',
      options: [
        { value: 'a', text: 'Using more complex serialization formats' },
        { value: 'b', text: 'Storing all message history on-chain' },
        { value: 'c', text: 'Pre-computing PDAs and minimizing on-chain lookups' },
      ]
    },
    {
      id: 'q3',
      question: 'For optimizing transaction throughput in a Solana OApp, you should:',
      options: [
        { value: 'a', text: 'Batch related operations into single transactions where possible' },
        { value: 'b', text: 'Create a new transaction for each operation' },
        { value: 'c', text: 'Always process messages sequentially' },
      ]
    },
    {
      id: 'q4',
      question: 'Which tool is best for monitoring cross-chain message performance with LayerZero?',
      options: [
        { value: 'a', text: 'Solana Explorer only' },
        { value: 'b', text: 'LayerZero Scan' },
        { value: 'c', text: 'Console logging on your local server' },
      ]
    },
    {
      id: 'q5',
      question: 'When designing omnichain applications on Solana, which factor most impacts performance?',
      options: [
        { value: 'a', text: 'Using the newest version of JavaScript' },
        { value: 'b', text: 'The number of active validators' },
        { value: 'c', text: "Understanding Solana's parallel execution model" },
      ]
    }
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'gas':
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Gas & Fee Optimization</h4>
            
            <div className="space-y-3 text-gray-300">
              <p>
                LayerZero V2 introduces significant improvements in gas efficiency compared to V1, but optimization 
                is still crucial for production applications. Here are key strategies:
              </p>
              
              <div className="bg-gray-800 p-3 rounded-md mt-2">
                <h5 className="text-blue-400 font-medium mb-2">1. Message Payload Optimization</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Minimize payload size: Each byte adds to gas costs on both chains</li>
                  <li>Use efficient encoding (e.g., compressed formats when possible)</li>
                  <li>Consider hash-based proofs instead of sending full data when appropriate</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="text-blue-400 font-medium mb-2">2. Batching Strategies</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Batch multiple messages into a single larger message when possible</li>
                  <li>For Solana OApps, bundle multiple instructions in one transaction</li>
                  <li>Balance batching with message size (find the optimal point)</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="text-blue-400 font-medium mb-2">3. Gas Fee Management</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Implement dynamic fee adjustment based on network conditions</li>
                  <li>Use fee estimators before sending messages</li>
                  <li>Configure appropriate gas limits for your use case</li>
                </ul>
              </div>
              
              <div className="mt-4 text-sm text-yellow-400">
                <p className="font-semibold">Solana-Specific Consideration:</p>
                <p>
                  On Solana, transaction size directly impacts costs. Optimize your Solana program instructions to 
                  be as compact as possible, especially when sending messages via LayerZero V2.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'solana':
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Solana Optimizations</h4>
            
            <div className="space-y-3 text-gray-300">
              <p>
                Building efficient omnichain applications on Solana requires understanding its unique architecture 
                and optimizing specifically for its parallel execution model.
              </p>
              
              <div className="bg-gray-800 p-3 rounded-md mt-2">
                <h5 className="text-blue-400 font-medium mb-2">1. Account Structure Optimization</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Use multiple smaller accounts instead of one large account when dealing with parallelizable data</li>
                  <li>Carefully design PDA (Program Derived Address) seeds for deterministic derivation</li>
                  <li>Pre-compute account addresses to reduce on-chain computation</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="text-blue-400 font-medium mb-2">2. Instruction Optimization</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Design instructions to avoid overlapping account access when possible</li>
                  <li>Take advantage of Solana's SIMD (Single Instruction, Multiple Data) capabilities</li>
                  <li>Minimize serialization/deserialization overhead with efficient data structures</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="text-blue-400 font-medium mb-2">3. LayerZero Integration Best Practices</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Implement proper error handling with clear status codes for cross-chain operations</li>
                  <li>Use lazy-initialization patterns when possible to defer costs</li>
                  <li>Cache frequently accessed endpoint data in your program to reduce endpoint program calls</li>
                </ul>
              </div>
              
              <div className="mt-4 p-3 border border-dashed border-yellow-500/40 rounded-md bg-yellow-900/20">
                <p className="text-sm">
                  <span className="font-semibold text-yellow-400">Implementation Example:</span> When handling incoming messages 
                  from LayerZero, consider using a temporary memory space for intermediate calculations rather than 
                  storing all working data on-chain. This reduces account size and lowers transaction costs.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'crosschain':
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Cross-Chain Communication Patterns</h4>
            
            <div className="space-y-3 text-gray-300">
              <p>
                Efficient communication patterns between Solana and EVM chains via LayerZero can significantly 
                impact the performance and user experience of your omnichain application.
              </p>
              
              <div className="bg-gray-800 p-3 rounded-md mt-2">
                <h5 className="text-blue-400 font-medium mb-2">1. Message Flow Optimization</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Implement asynchronous request/response patterns across chains</li>
                  <li>Design for eventual consistency rather than immediate synchronization when possible</li>
                  <li>Use message acknowledgments for critical operations</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="text-blue-400 font-medium mb-2">2. State Management Strategies</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Use checkpointing mechanisms for long-running cross-chain processes</li>
                  <li>Implement retry mechanisms with idempotency guarantees</li>
                  <li>Consider separating frequently updated data from rarely updated data in cross-chain messaging</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="text-blue-400 font-medium mb-2">3. Architectural Patterns</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>Hub and Spoke:</strong> Use a primary chain as coordination hub with other chains as spokes</li>
                  <li><strong>Message Aggregation:</strong> Batch updates from multiple sources before propagating</li>
                  <li><strong>Event-Driven Architecture:</strong> Design around critical cross-chain events</li>
                </ul>
              </div>
              
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-md">
                <p className="text-sm">
                  <span className="font-semibold text-blue-400">V2 Advantage:</span> LayerZero V2's improved message delivery 
                  verification system allows for more efficient cross-chain interactions. When designing your protocol,
                  leverage these improvements to reduce the number of confirmation messages needed between chains.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'monitoring':
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Monitoring & Performance Analysis</h4>
            
            <div className="space-y-3 text-gray-300">
              <p>
                Effective monitoring is essential for identifying performance bottlenecks and ensuring reliable 
                operation of your omnichain application.
              </p>
              
              <div className="bg-gray-800 p-3 rounded-md mt-2">
                <h5 className="text-blue-400 font-medium mb-2">1. LayerZero Scan Integration</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Implement monitoring with <a href="https://layerzeroscan.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">LayerZero Scan</a> for all cross-chain messages</li>
                  <li>Track message status and delivery times across networks</li>
                  <li>Set up alerts for failed or delayed messages</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="text-blue-400 font-medium mb-2">2. Instrumentation Strategies</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Add performance measurement hooks at critical points in your application</li>
                  <li>Log resource usage patterns to identify optimization opportunities</li>
                  <li>Implement timing measurements for cross-chain operations</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 p-3 rounded-md">
                <h5 className="text-blue-400 font-medium mb-2">3. Performance Testing Framework</h5>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Develop testnet performance benchmarks for your application</li>
                  <li>Simulate high-load scenarios to identify potential bottlenecks</li>
                  <li>Test with a variety of network conditions to ensure robustness</li>
                </ul>
              </div>
              
              <div className="mt-4 flex items-center p-3 bg-purple-900/20 border border-purple-500/30 rounded-md text-sm">
                <div className="bg-purple-900/50 p-1.5 rounded mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-purple-300">
                    For hackathon success, document your performance optimization strategies and benchmark results in your submission. 
                    The judges will be looking for evidence of thoughtful performance considerations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">Optimization Knowledge Check</h4>
            
            <div className="bg-gray-800 p-4 rounded-md">
              <p className="text-gray-300 mb-4">
                Test your understanding of LayerZero V2 performance optimization concepts for Solana. 
                Answer all questions and achieve at least 4/5 correct to complete this section.
              </p>
              
              <div className="space-y-6">
                {quizQuestions.map(q => (
                  <div key={q.id} className={`p-3 rounded-md ${showResults && quizAnswers[q.id] ? 
                    (quizAnswers[q.id] === 
                     (q.id === 'q1' ? 'b' : 
                      q.id === 'q2' ? 'c' : 
                      q.id === 'q3' ? 'a' : 
                      q.id === 'q4' ? 'b' : 'c') ? 
                      'bg-green-900/30 border border-green-500/30' : 
                      'bg-red-900/30 border border-red-500/30') : 
                    'bg-gray-700/50'}`}
                  >
                    <p className="font-medium text-white mb-2">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map(option => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            id={`${q.id}-${option.value}`}
                            name={q.id}
                            value={option.value}
                            checked={quizAnswers[q.id] === option.value}
                            onChange={() => handleQuizAnswer(q.id, option.value)}
                            disabled={showResults}
                            className="h-4 w-4 text-solana-purple border-gray-600 bg-gray-800 focus:ring-solana-purple"
                          />
                          <label 
                            htmlFor={`${q.id}-${option.value}`} 
                            className={`ml-2 block ${
                              showResults && quizAnswers[q.id] === option.value && quizAnswers[q.id] === 
                              (q.id === 'q1' ? 'b' : 
                               q.id === 'q2' ? 'c' : 
                               q.id === 'q3' ? 'a' : 
                               q.id === 'q4' ? 'b' : 'c') ? 
                              'text-green-400' : 'text-gray-300'
                            }`}
                          >
                            {option.text}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex space-x-3">
                {!showResults ? (
                  <button
                    onClick={checkQuizAnswers}
                    className="bg-solana-purple text-white px-4 py-2 rounded-md hover:bg-solana-purple-dark transition-colors"
                  >
                    Submit Answers
                  </button>
                ) : !isQuizCompleted ? (
                  <button
                    onClick={resetQuiz}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                ) : (
                  <div className="p-3 bg-green-900/30 text-green-400 rounded-md">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Quiz Completed Successfully!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">Quest 8: Performance Optimization</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-6 space-y-3">
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            This quest focuses on optimizing LayerZero V2 applications on Solana for maximum performance and efficiency.
            Performance and scalability are key criteria for the hackathon judging.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>Learn:</strong> Explore different optimization techniques for gas efficiency, Solana-specific optimizations,
            cross-chain communication patterns, and monitoring strategies.
          </span>
        </p>
        <p className="flex items-start">
          <span className="flex-shrink-0 inline-block w-2 h-2 bg-green-400 rounded-full mr-3 mt-[6px]"></span>
          <span>
            <strong>Apply:</strong> Test your knowledge with a short quiz on optimization strategies. You'll need to review
            all sections and pass the quiz to complete this quest.
          </span>
        </p>
      </div>
      
      <div className="bg-dark-card-secondary rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-700 overflow-x-auto">
          <button
            onClick={() => handleTabChange('gas')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'gas' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Gas Optimization
          </button>
          <button
            onClick={() => handleTabChange('solana')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'solana' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Solana Optimizations
          </button>
          <button
            onClick={() => handleTabChange('crosschain')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'crosschain' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Communication Patterns
          </button>
          <button
            onClick={() => handleTabChange('monitoring')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'monitoring' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Monitoring
          </button>
          <button
            onClick={() => handleTabChange('quiz')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'quiz' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Knowledge Check
          </button>
        </div>
        
        <div className="p-6">
          {renderTab()}
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${activeTab === 'gas' ? 'bg-blue-500' : activeTab === 'quiz' && isQuizCompleted ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <div className={`h-3 w-3 rounded-full ${activeTab === 'solana' ? 'bg-blue-500' : activeTab === 'quiz' && isQuizCompleted ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <div className={`h-3 w-3 rounded-full ${activeTab === 'crosschain' ? 'bg-blue-500' : activeTab === 'quiz' && isQuizCompleted ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <div className={`h-3 w-3 rounded-full ${activeTab === 'monitoring' ? 'bg-blue-500' : activeTab === 'quiz' && isQuizCompleted ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <div className={`h-3 w-3 rounded-full ${activeTab === 'quiz' ? 'bg-blue-500' : isQuizCompleted ? 'bg-green-500' : 'bg-gray-600'}`}></div>
        </div>
        
        <button
          onClick={handleCompleteQuest}
          disabled={!isQuizCompleted || isLoading || isCompleted}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : isCompleted ? (
            'Quest Completed!'
          ) : (
            'Complete Quest'
          )}
        </button>
      </div>

      {status && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          status.startsWith('Error:') 
            ? 'bg-red-700/30 text-red-300' 
            : status.includes('successfully') || status.includes('Great job')
              ? 'bg-green-700/30 text-green-300'
              : 'bg-blue-700/30 text-blue-300'
        }`}>
          {status}
        </div>
      )}

      {isCompleted && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <h4 className="text-green-400 font-semibold mb-2">Quest Completed!</h4>
          <p className="text-gray-300 text-sm">
            Congratulations! You've learned essential performance optimization techniques for LayerZero V2 applications
            on Solana. Applying these strategies will help you build scalable, efficient omnichain applications
            and improve your hackathon submission's chances of success.
          </p>
        </div>
      )}
    </div>
  );
}; 