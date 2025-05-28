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

// Path configurations
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

async function mintCertificate(
  recipientAddress: string, 
  pathId: string, 
  completionDate: Date = new Date()
) {
  try {
    // Load configuration
    if (!fs.existsSync(configPath)) {
      throw new Error('NFT collections not set up. Run npm run setup-nft first.');
    }

    const config: NFTConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const pathConfig = PATH_CONFIGS[pathId as keyof typeof PATH_CONFIGS];
    
    if (!pathConfig) {
      throw new Error(`Unknown path ID: ${pathId}`);
    }

    console.log(`Minting certificate for ${pathConfig.name} to ${recipientAddress}...`);

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

    // Prepare certificate metadata
    const certificateMetadata = {
      name: `${pathConfig.name} - Completion Certificate`,
      symbol: 'SQCERT',
      description: `This certificate verifies the completion of the ${pathConfig.name} learning path on SolQuest.io. ${pathConfig.description}`,
      seller_fee_basis_points: 0, // No royalties for certificates
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
    const metadataUri = await metaplex.storage().uploadMetadata(certificateMetadata);
    console.log(`Metadata uploaded: ${metadataUri}`);

    // Mint certificate NFT
    const { nft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: certificateMetadata.name,
      symbol: certificateMetadata.symbol,
      sellerFeeBasisPoints: 0,
      tokenOwner: new PublicKey(recipientAddress),
      collection: new PublicKey(config.collections.certificates.mint),
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
      collectionMintAddress: new PublicKey(config.collections.certificates.mint),
      isSizedCollection: true
    });

    console.log(`✅ Certificate minted successfully!`);
    console.log(`Certificate Mint Address: ${nft.address.toString()}`);
    console.log(`Recipient: ${recipientAddress}`);
    console.log(`Path: ${pathConfig.name}`);
    console.log(`Metadata URI: ${metadataUri}`);

    return {
      mintAddress: nft.address.toString(),
      metadataUri,
      pathId,
      pathName: pathConfig.name,
      recipient: recipientAddress,
      completionDate: completionDate.toISOString()
    };

  } catch (error) {
    console.error('Error minting certificate:', error);
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npm run mint-certificate <recipient-address> <path-id> [completion-date]');
    console.log('Available path IDs: solana-foundations, solquest-og, zk-compression');
    console.log('Example: npm run mint-certificate 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM solana-foundations');
    process.exit(1);
  }

  const recipientAddress = args[0];
  const pathId = args[1];
  const completionDate = args[2] ? new Date(args[2]) : new Date();

  mintCertificate(recipientAddress, pathId, completionDate)
    .then((result) => {
      console.log('\n🎉 Certificate minting completed successfully!');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error('❌ Certificate minting failed:', error);
      process.exit(1);
    });
}

export { mintCertificate, PATH_CONFIGS }; 