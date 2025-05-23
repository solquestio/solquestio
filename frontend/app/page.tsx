'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon, ArrowPathIcon, UserCircleIcon, TrophyIcon, SparklesIcon, ArrowTopRightOnSquareIcon as ExternalLinkIcon, CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

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
  shortTitle?: string;
  logoUrl?: string;
  bonusPoints?: number;
  userCount?: string;
  isPathCompleted?: boolean;
  currentProgress?: number;
  rewardTags?: Array<{ text: string; icon?: string; variant?: 'ethereum' | 'points' | 'generic' }>;
  statusTextOverride?: string;
  pathKey?: string;
  isDemo?: boolean;
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Define static learning paths
const STATIC_LEARNING_PATHS: LearningPath[] = [
  {
    id: 'bitcoin-solana-path',
    title: 'Bitcoin on Solana with Zeus Network',
    shortTitle: 'Bitcoin on Solana',
    description: "Become Satoshi Nakamoto on Solana through Zeus Network! Learn to build dApps using zBTC, the Solana native Bitcoin.",
    questCount: 7,
    difficulty: 'Intermediate',
    pathSlug: 'bitcoin-solana',
    totalXp: 2450,
    isLocked: false,
    graphicType: 'image',
    imageUrl: '/zeusnetwork.ico',
    logoUrl: '/zeusnetwork.ico',
    bonusPoints: 2000,
    userCount: '2K+',
    isPathCompleted: false,
    currentProgress: 0,
    rewardTags: [{ text: '+2450 zBTC XP', variant: 'points' }, { text: '0.05 zBTC Prize Pool', variant: 'ethereum' }],
    statusTextOverride: 'Become Satoshi on Solana!',
    pathKey: 'bitcoinSolana',
    isDemo: true
  },
  {
    id: 'layerzero-path',
    title: 'LayerZero V2 Omnichain Path',
    shortTitle: 'LayerZero V2',
    description: 'Master omnichain development! Learn to send messages, tokens, and build innovative cross-chain solutions on Solana using LayerZero V2.',
    questCount: 7,
    difficulty: 'Advanced',
    pathSlug: 'layerzero',
    totalXp: 2500,
    isLocked: false,
    graphicType: 'image',
    imageUrl: '/layerzero.jpg',
    logoUrl: '/layerzero.ico',
    bonusPoints: 1500,
    userCount: '5K',
    isPathCompleted: false,
    currentProgress: 0,
    rewardTags: [{ text: '+2500 LZ XP', variant: 'points' }, { text: 'Omnichain Dev', variant: 'generic' }],
    statusTextOverride: 'Become an Omnichain Pro!',
    pathKey: 'layerZero',
    isDemo: true
  },
  {
    id: 'substreams-path',
    title: 'The Graph Substreams on Solana',
    shortTitle: 'Substreams',
    description: 'Learn to index blockchain data with The Graph Substreams. Build powerful and efficient data pipelines for Solana dApps.',
    questCount: 9,
    difficulty: 'Intermediate',
    pathSlug: 'substreams',
    totalXp: 2150,
    isLocked: false,
    graphicType: 'image',
    imageUrl: '/substreams.svg',
    logoUrl: '/the-graph-grt-logo.svg',
    bonusPoints: 1800,
    userCount: '2K',
    isPathCompleted: false,
    currentProgress: 0,
    rewardTags: [{ text: '+2150 XP', variant: 'points' }, { text: 'Hackathon Ready', variant: 'generic' }],
    statusTextOverride: 'Prepare for Hackathon!',
    pathKey: 'substreams',
    isDemo: true
  },
  {
    id: 'solana-foundations',
    title: 'Solana Explorer Path',
    shortTitle: 'Solana Explorer',
    description: "Dive deep into Solana's core concepts, learn to navigate the ecosystem, and complete foundational quests, starting with community engagement.",
    questCount: 3,
    difficulty: 'Beginner',
    pathSlug: 'solana-foundations',
    totalXp: 500,
    isLocked: false,
    graphicType: 'image',
    imageUrl: '/solana-logo.svg',
    logoUrl: '/solana-logo.svg',
    bonusPoints: 100,
    userCount: '25K',
    isPathCompleted: false,
    currentProgress: 0,
    rewardTags: [
      { text: '+0.1 SOL (Bonus)', variant: 'ethereum' }, 
      { text: '+500 XP', variant: 'points' },
      { text: 'OG NFT Reward', variant: 'generic' }
    ],
    statusTextOverride: 'Production Ready',
    pathKey: 'solanaExplorer',
    isDemo: false
  },
  {
    id: 'zk-compression-path',
    title: 'ZK Compression Developer Path',
    shortTitle: 'ZK Compression',
    description: "Master ZK Compression on Solana! Learn to build scalable dApps with compressed NFTs, tokens, and state - essential skills for the 1000x Hackathon.",
    questCount: 8,
    difficulty: 'Advanced',
    pathSlug: 'zk-compression',
    totalXp: 2200,
    isLocked: false,
    graphicType: 'image',
    imageUrl: '/zk-compression.svg',
    logoUrl: '/zk-compression.svg',
    bonusPoints: 1800,
    userCount: '10K+',
    isPathCompleted: false,
    currentProgress: 0,
    rewardTags: [{ text: '+2200 ZK XP', variant: 'points' }, { text: '1000x Hackathon Ready', variant: 'generic' }],
    statusTextOverride: 'Become a ZK Compression Pro!',
    pathKey: 'zkCompression',
    isDemo: true
  },
  {
    id: 'wormhole-path',
    title: 'Wormhole Multichain Path',
    shortTitle: 'Wormhole',
    description: 'Master multichain development! Learn to build cross-chain dApps and transfer assets using Wormhole.',
    questCount: 6,
    difficulty: 'Advanced',
    pathSlug: 'wormhole',
    totalXp: 2000,
    isLocked: false,
    graphicType: 'image',
    imageUrl: '/wormhole-logo.svg',
    logoUrl: '/wormhole-logo.svg',
    bonusPoints: 1500,
    userCount: '1K+',
    isPathCompleted: false,
    currentProgress: 0,
    rewardTags: [{ text: '+2000 WH XP', variant: 'points' }, { text: 'Multichain Dev', variant: 'generic' }],
    statusTextOverride: 'Become a Multichain Pro!',
    pathKey: 'wormhole',
    isDemo: true
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

// Modify the renderLearningPath function to display project logos
const renderLearningPath = (path: LearningPath) => {
  const isDemo = path.isDemo;
  const isNew = path.id === 'solana-foundations'; // Highlighting the Solana Explorer path
  const isProduction = !path.isDemo;

  return (
    <div key={path.id} className={`bg-dark-card/80 rounded-2xl overflow-hidden border ${isProduction ? 'border-purple-500/30 hover:border-purple-500/70' : 'border-white/5 hover:border-purple-500/30'} transition-all duration-300 shadow-xl hover:shadow-purple-500/20`}>
      <div className="relative">
        {path.logoUrl && (
          <div className="absolute top-4 left-4 z-10">
            <div className={`w-16 h-16 rounded-full ${isProduction ? 'bg-white/20 backdrop-blur-md shadow-lg shadow-purple-500/20' : 'bg-white/10 backdrop-blur-md'} p-1.5 flex items-center justify-center border ${isProduction ? 'border-purple-500/30' : 'border-white/20'}`}>
              <Image 
                src={path.logoUrl} 
                alt={path.title} 
                width={48} 
                height={48}
                className={`object-contain ${isProduction ? 'drop-shadow-glow' : ''}`}
              />
            </div>
          </div>
        )}
        
        {/* Demo Badge */}
        {isDemo && (
          <div className="absolute top-4 right-4 z-10 px-2.5 py-1 text-xs font-bold bg-amber-500 text-black rounded-md shadow-lg">
            DEMO
          </div>
        )}
        
        {/* Production Badge */}
        {isProduction && (
          <div className="absolute top-4 right-4 z-10 px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-md shadow-lg">
            PRODUCTION
          </div>
        )}

        <div className={`h-48 ${isProduction ? 'bg-gradient-to-br from-purple-700/80 to-blue-700/80' : 'bg-gradient-to-br from-purple-900/60 to-blue-900/60'} flex items-center justify-center p-6 relative overflow-hidden`}>
          <div className={`absolute inset-0 ${isProduction ? 'bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),rgba(59,130,246,0.05))]' : 'bg-gradient-to-br from-purple-500/10 to-blue-500/10'} z-0`}></div>
          
          {isProduction && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-purple-500/10 animate-pulse-slow"></div>
            </div>
          )}
          
          <span className={`text-2xl font-bold ${isProduction ? 'text-white' : 'text-white/90'} z-10 text-center drop-shadow-md`}>{path.shortTitle}</span>
        </div>
      </div>
      
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-2">{path.title}</h2>
        <p className="text-gray-400 text-sm mb-4 h-12 line-clamp-2">{path.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {path.rewardTags?.map((tag, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1
                ${tag.variant === 'ethereum' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                tag.variant === 'points' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`
              }
            >
              {tag.icon && (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d={tag.icon} />
                </svg>
              )}
              {tag.text}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="text-xs text-gray-400">
              <span className={`${isProduction ? 'text-yellow-300' : 'text-white'} font-semibold`}>{path.questCount}</span> Quests
            </div>
            <div className="text-xs text-gray-400">
              <span className={`${isProduction ? 'text-yellow-300' : 'text-white'} font-semibold`}>{path.userCount}</span> Users
            </div>
          </div>
          <Link href={`/paths/${path.pathSlug}`}>
            <button className={`px-4 py-2 ${isProduction ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-md shadow-purple-700/20' : 'bg-gradient-to-r from-blue-500 to-purple-600'} text-white text-sm rounded-md font-medium flex items-center gap-1 hover:opacity-90 transition-opacity`}>
              Start Learning <ArrowRightIcon className="w-3 h-3 ml-1" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();

  const { 
    userProfile, 
    isLoading: isLoadingAuth,
    isAuthenticated, 
    login,
    logout,
    error: authError
  } = useAuth();

  const [featuredPaths, setFeaturedPaths] = useState<LearningPath[]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(false);
  const [pathError, setPathError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [topPlayers, setTopPlayers] = useState<LeaderboardUser[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [productionPaths, setProductionPaths] = useState<LearningPath[]>([]);
  const [demoPaths, setDemoPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Use the static paths instead of fetching from API
    if (isMounted) {
      setFeaturedPaths(STATIC_LEARNING_PATHS);
      setProductionPaths(STATIC_LEARNING_PATHS.filter(path => !path.isDemo));
      setDemoPaths(STATIC_LEARNING_PATHS.filter(path => path.isDemo));
      setIsLoadingPaths(false);
    }
  }, [isMounted]);

  // Fetch top players for leaderboard
  useEffect(() => {
    const fetchTopPlayers = async () => {
      setIsLoadingLeaderboard(true);
      setLeaderboardError(null);
      try {
        // Make a real API call to get leaderboard data instead of using mock data
        const response = await fetch(`${BACKEND_URL}/api/users?path=leaderboard&limit=3`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch leaderboard data');
        }
        
        const leaderboardData = await response.json();
        setTopPlayers(leaderboardData);
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

  const refreshLeaderboard = async () => {
    setIsRefreshing(true);
    setLeaderboardError(null);
    try {
      // Make a real API call to refresh leaderboard data
      const response = await fetch(`${BACKEND_URL}/api/users?path=leaderboard&limit=3`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to refresh leaderboard data');
      }
      
      const leaderboardData = await response.json();
      setTopPlayers(leaderboardData);
    } catch (error: any) {
      console.error('Error refreshing leaderboard:', error);
      setLeaderboardError(error.message || 'Failed to refresh leaderboard data');
    } finally {
      setIsRefreshing(false);
    }
  };

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
        <div className="md:col-span-3 bg-gray-800/20 rounded-xl overflow-visible shadow-xl pb-12">
          <OGNftCardDynamic />
        </div>
        
        {/* Leaderboard (2/5 width on md screens, reduced from 3/5) */}
        <div className="md:col-span-2 bg-gray-800/20 border border-gray-700/50 p-3 rounded-xl shadow-xl max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-100 flex items-center gap-1.5">
              <TrophyIcon className="w-4 h-4 text-yellow-400" />
              Leaderboard
            </h2>
            <button 
              onClick={refreshLeaderboard}
              disabled={isRefreshing}
              className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh Leaderboard"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {isLoadingLeaderboard ? (
            <div className="space-y-1.5 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-md">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 bg-gray-600 rounded-md"></div>
                    <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                    <div className="h-3 w-16 bg-gray-600 rounded"></div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="h-3 w-8 bg-gray-600 rounded"></div>
                    <div className="h-3 w-12 bg-gray-600 rounded-md"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : leaderboardError ? (
            <p className="text-red-400 text-xs text-center py-2">Error: {leaderboardError}</p>
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
                    className={`flex items-center justify-between p-2 ${gradientBg} hover:bg-gray-700/40 transition-colors duration-150 rounded-lg`}
                  >
                    <div className="flex items-center space-x-1.5 flex-grow min-w-0">
                      <span className={`flex-shrink-0 w-4 h-4 flex items-center justify-center text-xs font-bold rounded-md ${rankClasses}`}>
                        {rank}
                      </span>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                        {player.username ? player.username.charAt(0).toUpperCase() : truncatedAddress.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-100 truncate">
                          {player.username || truncatedAddress}
                        </p>
                        {player.username && (
                          <p className="text-[10px] text-gray-400 font-mono truncate">
                            {truncatedAddress}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      {/* Boost Badges */}
                      {(player.xpBoost && player.xpBoost > 1) && (
                        <span className="flex items-center text-[10px] font-semibold bg-black/50 text-purple-300 px-1 py-0.5 rounded border border-purple-500/50" title={`XP Boost x${player.xpBoost.toFixed(1)}`}>
                          <SparklesIcon className="h-2.5 w-2.5 mr-0.5"/> x{player.xpBoost.toFixed(1)}
                        </span>
                      )}
                      {/* Score (XP) */}
                      <div className="bg-gradient-to-r from-purple-600/70 to-blue-600/70 text-white px-1.5 py-0.5 rounded text-center min-w-[40px]">
                        <span className="text-[10px] font-bold">
                          {player.xp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-xs italic text-center py-3">Be the first on the leaderboard!</p>
          )}
        </div>
      </div>

      {/* Learning Paths Section */}
      {/* Production Paths Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-purple-400" />
            Our fully ready and production learning paths
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productionPaths.map(path => renderLearningPath(path))}
          </div>
        </div>
      </section>

      {/* Demo Paths Section */}
      <section className="mb-8">
        <div className="mb-6 flex items-center">
          <h2 className="text-3xl font-bold mb-0 text-white mr-3">Demo Paths</h2>
          <span className="px-2 py-1 bg-amber-700/50 text-amber-400 text-xs font-medium uppercase rounded-md tracking-wide">Demo</span>
        </div>
        <p className="text-gray-400 mb-6">Explore our upcoming learning paths in development</p>
        
        {isLoadingPaths ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2 w-full"></div>
                <div className="h-4 bg-gray-700 rounded mb-2 w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded mb-4 w-4/6"></div>
                <div className="h-10 bg-gray-700 rounded w-full mt-6"></div>
              </div>
            ))}
          </div>
        ) : pathError ? (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg">
            <p>Failed to load learning paths: {pathError}</p>
          </div>
        ) : demoPaths.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoPaths.map((path) => (
              <div key={path.id} className="bg-slate-800/70 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500 border border-transparent transition-all duration-200 shadow-lg hover:shadow-amber-500/30 relative">
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-700/60 text-amber-300 text-xs font-medium uppercase rounded tracking-wide">
                  Demo
                </div>
                <div> {/* Top content area */} 
                  <div className="flex items-start mb-3">
                    <div className="w-10 h-10 rounded-lg mr-3 overflow-hidden relative border border-slate-700">
                      <Image
                        src={path.logoUrl || path.imageUrl || '/images/paths/default.png'}
                        alt={`${path.shortTitle || path.title} logo`}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-gray-100 font-semibold text-base leading-tight">{path.shortTitle || path.title}</h3>
                    </div>
                    <Link href={`/paths/${path.pathSlug}`} className="ml-2 flex-shrink-0">
                      <ExternalLinkIcon className="w-5 h-5 text-gray-500 hover:text-amber-400 transition-colors" />
                    </Link>
                  </div>

                  {path.rewardTags && path.rewardTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {path.rewardTags.map((tag, index) => (
                        <span 
                          key={index} 
                          className={`text-xs px-2 py-0.5 rounded-full font-medium 
                            ${tag.variant === 'ethereum' ? 'bg-green-500/20 text-green-300' : 
                              tag.variant === 'points' ? 'bg-purple-500/20 text-purple-300' : 
                              'bg-slate-600/50 text-slate-300'}
                          `}
                        >
                          {tag.text}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>{path.questCount} Quests</span>
                    {path.bonusPoints && <span>{path.bonusPoints.toLocaleString()} Bonus PTS</span>}
                    {path.userCount && <span>{path.userCount} Users</span>}
                  </div>

                  {/* Progress/Status Section */}
                  <div className="text-xs mt-2 mb-3 h-8"> {/* Fixed height for this section */} 
                    {path.isPathCompleted ? (
                      <div className="flex items-center text-green-400">
                        <CheckCircleSolidIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span>All quests completed</span>
                      </div>
                    ) : path.currentProgress !== undefined && path.questCount > 0 ? (
                      <div>
                        <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                          <div 
                            className="bg-amber-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(path.currentProgress / path.questCount) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-400">
                          {path.statusTextOverride ? path.statusTextOverride : `${path.currentProgress}/${path.questCount} quests completed`}
                        </span>
                      </div>
                    ) : path.statusTextOverride ? (
                       <span className="text-slate-400 italic">{path.statusTextOverride}</span>
                    ) : null}
                  </div>
                </div>

                {/* Action Button - Pushed to bottom */} 
                <Link 
                  href={`/paths/${path.pathSlug}`}
                  className="mt-auto block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                >
                  {path.isPathCompleted ? 'View Path' : (path.currentProgress && path.currentProgress > 0 ? 'Continue Path' : 'Start Learning')}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No demo paths are currently available. Check back soon!</p>
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