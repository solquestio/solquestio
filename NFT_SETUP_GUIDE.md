# SolQuest NFT Collections Setup Guide

This guide will help you set up and manage the NFT collections for SolQuest, including the OG community collection and path completion certificates.

## 🎯 Overview

SolQuest uses two main NFT collections:

1. **SolQuest OG Collection** (`SQOG`) - Premium community NFTs with utility (**1 per wallet limit**)
2. **SolQuest Certificates** (`SQCERT`) - Achievement certificates for completed learning paths

## 🔒 Key Features

### OG Collection Limits
- **1 NFT per wallet maximum** - Ensures fair distribution
- **Free mint** for early community members
- **Automatic token ID assignment** - Sequential numbering
- **Ownership verification** - Prevents duplicate minting
- **Admin override** available for special cases

### Certificate Collection
- **Unlimited per wallet** - Users can earn multiple certificates
- **Path-specific** - Each learning path has its own certificate
- **Automatic minting** - Triggered upon path completion

## 📋 Prerequisites

- Node.js 18+ installed
- Solana CLI installed and configured
- A funded Solana wallet (devnet SOL for testing, mainnet SOL for production)
- Basic understanding of Solana and NFTs

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Install NFT dependencies with legacy peer deps (resolves version conflicts)
npm install @metaplex-foundation/js @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/mpl-token-metadata @solana/spl-account-compression @solana/spl-token ts-node --legacy-peer-deps
```

### 2. Create Collection Authority Keypair

```bash
# Create keypairs directory
mkdir -p keypairs

# Generate a new keypair for collection authority
solana-keygen new --outfile keypairs/payer.json

# Or use an existing keypair
cp /path/to/your/keypair.json keypairs/payer.json
```

### 3. Fund Your Keypair

```bash
# For devnet testing
solana airdrop 2 keypairs/payer.json --url devnet

# For mainnet, transfer SOL to the address
solana address -k keypairs/payer.json
```

### 4. Configure Environment

Create a `.env` file in your project root:

```env
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com  # or your preferred RPC
PAYER_KEYPAIR_PATH=./keypairs/payer.json

# For production, use mainnet RPC
# SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### 5. Update Creator Addresses

Edit `scripts/setup-nft-collections.ts` and update the creator addresses:

```typescript
const OG_COLLECTION_CONFIG = {
  // ... other config
  creators: [
    {
      address: 'YOUR_CREATOR_WALLET_ADDRESS_HERE', // Replace with your address
      share: 100,
      verified: true
    }
  ]
};

const CERTIFICATE_COLLECTION_CONFIG = {
  // ... other config  
  creators: [
    {
      address: 'YOUR_CREATOR_WALLET_ADDRESS_HERE', // Replace with your address
      share: 100,
      verified: true
    }
  ]
};
```

### 6. Create Collections

```bash
# Set up both NFT collections
npm run setup-nft
```

This will:
- Create the OG collection NFT
- Create the certificate collection NFT  
- Upload metadata to Arweave
- Save collection addresses to `config/nft-collections.json`
- Initialize the token ID counter for OG NFTs

## 🎨 Minting NFTs

### Mint OG NFTs (1 per wallet limit)

```bash
# Mint an OG NFT to a specific wallet (auto-assigns token ID)
npm run mint-og-nft <recipient-address>

# Mint with specific token ID
npm run mint-og-nft <recipient-address> <token-id>

# With custom attributes
npm run mint-og-nft <recipient-address> <token-id> '[{"trait_type":"Special","value":"Founder"}]'

# Admin override (skip ownership check)
npm run mint-og-nft <recipient-address> --skip-check

# Examples:
npm run mint-og-nft 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
npm run mint-og-nft 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM 1
npm run mint-og-nft 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --skip-check
```

**Important**: Each wallet can only mint 1 OG NFT. Attempting to mint a second NFT to the same wallet will fail unless using `--skip-check`.

### Mint Path Completion Certificates

```bash
# Mint a certificate for completing a learning path
npm run mint-certificate <recipient-address> <path-id> [completion-date]

# Available path IDs: solana-foundations, solquest-og, zk-compression

# Examples:
npm run mint-certificate 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM solana-foundations
npm run mint-certificate 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM zk-compression 2024-01-15
```

## 🔧 Backend Integration

### New API Endpoints

The backend now includes dedicated OG NFT endpoints:

#### Check Eligibility
```bash
GET /api/og-nft/eligibility/:walletAddress
```

Response:
```json
{
  "eligible": true,
  "reason": "Eligible for minting",
  "collectionMint": "ABC123...",
  "stats": {
    "totalMinted": 1250,
    "remaining": 8750,
    "maxSupply": 10000,
    "nextTokenId": 1251
  },
  "mintingAvailable": true
}
```

#### Mint OG NFT
```bash
POST /api/og-nft/mint
Content-Type: application/json

{
  "walletAddress": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "specialAttributes": []
}
```

#### Get Collection Stats
```bash
GET /api/og-nft/stats
```

### Update Backend Configuration

After creating collections, update your backend with the new addresses:

```typescript
// backend/config/nft-config.ts
export const NFT_COLLECTIONS = {
  OG_COLLECTION: 'YOUR_OG_COLLECTION_MINT_ADDRESS',
  CERTIFICATES_COLLECTION: 'YOUR_CERTIFICATES_COLLECTION_MINT_ADDRESS'
};
```

### Automated Certificate Minting

Update your backend's path completion endpoint to automatically mint certificates:

```typescript
// backend/standalone.js - Update the mint-nft endpoint
app.post('/api/paths/:pathId/mint-nft', async (req, res) => {
  // ... existing validation code ...
  
  try {
    // Import the minting function
    const { mintCertificate } = require('./lib/nft-integration');
    
    // Mint certificate
    const result = await mintCertificate(
      walletAddress,
      pathId,
      new Date()
    );
    
    res.json({
      message: 'Certificate minted successfully!',
      nftDetails: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🎭 NFT Metadata Structure

### OG NFT Metadata (with 1 per wallet limit)

```json
{
  "name": "SolQuest OG #1",
  "symbol": "SQOG",
  "description": "Exclusive SolQuest OG NFT #1. Holders get XP boosts, exclusive access, and special privileges. Limited to 1 per wallet.",
  "image": "https://arweave.net/...",
  "attributes": [
    {"trait_type": "Token ID", "value": "1"},
    {"trait_type": "XP Boost", "value": "10%"},
    {"trait_type": "SOL Bonus", "value": "10% on leaderboard rewards"},
    {"trait_type": "Collection", "value": "OG"},
    {"trait_type": "Rarity", "value": "Legendary"},
    {"trait_type": "Mint Type", "value": "Community Free Mint"},
    {"trait_type": "Limited Edition", "value": "1 per wallet"}
  ],
  "collection": {
    "name": "SolQuest OG",
    "family": "SolQuest"
  }
}
```

### Certificate Metadata

```json
{
  "name": "Solana Explorer Path - Completion Certificate",
  "symbol": "SQCERT", 
  "description": "This certificate verifies the completion of the Solana Explorer Path learning path on SolQuest.io.",
  "image": "https://arweave.net/...",
  "attributes": [
    {"trait_type": "Path", "value": "Solana Explorer Path"},
    {"trait_type": "Path ID", "value": "solana-foundations"},
    {"trait_type": "Completion Date", "value": "2024-01-15"},
    {"trait_type": "Type", "value": "Learning Path Certificate"},
    {"trait_type": "Issuer", "value": "SolQuest"}
  ]
}
```

## 🔍 Verification & Utilities

### Check NFT Ownership

```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

async function checkNFTOwnership(walletAddress: string, collectionAddress: string) {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const metaplex = Metaplex.make(connection);
  
  const nfts = await metaplex.nfts().findAllByOwner({ 
    owner: new PublicKey(walletAddress) 
  });
  
  return nfts.some(nft => 
    nft.collection?.address.toString() === collectionAddress
  );
}
```

### Check OG NFT Eligibility

```typescript
// Using the backend integration
const { checkOGNFTEligibility } = require('./lib/nft-integration');

const eligibility = await checkOGNFTEligibility(walletAddress);
console.log(eligibility);
// { eligible: true, reason: "Eligible for minting", collectionMint: "ABC123..." }
```

### Get Collection Stats

```typescript
const { getOGCollectionStats } = require('./lib/nft-integration');

const stats = await getOGCollectionStats();
console.log(stats);
// { totalMinted: 1250, nextTokenId: 1251, maxSupply: 10000, remaining: 8750 }
```

## 🎪 Frontend Integration

### OG NFT Minting Component

Use the new `OGNFTMintCard` component:

```tsx
import OGNFTMintCard from '@/components/nft/OGNFTMintCard';

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">SolQuest Community</h1>
      
      {/* OG NFT Minting Section */}
      <div className="mb-8">
        <OGNFTMintCard />
      </div>
      
      {/* Other community content */}
    </div>
  );
}
```

The component automatically:
- Checks wallet eligibility
- Shows minting progress
- Enforces 1 per wallet limit
- Displays NFT benefits
- Handles minting process
- Shows success/error states

## 💡 Business Model Implementation

### Free Mint Strategy for Early Community

1. **Phase 1: Early Adopters** (First 1000 NFTs)
   - Free mint for community members
   - 1 per wallet limit ensures fair distribution
   - Legendary rarity (Token IDs 1-100)
   - Rare rarity (Token IDs 101-1000)

2. **Phase 2: Community Growth** (NFTs 1001-5000)
   - Free mint continues
   - Common rarity
   - Focus on onboarding new users

3. **Phase 3: Premium Features** (NFTs 5001-10000)
   - Consider small mint fee (0.01-0.05 SOL)
   - Special attributes for later adopters
   - Maintain 1 per wallet limit

### Utility Implementation

#### XP Boost System
```typescript
// In your quest completion logic
const userNFTs = await checkOGNFTOwnership(walletAddress);
const xpMultiplier = userNFTs.hasOGNFT ? 1.1 : 1.0; // 10% boost
const finalXP = baseXP * xpMultiplier;
```

#### Leaderboard Reward Bonus System
The OG NFT provides a **10% bonus on monthly leaderboard rewards**. Here's how it works:

**Monthly Reward Tiers:**
- 🥇 1st place: 5.0 SOL (5.5 SOL with OG NFT)
- 🥈 2nd place: 3.0 SOL (3.3 SOL with OG NFT)  
- 🥉 3rd place: 2.0 SOL (2.2 SOL with OG NFT)
- 4th place: 1.5 SOL (1.65 SOL with OG NFT)
- 5th place: 1.0 SOL (1.1 SOL with OG NFT)
- 6th-10th: 0.8-0.3 SOL (with 10% bonus)

```typescript
// In your leaderboard reward distribution
const baseReward = getLeaderboardReward(userRank); // e.g., 1 SOL for 5th place
const bonusMultiplier = userNFTs.hasOGNFT ? 1.1 : 1.0; // 10% bonus
const totalReward = baseReward * bonusMultiplier; // 1.1 SOL for OG NFT holders

// Example implementation
const { calculateLeaderboardReward } = require('./lib/leaderboard-rewards');

async function distributeMonthlyRewards(leaderboard, ogCollectionMint) {
  for (const user of leaderboard.slice(0, 10)) { // Top 10 only
    const reward = await calculateLeaderboardReward(
      user.rank, 
      user.walletAddress, 
      ogCollectionMint
    );
    
    console.log(`Rank ${reward.rank}: ${reward.finalReward} SOL`);
    if (reward.hasOGNFT) {
      console.log(`🎉 OG Bonus: +${reward.bonusAmount.toFixed(3)} SOL`);
    }
    
    // Send SOL to user.walletAddress
    await sendSOL(user.walletAddress, reward.finalReward);
  }
}
```

#### API Endpoints for Rewards

```bash
# Get reward tiers and info
GET /api/leaderboard/rewards

# Simulate reward for a specific rank
GET /api/leaderboard/rewards?simulateRank=1

# Calculate actual reward for a wallet
GET /api/leaderboard/rewards?walletAddress=WALLET&rank=1
```

## 🔒 Security & Best Practices

### 1. Keypair Security
- Never commit keypairs to version control
- Use environment variables for production
- Consider hardware wallets for mainnet
- Rotate keys periodically

### 2. Collection Authority
- Keep update authority secure
- Consider multi-sig for production collections
- Document all authority transfers
- Implement role-based access

### 3. Metadata Immutability
- Upload to permanent storage (Arweave/IPFS)
- Verify metadata before minting
- Consider freezing metadata after launch
- Backup metadata files

### 4. Rate Limiting
- Implement API rate limits
- Monitor for abuse patterns
- Add CAPTCHA for public endpoints
- Log all minting activities

## 🚨 Troubleshooting

### Common Issues

1. **"Wallet already owns an OG NFT"**
   ```bash
   # Check ownership
   curl "http://localhost:5000/api/og-nft/eligibility/WALLET_ADDRESS"
   
   # Use admin override if needed
   npm run mint-og-nft WALLET_ADDRESS --skip-check
   ```

2. **"Insufficient funds"**
   ```bash
   # Check balance
   solana balance keypairs/payer.json
   
   # Add more SOL
   solana airdrop 1 keypairs/payer.json --url devnet
   ```

3. **"Collection not found"**
   - Verify collection addresses in `config/nft-collections.json`
   - Ensure collections were created successfully
   - Check network configuration (devnet vs mainnet)

4. **"Token ID counter not found"**
   ```bash
   # Initialize counter manually
   mkdir -p config
   echo '{"nextId": 1}' > config/og-nft-counter.json
   ```

### Debug Mode

Enable debug logging:

```bash
export DEBUG=metaplex:*
npm run setup-nft
```

## 📊 Monitoring & Analytics

### Track Minting Progress

```typescript
// Get real-time stats
const stats = await getOGCollectionStats();
console.log(`Progress: ${stats.totalMinted}/${stats.maxSupply} (${(stats.totalMinted/stats.maxSupply*100).toFixed(1)}%)`);
```

### Monitor API Usage

```bash
# Check eligibility endpoint usage
curl "http://localhost:5000/api/og-nft/stats"

# Monitor error rates
tail -f logs/nft-minting.log
```

## 📚 Additional Resources

- [Metaplex Documentation](https://docs.metaplex.com/)
- [Solana NFT Guide](https://docs.solana.com/developing/guides/nfts)
- [Magic Eden Creator Guide](https://docs.magiceden.io/creators)
- [Helius NFT API](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api)

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Solana and Metaplex documentation
3. Join the SolQuest Discord for community support
4. Open an issue in the project repository

---

**Happy minting! 🎨✨**

*Remember: 1 NFT per wallet ensures fair distribution and builds a strong, engaged community!* 