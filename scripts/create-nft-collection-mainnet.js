const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs');
const path = require('path');

async function createMainnetCollection() {
  console.log('🚀 Creating SolQuest OG NFT Collection on MAINNET...\n');

  try {
    console.log('📝 IMPORTANT: This script expects you to provide your wallet private key.');
    console.log('🔐 For security, you should either:');
    console.log('   1. Set PRIVATE_KEY environment variable, or');
    console.log('   2. Modify this script to load from a secure file\n');
    
    // Option 1: Use environment variable (recommended)
    let collectionWallet;
    if (process.env.PRIVATE_KEY) {
      const privateKeyArray = JSON.parse(process.env.PRIVATE_KEY);
      collectionWallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    } else {
      console.log('⚠️  No PRIVATE_KEY environment variable found.');
      console.log('📋 To set it, create your private key array from your wallet.');
      console.log('🔑 Your wallet: 8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM');
      console.log('\n💡 Alternative: You can export your private key from Phantom/Solflare');
      console.log('   and update this script manually (for testing only).\n');
      
      // For now, exit and ask user to provide the key
      console.log('❌ Please provide your private key and run again.');
      console.log('   Example: PRIVATE_KEY=\'[1,2,3,...]\' node scripts/create-nft-collection-mainnet.js');
      return;
    }
    
    // Verify this is the correct wallet
    if (collectionWallet.publicKey.toString() !== '8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM') {
      console.log('❌ Private key does not match expected wallet address!');
      console.log(`   Expected: 8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM`);
      console.log(`   Got: ${collectionWallet.publicKey.toString()}`);
      return;
    }
    
    console.log(`🔑 Using Your Wallet: ${collectionWallet.publicKey.toString()}`);
    
    // Connect to MAINNET
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    const metaplex = Metaplex.make(connection).use(keypairIdentity(collectionWallet));
    
    // Check balance
    const balance = await connection.getBalance(collectionWallet.publicKey);
    console.log(`💰 Wallet Balance: ${balance / 1e9} SOL`);
    
    if (balance < 0.1 * 1e9) {
      console.log('⚠️  LOW BALANCE!');
      console.log(`   Recommended: at least 0.1 SOL for collection creation`);
      console.log(`   Current: ${balance / 1e9} SOL`);
      console.log('\n💡 You can still try to proceed if you want...');
      
      // Ask user if they want to continue
      console.log('⚡ Proceeding anyway...');
    }

    console.log('🎨 Creating MAINNET collection NFT...');
    
    // Create collection directly
    const { nft: collectionNft } = await metaplex.nfts().create({
      name: 'SolQuest OG',
      symbol: 'SQOG',
      uri: 'https://solquest.io/OGNFT.mp4',
      sellerFeeBasisPoints: 500, // 5% royalties
      isCollection: true,
      creators: [
        {
          address: new PublicKey('8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM'),
          share: 100
        }
      ]
    });

    console.log('✅ MAINNET Collection created successfully!');
    console.log(`🔗 Collection Mint: ${collectionNft.address.toString()}`);
    
    // Save collection info
    const collectionConfig = {
      network: 'mainnet-beta',
      timestamp: new Date().toISOString(),
      collectionMint: collectionNft.address.toString(),
      collectionMetadata: collectionNft.metadataAddress.toString(),
      collectionMasterEdition: collectionNft.masterEditionAddress?.toString(),
      creatorWallet: collectionWallet.publicKey.toString(),
      treasuryWallet: '8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM'
    };

    const configPath = path.join(__dirname, '..', 'config', 'nft-collection-mainnet.json');
    fs.writeFileSync(configPath, JSON.stringify(collectionConfig, null, 2));
    
    console.log(`\n💾 MAINNET Collection config saved to: ${configPath}`);
    console.log(`\n🌐 View on Solana Explorer: https://explorer.solana.com/address/${collectionNft.address.toString()}`);
    console.log(`🎨 View on Magic Eden: https://magiceden.io/collections/solana/${collectionNft.address.toString()}`);
    console.log('\n✨ MAINNET Collection setup completed!');
    
    return collectionConfig;

  } catch (error) {
    console.error('❌ MAINNET Setup failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createMainnetCollection()
    .then(() => {
      console.log('\n🎉 MAINNET Success!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 MAINNET Failed:', error.message);
      process.exit(1);
    });
}

module.exports = { createMainnetCollection }; 