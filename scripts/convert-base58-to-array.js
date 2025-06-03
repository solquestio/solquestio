const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const fs = require('fs');
const path = require('path');

console.log('🔄 Base58 to Array Converter');
console.log('============================\n');

const keyFilePath = path.join(__dirname, 'temp-key.txt');

if (!fs.existsSync(keyFilePath)) {
  console.log('❌ temp-key.txt not found');
  process.exit(1);
}

try {
  const fileContent = fs.readFileSync(keyFilePath, 'utf8').trim();
  
  console.log('📄 Content read from file:');
  console.log(`   "${fileContent}"`);
  console.log(`📏 Length: ${fileContent.length} characters`);
  
  if (fileContent.length === 88) {
    console.log('✅ This looks like a base58 private key string!');
    
    try {
      // Decode base58 to bytes
      const privateKeyBytes = bs58.decode(fileContent);
      console.log(`✅ Successfully decoded base58 to ${privateKeyBytes.length} bytes`);
      
      if (privateKeyBytes.length !== 64) {
        console.log(`❌ Expected 64 bytes, got ${privateKeyBytes.length}`);
        process.exit(1);
      }
      
      // Convert to array format
      const privateKeyArray = Array.from(privateKeyBytes);
      console.log('✅ Converted to array format');
      
      // Test if it creates the right wallet
      const wallet = Keypair.fromSecretKey(privateKeyBytes);
      console.log(`\n🔑 Generated wallet: ${wallet.publicKey.toString()}`);
      console.log(`🎯 Expected wallet:  8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM`);
      
      if (wallet.publicKey.toString() === '8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM') {
        console.log('🎉 SUCCESS! This private key matches your wallet!');
        
        // Save the array format to a new file
        const arrayFormat = JSON.stringify(privateKeyArray);
        fs.writeFileSync(path.join(__dirname, 'temp-key-array.txt'), arrayFormat);
        
        console.log('\n📝 Array format saved to temp-key-array.txt:');
        console.log(`   [${privateKeyArray.slice(0, 5).join(', ')}, ... (64 numbers total)]`);
        
        console.log('\n📋 Next steps:');
        console.log('1. Copy the content from temp-key-array.txt');
        console.log('2. Replace the content in temp-key.txt with the array format');
        console.log('3. Run the collection creation script');
        
      } else {
        console.log('❌ This private key does not match your expected wallet');
        console.log('   Please make sure you exported the key for the correct wallet');
      }
      
    } catch (decodeError) {
      console.log('❌ Failed to decode base58 string:');
      console.log(`   Error: ${decodeError.message}`);
      console.log('   Make sure you copied the private key correctly');
    }
    
  } else {
    console.log('❌ Unexpected format');
    console.log('   Expected either:');
    console.log('   - Base58 string (88 characters)');
    console.log('   - Array format: [123,45,67,...]');
  }
  
} catch (error) {
  console.log('❌ Error processing file:');
  console.log(`   Error: ${error.message}`);
} 