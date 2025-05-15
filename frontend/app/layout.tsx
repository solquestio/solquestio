import React from 'react';
import './globals.css'
import type { Metadata } from 'next'
import { WalletProviderClient } from '@/components/WalletProviderClient'
import MainLayoutClient from '@/components/MainLayoutClient'
import { Inter } from "next/font/google";
import '@solana/wallet-adapter-react-ui/styles.css';
import 'react-loading-skeleton/dist/skeleton.css'
import AnimatedBackground from '@/components/background/AnimatedBackground'
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SolQuest.io - Interactive Solana Learning Platform',
  description: 'Master Solana through interactive quests, earn XP, and join a vibrant community of builders. Coming soon!',
  keywords: 'Solana, blockchain, learning, quests, LayerZero, ZK Compression, crypto education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + " min-h-screen bg-dark text-white"}>
        <div className="fixed inset-0 bg-gradient-radial from-dark-lighter to-dark -z-10" />
        <div className="fixed inset-0 opacity-30 -z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-solana-purple/20 to-solana-green/20 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(78,70,229,0.1),transparent)]" />
        </div>
        <WalletProviderClient>
          <AuthProvider>
            <AnimatedBackground />
            <MainLayoutClient>{children}</MainLayoutClient>
          </AuthProvider>
        </WalletProviderClient>
      </body>
    </html>
  )
} 