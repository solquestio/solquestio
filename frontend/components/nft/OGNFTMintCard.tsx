'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircleIcon, XCircleIcon, SparklesIcon, UsersIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.solquest.io';

interface OGNFTEligibility {
  eligible: boolean;
  reason: string;
  collectionMint: string | null;
  stats: {
    totalMinted: number;
    remaining: number;
    maxSupply: number;
    nextTokenId: number;
  };
  mintingAvailable: boolean;
}

interface MintResult {
  success: boolean;
  message: string;
  nft: {
    mintAddress: string;
    tokenId: number;
    metadataUri: string;
    recipient: string;
  };
  transactionSignature: string;
  limitEnforced: boolean;
}

export default function OGNFTMintCard() {
  const { publicKey, connected } = useWallet();
  const [eligibility, setEligibility] = useState<OGNFTEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check eligibility when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      checkEligibility();
    } else {
      setEligibility(null);
      setMintResult(null);
      setError(null);
    }
  }, [connected, publicKey]);

  const checkEligibility = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/og-nft?action=eligibility&walletAddress=${publicKey.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check eligibility');
      }

      setEligibility(data);
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setError(err instanceof Error ? err.message : 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const mintOGNFT = async () => {
    if (!publicKey || !eligibility?.eligible) return;

    setMinting(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/og-nft?action=mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          specialAttributes: [] // Could add special attributes for early community members
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mint NFT');
      }

      setMintResult(data);
      // Refresh eligibility to show updated status
      await checkEligibility();
    } catch (err) {
      console.error('Error minting NFT:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setMinting(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getProgressPercentage = () => {
    if (!eligibility?.stats) return 0;
    return (eligibility.stats.totalMinted / eligibility.stats.maxSupply) * 100;
  };

  if (!connected) {
    return (
      <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-6">
        <div className="text-center">
          <SparklesIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">SolQuest OG NFT</h3>
          <p className="text-gray-400 mb-4">
            Connect your wallet to check eligibility for the exclusive OG collection
          </p>
          <div className="text-sm text-gray-500">
            Limited to 1 NFT per wallet • Free mint for early community members
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="w-8 h-8 text-purple-400" />
          <div>
            <h3 className="text-xl font-bold text-white">SolQuest OG NFT</h3>
            <p className="text-sm text-gray-400">Exclusive community collection</p>
          </div>
        </div>
      </div>

      {/* Collection Stats */}
      {eligibility?.stats && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Minting Progress</span>
            <span className="text-sm text-gray-300">
              {formatNumber(eligibility.stats.totalMinted)} / {formatNumber(eligibility.stats.maxSupply)}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatNumber(eligibility.stats.remaining)} remaining</span>
            <span>Next: #{eligibility.stats.nextTokenId}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <ArrowPathIcon className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-400">Checking eligibility...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <XCircleIcon className="w-5 h-5 text-red-400" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
          <button
            onClick={checkEligibility}
            className="mt-2 text-red-300 hover:text-red-200 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Eligibility Status */}
      {eligibility && !loading && (
        <div className="space-y-4">
          {/* Eligibility Indicator */}
          <div className={`flex items-center space-x-3 p-4 rounded-lg border ${
            eligibility.eligible 
              ? 'bg-green-500/20 border-green-500/50' 
              : 'bg-red-500/20 border-red-500/50'
          }`}>
            {eligibility.eligible ? (
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            ) : (
              <XCircleIcon className="w-6 h-6 text-red-400" />
            )}
            <div>
              <p className={`font-medium ${
                eligibility.eligible ? 'text-green-300' : 'text-red-300'
              }`}>
                {eligibility.eligible ? 'Eligible for Minting' : 'Not Eligible'}
              </p>
              <p className="text-sm text-gray-400">{eligibility.reason}</p>
            </div>
          </div>

          {/* NFT Benefits */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">OG NFT Benefits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">10% XP boost on all quests</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">10% bonus on leaderboard rewards</span>
              </div>
              <div className="flex items-center space-x-2">
                <UsersIcon className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Exclusive Discord access</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Early access to new features</span>
              </div>
            </div>
          </div>

          {/* Mint Button */}
          {eligibility.eligible && eligibility.mintingAvailable ? (
            <button
              onClick={mintOGNFT}
              disabled={minting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {minting ? (
                <div className="flex items-center justify-center space-x-2">
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Minting...</span>
                </div>
              ) : (
                'Mint FREE OG NFT'
              )}
            </button>
          ) : !eligibility.mintingAvailable ? (
            <div className="w-full bg-gray-600 text-gray-300 font-bold py-4 px-6 rounded-lg text-center">
              Minting Completed - All NFTs Claimed
            </div>
          ) : (
            <div className="w-full bg-gray-600 text-gray-300 font-bold py-4 px-6 rounded-lg text-center">
              {eligibility.reason}
            </div>
          )}

          {/* Limit Notice */}
          <div className="text-center text-xs text-gray-500">
            🔒 Limited to 1 NFT per wallet • Free mint for early community members
          </div>
        </div>
      )}

      {/* Success State */}
      {mintResult && (
        <div className="mt-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <h4 className="font-bold text-green-300">NFT Minted Successfully!</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Token ID:</span>
              <span className="text-white font-mono">#{mintResult.nft.tokenId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mint Address:</span>
              <span className="text-white font-mono text-xs">
                {mintResult.nft.mintAddress.slice(0, 8)}...{mintResult.nft.mintAddress.slice(-8)}
              </span>
            </div>
            {mintResult.nft.metadataUri && (
              <div className="mt-3">
                <a
                  href={mintResult.nft.metadataUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm underline"
                >
                  View Metadata →
                </a>
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            🎉 Welcome to the SolQuest OG community! Your benefits are now active.
          </div>
        </div>
      )}
    </div>
  );
} 