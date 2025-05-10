/**
 * Central configuration file for environment variables
 * This helps ensure we have defaults and validation in one place
 */

// Database configuration
export const DB_CONFIG = {
  MONGO_URI: process.env.MONGO_URI || '',
};

// Authentication configuration
export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

// Frontend configuration
export const FRONTEND_CONFIG = {
  URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Helius API configuration
export const HELIUS_CONFIG = {
  API_KEY: process.env.HELIUS_API_KEY || '',
  RPC_URL: process.env.HELIUS_RPC_URL || '',
};

// NFT and Quest configuration
export const NFT_CONFIG = {
  OG_NFT_MINT_ADDRESS: process.env.OG_NFT_MINT_ADDRESS || '',
  REFER_FRIEND_OG_QUEST_ID: process.env.REFER_FRIEND_OG_QUEST_ID || 'refer-friend-og',
  MINT_OG_NFT_QUEST_ID: process.env.MINT_OG_NFT_QUEST_ID || 'mint-og-nft',
  EXPLORE_TRANSACTION_QUEST_ID: process.env.EXPLORE_TRANSACTION_QUEST_ID || 'explore-solana-transaction',
};

// Server configuration
export const SERVER_CONFIG = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_VERCEL: !!process.env.VERCEL,
};
