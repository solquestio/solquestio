'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { LAMPORTS_PER_SOL, Transaction, PublicKey, SystemProgram } from '@solana/web3.js';
import { LockClosedIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Dynamically import the OGNftCard component
const OGNftCardDynamic = dynamic(
  () => import('@/components/nft/OGNftCard'),
  { ssr: false, loading: () => <div className="bg-gray-800/50 rounded-lg h-64 animate-pulse"></div> }
);

// Dynamically import the WalletMultiButton with no SSR
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false, loading: () => <button className="px-4 py-2 bg-gray-600 rounded-md">Loading Wallet...</button> }
);

export default function OGNFTClaim() {
  const { publicKey, connected, signTransaction, sendTransaction } = useWallet();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [twitterVerified, setTwitterVerified] = useState(false);
  const [discordVerified, setDiscordVerified] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [mintEnabled, setMintEnabled] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mintPrice] = useState(0.005 * LAMPORTS_PER_SOL); // 0.005 SOL in lamports
  const [mintedCount, setMintedCount] = useState(0);
  const [remainingForUsers, setRemainingForUsers] = useState(5000);
  const [isFree, setIsFree] = useState(false);
  
  useEffect(() => {
    if (connected && publicKey) {
      checkEligibility();
      fetchMintStats();
    }
  }, [connected, publicKey]);
  
  useEffect(() => {
    // Enable mint button when either social verifications are complete or promo code is verified
    if ((twitterVerified && discordVerified) || codeVerified) {
      setMintEnabled(true);
    } else {
      setMintEnabled(false);
    }
  }, [twitterVerified, discordVerified, codeVerified]);
  
  const fetchMintStats = async () => {
    try {
      // This would be a real API call in production
      // Mock data for demo
      const randomMinted = Math.floor(Math.random() * 3500) + 1500; // Between 1500-5000
      setMintedCount(randomMinted);
      setRemainingForUsers(5000 - (randomMinted - 0)); // Assuming all minted so far are from user allocation
    } catch (error) {
      console.error("Error fetching mint stats:", error);
    }
  };
  
  const checkEligibility = async () => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      // Check if wallet has already claimed an NFT
      // For demo, this is a mock implementation
      const hasNFT = false; // In production, this would be a real API check
      
      if (hasNFT) {
        setAlreadyClaimed(true);
      }
      
      // Pre-fill any completed verifications
      // For demo purposes, we're simulating some already verified accounts
      const walletStr = publicKey.toString();
      // If wallet address ends with specific patterns, auto-verify (demo only)
      if (walletStr.endsWith('a') || walletStr.endsWith('b')) setTwitterVerified(true);
      if (walletStr.endsWith('c') || walletStr.endsWith('d')) setDiscordVerified(true);
      
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
  
  const verifyPromoCode = async () => {
    try {
      setLoading(true);
      
      // In production, this would check the promo code against a database
      // For demo purposes, we'll accept any code containing "SOLQUEST"
      const isValidCode = promoCode.includes("SOLQUEST");
      
      if (isValidCode) {
        setCodeVerified(true);
        setIsFree(true);
        setError('');
      } else {
        setError('Invalid promo code. Try "SOLQUEST" for this demo.');
      }
      
      setLoading(false);
    } catch (err) {
      setError('Code verification failed');
      setLoading(false);
    }
  };
  
  const mintNFT = async () => {
    if (!mintEnabled || !publicKey || !sendTransaction) return;
    
    try {
      setLoading(true);
      setError('');
      
      // In a real implementation, this would interact with your Solana NFT contract
      // For demo, we'll simulate the transaction
      
      if (!isFree) {
        try {
          // Create a Solana transaction for the payment
          // This would be replaced with actual NFT minting logic in production
          const treasuryWallet = new PublicKey("11111111111111111111111111111111"); // Replace with real treasury wallet
          
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: treasuryWallet,
              lamports: mintPrice
            })
          );
          
          // Setting a recent blockhash is required for transaction validation
          // In real app, you would fetch this from a connected Solana node
          // For demo, we'll simulate a successful transaction
          
          // Wait to simulate transaction time
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Simulate successful transaction
          setSuccess(true);
          setAlreadyClaimed(true);
        } catch (txError: any) {
          console.error("Transaction error:", txError);
          setError(`Transaction failed: ${txError.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }
      } else {
        // Free mint with promo code
        // Simulate API call and success
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSuccess(true);
        setAlreadyClaimed(true);
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Minting error:', err);
      setError(`Minting failed: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      {/* Hero section with NFT image and collection stats */}
      <div className="relative w-full py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Solquest OG NFT</h1>
            <p className="text-xl md:text-2xl mb-3">Exclusive limited NFT collection</p>
            <p className="text-gray-300 mb-4">Claim your OG status in the Solquest ecosystem</p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="bg-indigo-900/30 border border-indigo-500/30 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-300">Total Supply</p>
                <p className="text-xl font-bold">10,000</p>
              </div>
              <div className="bg-indigo-900/30 border border-indigo-500/30 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-300">Minted</p>
                <p className="text-xl font-bold">{mintedCount.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-900/30 border border-indigo-500/30 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-300">Available</p>
                <p className="text-xl font-bold">{remainingForUsers.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-900/30 border border-indigo-500/30 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-300">Price</p>
                <p className="text-xl font-bold">0.005 SOL</p>
              </div>
            </div>
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
                <p className="mb-4">Connect your wallet to claim your SolQuest OG NFT</p>
                <WalletMultiButtonDynamic className="!bg-indigo-600 !hover:bg-indigo-700 !rounded-lg !py-3 !border-none mx-auto" />
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
                <div className="flex items-center mb-6 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                  <InformationCircleIcon className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-200">
                    {isFree 
                      ? "You're eligible for a FREE mint with your promo code!" 
                      : "Complete social tasks for verification or use a promo code to mint."}
                  </p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {/* Social Verification */}
                  <div className="p-4 bg-gray-800/50 border border-gray-700/30 rounded-lg mb-4">
                    <h3 className="font-bold text-lg mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-sm mr-2">1</span>
                      Complete Social Verification
                    </h3>
                    
                    {/* Twitter Verification */}
                    <div className={`p-4 rounded-lg mb-3 ${twitterVerified ? 'bg-indigo-900/30 border border-indigo-500/50' : 'bg-gray-800 border border-gray-700'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753c0-.249 1.51-2.772 1.818-4.013z" />
                          </svg>
                          <span>Follow on Twitter</span>
                        </div>
                        {twitterVerified ? (
                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Verified</div>
                        ) : (
                          <button
                            onClick={verifyTwitter}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium transition"
                          >
                            {loading ? 'Verifying...' : 'Verify'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Discord Verification */}
                    <div className={`p-4 rounded-lg ${discordVerified ? 'bg-indigo-900/30 border border-indigo-500/50' : 'bg-gray-800 border border-gray-700'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.222 0c1.406 0 2.54 1.137 2.607 2.475V24l-2.677-2.273-1.47-1.338-1.604-1.398.67 2.205H3.71c-1.402 0-2.54-1.065-2.54-2.476V2.48C1.17 1.142 2.31.003 3.715.003h16.5L20.222 0zm-6.118 5.683h-.03l-.202.2c2.073.6 3.076 1.537 3.076 1.537-1.336-.668-2.54-1.002-3.744-1.137-.87-.135-1.74-.064-2.475 0h-.2c-.47 0-1.47.2-2.81.735-.467.203-.735.336-.735.336s1.002-1.002 3.21-1.537l-.135-.135s-1.672-.064-3.477 1.27c0 0-1.805 3.144-1.805 7.02 0 0 1 1.74 3.743 1.806 0 0 .4-.533.805-1.002-1.54-.468-2.14-1.404-2.14-1.404s.134.066.335.2h.06c.03 0 .044.015.06.03v.006c.016.016.03.03.06.03.33.136.66.27.93.4.466.202 1.065.403 1.8.536.93.135 1.996.2 3.21 0 .6-.135 1.2-.267 1.8-.535.39-.2.87-.4 1.397-.737 0 0-.6.936-2.205 1.404.33.466.795 1 .795 1 2.744-.06 3.81-1.8 3.87-1.726 0-3.87-1.815-7.02-1.815-7.02-1.635-1.214-3.165-1.26-3.435-1.26l.056-.02zm.168 4.413c.703 0 1.27.6 1.27 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.334.002-.74.573-1.338 1.27-1.338zm-4.543 0c.7 0 1.266.6 1.266 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.334 0-.74.57-1.338 1.27-1.338z" />
                          </svg>
                          <span>Join Discord</span>
                        </div>
                        {discordVerified ? (
                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Verified</div>
                        ) : (
                          <button
                            onClick={verifyDiscord}
                            disabled={loading}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md text-xs font-medium transition"
                          >
                            {loading ? 'Verifying...' : 'Verify'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* OR Divider */}
                  <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-700"></div>
                    <span className="flex-shrink-0 px-3 text-gray-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-700"></div>
                  </div>
                  
                  {/* Promo Code Section */}
                  <div className="p-4 bg-gray-800/50 border border-gray-700/30 rounded-lg">
                    <h3 className="font-bold text-lg mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-sm mr-2">2</span>
                      Use a Promo Code
                    </h3>
                    
                    <div className={`p-4 rounded-lg ${codeVerified ? 'bg-indigo-900/30 border border-indigo-500/50' : 'bg-gray-800 border border-gray-700'}`}>
                      <p className="text-sm text-gray-300 mb-3">Enter a promo code to mint your NFT for free</p>
                      
                      {codeVerified ? (
                        <div className="flex items-center justify-between bg-green-900/30 border border-green-500/30 rounded-lg p-2">
                          <span className="text-green-400">Promo code applied!</span>
                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">✓ FREE MINT</div>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="SOLQUEST"
                            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-grow"
                          />
                          <button
                            onClick={verifyPromoCode}
                            disabled={loading || !promoCode}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                          >
                            {loading ? 'Verifying...' : 'Apply'}
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
                  <div className="mb-4 p-3 rounded-lg bg-indigo-900/20 border border-indigo-500/20">
                    <span className="text-indigo-300 font-medium">Price: </span>
                    <span className="font-bold">
                      {isFree ? (
                        <span className="text-green-400">FREE</span>
                      ) : (
                        <span>0.005 SOL</span>
                      )}
                    </span>
                  </div>
                  
                  <button
                    onClick={mintNFT}
                    disabled={!mintEnabled || loading}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition ${
                      mintEnabled 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' 
                        : 'bg-gray-700 cursor-not-allowed text-gray-400'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </span>
                    ) : isFree ? 'Mint OG NFT (FREE)' : 'Mint OG NFT (0.005 SOL)'}
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