'use client';

import { FC, ReactNode } from 'react';
import { WalletProvider } from './WalletProvider';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Import the CSS for the modal
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletProviderClientProps {
  children: ReactNode;
}

// This component ensures WalletProvider and its children are rendered client-side.
export const WalletProviderClient: FC<WalletProviderClientProps> = ({ children }) => {
  return (
    <WalletProvider>
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
}; 