import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, Signer } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { wormhole, Chain, toNative, Wormhole } from '@wormhole-foundation/sdk';
import solana from '@wormhole-foundation/sdk/solana';
import evm from '@wormhole-foundation/sdk/evm';

interface WormholeNFTQuestProps {
  onQuestComplete: () => void;
  xpReward?: number;
}

// SignAndSendSigner implementation for Solana Wallet Adapter
class SolanaWalletSigner {
  private _wallet: ReturnType<typeof useWallet>;
  constructor(wallet: ReturnType<typeof useWallet>) {
    this._wallet = wallet;
  }
  chain(): 'Solana' { return 'Solana'; }
  address(): string { return this._wallet.publicKey?.toString() || ''; }
  async signAndSend(txns: any[]): Promise<string[]> {
    if (!this._wallet.signAllTransactions) {
      throw new Error('Wallet does not support signing transactions');
    }
    const signedTxns = await this._wallet.signAllTransactions(txns);
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com');
    const txids: string[] = [];
    for (const signed of signedTxns) {
      const txid = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(txid);
      txids.push(txid);
    }
    return txids;
  }
}

// SPL Token Signer implementation
class SPLTokenSigner implements Signer {
  private _wallet: ReturnType<typeof useWallet>;
  constructor(wallet: ReturnType<typeof useWallet>) {
    this._wallet = wallet;
  }
  get publicKey() { return this._wallet.publicKey || new PublicKey(''); }
  get secretKey() { return new Uint8Array(); } // Not needed for this use case
  async signTransaction(tx: Transaction): Promise<Transaction> {
    if (!this._wallet.signTransaction) {
      throw new Error('Wallet does not support signing transactions');
    }
    return await this._wallet.signTransaction(tx);
  }
  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    if (!this._wallet.signAllTransactions) {
      throw new Error('Wallet does not support signing transactions');
    }
    return await this._wallet.signAllTransactions(txs);
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
    if (!wallet.publicKey || !wallet.signAllTransactions || !wallet.signTransaction) {
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
      // 3. Mint NFT on Solana
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com');
      const splSigner = new SPLTokenSigner(wallet);
      const mint = await createMint(
        connection,
        splSigner,
        splSigner.publicKey,
        splSigner.publicKey,
        0 // 0 decimals for NFT
      );
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        splSigner,
        mint,
        splSigner.publicKey
      );
      await mintTo(
        connection,
        splSigner,
        mint,
        tokenAccount.address,
        splSigner.publicKey,
        1
      );
      // 4. Create metadata
      const metadataAddress = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
          mint.toBuffer(),
        ],
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      )[0];
      const transaction = new Transaction();
      transaction.add({
        keys: [
          { pubkey: metadataAddress, isSigner: false, isWritable: true },
          { pubkey: mint, isSigner: false, isWritable: false },
          { pubkey: splSigner.publicKey, isSigner: true, isWritable: false },
          { pubkey: splSigner.publicKey, isSigner: true, isWritable: false },
          { pubkey: splSigner.publicKey, isSigner: true, isWritable: false },
        ],
        programId: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
        data: Buffer.from([
          // Add metadata creation instruction data here
          // This is a placeholder - you'll need to implement the actual metadata creation
        ])
      });
      const signedTx = await splSigner.signTransaction(transaction);
      const txHash = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txHash);
      setTxHash(txHash);
      // 5. Bridge NFT to Ethereum using the new SDK
      const sourceAddress = toNative('Solana', wallet.publicKey.toString());
      const destinationAddress = toNative(
        'Ethereum',
        '0x0000000000000000000000000000000000000000' // TODO: real EVM address
      );
      const tokenId = Wormhole.tokenId('Solana', mint.toString());
      // Create the transfer object
      const xfer = await wh.tokenTransfer(
        tokenId,
        BigInt(1), // NFT amount is 1
        { chain: 'Solana' as Chain, address: sourceAddress },
        { chain: 'Ethereum' as Chain, address: destinationAddress },
        true // automatic delivery
      );
      // Wrap wallet as SignAndSendSigner
      const signer = new SolanaWalletSigner(wallet);
      // Initiate transfer
      const txids = await xfer.initiateTransfer(signer);
      setTxHash(txids[0]);
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