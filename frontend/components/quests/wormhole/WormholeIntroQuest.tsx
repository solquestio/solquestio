import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

interface WormholeIntroQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

const QUESTIONS = [
  {
    question: 'What is Wormhole?',
    options: [
      'A Solana wallet',
      'A cross-chain messaging protocol',
      'A DeFi lending platform',
      'A Solana NFT marketplace'
    ],
    answer: 1,
    image: '/wormhole-logo.svg',
  },
  {
    question: 'Which of the following is a primary use case for Wormhole?',
    options: [
      'Bridging tokens between blockchains',
      'Staking SOL',
      'Running validator nodes',
      'Minting NFTs only on Solana'
    ],
    answer: 0,
    image: '/chains.svg',
  },
  {
    question: 'Which chains does Wormhole connect?',
    options: [
      'Only Solana and Ethereum',
      'Solana, Ethereum, Polygon, BNB Chain, and more',
      'Only Solana',
      'Only EVM chains'
    ],
    answer: 1,
    image: '/multichain.svg',
  },
  {
    question: 'What is a "guardian" in Wormhole?',
    options: [
      'A validator node',
      'A decentralized entity that secures cross-chain messages',
      'A wallet provider',
      'A type of NFT'
    ],
    answer: 1,
    image: '/guardian.svg',
  },
];

const DidYouKnowCard = ({ fact }: { fact: string }) => (
  <div className="bg-gradient-to-r from-purple-700/80 to-blue-700/80 rounded-lg p-4 mb-6 shadow-lg flex items-center">
    <span className="text-3xl mr-4">💡</span>
    <span className="text-white text-lg font-medium">{fact}</span>
  </div>
);

const AnimatedBridgeDiagram = () => (
  <div className="flex flex-col items-center mb-8">
    {/* Placeholder for animated SVG or Lottie animation */}
    <img src="/bridge-animated.gif" alt="Bridge Animation" className="h-40 mb-2 rounded-lg shadow-lg bg-gradient-to-br from-purple-900/60 to-blue-900/60" />
    <div className="flex space-x-4 mt-2">
      <img src="/solana-logo.svg" alt="Solana" className="h-8" />
      <ArrowRightIcon className="h-8 w-8 text-purple-400 animate-pulse" />
      <img src="/ethereum-logo.svg" alt="Ethereum" className="h-8" />
      <ArrowRightIcon className="h-8 w-8 text-blue-400 animate-pulse" />
      <img src="/polygon-logo.svg" alt="Polygon" className="h-8" />
      <ArrowRightIcon className="h-8 w-8 text-pink-400 animate-pulse" />
      <img src="/bnb-logo.svg" alt="BNB Chain" className="h-8" />
    </div>
    <p className="text-gray-300 text-sm mt-2">Wormhole bridges assets and messages between major blockchains.</p>
  </div>
);

export const WormholeIntroQuest: React.FC<WormholeIntroQuestProps> = ({ onQuestComplete, xpReward = 250 }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOption = (idx: number) => setSelected(idx);

  const handleNext = () => {
    if (selected === QUESTIONS[current].answer) {
      setScore(score + 1);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      if (current < QUESTIONS.length - 1) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        setShowResult(true);
        setIsCompleted(true);
        setTimeout(() => onQuestComplete(), 1500);
      }
    }, 1200);
  };

  const progress = ((current + (showResult ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <div className="relative bg-gradient-to-br from-purple-900 to-blue-900 min-h-screen rounded-lg shadow-lg overflow-hidden">
      {/* Hero Section */}
      <div className="flex flex-col items-center py-10 px-4">
        <img src="/wormhole-logo.svg" className="h-16 mb-4 animate-bounce" alt="Wormhole Logo" />
        <h1 className="text-4xl font-extrabold text-white mb-2 text-center drop-shadow-lg">Welcome to Wormhole!</h1>
        <p className="text-lg text-blue-200 mb-4 text-center max-w-xl">
          Wormhole is the leading cross-chain messaging protocol, connecting Solana, Ethereum, Polygon, BNB Chain, and more. It enables seamless transfer of tokens, NFTs, and data across blockchains.
        </p>
      </div>
      {/* Animated Explainer */}
      <AnimatedBridgeDiagram />
      {/* Did You Know Card */}
      <DidYouKnowCard fact="Wormhole secures billions in cross-chain assets and powers some of the most popular dApps in the ecosystem!" />
      {/* Quiz Section */}
      <div className="max-w-xl mx-auto bg-dark-card/80 rounded-lg p-6 shadow-xl mt-6 mb-8">
        <div className="flex items-center mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Quiz: Test Your Wormhole Knowledge</h2>
          </div>
          <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden ml-4">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        {!showResult ? (
          <>
            <div className="mb-4 flex flex-col items-center">
              {QUESTIONS[current].image && (
                <img src={QUESTIONS[current].image} alt="Quiz Visual" className="h-20 mb-2 rounded-lg shadow-md" />
              )}
              <h3 className="text-lg font-semibold text-white mb-2 text-center">{QUESTIONS[current].question}</h3>
              <div className="space-y-2 w-full">
                {QUESTIONS[current].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOption(idx)}
                    className={`block w-full text-left px-4 py-2 rounded-lg border transition-colors duration-150 ${selected === idx ? 'bg-purple-700 border-purple-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-200'} hover:bg-purple-800`}
                    disabled={isCompleted || showFeedback}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleNext}
                disabled={selected === null || showFeedback}
                className="bg-solana-purple hover:bg-solana-purple-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-60"
              >
                {current < QUESTIONS.length - 1 ? 'Next' : 'Finish'}
              </button>
            </div>
            {showFeedback && (
              <div className="flex items-center justify-center mt-4">
                {isCorrect ? (
                  <span className="flex items-center text-green-400 font-bold text-lg animate-bounce">
                    <CheckCircleIcon className="h-6 w-6 mr-2" /> Correct!
                  </span>
                ) : (
                  <span className="flex items-center text-red-400 font-bold text-lg animate-shake">
                    <XCircleIcon className="h-6 w-6 mr-2" /> Incorrect
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center mt-6">
            <h4 className="text-2xl font-bold text-green-400 mb-2 animate-bounce">Quiz Complete!</h4>
            <p className="text-gray-200 mb-2 text-lg">You scored {score} out of {QUESTIONS.length}.</p>
            <p className="text-green-300 font-semibold text-lg mb-4">+{xpReward} XP</p>
            <a
              href="https://wormhole.com/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors mb-2"
            >
              Learn More About Wormhole
            </a>
            <div>
              <button
                onClick={onQuestComplete}
                className="inline-block bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors mt-2"
              >
                Next Quest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WormholeIntroQuest; 