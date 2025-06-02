import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile } from '@metaplex-foundation/js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity as umiKeypairIdentity, generateSigner, signerIdentity } from '@metaplex-foundation/umi';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { createTree, mplBubblegum } from '@metaplex-foundation/mpl-bubblegum';
import fs from 'fs';
import path from 'path';

// Configuration
type NetworkType = 'devnet' | 'mainnet-beta';
const NETWORK: NetworkType = 'devnet'; // Change to 'mainnet-beta' for production
const RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl(NETWORK);

// Collection configurations
const OG_COLLECTION_CONFIG = {
  name: 'SolQuest OG',
  symbol: 'SQOG',
  description: 'Exclusive NFT collection for SolQuest community members. Holders get XP boosts, exclusive access, and special privileges. 100% FREE community distribution.',
  totalSupply: 10000,
  freeSupply: 10000, // 100% free via secret codes
  paidSupply: 0,      // No paid NFTs - pure community model
  mintPrice: 0,       // Completely free
  royalties: 500, // 5%
  creators: [
    {
      address: '8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM', // Your creator wallet address
      share: 100,
      verified: true
    }
  ]
};

const CERTIFICATE_COLLECTION_CONFIG = {
  name: 'SolQuest Certificates',
  symbol: 'SQCERT',
  description: 'Achievement certificates for completing SolQuest learning paths.',
  royalties: 0, // No royalties for certificates
  creators: [
    {
      address: '8nnLuLdrUN96HuZgRwumkSJV8BzqJj55mZULu3iaqKSM', // Your creator wallet address  
      share: 100,
      verified: true
    }
  ]
};

interface CollectionSetupResult {
  collectionMint: PublicKey;
  collectionMetadata: PublicKey;
  collectionMasterEdition: PublicKey;
  merkleTree?: PublicKey; // For compressed NFTs
}

class NFTCollectionSetup {
  private connection: Connection;
  private metaplex: Metaplex;
  private umi: any;
  private payer: Keypair;

  constructor(payerKeypair: Keypair) {
    this.connection = new Connection(RPC_URL);
    this.payer = payerKeypair;
    
    // Setup Metaplex
    this.metaplex = Metaplex.make(this.connection)
      .use(keypairIdentity(payerKeypair))
      .use(bundlrStorage({
        address: NETWORK === 'mainnet-beta' 
          ? 'https://node1.bundlr.network' 
          : 'https://devnet.bundlr.network',
        providerUrl: RPC_URL,
        timeout: 60000,
      }));

    // Setup UMI for compressed NFTs
    this.umi = createUmi(RPC_URL)
      .use(mplTokenMetadata())
      .use(mplBubblegum())
      .use(umiKeypairIdentity(payerKeypair));
  }

  /**
   * Upload metadata to Arweave via Bundlr
   */
  async uploadMetadata(metadata: any, imagePath?: string): Promise<string> {
    try {
      let imageUri = '';
      
      // Upload image if provided
      if (imagePath && fs.existsSync(imagePath)) {
        console.log(`Uploading image: ${imagePath}`);
        const imageBuffer = fs.readFileSync(imagePath);
        const imageFile = toMetaplexFile(imageBuffer, path.basename(imagePath));
        imageUri = await this.metaplex.storage().upload(imageFile);
        console.log(`Image uploaded: ${imageUri}`);
      }

      // Upload metadata
      const metadataWithImage = {
        ...metadata,
        image: imageUri || metadata.image
      };

      const metadataUri = await this.metaplex.storage().uploadMetadata(metadataWithImage);
      console.log(`Metadata uploaded: ${metadataUri}`);
      
      return metadataUri;
    } catch (error) {
      console.error('Error uploading metadata:', error);
      throw error;
    }
  }

  /**
   * Create the main OG NFT collection
   */
  async createOGCollection(imagePath?: string): Promise<CollectionSetupResult> {
    console.log('\n🎨 Creating SolQuest OG Collection...');

    try {
      // Prepare collection metadata
      const collectionMetadata = {
        name: OG_COLLECTION_CONFIG.name,
        symbol: OG_COLLECTION_CONFIG.symbol,
        description: OG_COLLECTION_CONFIG.description,
        seller_fee_basis_points: OG_COLLECTION_CONFIG.royalties,
        external_url: 'https://solquest.io',
        creators: OG_COLLECTION_CONFIG.creators,
        collection: {
          name: OG_COLLECTION_CONFIG.name,
          family: 'SolQuest'
        },
        attributes: [
          {
            trait_type: 'Collection',
            value: 'OG'
          },
          {
            trait_type: 'Utility',
            value: 'XP Boost'
          }
        ]
      };

      // Upload metadata
      const metadataUri = await this.uploadMetadata(collectionMetadata, imagePath);

      // Create collection NFT
      const { nft: collectionNft } = await this.metaplex.nfts().create({
        uri: metadataUri,
        name: OG_COLLECTION_CONFIG.name,
        symbol: OG_COLLECTION_CONFIG.symbol,
        sellerFeeBasisPoints: OG_COLLECTION_CONFIG.royalties,
        isCollection: true,
        creators: OG_COLLECTION_CONFIG.creators.map(creator => ({
          address: new PublicKey(creator.address),
          share: creator.share,
          verified: creator.verified
        }))
      });

      console.log(`✅ OG Collection created!`);
      console.log(`Collection Mint: ${collectionNft.address.toString()}`);
      console.log(`Metadata URI: ${metadataUri}`);

      return {
        collectionMint: collectionNft.address,
        collectionMetadata: collectionNft.metadataAddress,
        collectionMasterEdition: collectionNft.masterEditionAddress!
      };

    } catch (error) {
      console.error('Error creating OG collection:', error);
      throw error;
    }
  }

  /**
   * Create certificate collection for path completions
   */
  async createCertificateCollection(imagePath?: string): Promise<CollectionSetupResult> {
    console.log('\n🏆 Creating Certificate Collection...');

    try {
      const collectionMetadata = {
        name: CERTIFICATE_COLLECTION_CONFIG.name,
        symbol: CERTIFICATE_COLLECTION_CONFIG.symbol,
        description: CERTIFICATE_COLLECTION_CONFIG.description,
        seller_fee_basis_points: CERTIFICATE_COLLECTION_CONFIG.royalties,
        external_url: 'https://solquest.io/certificates',
        creators: CERTIFICATE_COLLECTION_CONFIG.creators,
        collection: {
          name: CERTIFICATE_COLLECTION_CONFIG.name,
          family: 'SolQuest Certificates'
        },
        attributes: [
          {
            trait_type: 'Type',
            value: 'Achievement Certificate'
          },
          {
            trait_type: 'Issuer',
            value: 'SolQuest'
          }
        ]
      };

      const metadataUri = await this.uploadMetadata(collectionMetadata, imagePath);

      const { nft: collectionNft } = await this.metaplex.nfts().create({
        uri: metadataUri,
        name: CERTIFICATE_COLLECTION_CONFIG.name,
        symbol: CERTIFICATE_COLLECTION_CONFIG.symbol,
        sellerFeeBasisPoints: CERTIFICATE_COLLECTION_CONFIG.royalties,
        isCollection: true,
        creators: CERTIFICATE_COLLECTION_CONFIG.creators.map(creator => ({
          address: new PublicKey(creator.address),
          share: creator.share,
          verified: creator.verified
        }))
      });

      console.log(`✅ Certificate Collection created!`);
      console.log(`Collection Mint: ${collectionNft.address.toString()}`);

      return {
        collectionMint: collectionNft.address,
        collectionMetadata: collectionNft.metadataAddress,
        collectionMasterEdition: collectionNft.masterEditionAddress!
      };

    } catch (error) {
      console.error('Error creating certificate collection:', error);
      throw error;
    }
  }

  /**
   * Create a compressed NFT tree for efficient minting
   */
  async createCompressedNFTTree(maxDepth: number = 14, maxBufferSize: number = 64): Promise<PublicKey> {
    console.log('\n🌳 Creating Compressed NFT Tree...');

    try {
      const merkleTree = generateSigner(this.umi);
      
      await createTree(this.umi, {
        merkleTree,
        maxDepth,
        maxBufferSize,
        canopyDepth: 0,
      }).sendAndConfirm(this.umi);

      console.log(`✅ Merkle Tree created: ${merkleTree.publicKey}`);
      return new PublicKey(merkleTree.publicKey);

    } catch (error) {
      console.error('Error creating compressed NFT tree:', error);
      throw error;
    }
  }

  /**
   * Mint an individual OG NFT
   */
  async mintOGNFT(
    collectionMint: PublicKey,
    recipient: PublicKey,
    tokenId: number,
    attributes: any[] = []
  ): Promise<PublicKey> {
    console.log(`\n🎨 Minting OG NFT #${tokenId}...`);

    try {
      const nftMetadata = {
        name: `${OG_COLLECTION_CONFIG.name} #${tokenId}`,
        symbol: OG_COLLECTION_CONFIG.symbol,
        description: `${OG_COLLECTION_CONFIG.description} Token ID: ${tokenId}`,
        seller_fee_basis_points: OG_COLLECTION_CONFIG.royalties,
        external_url: `https://solquest.io/nft/${tokenId}`,
        attributes: [
          {
            trait_type: 'Token ID',
            value: tokenId.toString()
          },
          {
            trait_type: 'XP Boost',
            value: '10%'
          },
          {
            trait_type: 'SOL Bonus',
            value: '10% on leaderboard rewards'
          },
          ...attributes
        ],
        collection: {
          name: OG_COLLECTION_CONFIG.name,
          family: 'SolQuest'
        }
      };

      const metadataUri = await this.uploadMetadata(nftMetadata);

      const { nft } = await this.metaplex.nfts().create({
        uri: metadataUri,
        name: nftMetadata.name,
        symbol: nftMetadata.symbol,
        sellerFeeBasisPoints: OG_COLLECTION_CONFIG.royalties,
        tokenOwner: recipient,
        collection: collectionMint,
        creators: OG_COLLECTION_CONFIG.creators.map(creator => ({
          address: new PublicKey(creator.address),
          share: creator.share,
          verified: creator.verified
        }))
      });

      // Verify the NFT as part of the collection
      await this.metaplex.nfts().verifyCollection({
        mintAddress: nft.address,
        collectionMintAddress: collectionMint,
        isSizedCollection: true
      });

      console.log(`✅ OG NFT #${tokenId} minted to ${recipient.toString()}`);
      console.log(`NFT Mint: ${nft.address.toString()}`);

      return nft.address;

    } catch (error) {
      console.error(`Error minting OG NFT #${tokenId}:`, error);
      throw error;
    }
  }

  /**
   * Mint a path completion certificate
   */
  async mintCertificate(
    collectionMint: PublicKey,
    recipient: PublicKey,
    pathId: string,
    pathName: string,
    completionDate: Date = new Date()
  ): Promise<PublicKey> {
    console.log(`\n🏆 Minting Certificate for ${pathName}...`);

    try {
      const certificateMetadata = {
        name: `${pathName} - Completion Certificate`,
        symbol: CERTIFICATE_COLLECTION_CONFIG.symbol,
        description: `This certificate verifies the completion of the ${pathName} learning path on SolQuest.io`,
        seller_fee_basis_points: 0,
        external_url: `https://solquest.io/certificates/${pathId}`,
        attributes: [
          {
            trait_type: 'Path',
            value: pathName
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
          }
        ],
        collection: {
          name: CERTIFICATE_COLLECTION_CONFIG.name,
          family: 'SolQuest Certificates'
        }
      };

      const metadataUri = await this.uploadMetadata(certificateMetadata);

      const { nft } = await this.metaplex.nfts().create({
        uri: metadataUri,
        name: certificateMetadata.name,
        symbol: certificateMetadata.symbol,
        sellerFeeBasisPoints: 0,
        tokenOwner: recipient,
        collection: collectionMint,
        creators: CERTIFICATE_COLLECTION_CONFIG.creators.map(creator => ({
          address: new PublicKey(creator.address),
          share: creator.share,
          verified: creator.verified
        }))
      });

      // Verify the certificate as part of the collection
      await this.metaplex.nfts().verifyCollection({
        mintAddress: nft.address,
        collectionMintAddress: collectionMint,
        isSizedCollection: true
      });

      console.log(`✅ Certificate minted for ${pathName}`);
      console.log(`Certificate Mint: ${nft.address.toString()}`);

      return nft.address;

    } catch (error) {
      console.error(`Error minting certificate for ${pathName}:`, error);
      throw error;
    }
  }

  /**
   * Save collection addresses to config file
   */
  saveCollectionConfig(ogCollection: CollectionSetupResult, certificateCollection: CollectionSetupResult) {
    const config = {
      network: NETWORK,
      timestamp: new Date().toISOString(),
      collections: {
        og: {
          mint: ogCollection.collectionMint.toString(),
          metadata: ogCollection.collectionMetadata.toString(),
          masterEdition: ogCollection.collectionMasterEdition.toString(),
          merkleTree: ogCollection.merkleTree?.toString()
        },
        certificates: {
          mint: certificateCollection.collectionMint.toString(),
          metadata: certificateCollection.collectionMetadata.toString(),
          masterEdition: certificateCollection.collectionMasterEdition.toString(),
          merkleTree: certificateCollection.merkleTree?.toString()
        }
      }
    };

    const configPath = path.join(__dirname, '..', 'config', 'nft-collections.json');
    
    // Ensure config directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`\n💾 Collection config saved to: ${configPath}`);
  }
}

/**
 * Main setup function
 */
async function setupNFTCollections() {
  console.log('🚀 Setting up SolQuest NFT Collections...\n');

  try {
    // Load payer keypair (you'll need to provide this)
    const payerKeypairPath = process.env.PAYER_KEYPAIR_PATH || './keypairs/payer.json';
    
    if (!fs.existsSync(payerKeypairPath)) {
      console.error(`❌ Payer keypair not found at: ${payerKeypairPath}`);
      console.log('Please create a keypair file or set PAYER_KEYPAIR_PATH environment variable');
      process.exit(1);
    }

    const payerKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(payerKeypairPath, 'utf8')))
    );

    console.log(`Payer: ${payerKeypair.publicKey.toString()}`);
    console.log(`Network: ${NETWORK}`);
    console.log(`RPC: ${RPC_URL}\n`);

    const setup = new NFTCollectionSetup(payerKeypair);

    // Create collections
    const ogCollection = await setup.createOGCollection('./assets/images/og-nft-collection.png');
    const certificateCollection = await setup.createCertificateCollection('./assets/images/certificate-template.png');

    // Optionally create compressed NFT tree for efficient minting
    // const merkleTree = await setup.createCompressedNFTTree();
    // ogCollection.merkleTree = merkleTree;

    // Save configuration
    setup.saveCollectionConfig(ogCollection, certificateCollection);

    console.log('\n🎉 NFT Collections setup complete!');
    console.log('\nNext steps:');
    console.log('1. Update your frontend/backend with the new collection addresses');
    console.log('2. Create a candy machine for the OG collection (optional)');
    console.log('3. Set up automated certificate minting in your backend');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
export { NFTCollectionSetup, OG_COLLECTION_CONFIG, CERTIFICATE_COLLECTION_CONFIG };

// Run if called directly
if (require.main === module) {
  setupNFTCollections();
} 