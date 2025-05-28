'use client';

import React, { FC, ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Import the CSS for the modal
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletProviderClientProps {
  children: ReactNode;
}

// This component ensures WalletProvider and its children are rendered client-side.
export const WalletProviderClient: FC<WalletProviderClientProps> = ({ children }) => {
  // Always use mainnet - no network switching
  const network = WalletAdapterNetwork.Mainnet;
  
  // Get RPC endpoint for mainnet only
  const endpoint = useMemo(() => {
    // Priority order for mainnet RPC endpoints
    if (process.env.NEXT_PUBLIC_HELIUS_RPC_URL) {
      console.log('Using Helius RPC for mainnet connection');
      return process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
    }
    
    if (process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL) {
      console.log('Using QuickNode RPC for mainnet connection');
      return process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL;
    }
    
    if (process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL) {
      console.log('Using Alchemy RPC for mainnet connection');
      return process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL;
    }
    
    // Fallback to public mainnet RPC
    console.log('Using public mainnet RPC endpoint');
    return 'https://api.mainnet-beta.solana.com';
  }, []);

  // Log the endpoint being used
  useEffect(() => {
    console.log(`[WalletProvider] Using mainnet RPC endpoint: ${endpoint}`);
  }, [endpoint]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/solana-labs/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      // new PhantomWalletAdapter(),
      // new SolflareWalletAdapter({ network }),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}; 