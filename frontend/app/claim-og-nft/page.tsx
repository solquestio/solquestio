'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.solquest.io';

interface NFTStats {
  totalMinted: number;
  remaining: number;
  maxSupply: number;
  mintPrice: number;
  mintType: string;
  limitPerWallet: number;
}

interface MintResult {
  success: boolean;
  message: string;
  nftData?: string;
  attributes?: any[];
  // Legacy format support
  nft?: {
    mintAddress: string;
    tokenId: number;
    metadataUri: string;
    recipient: string;
  };
  transactionSignature?: string;
  mintType?: string;
  totalClaimed?: number;
}

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        >
          {i % 3 === 0 ? '✨' : i % 3 === 1 ? '💎' : '🚀'}
        </div>
      ))}
    </div>
  );
};

// Animated counter component
const AnimatedCounter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export default function OGNFTClaim() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [stats, setStats] = useState<NFTStats | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState('');
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  
  // Small fee for transaction (covers network costs)
  const CLAIM_FEE_SOL = 0.001; // 0.001 SOL (~$0.02)

  // Load stats on component mount
  useEffect(() => {
    loadStats();
  }, []);

  // Check eligibility when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      checkEligibility();
    } else {
      setClaimed(false);
      setError('');
      setMintResult(null);
    }
  }, [connected, publicKey]);

  const loadStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/og-nft?action=stats`);
      
      if (!response.ok) {
        throw new Error('Backend not available');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Don't set fake stats - leave stats as null to show loading state
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!publicKey) return;
    
    try {
      console.log('Checking eligibility for wallet:', publicKey.toString());
      const response = await fetch(`${BACKEND_URL}/api/og-nft?action=eligibility&walletAddress=${publicKey.toString()}`);
      
      if (!response.ok) {
        console.warn('Backend not available or error:', response.status);
        // Don't assume anything - keep current state
        return;
      }
      
      const data = await response.json();
      console.log('Eligibility response:', data);
      
      if (!data.eligible) {
        console.log('Wallet not eligible:', data.reason);
        setClaimed(true);
        setError(data.reason || 'Already claimed');
        // Clear any previous mint result to show the "already claimed" state
        setMintResult(null);
      } else {
        console.log('Wallet is eligible');
        setClaimed(false);
        setError('');
        setMintResult(null);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      // On network error, don't change the current state
      // This prevents showing claim button when we can't verify eligibility
    }
  };

  const handleClaim = async () => {
    console.log('handleClaim: Starting claim process');
    
    if (!publicKey || !sendTransaction || claiming) {
      console.log('handleClaim: Early return - missing requirements', { publicKey: !!publicKey, sendTransaction: !!sendTransaction, claiming });
      return;
    }
    
    // Additional validation checks
    if (!connection) {
      console.log('handleClaim: No connection available');
      setError('Connection to Solana network not available. Please refresh the page.');
      return;
    }
    
    if (!connected) {
      console.log('handleClaim: Wallet not connected');
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }
    
    console.log('handleClaim: All validations passed, starting claim');
    setClaiming(true);
    setError('');
    
    try {
      // Step 1: Create and send transaction for claiming fee
      console.log('handleClaim: Creating claim transaction...');
      
      // Create a transaction with a small fee to SolQuest treasury
      // This ensures the user actually interacts with the blockchain
      const treasuryWallet = new PublicKey('8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM'); // SolQuest treasury
      console.log('handleClaim: Treasury wallet created');
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryWallet,
          lamports: CLAIM_FEE_SOL * LAMPORTS_PER_SOL,
        })
      );
      console.log('handleClaim: Transaction created');
      
      // Get recent blockhash
      console.log('handleClaim: Getting recent blockhash...');
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      console.log('handleClaim: Transaction configured with blockhash');
      
      console.log('handleClaim: Requesting transaction signature...');
      
      // Step 2: User signs the transaction
      const signature = await sendTransaction(transaction, connection);
      console.log('handleClaim: Transaction signed:', signature);
      
      console.log('handleClaim: Waiting for confirmation...');
      
      // Step 3: Wait for transaction confirmation
      console.log('handleClaim: Confirming transaction...');
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
      }, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
      console.log('handleClaim: Transaction confirmed successfully');
      
      console.log('handleClaim: Calling backend to mint NFT...');
      
      // Step 4: Call backend to mint NFT (now that payment is confirmed)
      const response = await fetch(`${BACKEND_URL}/api/og-nft?action=mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          transactionSignature: signature
        }),
      });

      console.log('handleClaim: Backend response received', response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('handleClaim: API Response:', data);

      // Handle both API response formats
      if (data.success === true || data.nft) {
        console.log('handleClaim: NFT claim successful');
        setClaimed(true);
        setMintResult(data);
        setShowConfetti(true);
        // Reload stats to show updated numbers
        try {
          console.log('handleClaim: Reloading stats...');
          await loadStats();
        } catch (statsError) {
          console.warn('handleClaim: Failed to reload stats:', statsError);
        }
        // Stay on the claim page - user can navigate manually if they want
        console.log('handleClaim: NFT claim completed successfully');
      } else {
        console.log('handleClaim: NFT claim failed', data);
        setError(data.error || data.message || 'Failed to claim NFT');
      }
    } catch (error: any) {
      console.error('handleClaim: Error during claim process:', error);
      if (error.message?.includes('User rejected')) {
        setError('Transaction was cancelled. Please try again if you want to claim your NFT.');
      } else if (error.message?.includes('insufficient funds')) {
        setError(`Insufficient SOL balance. You need at least ${CLAIM_FEE_SOL} SOL to claim your NFT.`);
      } else if (error.name === 'WalletSignTransactionError') {
        setError('Wallet transaction failed. Please make sure your wallet is unlocked and try again.');
      } else if (error.message?.includes('API Error')) {
        setError('Backend service unavailable. Please try again later.');
      } else {
        setError(`Transaction failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      console.log('handleClaim: Claim process finished');
      setClaiming(false);
    }
  };

  const progressPercentage = stats ? (stats.totalMinted / stats.maxSupply) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400 border-solid mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Loading your destiny...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/30 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
      </div>
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              🎉
              </div>
          ))}
              </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="animate-pulse mb-6">
              <div className="text-8xl mb-4">🏆</div>
              </div>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
              Claim Your
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                FREE SolQuest OG
              </span>
              <span className="block text-5xl md:text-6xl mt-2">NFT Collection</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-8 font-medium">
              🚀 <span className="text-yellow-400 font-bold">10% XP Boost</span> + 
              💰 <span className="text-green-400 font-bold">10% Bonus Rewards</span> + 
              👑 <span className="text-purple-400 font-bold">Exclusive Access</span>
            </p>
            <div className="animate-bounce">
              <p className="text-xl text-orange-400 font-bold">
                ⏰ LIMITED TIME • FIRST 10,000 ONLY
              </p>
            </div>
          </div>
          
          {/* NFT Preview Video Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-4">🎥 Preview Your NFT</h2>
                <p className="text-xl text-gray-300">See exactly what you'll get with the SolQuest OG NFT</p>
              </div>
              
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Video Preview */}
                <div className="flex-shrink-0">
                  <div className="w-80 h-80 rounded-2xl overflow-hidden border-4 border-purple-500/30 shadow-2xl shadow-purple-500/20">
                    <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src="/OGNFT.mp4" type="video/mp4" />
                      {/* Fallback for browsers that don't support video */}
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-6xl font-bold mb-4">OG</div>
                          <div className="text-2xl">SolQuest NFT</div>
                        </div>
                      </div>
                    </video>
                  </div>
                </div>
                
                {/* NFT Benefits */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: '⚡', title: '10% XP Boost', desc: 'Accelerate your learning journey' },
                      { icon: '💰', title: '10% SOL Bonus', desc: 'Extra rewards on leaderboard' },
                      { icon: '👑', title: 'VIP Access', desc: 'Exclusive Discord channels' },
                      { icon: '🗳️', title: 'Governance', desc: 'Vote on platform decisions' },
                      { icon: '🎯', title: 'Exclusive Quests', desc: 'OG-only challenges' },
                      { icon: '🔄', title: 'Tradeable', desc: 'List on Magic Eden' }
                    ].map((benefit, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-4 backdrop-blur border border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{benefit.icon}</span>
                          <div>
                            <h4 className="text-white font-bold">{benefit.title}</h4>
                            <p className="text-gray-400 text-sm">{benefit.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-400/30">
                    <h3 className="text-2xl font-bold text-white mb-3">🎨 Unique Features</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        Animated 3D design with particle effects
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        Limited to first 10,000 community members
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        Permanent utility and benefits
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        Verified on Magic Eden marketplace
                      </li>
                    </ul>
                  </div>
            </div>
          </div>
        </div>
      </div>
      
          {/* Live Stats - Enhanced */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-4">📊 Live Mint Progress</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                    <div className="text-4xl font-black text-green-400">
                      {stats ? <AnimatedCounter value={stats.totalMinted} /> : '---'}
                    </div>
                    <div className="text-gray-300 font-medium">Minted</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                    <div className="text-4xl font-black text-yellow-400">
                      {stats ? <AnimatedCounter value={stats.remaining} /> : '---'}
                    </div>
                    <div className="text-gray-300 font-medium">Remaining</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur">
                    <div className="text-4xl font-black text-purple-400">
                      {stats ? stats.maxSupply.toLocaleString() : '---'}
                    </div>
                    <div className="text-gray-300 font-medium">Total Supply</div>
                  </div>
                </div>
                
                {/* Enhanced Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-700/50 rounded-full h-6 backdrop-blur">
                    <div 
                      className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-6 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <span className="text-2xl font-bold text-white">
                      {stats ? `${progressPercentage.toFixed(2)}% Complete` : 'Loading...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Claim Section - Enhanced */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
              {!connected ? (
                <div className="text-center">
                  <div className="text-6xl mb-6 animate-bounce">🔗</div>
                  <h2 className="text-4xl font-bold text-white mb-8">
                    Step 1: Connect Your Solana Wallet
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Connect your wallet to claim your exclusive SolQuest OG NFT
                  </p>
                  <div className="transform hover:scale-105 transition-transform">
                    <WalletMultiButtonDynamic className="!bg-gradient-to-r !from-purple-600 !to-pink-600 !text-white !font-bold !py-6 !px-12 !rounded-2xl !text-xl hover:!from-purple-700 hover:!to-pink-700 !transition-all !shadow-2xl" />
                  </div>
                </div>
              ) : claimed ? (
                <div className="text-center">
                  {mintResult ? (
                    <>
                      <div className="text-8xl mb-8 animate-bounce">🎉</div>
                      <h2 className="text-5xl font-black text-green-400 mb-6">
                        SUCCESS! NFT CLAIMED
                      </h2>
                      <p className="text-2xl text-gray-300 mb-8">
                        Your SolQuest OG NFT has been successfully claimed!
                        {mintResult.nftData && (
                          <span className="block text-lg text-yellow-400 mt-2 font-mono">
                            Token: {mintResult.nftData}
                          </span>
                        )}
                        {mintResult.nft?.tokenId && (
                          <span className="block text-lg text-yellow-400 mt-2">
                            #{mintResult.nft.tokenId}
                          </span>
                        )}
                      </p>
                      
                      {/* NFT Details Card */}
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-8 mb-8 border border-green-400/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                          <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-green-400 mb-4">🎁 Your Benefits</h3>
                            <div className="space-y-3">
                              {[
                                { icon: '⚡', text: '10% XP boost on all quests' },
                                { icon: '💰', text: '10% bonus on leaderboard rewards' },
                                { icon: '💬', text: 'Exclusive Discord access' },
                                { icon: '🗳️', text: 'Governance voting rights' },
                                { icon: '🏆', text: 'Special profile badge' },
                                { icon: '🔄', text: 'Tradeable on Magic Eden' }
                              ].map((benefit, idx) => (
                                <div key={idx} className="flex items-center text-lg">
                                  <span className="text-2xl mr-3">{benefit.icon}</span>
                                  <span className="text-green-300">{benefit.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-blue-400 mb-4">🏷️ NFT Details</h3>
                            <div className="bg-gray-800/50 p-6 rounded-xl space-y-3">
                              {mintResult.nft?.tokenId && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Token ID:</span>
                                  <span className="text-white font-mono text-xl">#{mintResult.nft.tokenId}</span>
                                </div>
                              )}
                              {mintResult.nftData && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">NFT Data:</span>
                                  <span className="text-white font-mono text-sm">
                                    {mintResult.nftData}
                                  </span>
                                </div>
                              )}
                              {mintResult.nft?.mintAddress && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Mint Address:</span>
                                  <span className="text-white font-mono text-sm">
                                    {mintResult.nft.mintAddress.slice(0, 8)}...{mintResult.nft.mintAddress.slice(-8)}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-400">Rarity:</span>
                                <span className="text-yellow-400 font-bold">Rare (1 of 10,000)</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Status:</span>
                                <span className="text-green-400 font-bold">Successfully Minted</span>
                              </div>
                    </div>
                    </div>
                  </div>
                </div>

                      <div className="bg-blue-500/20 rounded-2xl p-6 border border-blue-400/30">
                        <div className="flex items-center justify-center space-x-4">
                          <p className="text-lg text-blue-300 font-medium">
                            🎉 NFT successfully claimed! You can now explore SolQuest or check your wallet.
                          </p>
                          <button 
                            onClick={() => window.open('https://solquest.io', '_blank')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Explore SolQuest
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-6">🔒</div>
                      <h2 className="text-3xl font-bold text-orange-400 mb-4">
                        NFT Already Claimed
                      </h2>
                      <p className="text-xl text-gray-300 mb-6">
                        {error || 'This wallet has already claimed its free OG NFT'}
                      </p>
                      <div className="bg-orange-500/20 rounded-2xl p-6 border border-orange-400/30">
                        <p className="text-orange-300 text-lg">
                          🚫 <strong>Limit: 1 NFT per wallet</strong> - This helps ensure fair distribution to the community
                        </p>
                      </div>
                      <div className="mt-6">
                        <button 
                          onClick={() => window.open('https://solquest.io', '_blank')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors"
                        >
                          Back to SolQuest
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-6 animate-pulse">🎯</div>
                  <h2 className="text-4xl font-bold text-white mb-8">
                    Step 2: Claim Your FREE NFT
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    One click to join the elite SolQuest OG community!
                  </p>
                  
                  {/* Transaction Info */}
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-blue-300 mb-3">💳 Transaction Details</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>NFT Cost:</span>
                        <span className="text-green-400 font-bold">FREE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network Fee:</span>
                        <span className="text-yellow-400">{CLAIM_FEE_SOL} SOL</span>
                      </div>
                      <div className="border-t border-gray-600 pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total Cost:</span>
                          <span className="text-white">{CLAIM_FEE_SOL} SOL</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Small network fee covers blockchain transaction costs (~$0.02)
                    </p>
                  </div>
                  
                  {error && (
                    <div className="bg-red-500/20 border-2 border-red-500 rounded-2xl p-6 mb-8">
                      <p className="text-red-400 text-lg font-medium">{error}</p>
                    </div>
                  )}
                  
                  <div className="transform hover:scale-105 transition-transform">
                    <button 
                      onClick={handleClaim}
                      disabled={claiming}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black py-6 px-16 rounded-2xl text-2xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>
                      <div className="relative z-10">
                        {claiming ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-white mr-4"></div>
                            CLAIMING NFT...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span className="text-3xl mr-3">⚡</span>
                            CLAIM NFT
                            <span className="text-3xl ml-3">⚡</span>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                  
                  <p className="text-lg text-gray-400 mt-6 font-medium">
                    🔒 Secure blockchain transaction • 💯 One NFT per wallet • ♾️ Forever benefits
                  </p>
                </div>
              )}
            </div>
                </div>
                
          {/* Enhanced Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: '🚀', title: 'XP Boost', desc: '10% faster progression', gradient: 'from-blue-500 to-purple-500' },
              { icon: '💰', title: 'SOL Rewards', desc: '10% bonus on real SOL', gradient: 'from-green-500 to-emerald-500' },
              { icon: '👑', title: 'VIP Access', desc: 'Exclusive Discord & features', gradient: 'from-purple-500 to-pink-500' },
              { icon: '🗳️', title: 'Governance', desc: 'Vote on platform decisions', gradient: 'from-orange-500 to-red-500' }
            ].map((benefit, idx) => (
              <div key={idx} className="group hover:scale-105 transition-transform">
                <div className={`bg-gradient-to-br ${benefit.gradient} p-[2px] rounded-2xl`}>
                  <div className="bg-gray-900/90 backdrop-blur rounded-2xl p-6 h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-4 group-hover:animate-bounce">{benefit.icon}</div>
                      <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                      <p className="text-gray-300 text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer with urgency */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur rounded-2xl p-6 border border-orange-400/30">
              <p className="text-2xl font-bold text-orange-400 mb-2">
                ⚡ HURRY! LIMITED TO FIRST 10,000 WALLETS ⚡
              </p>
              <p className="text-lg text-gray-300">
                🔒 1 NFT per wallet • 💯 Completely free • 🚫 No catch • ♾️ Forever benefits
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(-10px) rotate(-5deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 