'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useAuth } from '@/context/AuthContext';
import { CheckCircleIcon, SparklesIcon, ArrowPathIcon, TrophyIcon } from '@heroicons/react/24/solid';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const MINT_COST_SOL = 0.001; // 0.001 SOL for minting

interface PathCompletionData {
  pathId: string;
  isCompleted: boolean;
  requiredQuests: string[];
  completedCount: number;
  totalCount: number;
  canMintNft: boolean;
  hasEligibleNft: boolean;
  hasMintedNft: boolean;
}

interface PathCompletionNftQuestProps {
  pathId: string;
  pathName: string;
  onQuestComplete: () => void;
  xpReward?: number;
  title?: string;
}

export default function PathCompletionNftQuest({ 
  pathId, 
  pathName, 
  onQuestComplete,
  xpReward = 500, // Default to 500 XP for Solana Explorer Path
  title = "Mint Path Completion NFT"
}: PathCompletionNftQuestProps) {
  const { authToken } = useAuth();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [completionData, setCompletionData] = useState<PathCompletionData>({
    pathId,
    isCompleted: false,
    requiredQuests: [],
    completedCount: 0,
    totalCount: 0,
    canMintNft: false,
    hasEligibleNft: false,
    hasMintedNft: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [isQuestComplete, setIsQuestComplete] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number>(0);

  // Set the correct XP reward based on path
  const totalPathXp = pathId === 'solana-foundations' ? 500 : pathId === 'substreams-path' ? 2150 : xpReward;

  // Fetch path completion status
  useEffect(() => {
    const fetchCompletionStatus = async () => {
      if (!authToken) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/paths/${pathId}/completion`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch completion status');
        }
        
        const data = await response.json();
        setCompletionData(data);
        
        // Check if NFT is already minted (quest is complete)
        if (data.hasMintedNft) {
          setIsQuestComplete(true);
        }
      } catch (error) {
        console.error('Error fetching completion status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletionStatus();
  }, [authToken, pathId]);

  // Handle NFT minting
  const handleMintNft = async () => {
    if (!publicKey || !sendTransaction || !completionData?.canMintNft) return;
    
    setIsMinting(true);
    setMintError(null);
    
    try {
      // Create a simple payment transaction (0.001 SOL to a treasury wallet)
      // In production, this would go to your treasury wallet
      const treasuryWallet = new PublicKey('11111111111111111111111111111111'); // Placeholder
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryWallet,
          lamports: MINT_COST_SOL * LAMPORTS_PER_SOL,
        })
      );
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Call backend to mint NFT
      const response = await fetch(`${BACKEND_URL}/api/paths/${pathId}/mint-nft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          transactionSignature: signature
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mint NFT');
      }
      
      const mintData = await response.json();
      
      // Mark quest as complete
      setIsQuestComplete(true);
      setCompletionData(prev => ({
        ...prev,
        canMintNft: false,
        hasMintedNft: true
      }));
      
      // Call the quest completion callback
      onQuestComplete();
      
      setXpAwarded(totalPathXp);
      setShowSuccessAnimation(true);
      
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      setMintError(error.message || 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-dark-card rounded-xl p-6 border border-white/10">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!completionData) {
    return (
      <div className="bg-dark-card rounded-xl p-6 border border-white/10">
        <div className="text-center text-gray-400">
          <p>Unable to load completion status. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-xl p-6 border border-white/10">
      {/* Success Animation */}
      {showSuccessAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-blue-500/30 flex items-center justify-center z-50 animate-pulse">
          <div className="bg-gray-900/90 rounded-2xl p-8 flex flex-col items-center shadow-2xl transform animate-bounce-small">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Path Completed!</h3>
            <p className="text-xl font-semibold text-green-400">+{xpAwarded} XP Earned!</p>
            <p className="text-sm text-gray-300 mt-2">Certificate NFT Minted Successfully</p>
          </div>
        </div>
      )}

      {/* Quest Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center">
          <TrophyIcon className="h-7 w-7 text-yellow-500 mr-3" />
          <h2 className="text-2xl font-bold text-yellow-300">{title}</h2>
        </div>
        <div className="bg-yellow-900/40 px-4 py-2 rounded-full border border-yellow-500/50 text-yellow-300 font-semibold flex items-center">
          <span className="text-yellow-400 mr-1">+{totalPathXp}</span> XP
          <span className="text-xs ml-1 text-yellow-400/70">(Total Path Reward)</span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6 relative z-10">
        <p className="text-gray-300 text-sm leading-relaxed">
          Complete your learning journey by minting your {pathName} completion certificate NFT. 
          <span className="text-yellow-400 font-medium"> You'll receive all {totalPathXp} XP for completing this entire learning path!</span>
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Path Progress</span>
          <span className="text-sm text-gray-300">
            {completionData.completedCount}/{completionData.totalCount} quests
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(completionData.completedCount / completionData.totalCount) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="text-center">
        {isQuestComplete ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircleIcon className="w-6 h-6" />
              <span className="text-lg font-medium">Quest Complete!</span>
            </div>
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
              <p className="text-green-400 text-sm">
                🎉 You've successfully completed the {pathName} and minted your certificate NFT!
              </p>
              <p className="text-green-300 text-xs mt-2">
                +{totalPathXp} XP earned for completing this quest
              </p>
            </div>
          </div>
        ) : completionData.canMintNft ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircleIcon className="w-6 h-6" />
              <span className="text-lg font-medium">Ready to mint your certificate!</span>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-4">
              <p className="text-blue-300 text-sm">
                🏆 Congratulations! You've completed all quests in this path. 
                Mint your completion certificate NFT to prove your mastery.
              </p>
            </div>
            
            <button
              onClick={handleMintNft}
              disabled={isMinting}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-4 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isMinting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Minting Certificate NFT...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Mint Certificate NFT ({MINT_COST_SOL} SOL)
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-400">
              <p className="text-lg">Complete all quests to unlock NFT minting</p>
              <p className="text-sm mt-2">
                Progress: {completionData.completedCount} of {completionData.totalCount} quests completed
              </p>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">
                🔒 Complete the remaining quests in this path to unlock your certificate NFT.
              </p>
            </div>
          </div>
        )}
        
        {/* Success/Error Messages */}
        {mintError && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
            <p className="text-red-400 text-sm">{mintError}</p>
          </div>
        )}
      </div>
    </div>
  );
} 