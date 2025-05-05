'use client';

import { WalletProvider } from '../components/WalletProvider';
import { Profile } from '../components/Profile';

export default function Home() {
  return (
    <WalletProvider>
      <main>
        <Profile />
      </main>
    </WalletProvider>
  );
} 