import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowTopRightOnSquareIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';

interface NFTVerificationQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
  title?: string;
}

export const NFTVerificationQuest: React.FC<NFTVerificationQuestProps> = ({ 
  onQuestComplete, 
  xpReward = 300, 
  title = 'Mint and Verify SolQuest OG NFT' 
}) => {
  const { publicKey, connected } = useWallet();
  const [hasNFT, setHasNFT] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [remainingSupply, setRemainingSupply] = useState(5555);

  // Mock verification for demo
  const verifyNFTOwnership = async () => {
    if (!connected || !publicKey) return;

    setIsVerifying(true);
    setVerificationError(null);

    try {
      // This would actually call your backend to verify NFT ownership
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate verification success (70% chance)
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        setHasNFT(true);
        setIsVerified(true);
        onQuestComplete();
        
        // Dispatch custom event to trigger profile update for XP
        window.dispatchEvent(new CustomEvent('quest-completed', { 
          detail: { 
            questId: 'verify-og-nft', 
            xpAmount: xpReward 
          } 
        }));
      } else {
        setVerificationError("No SolQuest OG NFT found in this wallet. Please mint one first.");
      }
    } catch (error) {
      console.error("NFT verification error:", error);
      setVerificationError("Failed to verify NFT ownership. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Simulate checking remaining supply
  useEffect(() => {
    const randomRemaining = Math.floor(Math.random() * 3000) + 2000; // Between 2000-5000
    setRemainingSupply(randomRemaining);
  }, []);

  if (!connected || !publicKey) {
    return (
      <div className="p-6 bg-dark-card rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-white mb-4">SolQuest OG NFT</h2>
        <p className="text-gray-300 mb-6">Please connect your Solana wallet to begin this quest.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
      <p className="text-yellow-400 text-sm font-medium mb-4">+{xpReward} XP</p>
      
      {isVerified ? (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-green-300">
          <h3 className="font-bold text-lg mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Quest Complete!
          </h3>
          <p>You've successfully verified your SolQuest OG NFT.</p>
          <p className="mt-2">You've earned {xpReward} XP and can now proceed to the next quest.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
            <p className="text-gray-300 mb-3">
              In this quest, you'll mint one of our exclusive SolQuest OG NFTs and verify ownership.
              Only 5,555 of these NFTs will ever exist, giving you special benefits in the SolQuest ecosystem.
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              <div className="bg-blue-900/40 px-3 py-2 rounded-lg flex-grow">
                <p className="text-gray-300">
                  <span className="font-bold text-yellow-400">SolQuest OG NFT Benefits:</span>
                  <ul className="list-disc list-inside mt-2 text-gray-300">
                    <li>+10% XP boost on all quests</li>
                    <li>Access to exclusive quests and events</li>
                    <li>Early access to new features</li>
                    <li>Limited edition collectible (only 5,555 available)</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="rounded-lg overflow-hidden flex-shrink-0 w-full md:w-48 h-48 relative">
              <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'linear-gradient(45deg, rgba(76, 29, 149, 0.5), rgba(124, 58, 237, 0.5))' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Image 
                  src="/OGNFT.mp4" 
                  alt="SolQuest OG NFT" 
                  width={192} 
                  height={192}
                  className="object-cover"
                />
              </div>
            </div>
            
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-white mb-2">SolQuest OG NFT</h3>
              <p className="text-gray-300 mb-3">Mint your exclusive OG NFT to receive permanent benefits.</p>
              
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg px-3 py-2 mb-3 flex justify-between">
                <span className="text-gray-300">Remaining</span>
                <span className="text-white font-bold">{remainingSupply}/5555</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/claim-og-nft" 
                  target="_blank"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-1"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  Mint NFT
                </Link>
                
                <button
                  onClick={verifyNFTOwnership}
                  disabled={isVerifying}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Ownership
                    </>
                  )}
                </button>
              </div>
              
              {verificationError && (
                <p className="mt-3 text-red-400 text-sm">{verificationError}</p>
              )}
            </div>
          </div>
          
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
            <h3 className="font-medium text-white mb-2">How to complete this quest:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Click the "Mint NFT" button to go to the minting page</li>
              <li>Follow the instructions to mint your SolQuest OG NFT</li>
              <li>Return to this page and click "Verify Ownership"</li>
              <li>Once verified, you'll receive {xpReward} XP</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}; 