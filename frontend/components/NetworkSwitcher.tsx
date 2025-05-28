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
  // Always use mainnet
  const [network, setNetwork] = useState<NetworkType>('mainnet');
  
  // Define fallback endpoint function
  const tryFallbackEndpoint = useCallback((currentEndpoint: string, networkKey: string) => {
    console.log(`Fallback requested for ${currentEndpoint} on ${networkKey}, but not implemented in NetworkSwitcher`);
    return currentEndpoint;
  }, []);
  
  useEffect(() => {
    // Force mainnet and save to localStorage
    localStorage.setItem(NETWORK_STORAGE_KEY, 'mainnet');
  }, []);
  
  return (
    <NetworkContext.Provider value={{ network, setNetwork, tryFallbackEndpoint }}>
      {children}
    </NetworkContext.Provider>
  );
};

// Network Switcher component - MAINNET ONLY DISPLAY
const NetworkSwitcher = () => {
  return (
    <div className="flex items-center">
      <div className="relative flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white">
        <div className="flex items-center relative z-10">
          <span className="inline-block w-2 h-2 rounded-full mr-2 bg-green-300 animate-pulse"></span>
          <span className="font-medium text-sm">Mainnet</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkSwitcher; 