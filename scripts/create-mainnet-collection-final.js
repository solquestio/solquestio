const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs');
const path = require('path');

async function createMainnetCollection() {
  console.log('🚀 Creating SolQuest OG NFT Collection on MAINNET...\n');

  try {
    // Read private key from temp file
    const keyFilePath = path.join(__dirname, 'temp-key.txt');
    if (!fs.existsSync(keyFilePath)) {
      console.log('❌ temp-key.txt not found. Run the test script first.');
      return;
    }

    const fileContent = fs.readFileSync(keyFilePath, 'utf8').trim();
    const privateKeyArray = JSON.parse(fileContent);
    
    console.log('✅ Private key loaded from file');
    
    // Create keypair
    const collectionWallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    console.log(`🔑 Wallet: ${collectionWallet.publicKey.toString()}`);
    
    // Connect to MAINNET
    console.log('🌐 Connecting to Solana mainnet...');
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    const metaplex = Metaplex.make(connection).use(keypairIdentity(collectionWallet));
    
    // Check balance
    console.log('💰 Checking wallet balance...');
    const balance = await connection.getBalance(collectionWallet.publicKey);
    console.log(`   Balance: ${balance / 1e9} SOL`);
    
    if (balance < 0.05 * 1e9) {
      console.log('⚠️  LOW BALANCE WARNING!');
      console.log(`   Current: ${balance / 1e9} SOL`);
      console.log(`   Recommended: at least 0.05 SOL for collection creation`);
      
      if (balance < 0.01 * 1e9) {
        console.log('❌ Balance too low to proceed. Need at least 0.01 SOL');
        return;
      }
      
      console.log('   Proceeding with low balance...');
    }

    console.log('\n🎨 Creating MAINNET NFT Collection...');
    console.log('   Name: SolQuest OG');
    console.log('   Symbol: SQOG');
    console.log('   Royalties: 5%');
    console.log('   ⏳ This may take 30-60 seconds...\n');
    
    // Create collection
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

    console.log('🎉 SUCCESS! MAINNET Collection Created!');
    console.log('=========================================');
    console.log(`🔗 Collection Mint: ${collectionNft.address.toString()}`);
    console.log(`📜 Metadata: ${collectionNft.metadataAddress.toString()}`);
    console.log(`👑 Master Edition: ${collectionNft.masterEditionAddress?.toString()}`);
    
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
    
    console.log(`\n💾 Config saved: ${configPath}`);
    console.log('\n🌐 Links:');
    console.log(`   Solana Explorer: https://explorer.solana.com/address/${collectionNft.address.toString()}`);
    console.log(`   Magic Eden: https://magiceden.io/collections/solana/${collectionNft.address.toString()}`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. ✅ Collection created on mainnet');
    console.log('2. 🔧 Update backend with collection address');
    console.log('3. 🚀 Deploy and go live!');
    console.log('4. 🗑️  Delete temp key files for security');
    
    // Clean up temp files for security
    console.log('\n🧹 Cleaning up temporary files...');
    try {
      fs.unlinkSync(path.join(__dirname, 'temp-key.txt'));
      fs.unlinkSync(path.join(__dirname, 'temp-key-array.txt'));
      console.log('✅ Temporary key files deleted');
    } catch (cleanupError) {
      console.log('⚠️  Could not delete temp files - please delete manually for security');
    }
    
    return collectionConfig;

  } catch (error) {
    console.error('\n❌ MAINNET Collection Creation Failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Solution: Add more SOL to your wallet');
    } else if (error.message.includes('Network request failed')) {
      console.log('\n💡 Solution: Check internet connection and try again');
    } else if (error.message.includes('blockhash')) {
      console.log('\n💡 Solution: Network congestion, try again in a few seconds');
    }
    
    throw error;
  }
}

// Run the function
createMainnetCollection()
  .then((config) => {
    console.log('\n🎉 MAINNET Collection Creation Complete!');
    console.log(`Collection Address: ${config.collectionMint}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed to create collection');
    process.exit(1);
  }); 