'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';

export default function ClaimPage() {
  const { publicKey, connected } = useWallet();
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [totalClaimed, setTotalClaimed] = useState(8247); // Mock counter
  const router = useRouter();

  // Check if wallet already claimed
  useEffect(() => {
    if (connected && publicKey) {
      checkEligibility();
    }
  }, [connected, publicKey]);

  const checkEligibility = async () => {
    if (!publicKey) return;
    
    try {
      const response = await fetch(`/api/og-nft?action=eligibility&walletAddress=${publicKey.toString()}`);
      const data = await response.json();
      
      if (!data.eligible) {
        setClaimed(true);
        setError(data.reason || 'Already claimed');
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const handleClaim = async () => {
    if (!publicKey || claiming) return;
    
    setClaiming(true);
    setError('');
    
    try {
      const response = await fetch('/api/og-nft?action=mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setClaimed(true);
        setTotalClaimed(prev => prev + 1);
        // Show success animation/confetti here
        setTimeout(() => {
          router.push('/dashboard'); // Redirect to dashboard
        }, 3000);
      } else {
        setError(data.error || 'Failed to claim NFT');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const progressPercentage = (totalClaimed / 10000) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Claim Your FREE
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {' '}SolQuest OG NFT
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            10% XP boost + 10% leaderboard bonus forever!
          </p>
        </div>

        {/* Live Stats */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 text-center">
          <div className="text-3xl font-bold text-white mb-2">
            📊 {totalClaimed.toLocaleString()} / 10,000 claimed
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-orange-400 font-semibold">
            ⏰ Limited time - first come, first served!
          </div>
        </div>

        {/* Claim Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
          {!connected ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">
                Step 1: Connect Your Wallet
              </h2>
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !text-white !font-bold !py-4 !px-8 !rounded-xl !text-lg hover:!from-purple-600 hover:!to-pink-600 transition-all" />
            </>
          ) : claimed ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-400 mb-4">
                Success! NFT Claimed
              </h2>
              <p className="text-gray-300 mb-6">
                Your SolQuest OG NFT has been claimed! You now have:
              </p>
              <div className="space-y-2 text-left max-w-md mx-auto">
                <div className="flex items-center text-green-400">
                  <span className="mr-2">✅</span> 10% XP boost on all quests
                </div>
                <div className="flex items-center text-green-400">
                  <span className="mr-2">✅</span> 10% bonus on leaderboard rewards
                </div>
                <div className="flex items-center text-green-400">
                  <span className="mr-2">✅</span> Exclusive Discord access
                </div>
                <div className="flex items-center text-green-400">
                  <span className="mr-2">✅</span> Governance voting rights
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-6">
                Redirecting to dashboard in 3 seconds...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">
                Step 2: Claim Your FREE NFT
              </h2>
              {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-12 rounded-xl text-xl hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {claiming ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Claiming...
                  </div>
                ) : (
                  'Claim FREE NFT ⚡'
                )}
              </button>
              <p className="text-sm text-gray-400 mt-4">
                No codes, no follows, no BS. Just claim!
              </p>
            </>
          )}
        </div>

        {/* Benefits Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">🚀 Platform Benefits</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✅ 10% XP boost on all quests</li>
              <li>✅ 10% leaderboard bonus (real SOL!)</li>
              <li>✅ Early access to new features</li>
              <li>✅ Exclusive #og-holders Discord</li>
            </ul>
          </div>
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-3">💎 NFT Benefits</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✅ Governance voting rights</li>
              <li>✅ Special profile badge</li>
              <li>✅ Tradeable on Magic Eden</li>
              <li>✅ 5% royalties to creators</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-400">
          <p>Limited to 1 NFT per wallet • Completely free • No catch!</p>
        </div>
      </div>
    </div>
  );
} 