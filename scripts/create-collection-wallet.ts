import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

// Generate a new keypair for collection creation
const generateCollectionWallet = () => {
  const keypair = Keypair.generate();
  
  const walletData = {
    publicKey: keypair.publicKey.toString(),
    secretKey: Array.from(keypair.secretKey),
    note: "This wallet is used for creating and managing NFT collections. Keep this secure!"
  };
  
  // Create config directory if it doesn't exist
  const configDir = path.join(process.cwd(), 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Save wallet to config
  const walletPath = path.join(configDir, 'collection-wallet.json');
  fs.writeFileSync(walletPath, JSON.stringify(walletData, null, 2));
  
  console.log('🔑 Collection wallet generated!');
  console.log(`📁 Saved to: ${walletPath}`);
  console.log(`🔗 Public Key: ${keypair.publicKey.toString()}`);
  console.log('\n⚠️  IMPORTANT:');
  console.log('1. Fund this wallet with SOL for devnet testing');
  console.log('2. Keep the wallet file secure - it controls your NFT collection');
  console.log('3. For mainnet, you may want to use a hardware wallet');
  
  return keypair;
};

// Run if called directly
if (require.main === module) {
  generateCollectionWallet();
}

export { generateCollectionWallet }; 