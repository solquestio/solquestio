import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
// In a real implementation you would import Metaplex
// import { Metaplex } from '@metaplex-foundation/js';

// Collection address - replace with your actual collection address
const NFT_COLLECTION_ADDRESS = "2rCAH2DF3UbBnRM9atpkQT7eVy9V5B9oXMYzziV8tyGv";

// This is a demonstration API route showing how you would implement the backend verification
// In production, this would actually connect to Solana and check the blockchain
export async function GET(request: Request) {
  try {
    // Get the wallet parameter from the URL
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    
    // Validate the wallet address
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(wallet);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }
    
    // In production code, you would use Metaplex to query the blockchain:
    /*
    // Setup connection to Solana
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
    const metaplex = new Metaplex(connection);
    
    // Get NFTs owned by this wallet
    const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey });
    
    // Check if any NFT is from our collection
    const hasCollectionNFT = nfts.some(nft => 
      nft.collection?.address.toString() === NFT_COLLECTION_ADDRESS
    );
    
    // If wallet owns an NFT from our collection, return the NFT data
    if (hasCollectionNFT) {
      const ourNft = nfts.find(nft => 
        nft.collection?.address.toString() === NFT_COLLECTION_ADDRESS
      );
      
      return NextResponse.json({ 
        hasNFT: true,
        nftData: {
          tokenId: parseInt(ourNft.name.split('#')[1]) || 0,
          name: ourNft.name,
          mintAddress: ourNft.address.toString(),
          mintDate: ourNft.mintedAt?.toISOString() || new Date().toISOString(),
          imageUrl: ourNft.json?.image || '',
          attributes: ourNft.json?.attributes || {},
          metadataUrl: ourNft.uri
        }
      });
    }
    */
    
    // For demonstration purposes, we'll return a fake response
    // In production, remove this and use the code above
    const hasNFT = Math.random() > 0.5; // Randomly determine if user has NFT (demo only)
    
    if (hasNFT) {
      const tokenId = Math.floor(Math.random() * 10000);
      return NextResponse.json({
        hasNFT: true,
        nftData: {
          tokenId,
          name: `SolQuestio OG #${tokenId}`,
          mintAddress: publicKey.toString(),
          mintDate: new Date().toISOString(),
          imageUrl: '/images/nft/og-nft-preview.jpg',
          attributes: {
            rarity: 'Uncommon',
            xpBoost: 10,
            solBoost: 10,
          }
        }
      });
    }
    
    return NextResponse.json({ hasNFT: false, nftData: null });
  } catch (error) {
    console.error('Error verifying NFT:', error);
    return NextResponse.json({ error: 'Failed to verify NFT ownership' }, { status: 500 });
  }
} 