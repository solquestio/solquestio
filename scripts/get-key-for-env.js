const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

console.log('🔑 Private Key Array Generator for Environment Variables');
console.log('========================================================\n');

console.log('Please paste your base58 private key (88 characters):');
console.log('(The same key you used before, from Phantom export)\n');

// Read from stdin
process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    const input = chunk.trim();
    
    if (input.length === 88) {
      try {
        // Decode base58 to bytes
        const privateKeyBytes = bs58.decode(input);
        
        if (privateKeyBytes.length !== 64) {
          console.log(`❌ Expected 64 bytes, got ${privateKeyBytes.length}`);
          process.exit(1);
        }
        
        // Test wallet generation
        const wallet = Keypair.fromSecretKey(privateKeyBytes);
        console.log(`✅ Generated wallet: ${wallet.publicKey.toString()}`);
        
        if (wallet.publicKey.toString() === '8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM') {
          console.log('🎉 Wallet matches! This is correct.\n');
          
          // Convert to array format
          const privateKeyArray = Array.from(privateKeyBytes);
          const arrayString = JSON.stringify(privateKeyArray);
          
          console.log('📋 COPY THIS FOR VERCEL ENVIRONMENT VARIABLE:');
          console.log('=' .repeat(50));
          console.log(arrayString);
          console.log('=' .repeat(50));
          
          console.log('\n📝 Instructions:');
          console.log('1. Copy the array above (including the brackets)');
          console.log('2. Go to Vercel → Your Backend Project → Settings → Environment Variables');
          console.log('3. Add variable: COLLECTION_WALLET_SECRET = [paste the array]');
          console.log('4. Add other variables from the setup guide');
          console.log('5. Redeploy your backend');
          
        } else {
          console.log('❌ Wallet mismatch. Please check your private key.');
          console.log(`   Expected: 8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM`);
          console.log(`   Got:      ${wallet.publicKey.toString()}`);
        }
        
        process.exit(0);
        
      } catch (error) {
        console.log('❌ Failed to decode base58:');
        console.log(`   Error: ${error.message}`);
        process.exit(1);
      }
    } else {
      console.log('❌ Invalid length. Expected 88 characters for base58 private key.');
      console.log(`   Got: ${input.length} characters`);
      process.exit(1);
    }
  }
});

console.log('Waiting for input...'); 