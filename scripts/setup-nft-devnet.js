const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { Metaplex, keypairIdentity, irysStorage } = require('@metaplex-foundation/js');
const fs = require('fs');
const path = require('path');

// Load the collection wallet we just created
const loadCollectionWallet = () => {
  const walletPath = path.join(__dirname, '..', 'config', 'collection-wallet.json');
  
  if (!fs.existsSync(walletPath)) {
    throw new Error('Collection wallet not found! Run: node scripts/create-collection-wallet.js');
  }
  
  const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
  return Keypair.fromSecretKey(new Uint8Array(walletData.secretKey));
};

// Collection configuration
const OG_COLLECTION_CONFIG = {
  name: 'SolQuest OG',
  symbol: 'SQOG',
  description: 'Exclusive NFT collection for SolQuest community members. Holders get XP boosts, exclusive access, and special privileges.',
  royalties: 500, // 5%
  creators: [
    {
      address: '8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM', // Your treasury wallet
      share: 100,
      verified: true
    }
  ]
};

async function setupOGCollection() {
  console.log('🚀 Setting up SolQuest OG NFT Collection on Devnet...\n');

  try {
    // Load collection wallet
    const collectionWallet = loadCollectionWallet();
    console.log(`🔑 Collection Wallet: ${collectionWallet.publicKey.toString()}`);
    
    // Connect to devnet
    const connection = new Connection(clusterApiUrl('devnet'));
    
    // Check wallet balance
    const balance = await connection.getBalance(collectionWallet.publicKey);
    console.log(`💰 Wallet Balance: ${balance / 1e9} SOL`);
    
    if (balance < 0.1 * 1e9) { // Less than 0.1 SOL
      console.log('⚠️  Low balance! Get devnet SOL at: https://faucet.solana.com/');
      console.log(`   Send SOL to: ${collectionWallet.publicKey.toString()}`);
      console.log('   Then run this script again.\n');
      return;
    }
    
    // Setup Metaplex with simpler storage
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(collectionWallet));

    console.log('📝 Creating collection metadata...');
    
    // Collection metadata
    const collectionMetadata = {
      name: OG_COLLECTION_CONFIG.name,
      symbol: OG_COLLECTION_CONFIG.symbol,
      description: OG_COLLECTION_CONFIG.description,
      seller_fee_basis_points: OG_COLLECTION_CONFIG.royalties,
      external_url: 'https://solquest.io',
      image: 'https://solquest.io/OGNFT.mp4', // Using your video as image
      animation_url: 'https://solquest.io/OGNFT.mp4',
      attributes: [
        {
          trait_type: 'Collection',
          value: 'SolQuest OG'
        },
        {
          trait_type: 'Utility',
          value: 'XP Boost & Access Pass'
        }
      ],
      properties: {
        creators: OG_COLLECTION_CONFIG.creators
      }
    };

    // Upload metadata to default storage
    console.log('📤 Uploading metadata...');
    const metadataUri = await metaplex.storage().uploadMetadata(collectionMetadata);
    console.log(`✅ Metadata uploaded: ${metadataUri}`);

    // Create collection NFT
    console.log('🎨 Creating collection NFT...');
    const { nft: collectionNft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: OG_COLLECTION_CONFIG.name,
      symbol: OG_COLLECTION_CONFIG.symbol,
      sellerFeeBasisPoints: OG_COLLECTION_CONFIG.royalties,
      isCollection: true,
      creators: OG_COLLECTION_CONFIG.creators.map(creator => ({
        address: new PublicKey(creator.address),
        share: creator.share,
        verified: creator.verified
      }))
    });

    console.log('✅ Collection created successfully!');
    console.log(`🔗 Collection Mint: ${collectionNft.address.toString()}`);
    console.log(`📜 Metadata: ${collectionNft.metadataAddress.toString()}`);
    console.log(`👑 Master Edition: ${collectionNft.masterEditionAddress.toString()}`);

    // Save collection info
    const collectionConfig = {
      network: 'devnet',
      timestamp: new Date().toISOString(),
      collectionMint: collectionNft.address.toString(),
      collectionMetadata: collectionNft.metadataAddress.toString(),
      collectionMasterEdition: collectionNft.masterEditionAddress.toString(),
      metadataUri: metadataUri,
      creatorWallet: collectionWallet.publicKey.toString(),
      treasuryWallet: '8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM'
    };

    const configPath = path.join(__dirname, '..', 'config', 'nft-collection-devnet.json');
    fs.writeFileSync(configPath, JSON.stringify(collectionConfig, null, 2));
    
    console.log(`\n💾 Collection config saved to: ${configPath}`);
    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Update backend with the collection mint address');
    console.log('2. Test minting NFTs');
    console.log('3. Verify on Solana Explorer');
    
    return collectionConfig;

  } catch (error) {
    console.error('❌ Setup failed:', error);
    
    if (error.message.includes('Insufficient funds')) {
      console.log('\n💡 Solution: Get devnet SOL at https://faucet.solana.com/');
    } else if (error.message.includes('Network request failed')) {
      console.log('\n💡 Solution: Check your internet connection and try again');
    }
    
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupOGCollection()
    .then(() => {
      console.log('\n✨ Collection setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Collection setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { setupOGCollection }; 