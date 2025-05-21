'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Connection, PublicKey } from '@solana/web3.js';
import { InformationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Constants
const MAGIC_EDEN_COLLECTION_URL = "https://magiceden.io/collections/solquestio-og-nft"; // Replace with actual URL when published
const NFT_COLLECTION_ADDRESS = "2rCAH2DF3UbBnRM9atpkQT7eVy9V5B9oXMYzziV8tyGv"; // Example address - replace with actual

// NFT data interface
interface NFTData {
  tokenId: number;
  mintDate: string;
  metadataUrl: string;
}

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
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasNFT, setHasNFT] = useState(false);
  const [nftData, setNftData] = useState<NFTData | null>(null);
  
  // Collection statistics (would come from API in production)
  const [mintedCount] = useState(2372); // Example count
  const [totalSupply] = useState(10000);
  const [remainingCount] = useState(7628); // Example count
  
  const checkNFTOwnership = async () => {
    if (!publicKey) return;
    
    try {
      setLoading(true);
      
      // In a real implementation, this would check the blockchain:
      // 1. Use the Metaplex JS SDK to fetch NFTs owned by this wallet
      // 2. Filter by your collection address/symbol
      // 3. Check if any NFT from your collection is owned by this wallet
      
      // Example implementation using Metaplex (pseudocode):
      /*
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com");
      const metaplex = new Metaplex(connection);
      const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey });
      const hasCollectionNFT = nfts.some(nft => 
        nft.collection?.address.toString() === NFT_COLLECTION_ADDRESS
      );
      
      setHasNFT(hasCollectionNFT);
      
      if (hasCollectionNFT) {
        // Find the specific NFT from the collection
        const ourNft = nfts.find(nft => 
          nft.collection?.address.toString() === NFT_COLLECTION_ADDRESS
        );
        
        if (ourNft) {
          setNftData({
            tokenId: parseInt(ourNft.name.split('#')[1]) || 0,
            mintDate: ourNft.mintedAt?.toISOString() || new Date().toISOString(),
            metadataUrl: ourNft.uri
          });
        }
      }
      */
      
      // For demo purposes - using localStorage to simulate owning an NFT
      const hasStoredNFT = localStorage.getItem(`solquest_nft_claimed_${publicKey.toString()}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (hasStoredNFT === 'true') {
        setHasNFT(true);
        setNftData({
          tokenId: Math.floor(Math.random() * 10000),
          mintDate: new Date().toISOString(),
          metadataUrl: 'https://solquest.io/api/nft/metadata/123'
        });
      } else {
        setHasNFT(false);
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error checking NFT ownership:', err);
      setError(`Failed to verify NFT: ${err.message}`);
      setLoading(false);
    }
  };
  
  // For demo purposes only - simulate having the NFT
  const simulateHavingNFT = () => {
    if (publicKey) {
      localStorage.setItem(`solquest_nft_claimed_${publicKey.toString()}`, 'true');
      checkNFTOwnership();
    }
  };
  
  useEffect(() => {
    if (connected && publicKey) {
      checkNFTOwnership();
    }
  }, [connected, publicKey]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      {/* Hero section with NFT image and collection stats */}
      <div className="relative w-full py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">SolQuestio OG NFT</h1>
            <p className="text-xl md:text-2xl mb-3">Exclusive limited NFT collection</p>
            <p className="text-gray-300 mb-4">Claim your OG status in the SolQuestio ecosystem</p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="bg-indigo-900/30 border border-indigo-500/30 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-300">Total Supply</p>
                <p className="text-xl font-bold">{totalSupply.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-900/30 border border-indigo-500/30 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-300">Minted</p>
                <p className="text-xl font-bold">{mintedCount.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-900/30 border border-indigo-500/30 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-300">Available</p>
                <p className="text-xl font-bold">{remainingCount.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-900/30 border border-indigo-500/30 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-300">Price</p>
                <p className="text-xl font-bold text-green-400">FREE</p>
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
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Get Your OG NFT</h2>
            
            {!connected ? (
              <div className="text-center py-8">
                <p className="mb-4">Connect your wallet to verify NFT ownership</p>
                <WalletMultiButtonDynamic className="!bg-indigo-600 !hover:bg-indigo-700 !rounded-lg !py-3 !border-none mx-auto" />
              </div>
            ) : hasNFT ? (
              <div className="text-center py-8 bg-green-900/20 rounded-lg">
                <h3 className="text-xl font-bold mb-2">You own a SolQuestio OG NFT!</h3>
                <p className="mb-4">Thank you for being an early supporter of SolQuestio.</p>
                
                {/* Display NFT data - would come from blockchain in production */}
                {nftData && (
                  <div className="mb-4 bg-gray-800/50 p-4 rounded-lg text-left">
                    <h4 className="font-medium text-green-400 mb-2">NFT Details:</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-400">Token ID:</span> {nftData.tokenId}</p>
                      <p><span className="text-gray-400">Mint Date:</span> {new Date(nftData.mintDate).toLocaleString()}</p>
                      <p><span className="text-gray-400">Blockchain:</span> Solana</p>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => router.push('/profile')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition mr-2"
                >
                  View in Profile
                </button>
                
                <button 
                  onClick={() => window.open(MAGIC_EDEN_COLLECTION_URL, '_blank')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  View on Magic Eden
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-6 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                  <InformationCircleIcon className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-200">
                    Mint a SolQuestio OG NFT for FREE to prove your early support and unlock exclusive benefits!
                  </p>
                </div>

                {/* Requirements section */}
                <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-3">Mint Requirements:</h3>
                  <div className="flex items-center mb-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white">Follow <a href="https://x.com/SolQuestio" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@SolQuestio on X</a></p>
                      <p className="text-xs text-gray-400">Show your support by following us on X (Twitter)</p>
                    </div>
                  </div>
                </div>

                {/* Benefits section */}
                <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-3">OG NFT Benefits:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="inline-block w-4 h-4 bg-green-500 rounded-full mt-1 mr-2"></span>
                      <span>Early supporter status in the SolQuestio community</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-4 h-4 bg-green-500 rounded-full mt-1 mr-2"></span>
                      <span>10% extra XP on all quests</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-4 h-4 bg-green-500 rounded-full mt-1 mr-2"></span>
                      <span>10% boost on SOL rewards</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-4 h-4 bg-green-500 rounded-full mt-1 mr-2"></span>
                      <span>Exclusive access to special quests and events</span>
                    </li>
                  </ul>
                </div>
                
                <div className="text-center space-y-4">
                  <a 
                    href={MAGIC_EDEN_COLLECTION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-bold text-lg transition"
                  >
                    Mint FREE NFT
                  </a>
                  
                  <p className="text-sm text-gray-400">
                    Price: <span className="text-green-500 font-medium">FREE</span> (plus network fees)
                  </p>
                  
                  {loading ? (
                    <button disabled className="w-full mt-4 py-2 px-4 bg-gray-700 rounded-lg text-gray-300 flex items-center justify-center">
                      <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                      Checking ownership...
                    </button>
                  ) : (
                    <button 
                      onClick={checkNFTOwnership}
                      className="w-full mt-4 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition"
                    >
                      I already minted - Verify ownership
                    </button>
                  )}
                  
                  {/* For demo purposes only - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <button 
                      onClick={simulateHavingNFT}
                      className="block w-full mt-2 py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 text-sm transition"
                    >
                      (Demo Only) Simulate Having NFT
                    </button>
                  )}
                </div>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 