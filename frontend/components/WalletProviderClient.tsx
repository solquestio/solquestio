'use client';

import { FC, ReactNode } from 'react';
import { WalletProvider } from './WalletProvider';

interface WalletProviderClientProps {
  children: ReactNode;
}

// This component ensures WalletProvider and its children are rendered client-side.
export const WalletProviderClient: FC<WalletProviderClientProps> = ({ children }) => {
  return <WalletProvider>{children}</WalletProvider>;
}; 