'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useWallet, WalletNotSelectedError } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { SparklesIcon, TrophyIcon, UserCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image'; // For NFT image
import { AuthPromptModal } from '@/components/AuthPromptModal';
import bs58 from 'bs58';
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
// Hardcode API URL temporarily for testing
const BACKEND_URL = 'https://api.solquest.io';
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
          layout="fill"
          objectFit="cover"
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

// Stat Card Component
const StatCard = ({ icon, value, label }: { icon: string, value: string, label: string }) => {
  return (
    <div className="stat-card">
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-3">{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold solana-gradient-text">{value}</div>
    </div>
  );
};

// --- Main Homepage Component --- 
export default function LandingPage() {
    return (
        <main className="min-h-screen">
            {/* Hero Section with Web3 Background */}
            <section className="relative pt-20 pb-32 overflow-hidden web3-grid">
                <BlockchainNodes />
                <div className="hero-gradient absolute inset-0" />
                <div className="container mx-auto px-4 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="mb-6 flex justify-center">
                            <div className="relative w-16 h-16 mb-4">
                                <Image 
                                    src="/solana-logo.png" 
                                    alt="Solana Logo"
                                    width={64}
                                    height={64}
                                    className="token-float"
                                />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="solana-gradient-text">SolQuest.io</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8">
                            Your interactive quest-based learning platform for the Solana ecosystem.
                            <br />
                            <span className="text-indigo-400 font-semibold">Coming Soon!</span>
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="https://twitter.com/solquestio"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors glow-button"
                            >
                                Follow on Twitter
                            </a>
                            <a
                                href="mailto:hello@solquest.io"
                                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-900/80">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard icon="🔍" value="3+" label="Learning Paths" />
                        <StatCard icon="🧩" value="20+" label="Interactive Quests" />
                        <StatCard icon="🏆" value="1000+" label="XP per Path" />
                        <StatCard icon="💰" value="$SOL" label="Rewards" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-900/50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        <span className="solana-gradient-text">Features Coming Soon</span>
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card glow-effect">
                                <div className="text-2xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Learning Paths Preview */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
                </div>
                <div className="container mx-auto px-4 relative">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
                        <span className="gradient-text">Learning Paths</span>
                    </h2>
                    <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
                        Explore our interactive learning paths designed to take you from beginner to expert in the Solana ecosystem.
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
                            <div className="h-40 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 flex items-center justify-center">
                                <Image src="/layerzero.jpg" alt="LayerZero" width={120} height={120} className="rounded-lg" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">LayerZero Path</h3>
                                <p className="text-gray-400 text-sm mb-4">Master omnichain interactions with LayerZero V2. Send messages and tokens across blockchains.</p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">3 Quests</span>
                                    <span className="text-yellow-400">1500 XP</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
                            <div className="h-40 bg-gradient-to-r from-green-900/80 to-blue-900/80 flex items-center justify-center">
                                <Image src="/solana_v2_2b.jpg" alt="Solana Explorer" width={120} height={120} className="rounded-lg" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">Solana Explorer Path</h3>
                                <p className="text-gray-400 text-sm mb-4">Dive deep into Solana's core concepts and learn to navigate the ecosystem.</p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">7 Quests</span>
                                    <span className="text-yellow-400">1650 XP</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
                            <div className="h-40 bg-gradient-to-r from-blue-900/80 to-cyan-900/80 flex items-center justify-center">
                                <Image src="/zk-compression.jpg" alt="ZK Compression" width={120} height={120} className="rounded-lg" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2">ZK Compression Path</h3>
                                <p className="text-gray-400 text-sm mb-4">Build scalable, private, and secure applications using compressed tokens and accounts.</p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">7 Quests</span>
                                    <span className="text-yellow-400">1000 XP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NFT Showcase */}
            <section className="py-20 bg-gray-900/70">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
                        <span className="gradient-text">Exclusive NFT Rewards</span>
                    </h2>
                    <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
                        Complete quests and earn exclusive NFTs that provide special benefits in the SolQuest ecosystem.
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <NFTCard 
                            image="/placeholder-nft.png"
                            title="SolQuest OG Pass"
                            description="Early adopter NFT with exclusive XP boosts and special community perks."
                        />
                        <NFTCard 
                            image="/placeholder-nft.png"
                            title="Path Completion Badge"
                            description="Showcase your achievements and expertise in specific Solana domains."
                        />
                        <NFTCard 
                            image="/placeholder-nft.png"
                            title="Quest Master Collection"
                            description="Rare NFTs for users who complete all quests with perfect scores."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                        <span className="solana-gradient-text">How SolQuest Works</span>
                    </h2>
                    
                    <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">1</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
                            <p className="text-gray-400 text-sm">Connect your Solana wallet to get started on your learning journey.</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">2</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Choose a Path</h3>
                            <p className="text-gray-400 text-sm">Select from various learning paths based on your interests.</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">3</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Complete Quests</h3>
                            <p className="text-gray-400 text-sm">Follow interactive tutorials and complete on-chain verification tasks.</p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">4</span>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Earn Rewards</h3>
                            <p className="text-gray-400 text-sm">Gain XP, climb the leaderboard, and earn exclusive NFT rewards.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-gray-900 to-indigo-900/50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Start Your Solana Journey?
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join our community and be the first to know when we launch.
                        Follow us on Twitter for updates and early access opportunities.
                    </p>
                    <a
                        href="https://twitter.com/solquestio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-lg transition-colors glow-button"
                    >
                        Follow for Updates
                    </a>
                    
                    <div className="mt-12 flex flex-wrap justify-center gap-8">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">📱</span>
                            <span className="text-gray-300">Mobile Friendly</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🔒</span>
                            <span className="text-gray-300">Secure & Non-Custodial</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🌐</span>
                            <span className="text-gray-300">Web3 Native</span>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Footer */}
            <footer className="py-8 bg-gray-900 border-t border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-bold solana-gradient-text">SolQuest.io</h3>
                            <p className="text-sm text-gray-500">Embark on your Solana Adventure</p>
                        </div>
                        <div className="flex gap-4">
                            <a href="https://twitter.com/solquestio" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                Twitter
                            </a>
                            <a href="https://discord.gg/solquest" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                Discord
                            </a>
                            <a href="mailto:hello@solquest.io" className="text-gray-400 hover:text-white">
                                Contact
                            </a>
                        </div>
                    </div>
                    <div className="mt-6 text-center text-xs text-gray-600">
                        &copy; {new Date().getFullYear()} SolQuest.io. All rights reserved.
                    </div>
                </div>
            </footer>
        </main>
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