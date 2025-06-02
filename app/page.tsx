'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, ArrowPathIcon, UserCircleIcon, TrophyIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/AuthContext';
import { PathCard } from '@/components/common/PathCard';

// Define learning path type
interface LearningPath {
  id: string;
  title: string;
  description: string;
  questCount: number;
  difficulty: string;
  pathSlug?: string;
  totalXp?: number;
  isLocked?: boolean;
  graphicType?: string;
  imageUrl?: string;
  pathKey?: string;
}

// Define leaderboard user type
interface LeaderboardUser {
  _id: string;
  walletAddress: string;
  username?: string;
  xp: number;
  rank?: number;
  xpBoost?: number;
}

// Dynamically import the WalletMultiButton with no SSR
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false, loading: () => <button className="px-4 py-2 bg-gray-600 rounded-md">Loading Wallet...</button> }
);

// Dynamic import for OG NFT Card
const OGNftCardDynamic = dynamic(
  () => import('@/components/nft/OGNftCard'),
  { ssr: false, loading: () => <div className="bg-gray-800/50 rounded-lg h-64 animate-pulse"></div> }
);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.solquest.io';

// Define static learning paths
const STATIC_LEARNING_PATHS: LearningPath[] = [
  {
    id: 'layerzero-path',
    title: 'LayerZero V2',
    description: 'Explore omnichain interactions! Start by funding your Devnet wallet, then dive into sending messages and tokens across blockchains with LayerZero V2.',
    questCount: 8,
    difficulty: 'Intermediate',
    pathSlug: 'layerzero',
    totalXp: 2500,
    isLocked: false,
    graphicType: 'image',
    imageUrl: '/layerzero.jpg',
    pathKey: 'layerZero'
  },
  {
    id: 'solana-foundations',
    title: 'Solana Explorer',
    description: "Dive deep into Solana's core concepts, learn to navigate the ecosystem, and complete foundational quests, starting with community engagement.",
    questCount: 7,
    difficulty: 'Beginner',
    pathSlug: 'solana-foundations',
    totalXp: 1200,
    isLocked: false,
    graphicType: 'image',
    imageUrl: '/solana_v2_2b.jpg',
    pathKey: 'solanaExplorer'
  },
  {
    id: 'zk-compression-path',
    title: 'ZK Compression',
    description: "Learn about ZK Compression on Solana. Discover how to build scalable, private, and secure applications using compressed tokens and accounts.",
    questCount: 8,
    difficulty: 'Advanced',
    pathSlug: 'zk-compression',
    totalXp: 2200,
    isLocked: false,
    graphicType: 'image',
    imageUrl: '/zk-compression.jpg',
    pathKey: 'zkCompression'
  },
  {
    id: 'bitcoin-solana-path',
    title: 'Bitcoin on Solana',
    description: "Explore the integration of Bitcoin with Solana through the Zeus Network, including zBTC, Apollo Exchange, and Zeus Program Library.",
    questCount: 7,
    difficulty: 'Intermediate',
    pathSlug: 'bitcoin-solana',
    totalXp: 2450,
    isLocked: false,
    graphicType: 'image',
    imageUrl: '/bitcoin-solana.jpg',
    pathKey: 'bitcoinSolana'
  },
  {
    id: 'substreams-path',
    title: 'Substreams',
    description: "Learn how to build powerful data pipelines with Substreams to analyze and transform Solana blockchain data for various applications.",
    questCount: 11,
    difficulty: 'Advanced',
    pathSlug: 'substreams',
    totalXp: 2150,
    isLocked: false,
    graphicType: 'image',
    imageUrl: '/substreams.jpg',
    pathKey: 'substreams'
  }
];

// Helper function to shorten wallet address
const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

// Rank Color/Style Helper
const getRankClasses = (rank: number): string => {
  if (rank === 1) return 'bg-yellow-500 text-black';
  if (rank === 2) return 'bg-gray-400 text-black';
  if (rank === 3) return 'bg-orange-600 text-white';
  return 'bg-gray-700 text-gray-300';
};

export default function HomePage() {
  const router = useRouter();

  const { 
    userProfile, 
    isLoading: isLoadingAuth,
    isAuthenticated, 
    login,
    error: authError
  } = useAuth();

  const [featuredPaths, setFeaturedPaths] = useState<LearningPath[]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(false);
  const [pathError, setPathError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [topPlayers, setTopPlayers] = useState<LeaderboardUser[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Use the static paths instead of fetching from API
    if (isMounted) {
      setFeaturedPaths(STATIC_LEARNING_PATHS);
      setIsLoadingPaths(false);
    }
  }, [isMounted]);

  // Fetch top players for leaderboard
  useEffect(() => {
    const fetchTopPlayers = async () => {
      setIsLoadingLeaderboard(true);
      setLeaderboardError(null);
      try {
        // Mocked leaderboard data since the backend API might not be available
        const mockLeaderboardData: LeaderboardUser[] = [
          {
            _id: '1',
            walletAddress: '8xrt45JYBs3HaKLsYrmaeG29xhQVq',
            username: 'SolanaWhiz',
            xp: 2850,
            rank: 1,
            xpBoost: 1.2
          },
          {
            _id: '2',
            walletAddress: '3tZp8FgmQsDxTKwF2aGrKASvYwQ',
            username: 'BlockchainBuilder',
            xp: 2340,
            rank: 2
          },
          {
            _id: '3',
            walletAddress: '5rWjNBs7MqLPvFGxHty64rRYbn',
            username: 'CryptoQuester',
            xp: 1920,
            rank: 3,
            xpBoost: 1.1
          }
        ];
        
        setTopPlayers(mockLeaderboardData);
      } catch (error: any) {
        console.error('Error fetching top players:', error);
        setLeaderboardError(error.message || 'Failed to load leaderboard data');
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    if (isMounted) {
      fetchTopPlayers();
    }
  }, [isMounted]);

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8">
      {/* Wallet and Auth Section */}
      <div className="flex justify-end mb-6">
        {isLoadingAuth ? (
          <div className="flex items-center">
            <ArrowPathIcon className="animate-spin h-5 w-5 mr-2 text-white" />
            <span className="text-white">Loading...</span>
          </div>
        ) : !isAuthenticated ? (
          <div className="flex flex-wrap items-center gap-4">
            <WalletMultiButtonDynamic className="!bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to !rounded-md" />
            <button
              onClick={login}
              className="px-5 py-2.5 bg-white text-purple-800 font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
              <p className="text-sm text-gray-300">Welcome back,</p>
              <p className="font-semibold text-white">{userProfile?.username || 'Explorer'}</p>
            </div>
            <Link 
              href="/profile" 
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to text-white rounded-md hover:opacity-90 transition-colors"
            >
              View Profile <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        )}
      </div>
      
      {authError && (
        <p className="mt-4 text-red-400 text-sm">{authError}</p>
      )}

      {/* Top Section: OG NFT and Leaderboard */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        {/* OG NFT Card (2/5 width on md screens) */}
        <div className="md:col-span-2 bg-gray-800/20 rounded-xl overflow-hidden shadow-xl">
          <OGNftCardDynamic />
        </div>
        
        {/* Leaderboard (3/5 width on md screens) */}
        <div className="md:col-span-3 bg-gray-800/20 border border-gray-700/50 p-6 rounded-xl shadow-xl">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-100 flex items-center">
              <TrophyIcon className="w-6 h-6 mr-2 text-yellow-400" /> Top Questers
            </h2>
            <Link 
              href="/leaderboard" 
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              View All &rarr;
            </Link>
          </div>
          
          {isLoadingLeaderboard ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gray-600 rounded-md"></div>
                    <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                    <div className="h-4 w-24 bg-gray-600 rounded"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-12 bg-gray-600 rounded"></div>
                    <div className="h-5 w-16 bg-gray-600 rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : leaderboardError ? (
            <p className="text-red-400 text-sm text-center py-4">Error: {leaderboardError}</p>
          ) : topPlayers.length > 0 ? (
            <div className="space-y-1">
              {topPlayers.map((player, index) => {
                const rank = player.rank ?? index + 1;
                const rankClasses = getRankClasses(rank);
                const truncatedAddress = shortenAddress(player.walletAddress, 4);
                const gradientBg = rank === 1 ? 'bg-gradient-to-r from-yellow-500/15 to-gray-800/0' 
                                  : rank === 2 ? 'bg-gradient-to-r from-gray-500/15 to-gray-800/0'
                                  : rank === 3 ? 'bg-gradient-to-r from-orange-600/15 to-gray-800/0' 
                                  : 'bg-gray-700/30';

                return (
                  <div 
                    key={player._id} 
                    className={`flex items-center justify-between p-3 rounded-lg ${gradientBg} hover:bg-gray-700/40 transition-colors duration-150`}
                  >
                    {/* Left Side: Rank, Avatar, User Info */}
                    <div className="flex items-center space-x-3 flex-grow min-w-0 mr-3">
                      <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold rounded-md ${rankClasses}`}>
                        {rank}
                      </span>
                      <UserCircleIcon className="flex-shrink-0 w-8 h-8 text-gray-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">
                          {player.username || truncatedAddress}
                        </p>
                        {player.username && (
                          <p className="text-xs text-gray-400 font-mono truncate">
                            {truncatedAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Boosts and Score */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {/* Boost Badges */}
                      {(player.xpBoost && player.xpBoost > 1) && (
                        <span className="flex items-center text-xs font-semibold bg-black/50 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/50" title={`XP Boost x${player.xpBoost.toFixed(1)}`}>
                          <SparklesIcon className="h-3 w-3 mr-0.5"/> x{player.xpBoost.toFixed(1)}
                        </span>
                      )}
                      {/* Score (XP) */}
                      <div className="bg-gradient-to-r from-purple-600/70 to-blue-600/70 text-white px-2 py-0.5 rounded text-center min-w-[60px]">
                        <span className="text-xs font-bold">
                          {player.xp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic text-center py-6">Be the first on the leaderboard!</p>
          )}
        </div>
      </div>

      {/* Learning Paths Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <SparklesIcon className="h-6 w-6 mr-2 text-purple-400" />
            Learning Paths
          </h2>
        </div>
        <p className="text-gray-400 mb-8 max-w-3xl">
          Start your blockchain journey with our guided learning paths
        </p>
        
        {isLoadingPaths ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div 
                key={index} 
                className="h-[380px] bg-gray-800/30 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : pathError ? (
          <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-400">{pathError}</p>
            <button 
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              onClick={() => {
                setIsLoadingPaths(true);
                setFeaturedPaths(STATIC_LEARNING_PATHS);
                setIsLoadingPaths(false);
                setPathError(null);
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPaths.map(path => (
              <PathCard 
                key={path.id}
                id={path.id}
                title={path.title}
                description={path.description}
                imageSrc={path.imageUrl || '/default-path.jpg'}
                totalXP={path.totalXp || 0}
                questCount={path.questCount}
                pathSlug={path.pathSlug || ''}
                userCount={path.id === 'zk-compression-path' ? '10K+ Users' : 
                           path.id === 'layerzero-path' ? '5K Users' : 
                           path.id === 'solana-foundations' ? '25K Users' : '2K+ Users'}
                pathKey={path.pathKey || ''}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-8 mb-8 bg-gray-800/30 rounded-xl p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-white">Why Learn With SolQuest</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Our platform combines interactive learning with rewards to help you master blockchain development</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-400 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Learn by Doing</h3>
            <p className="text-gray-400">Complete interactive tasks and quests that reinforce your understanding of blockchain concepts.</p>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-400 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Earn Rewards</h3>
            <p className="text-gray-400">Gain XP, badges, and potentially tokens as you complete challenges and milestones.</p>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/50">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-400 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Join the Community</h3>
            <p className="text-gray-400">Connect with other blockchain developers, share knowledge, and collaborate on projects.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Start Your Blockchain Journey?</h2>
          <p className="text-lg text-gray-300 mb-8">Join thousands of developers learning and building on various blockchains</p>
          
          {!isAuthenticated ? (
            <div className="flex flex-wrap justify-center gap-4">
              <WalletMultiButtonDynamic className="!bg-white !text-purple-900 !rounded-md !hover:bg-gray-100" />
              <button
                onClick={login}
                className="px-6 py-3 bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to text-white font-medium rounded-md hover:opacity-90 transition-colors"
              >
                Create Account
              </button>
            </div>
          ) : (
            <Link
              href="/paths"
              className="px-6 py-3 bg-white text-purple-900 font-medium rounded-md hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Explore Learning Paths <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
} 