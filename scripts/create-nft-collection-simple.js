const { Connection, Keypair, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function askForPrivateKey() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🔐 Please enter your private key array from Phantom/Solflare:');
  console.log('   (Format: [123,45,67,89,...])');
  console.log('   Your wallet: 8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM');
  console.log('');

  return new Promise((resolve) => {
    rl.question('Private Key Array: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function createMainnetCollection() {
  console.log('🚀 Creating SolQuest OG NFT Collection on MAINNET...\n');

  try {
    // Ask for private key directly
    const privateKeyInput = await askForPrivateKey();
    
    if (!privateKeyInput || privateKeyInput.trim() === '') {
      console.log('❌ No private key provided.');
      return;
    }

    console.log('🔍 Processing private key...');
    
    // Clean up the input - remove extra spaces, quotes, etc.
    let cleanedInput = privateKeyInput.trim();
    
    // Remove surrounding quotes if present
    if ((cleanedInput.startsWith('"') && cleanedInput.endsWith('"')) ||
        (cleanedInput.startsWith("'") && cleanedInput.endsWith("'"))) {
      cleanedInput = cleanedInput.slice(1, -1);
    }
    
    // Check if it looks like an array
    if (!cleanedInput.startsWith('[') || !cleanedInput.endsWith(']')) {
      console.log('❌ Private key should be an array format: [123,45,67,89,...]');
      console.log(`   You entered: ${cleanedInput.substring(0, 50)}...`);
      console.log('   Make sure it starts with [ and ends with ]');
      return;
    }

    // Parse the private key
    let privateKeyArray;
    try {
      privateKeyArray = JSON.parse(cleanedInput);
      console.log(`✅ Parsed private key array with ${privateKeyArray.length} elements`);
    } catch (error) {
      console.log('❌ Failed to parse private key as JSON.');
      console.log(`   Error: ${error.message}`);
      console.log('   Make sure it\'s a valid JSON array like: [123,45,67,89,...]');
      console.log('   No extra characters or formatting issues');
      return;
    }

    // Validate array
    if (!Array.isArray(privateKeyArray)) {
      console.log('❌ Private key should be an array of numbers');
      return;
    }

    if (privateKeyArray.length !== 64) {
      console.log(`❌ Private key array should have 64 numbers, got ${privateKeyArray.length}`);
      console.log('   Make sure you copied the complete private key from your wallet');
      return;
    }

    // Check if all elements are numbers
    if (!privateKeyArray.every(num => typeof num === 'number' && num >= 0 && num <= 255)) {
      console.log('❌ Private key array should contain only numbers between 0-255');
      return;
    }

    console.log('✅ Private key format validated');

    // Create keypair from private key
    let collectionWallet;
    try {
      collectionWallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
      console.log('✅ Keypair created successfully');
    } catch (error) {
      console.log('❌ Failed to create keypair from private key');
      console.log(`   Error: ${error.message}`);
      console.log('   Please check that your private key is correct');
      return;
    }
    
    // Verify this matches expected wallet
    const expectedWallet = '8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM';
    if (collectionWallet.publicKey.toString() !== expectedWallet) {
      console.log('❌ Private key does not match expected wallet!');
      console.log(`   Expected: ${expectedWallet}`);
      console.log(`   Got: ${collectionWallet.publicKey.toString()}`);
      console.log('   Please check your private key.');
      return;
    }

    console.log(`✅ Wallet verified: ${collectionWallet.publicKey.toString()}`);
    
    // Connect to MAINNET
    console.log('🌐 Connecting to Solana mainnet...');
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    const metaplex = Metaplex.make(connection).use(keypairIdentity(collectionWallet));
    
    // Check balance
    const balance = await connection.getBalance(collectionWallet.publicKey);
    console.log(`💰 Wallet Balance: ${balance / 1e9} SOL`);
    
    if (balance < 0.05 * 1e9) {
      console.log('⚠️  LOW BALANCE WARNING!');
      console.log(`   Current: ${balance / 1e9} SOL`);
      console.log(`   Recommended: at least 0.05 SOL for collection creation`);
      console.log('   Proceeding anyway...');
    }

    console.log('🎨 Creating MAINNET collection NFT...');
    console.log('   This may take 30-60 seconds...');
    
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

    console.log('🎉 SUCCESS! MAINNET Collection created!');
    console.log(`🔗 Collection Mint: ${collectionNft.address.toString()}`);
    console.log(`📜 Metadata: ${collectionNft.metadataAddress.toString()}`);
    
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
    
    console.log(`\n💾 Config saved to: ${configPath}`);
    console.log(`\n🌐 View on Solana Explorer:`);
    console.log(`   https://explorer.solana.com/address/${collectionNft.address.toString()}`);
    console.log(`\n🎨 View on Magic Eden:`);
    console.log(`   https://magiceden.io/collections/solana/${collectionNft.address.toString()}`);
    
    console.log('\n✨ MAINNET Collection setup completed!');
    console.log('📋 Next: Update backend with collection address and deploy!');
    
    return collectionConfig;

  } catch (error) {
    console.error('❌ MAINNET Setup failed:', error);
    console.log('\n💡 Common solutions:');
    console.log('   - Make sure you have enough SOL (0.05+ recommended)');
    console.log('   - Check your internet connection');
    console.log('   - Verify your private key is correct');
    throw error;
  }
}

// Run the function
createMainnetCollection()
  .then(() => {
    console.log('\n🎉 All done! Collection created on mainnet!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error.message);
    process.exit(1);
  }); 