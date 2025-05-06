'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { HeaderWalletButton } from '@/components/HeaderWalletButton';

interface MainLayoutClientProps {
    children: React.ReactNode;
}

export default function MainLayoutClient({ children }: MainLayoutClientProps) {
    return (
        <div className="relative z-10 flex flex-col min-h-screen">
            <header className="py-4 px-6 bg-dark-card/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-20">
              <nav className="flex justify-between items-center max-w-6xl mx-auto">
                <Link href="/" className="flex items-center space-x-2">
                  <Logo />
                  <span className="font-bold text-xl">SolQuest.io</span>
                </Link>
                <div className="flex items-center space-x-6">
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
                  <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</Link>
                  <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">Leaderboard</Link>
                  <HeaderWalletButton />
                </div>
              </nav>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
             {/* Optional: Add a footer here if needed within the client layout */}
        </div>
    );
} 