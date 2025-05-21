/**
 * Network configuration utilities
 * This file provides standardized configuration for network settings across the application
 */

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Define network types for the application
export type NetworkType = 'mainnet' | 'devnet';

// RPC endpoints with higher rate limits
export const RPC_ENDPOINTS: Record<string, string> = {
  'mainnet-beta': process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 
                 process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || 
                 process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 
                 'https://api.mainnet-beta.solana.com',
  'devnet': 'https://api.devnet.solana.com',
};

// Fallback RPC endpoints if the primary ones fail
export const FALLBACK_RPC_ENDPOINTS: Record<string, string[]> = {
  'mainnet-beta': [
    process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
    process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || 'https://solana-mainnet.rpc.extrnode.com',
    process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://ssc-dao.genesysgo.net',
    'https://mainnet.rpcpool.com',
  ],
  'devnet': [
    'https://api.devnet.solana.com',
    'https://solana-devnet.g.alchemy.com/v2/demo',
    'https://rpc-devnet.helius.xyz/?api-key=1312d10e-e283-483e-ab87-4ac5ec3e7a0f'
  ],
};

// Map NetworkType to WalletAdapterNetwork
export const mapNetworkType = (networkType: NetworkType): WalletAdapterNetwork => {
  switch (networkType) {
    case 'mainnet':
      return WalletAdapterNetwork.Mainnet;
    case 'devnet':
      return WalletAdapterNetwork.Devnet;
    default:
      return WalletAdapterNetwork.Mainnet;
  }
};

// Convert WalletAdapterNetwork to NetworkType
export const toNetworkType = (network: WalletAdapterNetwork): NetworkType => {
  switch (network) {
    case WalletAdapterNetwork.Mainnet:
      return 'mainnet';
    case WalletAdapterNetwork.Devnet:
      return 'devnet';
    default:
      return 'mainnet';
  }
};

// Get explorer URL for a given address based on network
export const getExplorerUrl = (address: string, networkType: NetworkType): string => {
  const baseUrl = networkType === 'mainnet' 
    ? 'https://explorer.solana.com' 
    : 'https://explorer.solana.com/?cluster=devnet';
  
  return `${baseUrl}/address/${address}`;
};

// Default network for the application
export const DEFAULT_NETWORK: NetworkType = 'mainnet';

// Local storage key for network setting
export const NETWORK_STORAGE_KEY = 'solquestio-network'; 