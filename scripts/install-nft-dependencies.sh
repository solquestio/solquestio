#!/bin/bash

echo "🚀 Installing NFT dependencies for SolQuest..."

# Install Metaplex and Solana NFT dependencies
npm install @metaplex-foundation/js@^0.20.1
npm install @metaplex-foundation/umi@^0.9.2
npm install @metaplex-foundation/umi-bundle-defaults@^0.9.2
npm install @metaplex-foundation/mpl-token-metadata@^3.2.1
npm install @metaplex-foundation/mpl-bubblegum@^1.0.1

# Install Solana dependencies
npm install @solana/spl-account-compression@^0.1.8
npm install @solana/spl-token@^0.3.9

# Install development dependencies
npm install --save-dev @types/bs58@^4.0.4
npm install --save-dev ts-node@^10.9.1

echo "✅ NFT dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Create a keypair for your collection authority"
echo "2. Fund the keypair with SOL (devnet or mainnet)"
echo "3. Update the creator addresses in the setup script"
echo "4. Run: npm run setup-nft" 