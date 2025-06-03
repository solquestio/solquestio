# 🔐 How to Get Your Wallet Private Key

To create the NFT collection with your existing wallet (`8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM`), you need to export your private key.

## 📱 **From Phantom Wallet:**

1. Open Phantom wallet
2. Click the gear icon (Settings)
3. Go to "Security & Privacy"
4. Click "Export Private Key"
5. Enter your password
6. Copy the private key array (looks like `[123, 45, 67, ...]`)

## 🦊 **From Solflare Wallet:**

1. Open Solflare wallet
2. Click on your wallet name
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key array

## 🖥️ **Using the Private Key:**

### Option 1: Environment Variable (Recommended)
```bash
export PRIVATE_KEY='[123,45,67,89,...]'
node scripts/create-nft-collection-mainnet.js
```

### Option 2: PowerShell (Windows)
```powershell
$env:PRIVATE_KEY='[123,45,67,89,...]'
node scripts/create-nft-collection-mainnet.js
```

### Option 3: One-liner
```bash
PRIVATE_KEY='[123,45,67,89,...]' node scripts/create-nft-collection-mainnet.js
```

## ⚠️ **Security Notes:**

- **Never share your private key**
- **Don't commit it to git**
- **Use environment variables in production**
- **Consider using a hardware wallet for large amounts**

## 🎯 **What Happens Next:**

1. The script will create a real NFT collection on Solana mainnet
2. You'll get a collection address 
3. We'll update the backend to use this collection
4. Users will get real NFTs worth actual SOL!

## 💰 **Cost:**

- Collection creation: ~0.05 SOL
- Each NFT mint: ~0.002 SOL
- Network fees: ~0.001 SOL per transaction

**Total recommended balance: 0.1+ SOL in your wallet** 