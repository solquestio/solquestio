'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { XMarkIcon } from '@heroicons/react/24/solid';
import useWindowSize from '@/hooks/useWindowSize';

interface QuestCompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  xpReward?: number;
  questTitle: string;
}

const QuestCompletionPopup: React.FC<QuestCompletionPopupProps> = ({ 
  isOpen, 
  onClose, 
  xpReward = 0,
  questTitle 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showConfetti && <Confetti width={width} height={height} recycle={false} />}
          
          <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-sm w-full bg-gradient-to-b from-purple-900 to-indigo-900 rounded-xl p-6 shadow-2xl border border-purple-500/30 relative"
            >
              <button 
                onClick={onClose}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-4 bg-purple-600/20 rounded-full flex items-center justify-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h3 className="text-xl font-bold text-white mb-1">Quest Completed!</h3>
                <p className="text-gray-300 mb-4">{questTitle}</p>
                
                <div className="my-4">
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: 3, repeatType: "reverse" }}
                    className="text-yellow-400 font-bold text-3xl"
                  >
                    +{xpReward} XP
                  </motion.div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={onClose}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuestCompletionPopup; 