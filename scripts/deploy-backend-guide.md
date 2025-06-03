# 🚀 Backend Deployment Guide - Critical for Wallet Restrictions

## ⚠️ **IMPORTANT**: Current Status

Your **live backend at api.solquest.io does NOT have the wallet restriction code**. This is why:
- Users can mint multiple NFTs from the same wallet
- The "already claimed" check isn't working

## 🔧 What We Fixed

1. **✅ Backend Changes Made**:
   - Added in-memory wallet tracking (`mintedWallets` Set)
   - Updated eligibility endpoint to check if wallet already minted
   - Added mint validation to reject duplicate attempts
   - Enhanced error messages

2. **✅ Frontend Changes Made**:
   - Improved eligibility checking logic
   - Removed automatic redirects
   - Better success/error state handling

## 🚀 Deployment Steps

### Step 1: Set Environment Variables in Vercel

Go to **Vercel Dashboard** → **Your Backend Project** → **Settings** → **Environment Variables**

Add these **exactly**:
```bash
COLLECTION_MINT=H8SDMgDmKyrNZ61CGAVqYPX8v9UQ95f7f8b9hRY8bXxk
TREASURY_WALLET=8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
COLLECTION_WALLET_SECRET=[228,166,229,159,123,246,86,119,246,2,111,62,168,37,7,77,155,195,74,87,201,42,8,127,90,251,204,110,214,178,164,182,115,188,54,236,190,128,73,168,95,177,136,58,112,25,212,252,164,181,132,188,137,209,204,229,184,176,247,208,162,0,158,246]
```

### Step 2: Deploy Backend

1. **Commit your changes** (if not already done):
   ```bash
   git add backend/api/og-nft/index.ts
   git commit -m "Add wallet restriction and fix mint limits"
   git push
   ```

2. **Redeploy in Vercel**:
   - Go to Vercel Dashboard
   - Find your backend project
   - Click **"Redeploy"** or push will auto-deploy

### Step 3: Test the Fixes

After deployment, test both scenarios:

#### Test 1: First-time wallet (should work)
```bash
# Use a wallet that hasn't minted before
# Visit: https://solquest.io/claim-og-nft
# Connect new wallet → Should see "Step 2: Claim Your FREE NFT"
```

#### Test 2: Already minted wallet (should be blocked)
```bash
# Use the wallet that already minted (yours)
# Visit: https://solquest.io/claim-og-nft  
# Connect your wallet → Should see "NFT Already Claimed" 🔒
```

## 🔍 Verification Commands

Test the API endpoints directly:

```bash
# Test eligibility for a wallet that already minted
curl "https://api.solquest.io/api/og-nft?action=eligibility&walletAddress=8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM"

# Expected response for already minted wallet:
# {"eligible":false,"reason":"Wallet has already minted an OG NFT (limit: 1 per wallet)","collectionMint":"H8SDMgDmKyrNZ61CGAVqYPX8v9UQ95f7f8b9hRY8bXxk"}
```

## 🎯 Expected Results After Deployment

### ✅ **What Should Work**:
1. **First-time wallets**: Can claim NFT normally
2. **Already minted wallets**: See "NFT Already Claimed" message
3. **No automatic redirects**: Users stay on claim page after minting
4. **Real NFTs**: Actual mainnet NFTs get minted to user wallets

### ❌ **What Should Be Blocked**:
1. **Duplicate mints**: Same wallet can't mint twice
2. **Backend errors**: Proper error handling for failed mints

## 🚨 Critical Notes

1. **⚠️ In-Memory Storage Limitation**: 
   - Current wallet tracking uses memory (resets on backend restart)
   - For production, consider moving to a database for persistent tracking

2. **🔐 Security**: 
   - Environment variables are set securely in Vercel
   - Private key is safely stored as environment variable

3. **💰 Real Costs**: 
   - This is mainnet - real SOL fees (~0.001 SOL per mint)
   - Real NFTs get created and sent to users

## 🆘 Troubleshooting

**If wallet restrictions still don't work**:
1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test the API endpoints directly
4. Check browser console for error messages

**Contact me if you need help with the deployment process!** 