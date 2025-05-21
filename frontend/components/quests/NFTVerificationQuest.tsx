import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowTopRightOnSquareIcon, ArrowPathIcon, LockClosedIcon } from '@heroicons/react/24/solid';
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
  const [totalSupply] = useState(10000);
  const [mintedCount, setMintedCount] = useState(0);
  const [remainingForUsers, setRemainingForUsers] = useState(5000);
  const [mintPrice] = useState(0.005);
  const [hasPromoCode, setHasPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showPromoCodeInput, setShowPromoCodeInput] = useState(false);

  // Mock fetch NFT data - in a real implementation this would call an API
  useEffect(() => {
    // Simulate API call to get mint status
    const fetchMintStatus = async () => {
      try {
        // In production, replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulated data - in production this would be real data from your NFT contract
        const randomMinted = Math.floor(Math.random() * 3500) + 1500; // Between 1500-5000
        setMintedCount(randomMinted);
        setRemainingForUsers(5000 - (randomMinted - 0)); // Assuming all minted so far are from user allocation
      } catch (error) {
        console.error("Error fetching mint status:", error);
      }
    };
    
    fetchMintStatus();
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
              
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-3 mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Total supply</span>
                  <span className="text-white font-bold">{totalSupply.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Minted so far</span>
                  <span className="text-white font-bold">{mintedCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-300">Available for users</span>
                  <span className="text-white font-bold">{remainingForUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Reserved for giveaways</span>
                  <span className="text-white font-bold">5,000</span>
                </div>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Price</span>
                  <div>
                    {hasPromoCode ? (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-500">{mintPrice} SOL</span>
                        <span className="text-green-400 font-bold">FREE</span>
                      </div>
                    ) : (
                      <span className="text-white font-bold">{mintPrice} SOL</span>
                    )}
                  </div>
                </div>
                
                {/* Promo code section */}
                <div className="mt-2">
                  <button 
                    onClick={handlePromoCodeToggle}
                    className="text-blue-400 hover:text-blue-300 text-xs flex items-center"
                  >
                    {showPromoCodeInput ? 'Hide promo code' : 'Have a promo code?'}
                  </button>
                  
                  {showPromoCodeInput && (
                    <div className="mt-2 flex items-center gap-2">
                      <input 
                        type="text" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter promo code"
                        className="bg-gray-900 border border-gray-700 text-white text-xs rounded-md px-2 py-1 flex-grow"
                      />
                      <button 
                        onClick={applyPromoCode}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded-md"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/claim-og-nft" 
                  target="_blank"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-1"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  Mint NFT {hasPromoCode && <span className="ml-1 text-xs bg-green-500 text-white px-1 rounded">FREE</span>}
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
              <li>Connect your wallet and pay {hasPromoCode ? 'nothing (free with promo code)' : `${mintPrice} SOL`}</li>
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
              <p>• Mint Price: {mintPrice} SOL (Free with promo codes for special communities)</p>
              <p>• Utility: Platform benefits, XP boosts, exclusive quests</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 