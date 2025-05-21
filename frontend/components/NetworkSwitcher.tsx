'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createContext, useContext } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { 
  NetworkType, 
  DEFAULT_NETWORK, 
  NETWORK_STORAGE_KEY 
} from '@/utils/networkConfig';

// Create a context for network state
type NetworkContextType = {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  tryFallbackEndpoint?: (currentEndpoint: string, networkKey: string) => string;
};

export const NetworkContext = createContext<NetworkContextType>({
  network: DEFAULT_NETWORK,
  setNetwork: () => {},
  tryFallbackEndpoint: () => '',
});

// Hook to use the network context
export const useNetwork = () => useContext(NetworkContext);

// Network Provider component
export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage if available, otherwise default to mainnet
  const [network, setNetwork] = useState<NetworkType>(DEFAULT_NETWORK);
  
  // Define fallback endpoint function
  const tryFallbackEndpoint = useCallback((currentEndpoint: string, networkKey: string) => {
    // Simple implementation that returns the same endpoint
    // This is just a placeholder to maintain API compatibility
    console.log(`Fallback requested for ${currentEndpoint} on ${networkKey}, but not implemented in NetworkSwitcher`);
    return currentEndpoint;
  }, []);
  
  useEffect(() => {
    // Load network preference from localStorage on mount
    const savedNetwork = localStorage.getItem(NETWORK_STORAGE_KEY);
    if (savedNetwork === 'mainnet' || savedNetwork === 'devnet') {
      setNetwork(savedNetwork as NetworkType);
    }
  }, []);
  
  // Save network preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(NETWORK_STORAGE_KEY, network);
  }, [network]);
  
  return (
    <NetworkContext.Provider value={{ network, setNetwork, tryFallbackEndpoint }}>
      {children}
    </NetworkContext.Provider>
  );
};

// Network Switcher component
const NetworkSwitcher = () => {
  const { network, setNetwork } = useNetwork();
  
  const toggleNetwork = () => {
    setNetwork(network === 'devnet' ? 'mainnet' : 'devnet');
  };
  
  return (
    <div className="flex items-center">
      <button
        onClick={toggleNetwork}
        className={`relative flex items-center px-3 py-1.5 rounded-full transition-all duration-300 ${
          network === 'mainnet' 
            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' 
            : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
        }`}
      >
        <span className={`
          absolute inset-0 rounded-full transition-opacity duration-300 
          ${network === 'mainnet' ? 'opacity-0' : 'opacity-100'}
          shadow-inner bg-gradient-to-r from-purple-600/50 to-purple-500/50
        `}></span>
        
        <div className="flex items-center relative z-10">
          <span className={`
            inline-block w-2 h-2 rounded-full mr-2 
            ${network === 'mainnet' ? 'bg-green-300' : 'bg-purple-300'} 
            animate-pulse
          `}></span>
          <span className="font-medium text-sm">
            {network === 'mainnet' ? 'Mainnet' : 'Devnet'}
          </span>
        </div>
      </button>
    </div>
  );
};

export default NetworkSwitcher; 