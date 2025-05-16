import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { wormhole } from '@wormhole-foundation/sdk';
import solana from '@wormhole-foundation/sdk/solana';
import evm from '@wormhole-foundation/sdk/evm';

interface WormholeNFTQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

// Simple Signer wrapper for Solana Wallet Adapter
class SolanaWalletSigner {
  constructor(wallet: any) {
    this.wallet = wallet;
  }
  chain() { return 'Solana'; }
  address() { return this.wallet.publicKey?.toString(); }
  async sign(txns: any[]) {
    return await this.wallet.signAllTransactions(txns);
  }
}

export const WormholeNFTQuest: React.FC<WormholeNFTQuestProps> = ({ onQuestComplete, xpReward = 500 }) => {
  const wallet = useWallet();
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
    if (!wallet.publicKey || !wallet.signAllTransactions) {
      setError('Please connect your wallet first');
      return;
    }
    try {
      setIsMinting(true);
      setError(null);
      // 1. Initialize Wormhole
      const wh = await wormhole('Mainnet', [solana, evm]);
      // 2. Get Solana chain context
      const solChain = wh.getChain('Solana');
      // 3. Get NFTBridge client
      const nb = await solChain.getNftBridge();
      // 4. Mint NFT on Solana
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com');
      const mint = await createMint(
        connection,
        wallet.publicKey,
        wallet.publicKey,
        wallet.publicKey,
        0 // 0 decimals for NFT
      );
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet.publicKey,
        mint,
        wallet.publicKey
      );
      await mintTo(
        connection,
        wallet.publicKey,
        mint,
        tokenAccount.address,
        wallet.publicKey,
        1
      );
      // 5. Create metadata
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
          mintAuthority: wallet.publicKey,
          payer: wallet.publicKey,
          updateAuthority: wallet.publicKey,
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
      const transaction = new Transaction().add(metadataInstruction);
      const signedTx = await wallet.signTransaction(transaction);
      const txHash = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txHash);
      setTxHash(txHash);
      // 6. Bridge NFT to Ethereum using the new SDK
      const signer = new SolanaWalletSigner(wallet);
      const recipientChain = 'Ethereum';
      const recipientAddress = wallet.publicKey.toString(); // For demo, send to self
      const bridgeTxids = await nb.transfer(
        signer,
        mint.toString(),
        recipientChain,
        recipientAddress
      );
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
          disabled={isMinting || isMinted || !wallet.publicKey}
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