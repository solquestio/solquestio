'use client';

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

/**
 * Custom hook to handle wallet reconnection across network changes.
 * 
 * This hook listens for network change events and attempts to maintain
 * wallet connection state when switching between Devnet and Mainnet.
 */
export function useWalletReconnect() {
  const { publicKey, connected } = useWallet();
  
  useEffect(() => {
    // Track connection state
    if (connected) {
      localStorage.setItem('walletConnectionState', 'connected');
    }
  }, [connected]);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleNetworkChange = async (event: any) => {
      // If wallet was previously connected, try to reconnect
      if (publicKey && !connected) {
        console.log('Network changed, attempting to reconnect wallet');
        // This forces a state update in wallet components
        window.dispatchEvent(new Event('wallet-adapter-reconnect'));
      }
    };
    
    window.addEventListener('wallet-network-change', handleNetworkChange);
    
    return () => {
      window.removeEventListener('wallet-network-change', handleNetworkChange);
    };
  }, [publicKey, connected]);
} 