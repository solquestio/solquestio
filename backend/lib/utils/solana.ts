import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Verify a signature from a Solana wallet
 * @param walletAddress The wallet address that signed the message (as a string)
 * @param signature The signature (base58 encoded string)
 * @param message The message that was signed
 * @returns boolean indicating if the signature is valid
 */
export const verifySignature = (
  walletAddress: string,
  signature: string,
  message: string
): boolean => {
  try {
    // Convert the wallet address to a PublicKey
    const publicKey = new PublicKey(walletAddress);
    
    // Convert the message to Uint8Array (UTF-8 encoded)
    const messageBytes = new TextEncoder().encode(message);
    
    // Decode the signature from base58
    const signatureBytes = bs58.decode(signature);
    
    // Verify the signature
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKey.toBytes()
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Generate a challenge message for authentication
 * @param walletAddress Wallet address to include in the challenge
 * @returns A challenge message for the user to sign
 */
export const generateChallengeMessage = (walletAddress: string): string => {
  const timestamp = new Date().toISOString();
  return `Sign this message to authenticate with SolQuest.io. Wallet: ${walletAddress}. Timestamp: ${timestamp}`;
};

/**
 * Verify if an address owns a specific NFT
 * @param walletAddress The wallet address to check
 * @param mintAddress The NFT mint address
 * @returns Promise resolving to boolean indicating ownership
 */
export const verifyNftOwnership = async (
  walletAddress: string,
  mintAddress: string
): Promise<boolean> => {
  // In production, this would use Helius API or similar to verify ownership
  // For now, we'll implement a placeholder that returns false
  console.log(`Checking if wallet ${walletAddress} owns NFT ${mintAddress}`);
  return false;
};
