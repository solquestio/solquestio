import React from 'react';
import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import { WalletProviderClient } from '@/components/WalletProviderClient'
import { Logo } from '@/components/Logo'
import { HeaderWalletButton } from '@/components/HeaderWalletButton'

export const metadata: Metadata = {
  title: 'SolQuest.io',
  description: 'Quest-based learning platform for Solana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark text-white">
        <div className="fixed inset-0 bg-gradient-radial from-dark-lighter to-dark -z-10" />
        <div className="fixed inset-0 opacity-30 -z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-solana-purple/20 to-solana-green/20 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(78,70,229,0.1),transparent)]" />
        </div>
        <WalletProviderClient>
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
          </div>
        </WalletProviderClient>
      </body>
    </html>
  )
} 