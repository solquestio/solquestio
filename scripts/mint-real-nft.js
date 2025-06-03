const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs');
const path = require('path');

async function mintRealNFT(recipientAddress, tokenId) {
  console.log(`🎨 Minting SolQuest OG NFT #${tokenId} to ${recipientAddress}...\n`);

  try {
    // Load collection config
    const configPath = path.join(__dirname, '..', 'config', 'nft-collection-devnet.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('Collection not found! Run: node scripts/create-nft-collection-simple.js');
    }
    
    const collectionConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const collectionMint = new PublicKey(collectionConfig.collectionMint);
    
    // Load collection wallet
    const walletPath = path.join(__dirname, '..', 'config', 'collection-wallet.json');
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    const collectionWallet = Keypair.fromSecretKey(new Uint8Array(walletData.secretKey));
    
    console.log(`🔗 Collection: ${collectionMint.toString()}`);
    console.log(`🎯 Recipient: ${recipientAddress}`);
    console.log(`🆔 Token ID: ${tokenId}`);
    
    // Connect to devnet
    const connection = new Connection(clusterApiUrl('devnet'));
    const metaplex = Metaplex.make(connection).use(keypairIdentity(collectionWallet));
    
    // Create NFT metadata
    const nftMetadata = {
      name: `SolQuest OG #${tokenId}`,
      symbol: 'SQOG',
      description: `SolQuest OG NFT #${tokenId} - Your exclusive access pass to the SolQuest ecosystem. This rare collectible grants you special privileges, early access to new features, and marks you as an original community member.`,
      seller_fee_basis_points: 500,
      external_url: 'https://solquest.io',
      attributes: [
        {
          trait_type: 'Collection',
          value: 'SolQuest OG'
        },
        {
          trait_type: 'Token ID',
          value: tokenId.toString()
        },
        {
          trait_type: 'Rarity',
          value: 'Rare'
        },
        {
          trait_type: 'Generation',
          value: 'Genesis'
        },
        {
          trait_type: 'Utility',
          value: 'Access Pass'
        },
        {
          trait_type: 'XP Boost',
          value: '10%'
        }
      ],
      properties: {
        creators: [
          {
            address: collectionConfig.treasuryWallet,
            verified: true,
            share: 100
          }
        ]
      }
    };

    console.log('📤 Creating NFT...');
    
    // Create the NFT
    const { nft } = await metaplex.nfts().create({
      name: nftMetadata.name,
      symbol: nftMetadata.symbol,
      uri: 'https://solquest.io/OGNFT.mp4', // Direct video URI for now
      sellerFeeBasisPoints: 500,
      tokenOwner: new PublicKey(recipientAddress),
      collection: collectionMint,
      creators: [
        {
          address: new PublicKey(collectionConfig.treasuryWallet),
          share: 100,
          verified: true
        }
      ]
    });

    console.log('🔗 Verifying collection membership...');
    
    // Verify the NFT as part of the collection
    await metaplex.nfts().verifyCollection({
      mintAddress: nft.address,
      collectionMintAddress: collectionMint,
      isSizedCollection: true
    });

    console.log('✅ NFT minted successfully!');
    console.log(`🎨 NFT Mint: ${nft.address.toString()}`);
    console.log(`📜 Metadata: ${nft.metadataAddress.toString()}`);
    console.log(`👤 Owner: ${recipientAddress}`);
    console.log(`\n🌐 View on Solana Explorer: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);

    return {
      mintAddress: nft.address.toString(),
      tokenId: tokenId,
      metadataAddress: nft.metadataAddress.toString(),
      recipient: recipientAddress,
      name: nftMetadata.name,
      collection: collectionMint.toString(),
      transactionSignature: nft.address.toString() // Placeholder
    };

  } catch (error) {
    console.error('❌ Minting failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const recipientAddress = process.argv[2];
  const tokenId = process.argv[3] || Math.floor(Math.random() * 10000);
  
  if (!recipientAddress) {
    console.error('Usage: node scripts/mint-real-nft.js <recipient_address> [token_id]');
    console.error('Example: node scripts/mint-real-nft.js 8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM 1');
    process.exit(1);
  }
  
  mintRealNFT(recipientAddress, tokenId)
    .then((result) => {
      console.log('\n🎉 Minting completed!', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Minting failed:', error.message);
      process.exit(1);
    });
}

module.exports = { mintRealNFT }; 