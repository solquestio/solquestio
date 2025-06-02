'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useAuth } from '@/context/AuthContext';
import { CheckCircleIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.solquest.io';
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

interface PathCompletionNftProps {
  pathId: string;
  pathName: string;
  pathDescription: string;
  onNftMinted?: () => void;
}

export default function PathCompletionNft({ 
  pathId, 
  pathName, 
  pathDescription,
  onNftMinted 
}: PathCompletionNftProps) {
  const { authToken } = useAuth();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [completionData, setCompletionData] = useState<PathCompletionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState<string | null>(null);

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
    setMintSuccess(null);
    
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
      setMintSuccess(`NFT minted successfully! Transaction: ${signature}`);
      
      // Refresh completion data
      setCompletionData(prev => prev ? { ...prev, canMintNft: false, hasMintedNft: true } : null);
      
      // Call callback if provided
      if (onNftMinted) {
        onNftMinted();
      }
      
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
    return null;
  }

  return (
    <div className="bg-dark-card rounded-xl p-6 border border-white/10">
      <div className="flex items-start gap-4">
        {/* NFT Preview */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">
            {pathName} - Completion Certificate
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Mint your completion NFT to certify your mastery of this learning path.
          </p>
          
          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Progress</span>
              <span className="text-sm text-gray-300">
                {completionData.completedCount}/{completionData.totalCount} quests
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completionData.completedCount / completionData.totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Status and Actions */}
          {completionData.hasMintedNft ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">NFT Already Minted</span>
            </div>
          ) : completionData.canMintNft ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Ready to mint!</span>
              </div>
              
              <button
                onClick={handleMintNft}
                disabled={isMinting}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isMinting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Minting NFT...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    Mint Certificate NFT ({MINT_COST_SOL} SOL)
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-gray-400">
              <p className="text-sm">
                Complete all {completionData.totalCount} quests to unlock NFT minting.
              </p>
            </div>
          )}
          
          {/* Success/Error Messages */}
          {mintSuccess && (
            <div className="mt-3 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
              <p className="text-green-400 text-sm">{mintSuccess}</p>
            </div>
          )}
          
          {mintError && (
            <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
              <p className="text-red-400 text-sm">{mintError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 