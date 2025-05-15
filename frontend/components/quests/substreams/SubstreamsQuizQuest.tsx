'use client';
import React, { useState } from 'react';
import QuestCompletionPopup from '@/components/common/QuestCompletionPopup';

interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface SubstreamsQuizQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const SubstreamsQuizQuest: React.FC<SubstreamsQuizQuestProps> = ({ onQuestComplete, xpReward }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  const quizQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      text: 'What is the primary purpose of Substreams?',
      options: [
        'To create new Solana accounts',
        'To process and transform blockchain data',
        'To validate transactions on the blockchain',
        'To create new tokens on Solana'
      ],
      correctAnswer: 'To process and transform blockchain data',
      explanation: 'Substreams provides a framework for processing and transforming blockchain data in a highly efficient manner, allowing developers to extract, aggregate, and analyze on-chain data.'
    },
    {
      id: 'q2',
      text: 'Which of these is a core component of a Substreams package?',
      options: [
        'User interface templates',
        'Map and Store modules',
        'Payment processor',
        'Token minting code'
      ],
      correctAnswer: 'Map and Store modules',
      explanation: 'Map modules transform data from the blockchain or other modules, while Store modules maintain state across blocks, forming the core components of a Substreams package.'
    },
    {
      id: 'q3',
      text: 'What programming language are Substreams modules typically written in?',
      options: [
        'JavaScript',
        'Python',
        'Rust',
        'Solidity'
      ],
      correctAnswer: 'Rust',
      explanation: 'Substreams modules are primarily written in Rust, which provides high performance and memory safety needed for reliable data processing.'
    },
    {
      id: 'q4',
      text: 'What does a Map module do in a Substreams package?',
      options: [
        'Creates a visual map of blockchain data',
        'Maps users to their wallets',
        'Transforms blockchain data into a new format',
        'Provides geographic mapping services'
      ],
      correctAnswer: 'Transforms blockchain data into a new format',
      explanation: 'Map modules extract, filter, and transform blockchain data or data from other modules, outputting it in a new format suitable for further processing or storage.'
    },
    {
      id: 'q5',
      text: 'What is a key benefit of using Store modules?',
      options: [
        'They provide a free database service',
        'They help store user passwords securely',
        'They can maintain state across blocks',
        'They create an app store for blockchain apps'
      ],
      correctAnswer: 'They can maintain state across blocks',
      explanation: 'Store modules allow Substreams to maintain state (like counters, aggregations, etc.) across different blocks, enabling stateful data processing.'
    },
    {
      id: 'q6',
      text: 'How does Substreams handle parallel processing?',
      options: [
        'It can process different data streams in parallel',
        'It does not support parallel processing',
        'It only allows parallel processing for paid users',
        'It requires manual thread management'
      ],
      correctAnswer: 'It can process different data streams in parallel',
      explanation: 'Substreams is designed for high throughput and enables parallel processing of data streams, making it much faster than traditional indexing solutions.'
    },
    {
      id: 'q7',
      text: 'What format is used to define a Substreams package configuration?',
      options: [
        'JSON',
        'YAML',
        'XML',
        'HTML'
      ],
      correctAnswer: 'YAML',
      explanation: 'Substreams packages are configured using YAML files that define modules, their inputs, outputs, and other package metadata.'
    },
    {
      id: 'q8',
      text: 'What is a sink in the context of Substreams?',
      options: [
        'A module that discards unwanted data',
        'A bathroom fixture needed for development',
        'A destination system that receives processed data',
        'A debugging tool for finding memory leaks'
      ],
      correctAnswer: 'A destination system that receives processed data',
      explanation: 'A sink is a destination system (like a database, message queue, or API) that receives the processed data output from a Substreams package.'
    },
    {
      id: 'q9',
      text: 'Which of these would be a good use case for Substreams?',
      options: [
        'Creating a new blockchain',
        'Mining cryptocurrency',
        'Building a real-time token transfer dashboard',
        'Securing web3 wallets'
      ],
      correctAnswer: 'Building a real-time token transfer dashboard',
      explanation: 'Substreams excels at processing blockchain data for analytics and dashboards, making it perfect for creating real-time visualizations of on-chain activity like token transfers.'
    },
    {
      id: 'q10',
      text: 'How are Substreams packages deployed?',
      options: [
        'As .spkg files to a Substreams endpoint',
        'As JavaScript libraries on NPM',
        'As mobile apps on app stores',
        'As smart contracts on the blockchain'
      ],
      correctAnswer: 'As .spkg files to a Substreams endpoint',
      explanation: 'Substreams packages are compiled into .spkg files that contain all the necessary code and configuration, then deployed to Substreams-compatible endpoints.'
    }
  ];

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
    } else {
      setShowResults(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowFeedback(false);
    }
  };

  const handleCheckAnswer = () => {
    setShowFeedback(true);
  };

  const handleFinishQuiz = () => {
    setShowCompletionPopup(true);
  };

  const handleClosePopup = () => {
    setShowCompletionPopup(false);
    onQuestComplete();
  };

  const calculateScore = () => {
    let correctCount = 0;
    quizQuestions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });
    return {
      score: correctCount,
      total: quizQuestions.length,
      percentage: Math.round((correctCount / quizQuestions.length) * 100)
    };
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const isAnswerSelected = currentQuestion && selectedAnswers[currentQuestion.id];
  const isAnswerCorrect = currentQuestion && selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer;
  const scoreData = calculateScore();

  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold text-white mb-1">Substreams Concepts Quiz</h3>
      {xpReward !== undefined && (
        <p className="text-sm font-semibold text-yellow-400 mb-4">
          +{xpReward} XP
        </p>
      )}
      
      <div className="text-gray-400 mb-8">
        <p>Test your knowledge of Substreams concepts with this quiz. Answer at least 7 out of 10 questions correctly to complete the quest.</p>
      </div>

      {!showResults ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
          {/* Progress bar */}
          <div className="w-full bg-gray-700 h-2">
            <div 
              className="bg-emerald-500 h-2 transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-medium text-gray-400">Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
              {selectedAnswers[currentQuestion.id] && !showFeedback && (
                <button 
                  onClick={handleCheckAnswer}
                  className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Check Answer
                </button>
              )}
            </div>
            
            <h4 className="text-xl font-medium text-white mb-6">{currentQuestion.text}</h4>
            
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index}
                  onClick={() => !showFeedback && handleAnswerSelect(currentQuestion.id, option)}
                  className={`p-4 rounded-lg cursor-pointer border transition-all ${
                    selectedAnswers[currentQuestion.id] === option
                      ? showFeedback
                        ? option === currentQuestion.correctAnswer
                          ? 'bg-green-900/30 border-green-500/50'
                          : 'bg-red-900/30 border-red-500/50'
                        : 'bg-blue-900/30 border-blue-500/50'
                      : 'bg-gray-700/50 border-gray-600/50 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                      selectedAnswers[currentQuestion.id] === option
                        ? showFeedback
                          ? option === currentQuestion.correctAnswer
                            ? 'bg-green-500'
                            : 'bg-red-500'
                          : 'bg-blue-500'
                        : 'bg-gray-600'
                    }`}>
                      {selectedAnswers[currentQuestion.id] === option && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-200">{option}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {showFeedback && (
              <div className={`p-4 rounded-lg mb-6 ${
                isAnswerCorrect ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'
              }`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {isAnswerCorrect ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isAnswerCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isAnswerCorrect ? 'Correct!' : 'Incorrect'}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded text-sm ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                Previous
              </button>
              
              <button
                onClick={handleNextQuestion}
                disabled={!isAnswerSelected}
                className={`px-4 py-2 rounded text-sm ${
                  !isAnswerSelected
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">Quiz Results</h3>
          
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-700 stroke-current"
                  strokeWidth="10"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                ></circle>
                <circle
                  className={`${scoreData.percentage >= 70 ? 'text-green-500' : 'text-amber-500'} stroke-current`}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${scoreData.percentage * 2.51} 251`}
                  strokeDashoffset="0"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  transform="rotate(-90 50 50)"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{scoreData.percentage}%</span>
                <span className="text-sm text-gray-400">{scoreData.score}/{scoreData.total}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mb-6">
            {scoreData.percentage >= 70 ? (
              <div>
                <h4 className="text-xl font-medium text-green-400 mb-2">Well Done!</h4>
                <p className="text-gray-300">
                  You've demonstrated a good understanding of Substreams concepts. 
                  You're ready to move on to the next quest!
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-xl font-medium text-amber-400 mb-2">Almost There!</h4>
                <p className="text-gray-300">
                  You need to get at least 70% correct to complete this quest. 
                  Review the feedback and try again!
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-3 mb-8">
            {quizQuestions.map((question, index) => (
              <div key={question.id} className="flex items-start">
                <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 ${
                  selectedAnswers[question.id] === question.correctAnswer 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}>
                  {selectedAnswers[question.id] === question.correctAnswer ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">Q{index + 1}:</span> {question.text}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedAnswers[question.id] !== question.correctAnswer && (
                      <>
                        <span className="text-red-400">Your answer: </span> 
                        {selectedAnswers[question.id] || 'Not answered'}<br />
                      </>
                    )}
                    <span className="text-green-400">Correct answer: </span>
                    {question.correctAnswer}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center">
            {scoreData.percentage >= 70 ? (
              <button 
                onClick={handleFinishQuiz}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Complete Quest
              </button>
            ) : (
              <button 
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setShowFeedback(false);
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}
      
      <QuestCompletionPopup
        isOpen={showCompletionPopup}
        onClose={handleClosePopup}
        xpReward={xpReward}
        questTitle="Substreams Concepts Quiz"
      />
    </div>
  );
}; 