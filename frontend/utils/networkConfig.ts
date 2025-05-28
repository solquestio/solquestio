/**
 * Network configuration utilities
 * This file provides standardized configuration for network settings across the application
 */

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Define network types for the application - MAINNET ONLY
export type NetworkType = 'mainnet';

// RPC endpoints - MAINNET ONLY
export const RPC_ENDPOINTS: Record<string, string> = {
  'mainnet-beta': process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 
                 process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || 
                 process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 
                 'https://api.mainnet-beta.solana.com',
};

// Fallback RPC endpoints - MAINNET ONLY
export const FALLBACK_RPC_ENDPOINTS: Record<string, string[]> = {
  'mainnet-beta': [
    process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
    process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || 'https://solana-mainnet.rpc.extrnode.com',
    process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://ssc-dao.genesysgo.net',
    'https://mainnet.rpcpool.com',
  ],
};

// Map NetworkType to WalletAdapterNetwork - MAINNET ONLY
export const mapNetworkType = (networkType: NetworkType): WalletAdapterNetwork => {
  return WalletAdapterNetwork.Mainnet;
};

// Convert WalletAdapterNetwork to NetworkType - MAINNET ONLY
export const toNetworkType = (network: WalletAdapterNetwork): NetworkType => {
  return 'mainnet';
};

// Get explorer URL for a given address - MAINNET ONLY
export const getExplorerUrl = (address: string, networkType: NetworkType): string => {
  return `https://explorer.solana.com/address/${address}`;
};

// Default network for the application
export const DEFAULT_NETWORK: NetworkType = 'mainnet';

// Local storage key for network setting
export const NETWORK_STORAGE_KEY = 'solquestio-network'; 