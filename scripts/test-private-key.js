const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

console.log('🔍 Private Key Tester');
console.log('===================\n');

// Let's try a different approach - save the key to a temporary file
console.log('📋 INSTRUCTIONS:');
console.log('1. Create a file called "temp-key.txt" in this directory');
console.log('2. Paste your private key array into that file');
console.log('3. Run this script again');
console.log('4. Format should be: [123,45,67,89,...]');
console.log('\nExpected wallet: 8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM');

const keyFilePath = path.join(__dirname, 'temp-key.txt');

if (!fs.existsSync(keyFilePath)) {
  console.log(`\n❌ File not found: ${keyFilePath}`);
  console.log('📝 Please create temp-key.txt and paste your private key array into it');
  console.log('   Example content: [123,45,67,89,156,234,...]');
  process.exit(1);
}

try {
  console.log('\n🔍 Reading private key from temp-key.txt...');
  const fileContent = fs.readFileSync(keyFilePath, 'utf8');
  
  console.log('📄 File content (first 100 chars):');
  console.log(`   "${fileContent.substring(0, 100)}..."`);
  console.log(`📏 Total length: ${fileContent.length} characters`);
  
  // Clean up the content
  let cleanedContent = fileContent.trim();
  
  // Remove surrounding quotes if present
  if ((cleanedContent.startsWith('"') && cleanedContent.endsWith('"')) ||
      (cleanedContent.startsWith("'") && cleanedContent.endsWith("'"))) {
    cleanedContent = cleanedContent.slice(1, -1);
    console.log('🧹 Removed surrounding quotes');
  }
  
  console.log('\n🧹 Cleaned content (first 100 chars):');
  console.log(`   "${cleanedContent.substring(0, 100)}..."`);
  
  // Check format
  if (!cleanedContent.startsWith('[')) {
    console.log('❌ Does not start with [');
    console.log(`   First character: "${cleanedContent[0]}"`);
    process.exit(1);
  }
  
  if (!cleanedContent.endsWith(']')) {
    console.log('❌ Does not end with ]');
    console.log(`   Last character: "${cleanedContent[cleanedContent.length - 1]}"`);
    process.exit(1);
  }
  
  console.log('✅ Starts with [ and ends with ]');
  
  // Try to parse JSON
  let privateKeyArray;
  try {
    privateKeyArray = JSON.parse(cleanedContent);
    console.log('✅ Successfully parsed as JSON');
  } catch (parseError) {
    console.log('❌ JSON parsing failed:');
    console.log(`   Error: ${parseError.message}`);
    
    // Show problematic part
    const errorMatch = parseError.message.match(/position (\d+)/);
    if (errorMatch) {
      const pos = parseInt(errorMatch[1]);
      const start = Math.max(0, pos - 20);
      const end = Math.min(cleanedContent.length, pos + 20);
      console.log(`   Around position ${pos}: "${cleanedContent.substring(start, end)}"`);
    }
    process.exit(1);
  }
  
  // Validate array
  if (!Array.isArray(privateKeyArray)) {
    console.log('❌ Not an array');
    console.log(`   Type: ${typeof privateKeyArray}`);
    process.exit(1);
  }
  
  console.log(`✅ Is an array with ${privateKeyArray.length} elements`);
  
  if (privateKeyArray.length !== 64) {
    console.log(`❌ Wrong length. Expected 64, got ${privateKeyArray.length}`);
    if (privateKeyArray.length > 0) {
      console.log(`   First few elements: [${privateKeyArray.slice(0, 5).join(', ')}...]`);
      console.log(`   Last few elements: [...${privateKeyArray.slice(-5).join(', ')}]`);
    }
    process.exit(1);
  }
  
  console.log('✅ Correct length (64 elements)');
  
  // Check if all elements are valid numbers
  const invalidElements = privateKeyArray.filter((num, index) => 
    typeof num !== 'number' || num < 0 || num > 255 || !Number.isInteger(num)
  );
  
  if (invalidElements.length > 0) {
    console.log(`❌ Found ${invalidElements.length} invalid elements`);
    console.log(`   Examples: ${invalidElements.slice(0, 5)}`);
    process.exit(1);
  }
  
  console.log('✅ All elements are valid numbers (0-255)');
  
  // Try to create keypair
  let wallet;
  try {
    wallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    console.log('✅ Successfully created keypair');
  } catch (keypairError) {
    console.log('❌ Failed to create keypair:');
    console.log(`   Error: ${keypairError.message}`);
    process.exit(1);
  }
  
  console.log(`\n🔑 Generated wallet address: ${wallet.publicKey.toString()}`);
  console.log(`🎯 Expected wallet address: 8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM`);
  
  if (wallet.publicKey.toString() === '8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM') {
    console.log('🎉 SUCCESS! Private key is valid and matches expected wallet!');
    console.log('\n📋 Next steps:');
    console.log('1. You can now use this private key for collection creation');
    console.log('2. Delete temp-key.txt for security');
    console.log('3. Run the collection creation script');
  } else {
    console.log('❌ Private key does not match expected wallet');
    console.log('   This private key belongs to a different wallet');
    console.log('   Please export the private key for wallet: 8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM');
  }
  
} catch (error) {
  console.log('❌ Error reading or processing file:');
  console.log(`   Error: ${error.message}`);
  process.exit(1);
} 