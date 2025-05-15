'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamically import the OGNftCard component
const OGNftCardDynamic = dynamic(
  () => import('@/components/nft/OGNftCard'),
  { ssr: false, loading: () => <div className="bg-gray-800/50 rounded-lg h-64 animate-pulse"></div> }
);

export default function OGNFTClaim() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [twitterVerified, setTwitterVerified] = useState(false);
  const [discordVerified, setDiscordVerified] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [mintEnabled, setMintEnabled] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    if (connected && publicKey) {
      checkEligibility();
    }
  }, [connected, publicKey]);
  
  useEffect(() => {
    // Enable mint button when all verifications are complete
    if (twitterVerified && discordVerified && codeVerified) {
      setMintEnabled(true);
    } else {
      setMintEnabled(false);
    }
  }, [twitterVerified, discordVerified, codeVerified]);
  
  const checkEligibility = async () => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      // Check if wallet has already claimed an NFT
      const response = await fetch(`/api/nft/check-eligibility?wallet=${publicKey.toString()}`);
      const data = await response.json();
      
      if (data.alreadyClaimed) {
        setAlreadyClaimed(true);
      }
      
      // Pre-fill any completed verifications
      if (data.twitterVerified) setTwitterVerified(true);
      if (data.discordVerified) setDiscordVerified(true);
      
      setLoading(false);
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setLoading(false);
    }
  };
  
  const verifyTwitter = async () => {
    try {
      setLoading(true);
      // Open Twitter auth popup and handle verification flow
      window.open(`/api/nft/twitter-auth?wallet=${publicKey?.toString()}`, 'twitter-verify', 'width=600,height=600');
      
      // This would normally use a callback or polling to confirm verification
      // For now we'll simulate success after 2 seconds
      setTimeout(() => {
        setTwitterVerified(true);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError('Twitter verification failed');
      setLoading(false);
    }
  };
  
  const verifyDiscord = async () => {
    try {
      setLoading(true);
      // Open Discord auth popup and handle verification flow
      window.open(`/api/nft/discord-auth?wallet=${publicKey?.toString()}`, 'discord-verify', 'width=600,height=600');
      
      // This would normally use a callback or polling to confirm verification
      // For now we'll simulate success after 2 seconds
      setTimeout(() => {
        setDiscordVerified(true);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError('Discord verification failed');
      setLoading(false);
    }
  };
  
  const verifySecretCode = async () => {
    try {
      setLoading(true);
      // Verify secret code from backend
      const response = await fetch('/api/nft/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: secretCode, wallet: publicKey?.toString() })
      });
      
      const data = await response.json();
      
      if (data.verified) {
        setCodeVerified(true);
        setError('');
      } else {
        setError('Invalid secret code');
      }
      
      setLoading(false);
    } catch (err) {
      setError('Code verification failed');
      setLoading(false);
    }
  };
  
  const mintNFT = async () => {
    if (!mintEnabled || !publicKey) return;
    
    try {
      setLoading(true);
      // Call backend to mint NFT
      const response = await fetch('/api/nft/mint-og', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toString() })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setAlreadyClaimed(true);
      } else {
        setError(data.message || 'Minting failed');
      }
      
      setLoading(false);
    } catch (err) {
      setError('Minting failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      {/* Hero section with NFT image */}
      <div className="relative w-full py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Solquest OG NFT</h1>
            <p className="text-xl md:text-2xl mb-3">Exclusive free NFT for our early supporters</p>
            <p className="text-gray-300">Claim your OG status in the Solquest ecosystem</p>
          </div>
          
          <div className="w-full max-w-md mx-auto">
            {/* NFT card with styling container */}
            <div className="transform hover:scale-105 transition-all duration-500 p-3 rounded-2xl bg-gradient-to-b from-indigo-500/20 to-purple-500/10 backdrop-blur-sm border border-white/10 shadow-xl">
              <OGNftCardDynamic />
            </div>
          </div>
        </div>
      </div>
      
      {/* Claim section */}
      <div className="container mx-auto px-4 py-10 pb-20">
        <div className="max-w-xl mx-auto bg-gray-900/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-indigo-500/20">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Claim Your OG NFT</h2>
            
            {!connected ? (
              <div className="text-center py-8">
                <p className="mb-4">Connect your wallet to claim your free OG NFT</p>
                {/* The wallet connect button will be handled by your existing wallet provider */}
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition">
                  Connect Wallet
                </button>
              </div>
            ) : alreadyClaimed ? (
              <div className="text-center py-8 bg-green-900/20 rounded-lg">
                <h3 className="text-xl font-bold mb-2">You've already claimed your OG NFT!</h3>
                <p>Thank you for being an early supporter of Solquest.</p>
              </div>
            ) : success ? (
              <div className="text-center py-8 bg-green-900/20 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
                <p className="mb-4">Your Solquest OG NFT has been successfully minted to your wallet.</p>
                <button 
                  onClick={() => router.push('/profile')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  View in Profile
                </button>
              </div>
            ) : (
              <div>
                <div className="space-y-4 mb-8">
                  {/* Step 1: Twitter Verification */}
                  <div className={`p-5 rounded-lg ${twitterVerified ? 'bg-indigo-900/30 border border-indigo-500/50' : 'bg-gray-800/50 border border-gray-700/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="font-bold">1</span>
                        </div>
                        <div>
                          <h3 className="font-bold">Follow @SolquestIO on Twitter</h3>
                          <p className="text-sm text-gray-400">Follow and retweet our pinned post</p>
                        </div>
                      </div>
                      {twitterVerified ? (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Verified</div>
                      ) : (
                        <button
                          onClick={verifyTwitter}
                          disabled={loading}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          {loading ? 'Verifying...' : 'Verify'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Step 2: Discord Verification */}
                  <div className={`p-5 rounded-lg ${discordVerified ? 'bg-indigo-900/30 border border-indigo-500/50' : 'bg-gray-800/50 border border-gray-700/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                          <span className="font-bold">2</span>
                        </div>
                        <div>
                          <h3 className="font-bold">Join Solquest Discord</h3>
                          <p className="text-sm text-gray-400">Join our community Discord server</p>
                        </div>
                      </div>
                      {discordVerified ? (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Verified</div>
                      ) : (
                        <button
                          onClick={verifyDiscord}
                          disabled={loading}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          {loading ? 'Verifying...' : 'Verify'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Step 3: Secret Code */}
                  <div className={`p-5 rounded-lg ${codeVerified ? 'bg-indigo-900/30 border border-indigo-500/50' : 'bg-gray-800/50 border border-gray-700/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                          <span className="font-bold">3</span>
                        </div>
                        <div>
                          <h3 className="font-bold">Enter Secret Code</h3>
                          <p className="text-sm text-gray-400">Enter the secret code from our community channels</p>
                        </div>
                      </div>
                      {codeVerified ? (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Verified</div>
                      ) : (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            placeholder="Enter code"
                            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                          />
                          <button
                            onClick={verifySecretCode}
                            disabled={loading || !secretCode}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            {loading ? 'Verifying...' : 'Verify'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}
                
                <div className="text-center mt-10">
                  <button
                    onClick={mintNFT}
                    disabled={!mintEnabled || loading}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition ${
                      mintEnabled 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' 
                        : 'bg-gray-700 cursor-not-allowed text-gray-400'
                    }`}
                  >
                    {loading ? 'Processing...' : 'Mint OG NFT (FREE)'}
                  </button>
                  
                  <p className="text-xs text-gray-400 mt-4">
                    By clicking "Mint", you acknowledge that you are claiming the OG NFT and that only one NFT is allowed per wallet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 