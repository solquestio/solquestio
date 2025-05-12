import React from 'react';
import './globals.css'
import { WalletProviderClient } from '@/components/WalletProviderClient'
import { Inter } from "next/font/google";
import '@solana/wallet-adapter-react-ui/styles.css';
import 'react-loading-skeleton/dist/skeleton.css'
import AnimatedBackground from '@/components/background/AnimatedBackground'

const inter = Inter({ subsets: ["latin"] });

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className + " min-h-screen bg-dark text-white"}>
        {/* Shared Backgrounds */}
        <div className="fixed inset-0 bg-gradient-radial from-dark-lighter to-dark -z-10" />
        <div className="fixed inset-0 opacity-30 -z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-solana-purple/20 to-solana-green/20 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(78,70,229,0.1),transparent)]" />
        </div>
        {/* Minimal Providers Needed for Landing */}
        <WalletProviderClient> 
          <AnimatedBackground />
          {/* Render children directly without MainLayoutClient */}
          {children}
        </WalletProviderClient>
      </body>
    </html>
  );
} 