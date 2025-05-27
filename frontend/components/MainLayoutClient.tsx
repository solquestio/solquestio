'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { HeaderWalletButton } from '@/components/HeaderWalletButton';
import { AuthPromptModal } from '@/components/AuthPromptModal';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '@/context/AuthContext';
import NetworkSwitcher, { NetworkProvider, useNetwork } from '@/components/NetworkSwitcher';
import NetworkBadge from '@/components/NetworkBadge';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

interface MainLayoutClientProps {
    children: React.ReactNode;
}

function MainLayoutClientInner({ children }: MainLayoutClientProps) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    const { setVisible: setWalletModalVisible } = useWalletModal();
    const { connected } = useWallet();
    const { isAuthenticated, isLoading, login, logout, userProfile } = useAuth();
    const { network } = useNetwork();

    // Close modal when user successfully authenticates
    useEffect(() => {
        if (isAuthenticated && isAuthModalOpen) {
            console.log('User authenticated, closing modal');
            setIsAuthModalOpen(false);
        }
    }, [isAuthenticated, isAuthModalOpen]);

    const handleRequestAuthentication = async () => {
        if (!connected) {
            setWalletModalVisible(true);
            return;
        }
        
        // Authentication will happen automatically when wallet is connected
        // No need to manually call login() anymore
        setIsAuthModalOpen(false);
    };

    const openLoginModal = () => {
        setIsAuthModalOpen(true);
    };

    return (
        <div className="relative z-10 flex flex-col min-h-screen">
            <header className="py-3 px-6 bg-dark-card/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-20">
              <nav className="flex flex-col lg:flex-row justify-between items-center max-w-6xl mx-auto gap-3">
                {/* Top row: Logo and main navigation */}
                <div className="flex items-center justify-between w-full lg:w-auto">
                  <Link href="/" className="flex items-center">
                    <Logo iconHeight={35}/>
                  </Link>
                  
                  {/* Mobile menu button could go here if needed */}
                </div>
                
                {/* Navigation and user elements */}
                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 lg:gap-4 w-full lg:w-auto">
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">Home</Link>
                  {isAuthenticated ? (
                    <Link href="/profile" className="text-gray-300 hover:text-white transition-colors text-sm">Profile</Link>
                  ) : (
                    <button onClick={openLoginModal} className="text-gray-300 hover:text-white transition-colors text-sm">Login</button>
                  )}
                  <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors text-sm">Leaderboard</Link>
                  <Link 
                    href="/claim-og-nft" 
                    className="text-purple-300 hover:text-purple-200 transition-colors font-medium text-sm"
                  >
                    OG NFT
                    <span className="ml-1 px-1 py-0.5 text-xs bg-purple-600 text-white rounded-full">NEW</span>
                  </Link>
                  <NetworkBadge />
                  
                  {/* Welcome Message and Profile Button for Authenticated Users */}
                  {isAuthenticated && userProfile && (
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-800/50 px-2 py-1 rounded border border-gray-700">
                        <p className="text-xs text-gray-300">Welcome,</p>
                        <p className="text-xs font-semibold text-white">{userProfile?.username || 'Explorer'}</p>
                      </div>
                      <Link 
                        href="/profile" 
                        className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded hover:opacity-90 transition-colors"
                      >
                        Profile <ArrowRightIcon className="h-2.5 w-2.5 ml-1" />
                      </Link>
                    </div>
                  )}
                  
                  <HeaderWalletButton />
                  {isAuthenticated && (
                    <button 
                      onClick={logout}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Logout
                    </button>
                  )}
                </div>
              </nav>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <AuthPromptModal 
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onAuthenticate={handleRequestAuthentication}
                loading={isLoading}
            />
        </div>
    );
}

export default function MainLayoutClient({ children }: MainLayoutClientProps) {
  return (
    <NetworkProvider>
      <MainLayoutClientInner children={children} />
    </NetworkProvider>
  );
} 
