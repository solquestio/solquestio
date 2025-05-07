'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: () => void;
  loading?: boolean;
  referralCode?: string;
  onReferralCodeChange?: (code: string) => void;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({ isOpen, onClose, onAuthenticate, loading, referralCode, onReferralCodeChange }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card border border-gray-700 p-6 md:p-8 rounded-xl shadow-2xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-semibold text-white mb-4">Connect to SolQuest</h2>
        <p className="text-gray-300 mb-6 text-sm">
          To track your progress, earn XP, and unlock the full learning experience, please connect your Solana wallet and sign in.
        </p>
        
        {onReferralCodeChange && (
            <div className="mb-6">
                <label htmlFor="referralCodeInput" className="block text-xs font-medium text-gray-400 mb-1">
                    Have a Referral Code? (Optional)
                </label>
                <input 
                    type="text"
                    id="referralCodeInput"
                    name="referralCode"
                    value={referralCode || ''}
                    onChange={(e) => onReferralCodeChange(e.target.value)}
                    placeholder="Enter referral code"
                    className="w-full px-3 py-2 bg-dark-card-secondary border border-gray-600 rounded-md text-white placeholder-gray-500 focus:ring-solana-purple focus:border-solana-purple text-sm"
                    disabled={loading}
                />
            </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={onAuthenticate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-solana-purple to-solana-green text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-solana-purple focus:ring-offset-2 focus:ring-offset-dark-card"
          >
            {loading ? 'Processing...' : 'Connect Wallet & Sign In'}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-dark-card-secondary text-gray-300 font-medium py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-dark-card"
          >
            Maybe Later
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-6 text-center">
          Connecting your wallet is safe and only used to verify ownership for your SolQuest account.
        </p>
      </div>
    </div>
  );
}; 