# Environment Setup Guide for SolQuest NFT System

## Required Environment Variables

For your **Vercel deployment**, you need to set these environment variables:

### 1. Collection Configuration
```bash
COLLECTION_MINT=H8SDMgDmKyrNZ61CGAVqYPX8v9UQ95f7f8b9hRY8bXxk
TREASURY_WALLET=8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### 2. Collection Wallet Secret
You need to set `COLLECTION_WALLET_SECRET` to your private key in JSON array format.

**From your temp-key-array.txt file**, copy the content (should look like `[123,45,67,...]`) and set it as:
```bash
COLLECTION_WALLET_SECRET=[your-private-key-array-from-temp-key-array.txt]
```

## How to Set in Vercel

1. Go to your Vercel dashboard
2. Select your backend project
3. Go to Settings → Environment Variables
4. Add each variable:
   - `COLLECTION_MINT` = `H8SDMgDmKyrNZ61CGAVqYPX8v9UQ95f7f8b9hRY8bXxk`
   - `TREASURY_WALLET` = `8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM`
   - `SOLANA_RPC_URL` = `https://api.mainnet-beta.solana.com`
   - `COLLECTION_WALLET_SECRET` = `[your-private-key-array]`

5. Redeploy your backend

## Security Notes

- **NEVER** commit your private key to git
- The `COLLECTION_WALLET_SECRET` should only be in your Vercel environment variables
- After setting up, delete any local temp key files
- Consider using a dedicated wallet for NFT minting operations

## Testing the Setup

After deployment, test the endpoints:
- `GET https://api.solquest.io/api/og-nft?action=stats`
- `GET https://api.solquest.io/api/og-nft?action=eligibility&walletAddress=YOUR_WALLET`

## Next Steps

1. ✅ Set environment variables in Vercel
2. 🚀 Deploy backend
3. 🔗 Test frontend minting flow
4. 🎉 Go live! 