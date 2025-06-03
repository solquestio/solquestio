const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs');
const path = require('path');

async function createSimpleCollection() {
  console.log('🚀 Creating SolQuest OG NFT Collection on Devnet...\n');

  try {
    // Load collection wallet
    const walletPath = path.join(__dirname, '..', 'config', 'collection-wallet.json');
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    const collectionWallet = Keypair.fromSecretKey(new Uint8Array(walletData.secretKey));
    
    console.log(`🔑 Collection Wallet: ${collectionWallet.publicKey.toString()}`);
    
    // Connect to devnet
    const connection = new Connection(clusterApiUrl('devnet'));
    const metaplex = Metaplex.make(connection).use(keypairIdentity(collectionWallet));
    
    // Check balance
    const balance = await connection.getBalance(collectionWallet.publicKey);
    console.log(`💰 Wallet Balance: ${balance / 1e9} SOL`);
    
    if (balance < 0.1 * 1e9) {
      throw new Error('Insufficient balance. Need at least 0.1 SOL');
    }

    console.log('🎨 Creating collection NFT...');
    
    // Create collection directly without external metadata upload
    const { nft: collectionNft } = await metaplex.nfts().create({
      name: 'SolQuest OG',
      symbol: 'SQOG',
      uri: 'https://solquest.io', // Temporary URI
      sellerFeeBasisPoints: 500,
      isCollection: true,
      creators: [
        {
          address: new PublicKey('8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM'),
          share: 100,
          verified: true
        }
      ]
    });

    console.log('✅ Collection NFT created!');
    console.log(`🔗 Collection Mint: ${collectionNft.address.toString()}`);
    
    // Save collection info
    const collectionConfig = {
      network: 'devnet',
      timestamp: new Date().toISOString(),
      collectionMint: collectionNft.address.toString(),
      collectionMetadata: collectionNft.metadataAddress.toString(),
      collectionMasterEdition: collectionNft.masterEditionAddress?.toString(),
      creatorWallet: collectionWallet.publicKey.toString(),
      treasuryWallet: '8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM'
    };

    const configPath = path.join(__dirname, '..', 'config', 'nft-collection-devnet.json');
    fs.writeFileSync(configPath, JSON.stringify(collectionConfig, null, 2));
    
    console.log(`\n💾 Collection config saved to: ${configPath}`);
    console.log(`\n🌐 View on Solana Explorer: https://explorer.solana.com/address/${collectionNft.address.toString()}?cluster=devnet`);
    console.log('\n✨ Collection setup completed!');
    
    return collectionConfig;

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createSimpleCollection()
    .then(() => {
      console.log('\n🎉 Success!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed:', error.message);
      process.exit(1);
    });
}

module.exports = { createSimpleCollection }; 