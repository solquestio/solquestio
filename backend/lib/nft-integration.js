const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Metaplex, keypairIdentity, bundlrStorage } = require('@metaplex-foundation/js');
const fs = require('fs');
const path = require('path');

// Load NFT collection configuration
const configPath = path.join(__dirname, '..', '..', 'config', 'nft-collections.json');

// Path configurations matching the frontend
const PATH_CONFIGS = {
  'solana-foundations': {
    name: 'Solana Explorer Path',
    description: 'Foundational knowledge of Solana blockchain and ecosystem',
    image: 'solana-foundations-certificate.png'
  },
  'solquest-og': {
    name: 'SolQuest OG Path', 
    description: 'Exclusive quests and learning experiences for SolQuest enthusiasts',
    image: 'solquest-og-certificate.png'
  },
  'zk-compression': {
    name: 'ZK Compression Path',
    description: 'Advanced understanding of Zero-Knowledge compression on Solana',
    image: 'zk-compression-certificate.png'
  }
};

class NFTMinter {
  constructor() {
    this.config = null;
    this.metaplex = null;
    this.connection = null;
    this.payer = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Load configuration
      if (!fs.existsSync(configPath)) {
        throw new Error('NFT collections not configured. Run npm run setup-nft first.');
      }

      this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Load payer keypair
      const payerKeypairPath = process.env.PAYER_KEYPAIR_PATH || './keypairs/payer.json';
      
      if (!fs.existsSync(payerKeypairPath)) {
        throw new Error(`Payer keypair not found at: ${payerKeypairPath}`);
      }

      this.payer = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(payerKeypairPath, 'utf8')))
      );

      // Setup connection
      this.connection = new Connection(
        process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
      );

      // Setup Metaplex
      this.metaplex = Metaplex.make(this.connection)
        .use(keypairIdentity(this.payer))
        .use(bundlrStorage({
          address: this.config.network === 'mainnet-beta' 
            ? 'https://node1.bundlr.network' 
            : 'https://devnet.bundlr.network',
          providerUrl: this.connection.rpcEndpoint,
          timeout: 60000,
        }));

      this.initialized = true;
      console.log('NFT Minter initialized successfully');

    } catch (error) {
      console.error('Failed to initialize NFT Minter:', error);
      throw error;
    }
  }

  /**
   * Check if a wallet already owns an OG NFT from the collection
   */
  async checkExistingOGNFT(walletAddress, collectionMint) {
    try {
      console.log(`Checking if ${walletAddress} already owns an OG NFT...`);
      
      const nfts = await this.metaplex.nfts().findAllByOwner({ 
        owner: new PublicKey(walletAddress) 
      });
      
      const hasOGNFT = nfts.some(nft => 
        nft.collection?.address.toString() === collectionMint
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
   * Get the next available token ID for the OG collection
   */
  async getNextOGTokenId() {
    try {
      const counterPath = path.join(__dirname, '..', '..', 'config', 'og-nft-counter.json');
      
      let counter = { nextId: 1 };
      
      if (fs.existsSync(counterPath)) {
        counter = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
      }
      
      const nextId = counter.nextId;
      
      // Update counter for next mint
      counter.nextId = nextId + 1;
      
      // Ensure config directory exists
      const configDir = path.dirname(counterPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(counterPath, JSON.stringify(counter, null, 2));
      
      return nextId;
      
    } catch (error) {
      console.error('Error getting next token ID:', error);
      // Fallback to timestamp-based ID if counter fails
      return Date.now() % 10000;
    }
  }

  async mintPathCertificate(recipientAddress, pathId, completionDate = new Date()) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const pathConfig = PATH_CONFIGS[pathId];
      if (!pathConfig) {
        throw new Error(`Unknown path ID: ${pathId}`);
      }

      console.log(`Minting certificate for ${pathConfig.name} to ${recipientAddress}...`);

      // Prepare certificate metadata
      const certificateMetadata = {
        name: `${pathConfig.name} - Completion Certificate`,
        symbol: 'SQCERT',
        description: `This certificate verifies the completion of the ${pathConfig.name} learning path on SolQuest.io. ${pathConfig.description}`,
        seller_fee_basis_points: 0,
        external_url: `https://solquest.io/certificates/${pathId}`,
        attributes: [
          {
            trait_type: 'Path',
            value: pathConfig.name
          },
          {
            trait_type: 'Path ID',
            value: pathId
          },
          {
            trait_type: 'Completion Date',
            value: completionDate.toISOString().split('T')[0]
          },
          {
            trait_type: 'Type',
            value: 'Learning Path Certificate'
          },
          {
            trait_type: 'Issuer',
            value: 'SolQuest'
          },
          {
            trait_type: 'Year',
            value: completionDate.getFullYear().toString()
          },
          {
            trait_type: 'Month',
            value: completionDate.toLocaleString('default', { month: 'long' })
          }
        ],
        collection: {
          name: 'SolQuest Certificates',
          family: 'SolQuest Certificates'
        }
      };

      // Upload metadata
      const metadataUri = await this.metaplex.storage().uploadMetadata(certificateMetadata);
      console.log(`Metadata uploaded: ${metadataUri}`);

      // Mint certificate NFT
      const { nft } = await this.metaplex.nfts().create({
        uri: metadataUri,
        name: certificateMetadata.name,
        symbol: certificateMetadata.symbol,
        sellerFeeBasisPoints: 0,
        tokenOwner: new PublicKey(recipientAddress),
        collection: new PublicKey(this.config.collections.certificates.mint),
        creators: [
          {
            address: this.payer.publicKey,
            share: 100,
            verified: true
          }
        ]
      });

      // Verify as part of collection
      await this.metaplex.nfts().verifyCollection({
        mintAddress: nft.address,
        collectionMintAddress: new PublicKey(this.config.collections.certificates.mint),
        isSizedCollection: true
      });

      console.log(`✅ Certificate minted successfully!`);
      console.log(`Certificate Mint Address: ${nft.address.toString()}`);

      return {
        mintAddress: nft.address.toString(),
        metadataUri,
        pathId,
        pathName: pathConfig.name,
        recipient: recipientAddress,
        completionDate: completionDate.toISOString(),
        transactionSignature: 'real-nft-minted' // This would be the actual transaction signature
      };

    } catch (error) {
      console.error('Error minting certificate:', error);
      throw error;
    }
  }

  async mintOGNFT(recipientAddress, tokenId = null, attributes = [], skipOwnershipCheck = false) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const collectionMint = this.config.collections.og.mint;

      // Check if wallet already owns an OG NFT (unless explicitly skipped)
      if (!skipOwnershipCheck) {
        const alreadyOwnsNFT = await this.checkExistingOGNFT(recipientAddress, collectionMint);
        if (alreadyOwnsNFT) {
          throw new Error(`Wallet ${recipientAddress} already owns an OG NFT. Each wallet can only mint 1 OG NFT.`);
        }
      }

      // Get token ID (auto-assign if not provided)
      const finalTokenId = tokenId || await this.getNextOGTokenId();
      
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
      const metadataUri = await this.metaplex.storage().uploadMetadata(nftMetadata);
      console.log(`Metadata uploaded: ${metadataUri}`);

      // Mint NFT
      const { nft } = await this.metaplex.nfts().create({
        uri: metadataUri,
        name: nftMetadata.name,
        symbol: nftMetadata.symbol,
        sellerFeeBasisPoints: nftMetadata.seller_fee_basis_points,
        tokenOwner: new PublicKey(recipientAddress),
        collection: new PublicKey(collectionMint),
        creators: [
          {
            address: this.payer.publicKey,
            share: 100,
            verified: true
          }
        ]
      });

      // Verify as part of collection
      await this.metaplex.nfts().verifyCollection({
        mintAddress: nft.address,
        collectionMintAddress: new PublicKey(collectionMint),
        isSizedCollection: true
      });

      console.log(`✅ OG NFT #${finalTokenId} minted successfully!`);
      console.log(`NFT Mint Address: ${nft.address.toString()}`);
      console.log(`🔒 This wallet can no longer mint additional OG NFTs`);

      return {
        mintAddress: nft.address.toString(),
        metadataUri,
        tokenId: finalTokenId,
        recipient: recipientAddress,
        transactionSignature: 'real-nft-minted',
        isFirstMint: true,
        limitEnforced: !skipOwnershipCheck
      };

    } catch (error) {
      console.error('Error minting OG NFT:', error);
      throw error;
    }
  }

  async verifyNFTOwnership(walletAddress, collectionMint) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const nfts = await this.metaplex.nfts().findAllByOwner({ 
        owner: new PublicKey(walletAddress) 
      });
      
      return nfts.some(nft => 
        nft.collection?.address.toString() === collectionMint
      );
    } catch (error) {
      console.error('Error verifying NFT ownership:', error);
      return false;
    }
  }

  /**
   * Check if a wallet is eligible for OG NFT minting
   */
  async checkOGNFTEligibility(walletAddress) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const collectionMint = this.config.collections.og.mint;
      const alreadyOwnsNFT = await this.checkExistingOGNFT(walletAddress, collectionMint);
      
      return {
        eligible: !alreadyOwnsNFT,
        reason: alreadyOwnsNFT ? 'Wallet already owns an OG NFT' : 'Eligible for minting',
        collectionMint
      };
    } catch (error) {
      console.error('Error checking OG NFT eligibility:', error);
      return {
        eligible: false,
        reason: 'Error checking eligibility',
        collectionMint: this.config?.collections?.og?.mint || null
      };
    }
  }

  getCollectionAddresses() {
    if (!this.config) {
      throw new Error('NFT Minter not initialized');
    }

    return {
      ogCollection: this.config.collections.og.mint,
      certificatesCollection: this.config.collections.certificates.mint
    };
  }

  /**
   * Get collection statistics
   */
  async getOGCollectionStats() {
    try {
      const counterPath = path.join(__dirname, '..', '..', 'config', 'og-nft-counter.json');
      
      let counter = { nextId: 1 };
      if (fs.existsSync(counterPath)) {
        counter = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
      }
      
      return {
        totalMinted: counter.nextId - 1,
        nextTokenId: counter.nextId,
        maxSupply: 10000, // From OG_COLLECTION_CONFIG
        remaining: 10000 - (counter.nextId - 1)
      };
    } catch (error) {
      console.error('Error getting collection stats:', error);
      return {
        totalMinted: 0,
        nextTokenId: 1,
        maxSupply: 10000,
        remaining: 10000
      };
    }
  }
}

// Create singleton instance
const nftMinter = new NFTMinter();

// Export functions for use in your existing backend
module.exports = {
  // Main minting functions
  mintPathCertificate: (recipientAddress, pathId, completionDate) => 
    nftMinter.mintPathCertificate(recipientAddress, pathId, completionDate),
  
  mintOGNFT: (recipientAddress, tokenId, attributes, skipOwnershipCheck) => 
    nftMinter.mintOGNFT(recipientAddress, tokenId, attributes, skipOwnershipCheck),
  
  // Utility functions
  verifyNFTOwnership: (walletAddress, collectionMint) => 
    nftMinter.verifyNFTOwnership(walletAddress, collectionMint),
  
  checkOGNFTEligibility: (walletAddress) => 
    nftMinter.checkOGNFTEligibility(walletAddress),
  
  getCollectionAddresses: () => nftMinter.getCollectionAddresses(),
  
  getOGCollectionStats: () => nftMinter.getOGCollectionStats(),
  
  // Initialize function (call this when your server starts)
  initializeNFTMinter: () => nftMinter.initialize(),
  
  // Path configurations
  PATH_CONFIGS
}; 