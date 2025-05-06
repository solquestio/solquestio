'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the WalletMultiButton with no SSR
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  {
    ssr: false,
    loading: () => <button className="px-4 py-2 h-10 bg-gray-600 rounded-md animate-pulse">Loading Wallet...</button>
  }
);

export function HeaderWalletButton() {
    // Apply the same styling we wanted in the layout
    return (
        <WalletMultiButtonDynamic className="!bg-gradient-to-r from-sol-gradient-from to-sol-gradient-to hover:opacity-90 transition-opacity !rounded-md !h-10" />
    );
} 