'use client';

import React, { FC, ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { 
  RPC_ENDPOINTS, 
  FALLBACK_RPC_ENDPOINTS,
  DEFAULT_NETWORK,
  mapNetworkType
} from '@/utils/networkConfig';
// You can import specific wallet adapters here if you want to pre-load them
// e.g., import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Import the CSS for the modal
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletProviderClientProps {
  children: ReactNode;
}

// Use a global variable to track if wallet was already connected
// This helps prevent reconnection prompts when switching networks
let walletWasConnected = false;

// Create a context for network switching
export const NetworkContext = React.createContext<{
  network: WalletAdapterNetwork;
  setNetwork: (network: WalletAdapterNetwork) => void;
  isMainnet: boolean;
  toggleNetwork: () => void;
  tryFallbackEndpoint: (currentEndpoint: string, networkKey: string) => string;
}>({
  network: WalletAdapterNetwork.Mainnet,
  setNetwork: () => {},
  isMainnet: true,
  toggleNetwork: () => {},
  tryFallbackEndpoint: () => '',
});

// This component ensures WalletProvider and its children are rendered client-side.
export const WalletProviderClient: FC<WalletProviderClientProps> = ({ children }) => {
  // Create state for network
  const [network, setNetwork] = useState<WalletAdapterNetwork>(WalletAdapterNetwork.Mainnet);
  
  // State to track custom fallback endpoint
  const [customFallbackEndpoint, setCustomFallbackEndpoint] = useState<string | null>(null);
  
  // Load network from localStorage on initial mount
  useEffect(() => {
    const savedNetwork = localStorage.getItem('solana-network');
    if (savedNetwork === 'devnet') {
      setNetwork(WalletAdapterNetwork.Devnet);
    }
    
    // Check if we have a saved fallback endpoint
    const fallbackEndpoint = localStorage.getItem('fallback-rpc-endpoint');
    if (fallbackEndpoint) {
      console.log(`Loading saved fallback RPC endpoint: ${fallbackEndpoint}`);
      setCustomFallbackEndpoint(fallbackEndpoint);
    }
  }, []);

  // Listen for RPC fallback events
  useEffect(() => {
    const handleRpcFallback = () => {
      const fallbackEndpoint = localStorage.getItem('fallback-rpc-endpoint');
      if (fallbackEndpoint) {
        console.log(`Switching to fallback RPC endpoint: ${fallbackEndpoint}`);
        setCustomFallbackEndpoint(fallbackEndpoint);
      }
    };
    
    window.addEventListener('wallet-rpc-fallback', handleRpcFallback);
    
    return () => {
      window.removeEventListener('wallet-rpc-fallback', handleRpcFallback);
    };
  }, []);
  
  // Save network to localStorage when it changes
  useEffect(() => {
    // Skip on first render
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('solana-network', network);
    console.log(`Network switched to: ${network}`);
    
    // Add a slight delay before triggering reconnect to allow wallet adapter to update
    const reconnectTimeout = setTimeout(() => {
      // If wallet was previously connected, dispatch a custom event to trigger auto-reconnect
      const wasConnected = localStorage.getItem('walletConnectionState') === 'connected';
      if (wasConnected) {
        console.log('Attempting to restore wallet connection after network switch');
        // Create and dispatch a custom event that components can listen for
        const reconnectEvent = new CustomEvent('wallet-network-change', { 
          detail: { network } 
        });
        window.dispatchEvent(reconnectEvent);
      }
    }, 500);
    
    return () => clearTimeout(reconnectTimeout);
  }, [network]);
  
  // Toggle between Devnet and Mainnet
  const toggleNetwork = () => {
    // Preserve wallet connection state before switching
    const walletConnectState = localStorage.getItem('walletConnectionState');
    if (walletConnectState === 'connected') {
      walletWasConnected = true;
    }
    
    setNetwork(network === WalletAdapterNetwork.Devnet 
      ? WalletAdapterNetwork.Mainnet 
      : WalletAdapterNetwork.Devnet
    );
  };
  
  // Check if current network is mainnet
  const isMainnet = network === WalletAdapterNetwork.Mainnet;
  
  // Get RPC endpoint for the selected network
  // Use our better RPC endpoint instead of the default one
  const endpoint = useMemo(() => {
    // If we have a custom fallback endpoint, use it
    if (customFallbackEndpoint) {
      console.log(`Using custom fallback RPC endpoint: ${customFallbackEndpoint}`);
      return customFallbackEndpoint;
    }
    
    // Convert WalletAdapterNetwork enum to string key
    const networkKey = network.toString();
    
    // Check if we have Helius available for mainnet
    if (networkKey === 'mainnet-beta' && process.env.NEXT_PUBLIC_HELIUS_RPC_URL) {
      console.log('Using Helius RPC for mainnet connection');
      return process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
    }
    
    // Try to get the better endpoint, fallback to default if not available
    if (RPC_ENDPOINTS[networkKey]) {
      console.log(`Using enhanced RPC endpoint for ${networkKey}: ${RPC_ENDPOINTS[networkKey]}`);
      return RPC_ENDPOINTS[networkKey];
    }
    
    // Default fallback
    console.log(`Using default RPC endpoint for ${networkKey}`);
    return clusterApiUrl(network);
  }, [network, customFallbackEndpoint]);

  // When an RPC endpoint fails, this function can be called to try the next fallback
  const tryFallbackEndpoint = useCallback((currentEndpoint: string, networkKey: string) => {
    // Find the current index in fallbacks
    const fallbacks = FALLBACK_RPC_ENDPOINTS[networkKey] || [];
    const currentIndex = fallbacks.indexOf(currentEndpoint);
    
    // If there's a next fallback, use it
    if (currentIndex < fallbacks.length - 1) {
      const nextEndpoint = fallbacks[currentIndex + 1];
      console.log(`Switching to fallback RPC endpoint: ${nextEndpoint}`);
      return nextEndpoint;
    }
    
    // If we've tried all fallbacks, go back to the first one
    if (fallbacks.length > 0) {
      console.log(`Tried all fallbacks, returning to primary endpoint: ${fallbacks[0]}`);
      return fallbacks[0];
    }
    
    // Last resort - use Solana default
    return clusterApiUrl(network);
  }, [network]);

  // Expose the fallback function via context
  const networkContextValue = useMemo(() => ({
    network,
    setNetwork,
    isMainnet: network === WalletAdapterNetwork.Mainnet,
    toggleNetwork,
    tryFallbackEndpoint
  }), [network, setNetwork, toggleNetwork, tryFallbackEndpoint]);

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
    [network]
  );

  return (
    <NetworkContext.Provider value={networkContextValue}>
      <ConnectionProvider endpoint={endpoint}>
        <SolanaWalletProvider wallets={wallets} autoConnect={true}>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </SolanaWalletProvider>
      </ConnectionProvider>
    </NetworkContext.Provider>
  );
}; 