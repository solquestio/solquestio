'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNetwork } from './NetworkSwitcher';

/**
 * NetworkBadge Component
 * Displays the current network information (Mainnet or Devnet)
 */
const NetworkBadge: React.FC = () => {
  const { network } = useNetwork();
  const { connected } = useWallet();
  
  // Different styling based on network
  const bgColor = network === 'mainnet' 
    ? 'bg-green-900/20 border-green-700/30' 
    : 'bg-purple-900/20 border-purple-700/30';
    
  const textColor = network === 'mainnet' 
    ? 'text-green-400' 
    : 'text-purple-400';
    
  const dotColor = network === 'mainnet' 
    ? 'bg-green-400' 
    : 'bg-purple-400';
  
  return (
    <div className={`${bgColor} rounded-md border px-3 py-1 text-xs flex items-center gap-2`}>
      <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`}></div>
      <span className={`font-medium ${textColor}`}>
        {network === 'mainnet' ? 'Mainnet' : 'Devnet'}
        {!connected && <span className="text-gray-400 ml-1">(Not Connected)</span>}
      </span>
    </div>
  );
};

export default NetworkBadge; 