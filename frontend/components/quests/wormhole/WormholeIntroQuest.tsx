import React, { useState } from 'react';

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
    answer: 1
  },
  {
    question: 'Which of the following is a primary use case for Wormhole?',
    options: [
      'Bridging tokens between blockchains',
      'Staking SOL',
      'Running validator nodes',
      'Minting NFTs only on Solana'
    ],
    answer: 0
  }
];

export const WormholeIntroQuest: React.FC<WormholeIntroQuestProps> = ({ onQuestComplete, xpReward = 250 }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleOption = (idx: number) => setSelected(idx);

  const handleNext = () => {
    if (selected === QUESTIONS[current].answer) {
      setScore(score + 1);
    }
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setShowResult(true);
      setIsCompleted(true);
      setTimeout(() => onQuestComplete(), 1500);
    }
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">Introduction to Wormhole</h2>
      <p className="text-gray-300 mb-6">
        Wormhole is a leading cross-chain messaging protocol that enables interoperability between Solana and other blockchains. It allows users and developers to transfer tokens, NFTs, and arbitrary data across chains securely and efficiently.
      </p>
      <ul className="list-disc pl-6 mb-6 text-gray-400">
        <li>Connects Solana to Ethereum, BNB Chain, Polygon, and more</li>
        <li>Supports token bridges, NFT bridges, and generic message passing</li>
        <li>Secured by a decentralized network of guardians</li>
      </ul>
      {!showResult ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Quiz: {QUESTIONS[current].question}</h3>
          <div className="space-y-2">
            {QUESTIONS[current].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOption(idx)}
                className={`block w-full text-left px-4 py-2 rounded-lg border transition-colors duration-150 ${selected === idx ? 'bg-purple-700 border-purple-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-200'} hover:bg-purple-800`}
                disabled={isCompleted}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={selected === null}
            className="mt-4 bg-solana-purple hover:bg-solana-purple-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-60"
          >
            {current < QUESTIONS.length - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      ) : (
        <div className="text-center mt-6">
          <h4 className="text-xl font-bold text-green-400 mb-2">Quiz Complete!</h4>
          <p className="text-gray-200 mb-2">You scored {score} out of {QUESTIONS.length}.</p>
          <p className="text-green-300 font-semibold">+{xpReward} XP</p>
        </div>
      )}
    </div>
  );
};

export default WormholeIntroQuest; 