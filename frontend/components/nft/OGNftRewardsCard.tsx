import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './OGNftCard.module.css';

const OGNftCardDynamic = dynamic(
  () => import('@/components/nft/OGNftCard'),
  { ssr: false, loading: () => <div className="bg-gray-800/50 rounded-lg h-64 animate-pulse"></div> }
);

const OGNftRewardsCard: React.FC = () => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-indigo-500/20">
      <div className="p-8 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Unleash the Power <br />
              of <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">SolQuest OG</span>
            </h2>
            
            <div className="space-y-4 mb-8">
              {/* SOL Bonus */}
              <div className="flex items-center gap-4 bg-gray-800/60 p-3 rounded-lg border border-indigo-500/30">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                    <path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.75 6.75 0 01-3.75-6.009 6.75 6.75 0 013.75-6.009v4.661c0 .326.277.585.6.544.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z" />
                    <path fillRule="evenodd" d="M9.75 10.5a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75h-1.5zm3.75 1.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">+10%</span>
                    <span className="text-xs text-indigo-300">SOLANA bonus</span>
                  </div>
                  <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
                    <div className="h-full w-[10%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* XP Boost */}
              <div className="flex items-center gap-4 bg-gray-800/60 p-3 rounded-lg border border-indigo-500/30">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clipRule="evenodd" />
                    <path d="M5.26 17.242a.75.75 0 10-.897-1.203 5.243 5.243 0 00-2.05 5.022.75.75 0 00.625.627 5.243 5.243 0 005.022-2.051.75.75 0 10-1.202-.897 3.744 3.744 0 01-3.008 1.51c0-1.23.592-2.323 1.51-3.008z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">+10%</span>
                    <span className="text-xs text-yellow-300">XP boost</span>
                  </div>
                  <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
                    <div className="h-full w-[10%] bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Exclusive Content */}
              <div className="flex items-center gap-4 bg-gray-800/60 p-3 rounded-lg border border-indigo-500/30">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-white font-medium block">Exclusive Rewards</span>
                  <span className="text-xs text-gray-400">Early access to new features and quests</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-start">
              <Link href="/claim-og-nft" className="inline-block">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                  Mint OG NFT
                </button>
              </Link>
            </div>
            
            <p className="text-xs text-gray-400 mt-4">
              Available for a limited time. One OG NFT per wallet.
            </p>
          </div>
          
          <div className="flex justify-center items-center">
            <div className="transform hover:scale-105 transition-all duration-500 p-3 rounded-2xl">
              <OGNftCardDynamic />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OGNftRewardsCard; 