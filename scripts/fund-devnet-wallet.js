const { Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function fundDevnetWallet() {
  try {
    // Load collection wallet
    const walletPath = path.join(__dirname, '..', 'config', 'collection-wallet.json');
    
    if (!fs.existsSync(walletPath)) {
      throw new Error('Collection wallet not found! Run: node scripts/create-collection-wallet.js');
    }
    
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    const walletAddress = new PublicKey(walletData.publicKey);
    
    console.log('💧 Requesting devnet SOL for collection wallet...');
    console.log(`🔗 Wallet: ${walletAddress.toString()}`);
    
    // Connect to devnet
    const connection = new Connection(clusterApiUrl('devnet'));
    
    // Check current balance
    const currentBalance = await connection.getBalance(walletAddress);
    console.log(`💰 Current Balance: ${currentBalance / LAMPORTS_PER_SOL} SOL`);
    
    if (currentBalance >= 0.5 * LAMPORTS_PER_SOL) {
      console.log('✅ Wallet already has sufficient balance!');
      return;
    }
    
    console.log('📡 Requesting airdrop from Solana devnet...');
    
    try {
      // Request 1 SOL airdrop
      const signature = await connection.requestAirdrop(
        walletAddress,
        1 * LAMPORTS_PER_SOL
      );
      
      console.log(`📋 Airdrop signature: ${signature}`);
      console.log('⏳ Waiting for confirmation...');
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);
      
      // Check new balance
      const newBalance = await connection.getBalance(walletAddress);
      console.log(`✅ New Balance: ${newBalance / LAMPORTS_PER_SOL} SOL`);
      console.log('🎉 Devnet SOL airdrop successful!');
      
    } catch (airdropError) {
      console.log('⚠️  Automatic airdrop failed. Manual funding required.');
      console.log('🌐 Please go to: https://faucet.solana.com/');
      console.log(`📝 Enter wallet address: ${walletAddress.toString()}`);
      console.log('💰 Request 1-2 SOL for testing');
      console.log('\nThen run the collection setup script again.');
    }
    
  } catch (error) {
    console.error('❌ Error funding wallet:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fundDevnetWallet()
    .then(() => {
      console.log('\n✨ Wallet funding completed!');
    })
    .catch((error) => {
      console.error('\n💥 Wallet funding failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fundDevnetWallet }; 