'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useWallet, WalletNotSelectedError } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { SparklesIcon, TrophyIcon, UserCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image'; // For NFT image
import { AuthPromptModal } from '@/components/AuthPromptModal';
import bs58 from 'bs58';
import LandingLayout from './landing-layout'; // Import the new layout
// import OGNftCard from '@/components/nft/OGNftCard'; // Removed import

// --- Interfaces --- 
interface LearningPath {
    id: string;
    title: string;
    description: string;
    questCount: number;
    isLocked?: boolean;
    totalXp?: number; // Added totalXp
    graphicType?: 'image' | 'gradient' | 'none'; // Made graphicType optional
    imageUrl?: string | null; // Allow null
    pathSlug?: string; // STEP 1.1: Add pathSlug back to the interface
}

interface UserProfile { 
  id: string;
  username?: string;
  xp: number;
}

interface LeaderboardUser {
    _id: string;
    walletAddress: string;
    username?: string;
    xp: number;
    rank?: number; // Optional rank if provided by API or calculated client-side
    xpBoost?: number; // Added xpBoost
    // avatar?: string; // Placeholder for avatar images later
}

// --- Constants --- 
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const AUTH_TOKEN_KEY = 'solquest_auth_token';
const SIGN_IN_MESSAGE = "Sign this message to verify your wallet and log in to SolQuest.io. This does not cost any SOL.";

// STEP 1.2: Define STATIC_LAYER_ZERO_PATH outside the component
const STATIC_LAYER_ZERO_PATH: LearningPath = {
  id: 'layerzero-path',
  title: 'LayerZero Learning Path',
  description: 'Explore omnichain interactions! Start by funding your Devnet wallet, then dive into sending messages and tokens across blockchains with LayerZero V2.',
  questCount: 3, // Example: Faucet + Messenger + OFT
  totalXp: 1500, // Example XP
  pathSlug: 'layerzero', // Links to /paths/layerzero
  isLocked: false,
  graphicType: 'image',
  imageUrl: '/layerzero.jpg' // Adjusted path to be relative to the public directory root
};

const STATIC_SOLANA_FOUNDATIONS_PATH: LearningPath = {
  id: 'solana-foundations',
  title: 'Solana Explorer Path',
  description: "Dive deep into Solana\'s core concepts, learn to navigate the ecosystem, and complete foundational quests, starting with community engagement.",
  questCount: 7,
  totalXp: 1650,
  pathSlug: 'solana-foundations',
  isLocked: false,
  graphicType: 'image',
  imageUrl: '/solana_v2_2b.jpg'
};

const STATIC_ZK_COMPRESSION_PATH: LearningPath = {
  id: 'zk-compression-path',
  title: 'ZK Compression Innovators Path',
  description: "Learn about ZK Compression on Solana. Discover how to build scalable, private, and secure applications using compressed tokens and accounts, as featured in the 1000x Hackathon.",
  questCount: 7, // Updated from 3
  totalXp: 1000, // Updated from 300
  pathSlug: 'zk-compression',
  isLocked: false,
  graphicType: 'image',
  imageUrl: '/zk-compression.jpg' // Placeholder
};

// --- Helper Components --- 

interface LearningPathCardProps {
    title: string;
    description: string;
    isLocked: boolean;
    pathSlug?: string; // Ensure this is present
    totalXp?: number;
    questCount: number;
    isAuthenticated: boolean;
    promptLogin: () => void;
    graphicType?: 'image' | 'gradient' | 'none';
    imageUrl?: string | null;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ title, description, isLocked, pathSlug, totalXp, questCount, isAuthenticated, promptLogin, graphicType = 'none', imageUrl }) => {
    const cardClasses = isLocked
        ? "bg-dark-card-secondary border-gray-700 cursor-not-allowed opacity-60"
        : "bg-dark-card border-gray-800 hover:border-solana-purple transition-all duration-200 ease-in-out transform hover:-translate-y-1 shadow-lg hover:shadow-solana-purple/30";

    const cardContent = (
        <div className={`rounded-xl border ${cardClasses} flex flex-col h-full overflow-hidden`}>
            {/* Graphic Area */}            
            {(graphicType === 'image' && imageUrl) ? (
                <div className="relative h-36 w-full bg-black/20"> 
                    <Image 
                        src={imageUrl} 
                        alt={`${title} graphic`} 
                        layout="fill" 
                        objectFit="cover"
                        className="opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                </div>
            ) : graphicType === 'gradient' ? (
                // Example gradient for Solana Explorer Path
                <div className="h-36 w-full bg-gradient-to-br from-emerald-900/70 via-sky-900/60 to-purple-900/70 flex items-center justify-center">
                    {/* Optional: Add a subtle icon or text here */}
                     <svg className="w-16 h-16 text-sky-300 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> 
                </div>
            ) : (
                 <div className="h-8"></div> // Minimal space if no graphic
            )}

            {/* Content Area */} 
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold mb-2 text-gray-100">{title}</h3>
                <p className="text-gray-400 text-sm mb-4 flex-grow">{description}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-700/50">
                    <div className="text-xs text-gray-500">
                        {questCount} Quests 
                        {totalXp !== undefined && (
                            <span className="ml-2 pl-2 border-l border-gray-600">
                                Up to <span className="font-semibold text-yellow-400">{totalXp} XP</span>
                            </span>
                        )}
                    </div>
                    {isLocked ? (
                        <span className="text-xs text-gray-500 italic">Coming Soon</span>
                    ) : !isAuthenticated ? (
                        <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); promptLogin(); }}
                            className="text-sm font-medium text-solana-green hover:text-solana-green-light flex items-center focus:outline-none"
                        >
                            Login to Start <ArrowRightIcon className="w-4 h-4 ml-1" />
                        </button>
                    ) : (
                        <span className="text-sm font-medium text-solana-purple group-hover:text-solana-purple-light flex items-center">
                            Start Path <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    if (!isLocked && pathSlug && isAuthenticated) {
        return (
            <Link href={`/paths/${pathSlug}`} legacyBehavior={false} className="block group h-full">
                {cardContent}
            </Link>
        );
    } else {
        return <div className="block group h-full">{cardContent}</div>; 
    }
};

interface OgNftShowcaseProps {
    isAuthenticated: boolean;
    promptLogin: () => void;
}

const OgNftShowcase: React.FC<OgNftShowcaseProps> = ({ isAuthenticated, promptLogin }) => {
    const nftName = "SolQuest OG Pass";
    const nftBenefit = "Unlock exclusive XP boosts, early access to new paths, and special community perks.";
    const nftImageUrl = "/placeholder-nft.png"; // Restored placeholder image

    return (
        <div className="relative bg-gradient-to-br from-purple-600/80 via-solana-purple to-solana-green/80 p-8 md:p-12 rounded-xl shadow-2xl overflow-hidden mb-16">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('/grid-pattern.svg')`, backgroundSize: 'cover'}}></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center">
                <div className="md:w-2/3 mb-8 md:mb-0 md:pr-10">
                     <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                        Hold the <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">{nftName}</span>
                    </h2>
                    <p className="text-purple-100 text-lg mb-6">
                        {nftBenefit}
                    </p>
                    {!isAuthenticated ? (
                        <button 
                            onClick={promptLogin}
                            className="inline-block bg-white text-solana-purple font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none"
                        > 
                            Login to Learn More
                        </button>
                    ) : (
                        <Link 
                            href="/mint" // Assuming /mint page might require auth or show different content
                            legacyBehavior={false} 
                            className="inline-block bg-white text-solana-purple font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200"
                        > 
                            Learn More & Mint (Soon)
                        </Link>
                    )}
                </div>
                <div className="md:w-1/3 flex justify-center md:justify-end">
                    {/* Restored placeholder image div */}
                    <div className="w-48 h-48 md:w-60 md:h-60 bg-black/20 rounded-lg shadow-xl flex items-center justify-center overflow-hidden animate-float">
                        <img src={nftImageUrl} alt={nftName} className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity" /> 
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to shorten wallet address (if not already global)
const shortenAddress = (address: string, chars = 4): string => {
    if (!address) return '';
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

// Rank Color/Style Helper (copied from leaderboard page)
const getRankClasses = (rank: number): string => {
    if (rank === 1) return 'bg-yellow-500 text-black';
    if (rank === 2) return 'bg-gray-400 text-black';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-gray-700 text-gray-300';
};

const LeaderboardSnippet: React.FC = () => {
    const [topPlayers, setTopPlayers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopPlayers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BACKEND_URL}/users?path=leaderboard&limit=3`); 
                if (!response.ok) throw new Error('Failed to fetch leaderboard');
                const responseData = await response.json();
                // The backend may return either an array directly or an object with a users/leaderboard property
                let data: LeaderboardUser[] = Array.isArray(responseData) ? responseData : 
                    responseData.users || responseData.leaderboard || [];
                // Ensure limit if backend doesn't support it
                if (data.length > 3 && !response.url.includes('limit=3')) {
                    data = data.slice(0, 3);
                }
                 // Assign rank explicitly if not provided by backend
                 setTopPlayers(data.map((player, index) => ({
                    ...player, 
                    rank: player.rank ?? index + 1 // Use backend rank or calculate
                })));
            } catch (err: any) {
                setError(err.message || 'Could not load top players.');
                console.error("Leaderboard snippet error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopPlayers();
    }, []);

    return (
        <div className="bg-dark-card border border-gray-800/50 p-6 rounded-xl shadow-xl h-full"> {/* Added h-full */} 
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-gray-100 flex items-center">
                    <TrophyIcon className="w-6 h-6 mr-2 text-yellow-400" /> Top Questers
                </h2>
                <Link href="/leaderboard" legacyBehavior={false}
                    className="text-xs text-solana-purple hover:text-solana-purple-light transition-colors font-medium"
                >
                    View All &rarr;
                </Link>
            </div>
            {isLoading && (
                <div className="space-y-2 animate-pulse">
                     {/* Updated Skeleton to match new layout */}
                    {[...Array(3)].map((_, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-dark-card-secondary rounded-md">
                           <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 bg-gray-600 rounded-md"></div> {/* Rank */}
                                <div className="w-8 h-8 bg-gray-600 rounded-full"></div> {/* Avatar */}
                                <div className="h-4 w-24 bg-gray-600 rounded"></div> {/* Name */}
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="h-4 w-12 bg-gray-600 rounded"></div> {/* Boost */}
                                <div className="h-5 w-16 bg-gray-600 rounded-md"></div> {/* Score */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-red-400 text-sm text-center py-4">Error: {error}</p>}
            {!isLoading && !error && topPlayers.length > 0 && (
                 <div className="space-y-1"> {/* Use space-y-1 for tighter rows */} 
                    {topPlayers.map((player, index) => {
                         const rank = player.rank ?? index + 1;
                         const rankClasses = getRankClasses(rank);
                         const truncatedAddress = shortenAddress(player.walletAddress, 4); // Use 4 chars for snippet
                         const gradientBg = rank === 1 ? 'bg-gradient-to-r from-yellow-500/15 to-dark-card-secondary/0' 
                                           : rank === 2 ? 'bg-gradient-to-r from-gray-500/15 to-dark-card-secondary/0'
                                           : rank === 3 ? 'bg-gradient-to-r from-orange-600/15 to-dark-card-secondary/0' 
                                           : 'bg-dark-card-secondary/50';

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
                                    <UserCircleIcon className="flex-shrink-0 w-8 h-8 text-gray-500" /> {/* Placeholder Avatar */}
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
            )}
             {!isLoading && !error && topPlayers.length === 0 && (
                 <p className="text-gray-500 text-sm italic text-center py-6">Be the first on the leaderboard!</p>
            )}
        </div>
    );
};

// Blockchain Node Animation Component
const BlockchainNodes = () => {
  const [nodes, setNodes] = useState<{id: number, x: number, y: number, size: number, delay: number}[]>([]);
  
  useEffect(() => {
    // Create random nodes
    const newNodes = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5
    }));
    setNodes(newNodes);
    
    // Create random blockchain paths
    const createPaths = () => {
      const paths = document.querySelectorAll('.blockchain-path');
      paths.forEach(path => path.remove());
      
      const container = document.querySelector('.blockchain-nodes');
      if (!container) return;
      
      for (let i = 0; i < 5; i++) {
        const path = document.createElement('div');
        path.className = 'blockchain-path';
        path.style.width = `${Math.random() * 30 + 10}%`;
        path.style.top = `${Math.random() * 80 + 10}%`;
        path.style.left = `${Math.random() * 20}%`;
        path.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(path);
      }
    };
    
    createPaths();
    const interval = setInterval(createPaths, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="blockchain-nodes">
      {nodes.map(node => (
        <div 
          key={node.id}
          className="node"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size}px`,
            height: `${node.size}px`,
            animationDelay: `${node.delay}s`
          }}
        />
      ))}
    </div>
  );
};

// NFT Card Component
const NFTCard = ({ image, title, description }: { image: string, title: string, description: string }) => {
  return (
    <div className="nft-card">
      <div className="relative h-48 w-full overflow-hidden">
        <Image 
          src={image} 
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-indigo-400">Exclusive Rewards</span>
          <span className="text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded-full">Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Stat Card Component
const StatCard = ({ icon, value, label, color }: { icon: string, value: string, label: string, color: string }) => {
  return (
    <div className={`stat-card relative overflow-hidden group`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>
      <div className="flex items-center mb-3">
        <div className={`text-3xl mr-4 p-2 rounded-lg ${color} bg-opacity-20 group-hover:bg-opacity-30 transition-all`}>
          {icon}
        </div>
        <span className="text-gray-300 text-sm font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold solana-gradient-text">{value}</div>
    </div>
  );
};

// Example Quest Card Component
const ExampleQuestCard = ({ title, description, difficulty, xpReward, category, icon }: { 
  title: string, 
  description: string, 
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced', 
  xpReward: number,
  category: string,
  icon: string
}) => {
  const difficultyColor = 
    difficulty === 'Beginner' ? 'bg-green-500' : 
    difficulty === 'Intermediate' ? 'bg-yellow-500' : 
    'bg-red-500';
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-indigo-500/30 transition-all duration-300">
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor}`}>{difficulty}</span>
            <span className="text-xs text-gray-400">{category}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="text-yellow-400 font-medium">{xpReward} XP</span>
        <span className="text-indigo-400">Coming Soon</span>
      </div>
    </div>
  );
};

// --- New ARKADA-Inspired PathCard Component ---
interface PathCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  questCount: number;
  totalXp?: number;
  userCount?: string;
  highlightTag?: string;
  gradient?: string;
  onClick?: () => void;
}

const PathCard: React.FC<PathCardProps> = ({
  title,
  description,
  imageUrl,
  questCount,
  totalXp,
  userCount,
  highlightTag,
  gradient = 'from-blue-500 to-purple-500',
  onClick,
}) => (
  <div
    className={`relative rounded-2xl shadow-lg bg-gradient-to-br ${gradient} p-6 flex flex-col justify-between min-h-[220px] cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-2xl`}
    onClick={onClick}
  >
    {/* Highlight Tag */}
    {highlightTag && (
      <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold z-10">
        {highlightTag}
      </div>
    )}
    {/* Top Row: Icon + Title */}
    <div className="flex items-center gap-3 mb-2">
      {imageUrl && (
        <img src={imageUrl} alt="Path Icon" className="w-10 h-10 rounded-full border-2 border-white/30" />
      )}
      <div>
        <h3 className="text-xl font-bold text-white drop-shadow-md">{title}</h3>
        <div className="flex gap-2 mt-1">
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">{questCount} Quests</span>
          {totalXp && (
            <span className="bg-green-400/80 text-xs px-2 py-1 rounded-full">+{totalXp} XP</span>
          )}
        </div>
      </div>
    </div>
    {/* Description */}
    <p className="text-white mt-2 text-sm flex-grow">{description}</p>
    {/* Progress & Stats */}
    <div className="flex items-center justify-between mt-6">
      {userCount && (
        <div className="flex items-center gap-2">
          <span className="text-white text-xs">{userCount}</span>
        </div>
      )}
      <div className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">View Path</div>
    </div>
    {/* Action Icon */}
    <div className="absolute bottom-4 right-4 bg-black/30 rounded-full p-2 hover:bg-black/50 transition">
      <svg width="20" height="20" fill="none"><path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  </div>
);

// --- Refactored Homepage ---
export default function LandingPage() {
  // Example data (replace with real data/fetch as needed)
  const spotlightProjects = [
    {
      title: 'GPT360',
      description: 'Boost your productivity, automate your growth',
      imageUrl: '/gpt360.png',
      questCount: 3,
      totalXp: 1000,
      userCount: '15K Users joined',
      highlightTag: 'TOP1 Staking',
      gradient: 'from-pink-400 to-purple-400',
    },
    {
      title: 'GPT360',
      description: 'Grow the community. Get rewarded.',
      imageUrl: '/gpt360.png',
      questCount: 3,
      totalXp: 1000,
      userCount: '18K Users joined',
      highlightTag: '',
      gradient: 'from-purple-400 to-blue-400',
    },
    {
      title: 'GPT360',
      description: 'Boost your productivity, automate your growth',
      imageUrl: '/gpt360.png',
      questCount: 3,
      totalXp: 1000,
      userCount: '15K Users joined',
      highlightTag: '',
      gradient: 'from-pink-400 to-purple-400',
    },
  ];

  const moreQuests = [
    {
      title: 'SynthSwap',
      description: 'All quests completed',
      imageUrl: '/synthswap.png',
      questCount: 3,
      totalXp: 1200,
      userCount: '15K Users',
      highlightTag: '',
      gradient: 'from-gray-800 to-gray-700',
    },
    // ...add more quests as needed
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-br from-blue-700 via-blue-500 to-purple-700 rounded-b-3xl shadow-xl overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">Explore the SolQuest Ecosystem</h1>
            <p className="text-lg text-blue-100 mb-6 max-w-lg">Choose your path. Complete quests. Earn rewards. Each sector represents a key part of the blockchain's infrastructure—whether it's trading, staking, or social interactions.</p>
            <div className="flex gap-2">
              <button className="bg-white text-blue-700 font-semibold px-5 py-2 rounded-full shadow hover:bg-blue-100 transition">All projects</button>
              <button className="bg-blue-900/40 text-white font-semibold px-5 py-2 rounded-full shadow hover:bg-blue-800/60 transition">Farm</button>
              <button className="bg-blue-900/40 text-white font-semibold px-5 py-2 rounded-full shadow hover:bg-blue-800/60 transition">Social</button>
              <button className="bg-blue-900/40 text-white font-semibold px-5 py-2 rounded-full shadow hover:bg-blue-800/60 transition">DEX</button>
              <button className="bg-blue-900/40 text-white font-semibold px-5 py-2 rounded-full shadow hover:bg-blue-800/60 transition">Staking</button>
              <button className="bg-blue-900/40 text-white font-semibold px-5 py-2 rounded-full shadow hover:bg-blue-800/60 transition">Bridge</button>
            </div>
          </div>
          <img src="/hero-ninja.png" alt="Hero" className="w-80 h-80 object-contain drop-shadow-2xl hidden md:block" />
        </div>
      </section>

      {/* Spotlight Projects */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-6">Spotlight Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {spotlightProjects.map((proj, i) => (
              <PathCard key={i} {...proj} />
            ))}
          </div>
        </div>
      </section>

      {/* Explore More Quests */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-100 mb-6">Explore more quests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {moreQuests.map((quest, i) => (
              <PathCard key={i} {...quest} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
    {
        icon: "🧭",
        title: "Interactive Learning Paths",
        description: "Master Solana through structured quests covering LayerZero, ZK Compression, and more."
    },
    {
        icon: "🏆",
        title: "On-chain Verification",
        description: "Complete quests and earn verifiable XP rewards on the Solana blockchain."
    },
    {
        icon: "🎮",
        title: "Gamified Experience",
        description: "Learn through interactive challenges, achievements, and real-world projects."
    },
    {
        icon: "👥",
        title: "Community Driven",
        description: "Join a vibrant community of learners, builders, and Solana enthusiasts."
    },
    {
        icon: "🔒",
        title: "Secure Authentication",
        description: "Connect your Solana wallet for a seamless, secure learning experience."
    },
    {
        icon: "🚀",
        title: "Devnet & Mainnet",
        description: "Practice on devnet, then apply your skills on mainnet with confidence."
    },
    {
        icon: "🔄",
        title: "Cross-Chain Learning",
        description: "Explore interoperability between Solana and other blockchains."
    },
    {
        icon: "📊",
        title: "Progress Tracking",
        description: "Monitor your learning journey with detailed progress analytics."
    },
    {
        icon: "💎",
        title: "NFT Rewards",
        description: "Earn exclusive NFTs that showcase your achievements and provide benefits."
    }
]; 