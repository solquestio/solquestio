import { PublicKey, Connection } from '@solana/web3.js';

// Constants (replace with actual values in production)
export const NFT_COLLECTION_ADDRESS = "2rCAH2DF3UbBnRM9atpkQT7eVy9V5B9oXMYzziV8tyGv"; // Example address
export const MAGIC_EDEN_COLLECTION_URL = "https://magiceden.io/collections/solquestio-og-nft"; // Replace with actual URL

/**
 * Interface for NFT data retrieved from the blockchain or API
 */
export interface NFTData {
  tokenId: number;
  name: string;
  mintAddress: string;
  mintDate: string;
  imageUrl: string;
  attributes?: Record<string, string | number>;
  metadataUrl?: string;
}

/**
 * Verifies if a wallet owns an NFT from the SolQuestio OG collection
 * In production, this would use Metaplex SDK to query the blockchain
 * 
 * @param walletAddress The public key of the wallet to check
 * @param connection A Solana connection
 * @returns Promise containing ownership status and NFT data if owned
 */
export async function verifyNFTOwnership(
  walletAddress: string | PublicKey, 
  connection: Connection
): Promise<{ hasNFT: boolean; nftData: NFTData | null }> {
  try {
    // Convert string address to PublicKey if needed
    const publicKey = typeof walletAddress === 'string' 
      ? new PublicKey(walletAddress) 
      : walletAddress;
    
    // In production code, this would use Metaplex to fetch NFTs
    // Example:
    // const metaplex = new Metaplex(connection);
    // const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey });
    // const collectionNFT = nfts.find(nft => 
    //   nft.collection?.address.toString() === NFT_COLLECTION_ADDRESS
    // );
    
    // For demo/development, we'll use localStorage to simulate verification
    // IMPORTANT: In production, NEVER rely on client-side storage for verification
    const hasStoredNFT = localStorage.getItem(`has_solquestio_nft_${publicKey.toString()}`);
    
    if (hasStoredNFT === 'true') {
      // Simulate NFT data that would be fetched from blockchain
      const mockNFTData: NFTData = {
        tokenId: Math.floor(Math.random() * 10000),
        name: `SolQuestio OG #${Math.floor(Math.random() * 10000)}`,
        mintAddress: publicKey.toString(),
        mintDate: new Date().toISOString(),
        imageUrl: '/images/nft/og-nft-preview.jpg',
        attributes: {
          rarity: 'Uncommon',
          xpBoost: 10,
          solBoost: 10,
        }
      };
      
      return { hasNFT: true, nftData: mockNFTData };
    }
    
    return { hasNFT: false, nftData: null };
  } catch (error) {
    console.error("Error verifying NFT ownership:", error);
    return { hasNFT: false, nftData: null };
  }
}

/**
 * Performs backend verification of NFT ownership
 * In production, this would call your backend API, which would verify on-chain
 * 
 * @param walletAddress The wallet address to check
 * @returns Promise with verification result
 */
export async function verifyNFTOwnershipViaAPI(walletAddress: string): Promise<boolean> {
  try {
    // In production code, this would be:
    // const response = await fetch(`/api/nft/verify?wallet=${walletAddress}`);
    // const data = await response.json();
    // return data.hasNFT;
    
    // For development/demo purposes
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    const hasStoredNFT = localStorage.getItem(`has_solquestio_nft_${walletAddress}`);
    return hasStoredNFT === 'true';
  } catch (error) {
    console.error("API verification error:", error);
    return false;
  }
}

/**
 * Fetches collection statistics from Magic Eden or your backend
 * In production, this would fetch real-time data
 * 
 * @returns Promise with collection stats
 */
export async function getCollectionStats(): Promise<{
  totalSupply: number;
  minted: number;
  available: number;
  floorPrice: number;
}> {
  try {
    // In production code, this would fetch from an API:
    // const response = await fetch('/api/nft/collection-stats');
    // return await response.json();
    
    // For development/demo purposes
    return {
      totalSupply: 10000,
      minted: 2372,
      available: 7628,
      floorPrice: 0.005
    };
  } catch (error) {
    console.error("Error fetching collection stats:", error);
    return {
      totalSupply: 10000,
      minted: 0,
      available: 10000,
      floorPrice: 0.005
    };
  }
}

/**
 * Simulates a user owning the NFT (FOR DEMO PURPOSES ONLY)
 * This would never exist in production code
 * 
 * @param walletAddress The wallet address to mark as having the NFT
 */
export function simulateNFTOwnership(walletAddress: string): void {
  localStorage.setItem(`has_solquestio_nft_${walletAddress}`, 'true');
}

/**
 * Simulates a user not owning the NFT (FOR DEMO PURPOSES ONLY)
 * This would never exist in production code
 * 
 * @param walletAddress The wallet address to mark as not having the NFT
 */
export function clearNFTOwnership(walletAddress: string): void {
  localStorage.removeItem(`has_solquestio_nft_${walletAddress}`);
} 