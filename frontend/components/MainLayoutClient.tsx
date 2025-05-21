'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { HeaderWalletButton } from '@/components/HeaderWalletButton';
import { AuthPromptModal } from '@/components/AuthPromptModal';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '@/context/AuthContext';
import NetworkSwitcher, { NetworkProvider, useNetwork } from '@/components/NetworkSwitcher';
import NetworkBadge from '@/components/NetworkBadge';

interface MainLayoutClientProps {
    children: React.ReactNode;
}

function MainLayoutClientInner({ children }: MainLayoutClientProps) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    const { setVisible: setWalletModalVisible } = useWalletModal();
    const { connected } = useWallet();
    const { isAuthenticated, isLoading, login, logout } = useAuth();
    const { network } = useNetwork();

    const handleRequestAuthentication = async () => {
        if (!connected) {
            setWalletModalVisible(true);
            return;
        }
        
        // Use the login function from AuthContext
        await login();
        
        // Close the modal if authentication was successful
        if (isAuthenticated) {
            setIsAuthModalOpen(false);
        }
    };

    const openLoginModal = () => {
        setIsAuthModalOpen(true);
    };

    return (
        <div className="relative z-10 flex flex-col min-h-screen">
            <header className="py-4 px-6 bg-dark-card/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-20">
              <nav className="flex justify-between items-center max-w-6xl mx-auto">
                <Link href="/" className="flex items-center">
                  <Logo iconHeight={40}/>
                </Link>
                <div className="flex items-center space-x-6">
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
                  {isAuthenticated ? (
                    <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</Link>
                  ) : (
                    <button onClick={openLoginModal} className="text-gray-300 hover:text-white transition-colors">Login</button>
                  )}
                  <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">Leaderboard</Link>
                  <Link 
                    href="/claim-og-nft" 
                    className="text-purple-300 hover:text-purple-200 transition-colors font-medium"
                  >
                    OG NFT
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-600 text-white rounded-full">NEW</span>
                  </Link>
                  <NetworkBadge />
                  <HeaderWalletButton />
                  {isAuthenticated && (
                    <button 
                      onClick={logout}
                      className="text-sm text-red-400 hover:text-red-300"
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
