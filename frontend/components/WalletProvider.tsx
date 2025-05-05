'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import dynamic from 'next/dynamic';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Dynamically import WalletModalProvider to avoid SSR issues
const WalletModalProviderDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletModalProvider,
  { ssr: false }
);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // Using Correct Helius RPC endpoint from screenshots
  const endpoint = 'https://mainnet.helius-rpc.com/?api-key=0abb48db-ebdd-4297-aa63-5f4d79234d9e';
  
  // Initialize wallet adapters
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  // Only render on client-side to avoid hydration errors
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProviderDynamic>
          {children}
        </WalletModalProviderDynamic>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}; 