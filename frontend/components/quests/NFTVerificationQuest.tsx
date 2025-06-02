import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowTopRightOnSquareIcon, ArrowPathIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.solquest.io';

interface NFTVerificationQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
  title?: string;
  questId?: string;
}

interface NFTStats {
  totalMinted: number;
  maxSupply: number;
  remaining: number;
  mintPrice: number;
  mintType: string;
}

export const NFTVerificationQuest: React.FC<NFTVerificationQuestProps> = ({ 
  onQuestComplete, 
  xpReward = 300, 
  title = 'Mint and Verify SolQuest OG NFT',
  questId = 'verify-og-nft'
}) => {
  const { publicKey, connected } = useWallet();
  const [hasNFT, setHasNFT] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [nftStats, setNftStats] = useState<NFTStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [hasPromoCode, setHasPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showPromoCodeInput, setShowPromoCodeInput] = useState(false);
  const [twitterFollowed, setTwitterFollowed] = useState(false);

  // Fetch real NFT data from backend
  useEffect(() => {
    const fetchNFTStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await fetch(`${BACKEND_URL}/api/og-nft?action=stats`);
        const data = await response.json();
        
        if (data) {
          setNftStats(data);
        }
      } catch (error) {
        console.error("Error fetching NFT stats:", error);
        // Fallback to default values if API fails
        setNftStats({
          totalMinted: 0,
          maxSupply: 10000,
          remaining: 10000,
          mintPrice: 0,
          mintType: 'Community Free Mint'
        });
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchNFTStats();
  }, []);

  // Mock verification for demo - will need to be replaced with actual NFT verification
  const verifyNFTOwnership = async () => {
    if (!connected || !publicKey) return;

    setIsVerifying(true);
    setVerificationError(null);

    try {
      // This would actually call your backend to verify NFT ownership using Metaplex or another method
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, let's succeed if they have followed Twitter
      if (twitterFollowed) {
        setHasNFT(true);
        setIsVerified(true);
        onQuestComplete();
        
        // Dispatch custom event to trigger profile update for XP
        window.dispatchEvent(new CustomEvent('quest-completed', { 
          detail: { 
            questId: questId, 
            xpAmount: xpReward 
          } 
        }));
        
        return;
      }
      
      // Otherwise, show an appropriate message
      setHasNFT(false);
      setIsVerified(false);
      setVerificationError("The SolQuest OG NFT collection has not been created yet. Please follow @SolQuestio on Twitter to receive points for this quest.");
    } catch (error) {
      console.error("NFT verification error:", error);
      setVerificationError("Failed to verify NFT ownership. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePromoCodeToggle = () => {
    setShowPromoCodeInput(!showPromoCodeInput);
  };

  const applyPromoCode = () => {
    // In production, this would validate against a real API
    // For demo, we'll accept any code with "SOLQUEST" in it
    if (promoCode.includes("SOLQUEST")) {
      setHasPromoCode(true);
      setVerificationError(null);
    } else {
      setVerificationError("Invalid promo code. Please try again.");
    }
  };

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
              This limited edition collection has only 10,000 NFTs, with special benefits in the SolQuest ecosystem.
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              <div className="bg-blue-900/40 px-3 py-2 rounded-lg flex-grow">
                <p className="text-gray-300">
                  <span className="font-bold text-yellow-400">SolQuest OG NFT Benefits:</span>
                  <ul className="list-disc list-inside mt-2 text-gray-300">
                    <li>+10% XP boost on all quests</li>
                    <li>Access to exclusive quests and events</li>
                    <li>Early access to new features</li>
                    <li>Limited edition collectible (only 10,000 available)</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="rounded-lg overflow-hidden flex-shrink-0 w-full md:w-48 h-48 relative">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover rounded-lg"
              >
                <source src="/OGNFT.mp4" type="video/mp4" />
                {/* Fallback for browsers that don't support video */}
                <div className="w-full h-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold mb-2">OG</div>
                    <div className="text-sm">SolQuest NFT</div>
                  </div>
                </div>
              </video>
            </div>
            
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-white mb-2">SolQuest OG NFT</h3>
              <p className="text-gray-300 mb-3">Mint your exclusive OG NFT to receive permanent benefits.</p>
              
              {isLoadingStats ? (
                <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-3 mb-3">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ) : nftStats ? (
                <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-3 mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Total supply</span>
                    <span className="text-white font-bold">{nftStats.maxSupply.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Minted so far</span>
                    <span className="text-white font-bold">{nftStats.totalMinted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Available for users</span>
                    <span className="text-white font-bold">{nftStats.remaining.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Distribution model</span>
                    <span className="text-white font-bold">{nftStats.mintType}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 mb-3">
                  <p className="text-red-400 text-sm">Failed to load NFT statistics</p>
                </div>
              )}
              
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Price</span>
                  <div>
                    <span className="text-green-400 font-bold">FREE</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-300">Requirements</span>
                  <a 
                    href="https://x.com/SolQuestio" 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center text-blue-400 hover:text-blue-300 text-sm"
                    onClick={() => setTwitterFollowed(true)}
                  >
                    Follow on X (Twitter)
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                  </a>
                </div>
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
              <li>Follow <a href="https://x.com/SolQuestio" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@SolQuestio on X (Twitter)</a></li>
              <li>Click the "Mint NFT" button to go to the minting page</li>
              <li>Connect your wallet to mint for FREE</li>
              <li>Confirm the transaction in your wallet</li>
              <li>Return to this page and click "Verify Ownership"</li>
              <li>Once verified, you'll receive {xpReward} XP</li>
            </ol>
          </div>

          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
            <h3 className="font-medium text-white mb-2 flex items-center">
              <LockClosedIcon className="w-4 h-4 mr-1.5 text-slate-400" />
              NFT Collection Details:
            </h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>• Collection Name: SolQuest OG NFTs</p>
              <p>• Network: Solana</p>
              <p>• Total Supply: 10,000</p>
              <p>• Allocation: 5,000 for community mints, 5,000 for giveaways</p>
              <p>• Mint Price: FREE</p>
              <p>• Requirements: Follow <a href="https://x.com/SolQuestio" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@SolQuestio on X</a></p>
              <p>• Utility: Platform benefits, XP boosts, exclusive quests</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 