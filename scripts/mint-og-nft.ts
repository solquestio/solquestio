import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';
import fs from 'fs';
import path from 'path';

// Load configuration
const configPath = path.join(__dirname, '..', 'config', 'nft-collections.json');

interface NFTConfig {
  network: string;
  collections: {
    og: {
      mint: string;
      metadata: string;
      masterEdition: string;
    };
    certificates: {
      mint: string;
      metadata: string;
      masterEdition: string;
    };
  };
}

/**
 * Check if a wallet already owns an OG NFT from the collection
 */
async function checkExistingOGNFT(metaplex: Metaplex, walletAddress: PublicKey, collectionMint: PublicKey): Promise<boolean> {
  try {
    console.log(`Checking if ${walletAddress.toString()} already owns an OG NFT...`);
    
    const nfts = await metaplex.nfts().findAllByOwner({ 
      owner: walletAddress 
    });
    
    const hasOGNFT = nfts.some(nft => 
      nft.collection?.address.toString() === collectionMint.toString()
    );
    
    if (hasOGNFT) {
      console.log(`❌ Wallet already owns an OG NFT from this collection`);
      return true;
    }
    
    console.log(`✅ Wallet is eligible for OG NFT minting`);
    return false;
    
  } catch (error) {
    console.error('Error checking existing NFT ownership:', error);
    // In case of error, allow minting but log the issue
    console.log('⚠️ Could not verify existing ownership, proceeding with mint...');
    return false;
  }
}

/**
 * Get the next available token ID for the collection
 */
async function getNextTokenId(metaplex: Metaplex, collectionMint: PublicKey): Promise<number> {
  try {
    // In a production environment, you'd want to track this in a database
    // For now, we'll use a simple file-based counter
    const counterPath = path.join(__dirname, '..', 'config', 'og-nft-counter.json');
    
    let counter = { nextId: 1 };
    
    if (fs.existsSync(counterPath)) {
      counter = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
    }
    
    const nextId = counter.nextId;
    
    // Update counter for next mint
    counter.nextId = nextId + 1;
    fs.writeFileSync(counterPath, JSON.stringify(counter, null, 2));
    
    return nextId;
    
  } catch (error) {
    console.error('Error getting next token ID:', error);
    // Fallback to random ID if counter fails
    return Math.floor(Math.random() * 10000) + 1;
  }
}

async function mintOGNFT(recipientAddress: string, tokenId?: number, attributes: any[] = [], skipOwnershipCheck: boolean = false) {
  try {
    // Load configuration
    if (!fs.existsSync(configPath)) {
      throw new Error('NFT collections not set up. Run npm run setup-nft first.');
    }

    const config: NFTConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const recipientPubkey = new PublicKey(recipientAddress);
    
    // Load payer keypair
    const payerKeypairPath = process.env.PAYER_KEYPAIR_PATH || './keypairs/payer.json';
    const payerKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(payerKeypairPath, 'utf8')))
    );

    // Setup connection and Metaplex
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
    );

    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payerKeypair))
      .use(bundlrStorage({
        address: config.network === 'mainnet-beta' 
          ? 'https://node1.bundlr.network' 
          : 'https://devnet.bundlr.network',
        providerUrl: connection.rpcEndpoint,
        timeout: 60000,
      }));

    const collectionMint = new PublicKey(config.collections.og.mint);

    // Check if wallet already owns an OG NFT (unless explicitly skipped)
    if (!skipOwnershipCheck) {
      const alreadyOwnsNFT = await checkExistingOGNFT(metaplex, recipientPubkey, collectionMint);
      if (alreadyOwnsNFT) {
        throw new Error(`Wallet ${recipientAddress} already owns an OG NFT. Each wallet can only mint 1 OG NFT.`);
      }
    }

    // Get token ID (auto-assign if not provided)
    const finalTokenId = tokenId || await getNextTokenId(metaplex, collectionMint);
    
    console.log(`Minting OG NFT #${finalTokenId} to ${recipientAddress}...`);

    // Prepare NFT metadata
    const nftMetadata = {
      name: `SolQuest OG #${finalTokenId}`,
      symbol: 'SQOG',
      description: `Exclusive SolQuest OG NFT #${finalTokenId}. Holders get XP boosts, exclusive access, and special privileges. Limited to 1 per wallet.`,
      seller_fee_basis_points: 500, // 5% royalties
      external_url: `https://solquest.io/nft/${finalTokenId}`,
      attributes: [
        {
          trait_type: 'Token ID',
          value: finalTokenId.toString()
        },
        {
          trait_type: 'XP Boost',
          value: '10%'
        },
        {
          trait_type: 'SOL Bonus',
          value: '10% on leaderboard rewards'
        },
        {
          trait_type: 'Collection',
          value: 'OG'
        },
        {
          trait_type: 'Rarity',
          value: finalTokenId <= 100 ? 'Legendary' : finalTokenId <= 1000 ? 'Rare' : 'Common'
        },
        {
          trait_type: 'Mint Type',
          value: 'Community Free Mint'
        },
        {
          trait_type: 'Limited Edition',
          value: '1 per wallet'
        },
        ...attributes
      ],
      collection: {
        name: 'SolQuest OG',
        family: 'SolQuest'
      }
    };

    // Upload metadata
    const metadataUri = await metaplex.storage().uploadMetadata(nftMetadata);
    console.log(`Metadata uploaded: ${metadataUri}`);

    // Mint NFT
    const { nft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: nftMetadata.name,
      symbol: nftMetadata.symbol,
      sellerFeeBasisPoints: nftMetadata.seller_fee_basis_points,
      tokenOwner: recipientPubkey,
      collection: collectionMint,
      creators: [
        {
          address: payerKeypair.publicKey,
          share: 100,
          verified: true
        }
      ]
    });

    // Verify as part of collection
    await metaplex.nfts().verifyCollection({
      mintAddress: nft.address,
      collectionMintAddress: collectionMint,
      isSizedCollection: true
    });

    console.log(`✅ OG NFT #${finalTokenId} minted successfully!`);
    console.log(`NFT Mint Address: ${nft.address.toString()}`);
    console.log(`Recipient: ${recipientAddress}`);
    console.log(`Metadata URI: ${metadataUri}`);
    console.log(`🔒 This wallet can no longer mint additional OG NFTs`);

    return {
      mintAddress: nft.address.toString(),
      metadataUri,
      tokenId: finalTokenId,
      recipient: recipientAddress,
      isFirstMint: true,
      limitEnforced: !skipOwnershipCheck
    };

  } catch (error) {
    console.error('Error minting OG NFT:', error);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: npm run mint-og-nft <recipient-address> [token-id] [attributes-json] [--skip-check]');
    console.log('');
    console.log('Examples:');
    console.log('  npm run mint-og-nft 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
    console.log('  npm run mint-og-nft 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM 1');
    console.log('  npm run mint-og-nft 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM 1 \'[{"trait_type":"Special","value":"Founder"}]\'');
    console.log('  npm run mint-og-nft 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --skip-check');
    console.log('');
    console.log('Note: Each wallet can only mint 1 OG NFT. Use --skip-check to override (admin only).');
    process.exit(1);
  }

  const recipientAddress = args[0];
  let tokenId: number | undefined;
  let attributes: any[] = [];
  let skipOwnershipCheck = false;

  // Parse arguments
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--skip-check') {
      skipOwnershipCheck = true;
      console.log('⚠️ Skipping ownership check (admin override)');
    } else if (!isNaN(parseInt(arg))) {
      tokenId = parseInt(arg);
    } else if (arg.startsWith('[') || arg.startsWith('{')) {
      try {
        attributes = JSON.parse(arg);
      } catch (e) {
        console.error('Invalid JSON for attributes:', arg);
        process.exit(1);
      }
    }
  }

  mintOGNFT(recipientAddress, tokenId, attributes, skipOwnershipCheck)
    .then((result) => {
      console.log('\n🎉 OG NFT minting completed successfully!');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error('❌ OG NFT minting failed:', error.message);
      process.exit(1);
    });
}

export { mintOGNFT }; 