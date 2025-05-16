import React, { useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { CHAIN_ID_SOLANA, CHAIN_ID_ETH, transferFromSolana } from '@certusone/wormhole-sdk';

interface WormholeNFTQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

export const WormholeNFTQuest: React.FC<WormholeNFTQuestProps> = ({ onQuestComplete, xpReward = 500 }) => {
  const { publicKey, signTransaction } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [nftMetadata, setNftMetadata] = useState({
    name: 'Wormhole Cross-Chain NFT',
    symbol: 'WCNFT',
    uri: 'https://arweave.net/your-metadata-uri' // Replace with actual metadata URI
  });

  const handleMint = async () => {
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsMinting(true);
      setError(null);

      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com');

      // Create the NFT mint
      const mint = await createMint(
        connection,
        publicKey,
        publicKey,
        publicKey,
        0 // 0 decimals for NFT
      );

      // Get the token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        mint,
        publicKey
      );

      // Mint 1 token (NFT)
      await mintTo(
        connection,
        publicKey,
        mint,
        tokenAccount.address,
        publicKey,
        1
      );

      // Create metadata
      const metadataInstruction = createCreateMetadataAccountV3Instruction(
        {
          metadata: PublicKey.findProgramAddressSync(
            [
              Buffer.from('metadata'),
              new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
              mint.toBuffer(),
            ],
            new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
          )[0],
          mint: mint,
          mintAuthority: publicKey,
          payer: publicKey,
          updateAuthority: publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: nftMetadata.name,
              symbol: nftMetadata.symbol,
              uri: nftMetadata.uri,
              sellerFeeBasisPoints: 0,
              creators: null,
              collection: null,
              uses: null,
            },
            isMutable: true,
            collectionDetails: null,
          },
        }
      );

      // Create and send transaction
      const transaction = new Transaction().add(metadataInstruction);
      const signedTx = await signTransaction(transaction);
      const txHash = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txHash);
      setTxHash(txHash);

      // Bridge NFT to Ethereum (simplified version)
      const bridgeTx = await transferFromSolana(
        connection,
        tokenAccount.address,
        CHAIN_ID_ETH,
        1
      );

      const bridgeSignedTx = await signTransaction(bridgeTx);
      const bridgeTxHash = await connection.sendRawTransaction(bridgeSignedTx.serialize());
      await connection.confirmTransaction(bridgeTxHash);

      setIsMinted(true);
      setTimeout(() => onQuestComplete(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="p-6 bg-dark-card rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">Minting a Cross-Chain NFT</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-gray-400 mb-2">NFT Name</label>
          <input
            type="text"
            value={nftMetadata.name}
            onChange={(e) => setNftMetadata(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-gray-400 mb-2">NFT Symbol</label>
          <input
            type="text"
            value={nftMetadata.symbol}
            onChange={(e) => setNftMetadata(prev => ({ ...prev, symbol: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg p-2"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-400 mb-4">{error}</div>
      )}

      <div className="mb-4">
        <button
          onClick={handleMint}
          disabled={isMinting || isMinted || !publicKey}
          className="bg-solana-purple hover:bg-solana-purple-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-60"
        >
          {isMinting ? 'Minting...' : isMinted ? 'Minted!' : 'Mint & Bridge NFT'}
        </button>
      </div>

      {txHash && (
        <div className="text-green-400 font-semibold mt-2">
          <p>NFT minted and bridged! +{xpReward} XP</p>
          <a 
            href={`https://solscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 underline mt-2 inline-block"
          >
            View Transaction
          </a>
        </div>
      )}
    </div>
  );
};

export default WormholeNFTQuest; 