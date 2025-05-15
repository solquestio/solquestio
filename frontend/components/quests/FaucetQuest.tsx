// frontend/components/quests/FaucetQuest.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Connection } from '@solana/web3.js';

interface FaucetQuestProps {
  minRequiredSOL: number;
  onQuestComplete: () => void;
  xpReward?: number;
}

const SOLANA_FAUCET_URL = "https://solfaucet.com";
const DEVNET_RPC_URL = "https://api.devnet.solana.com";

export const FaucetQuest: React.FC<FaucetQuestProps> = ({
  minRequiredSOL,
  onQuestComplete,
  xpReward,
}) => {
  const { connection } = useConnection();
  const { publicKey, connected, wallet } = useWallet();

  const [currentSolBalance, setCurrentSolBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questAttempted, setQuestAttempted] = useState(false);
  const [isQuestMarkedComplete, setIsQuestMarkedComplete] = useState(false);
  const [isActuallyOnDevnet, setIsActuallyOnDevnet] = useState<boolean | null>(null);
  
  // Create a direct Devnet connection
  const devnetConnection = new Connection(DEVNET_RPC_URL);

  const checkNetwork = useCallback(async () => {
    // Always set to true to bypass the network check
    setIsActuallyOnDevnet(true);
    return;
  }, []);

  useEffect(() => {
    if (connected) {
      checkNetwork();
    } else {
      setIsActuallyOnDevnet(null);
    }
  }, [connected, checkNetwork]);

  const handleVerifyBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      alert('Please connect your Solana wallet first.');
      return;
    }

    setIsLoading(true);
    setQuestAttempted(true);
    setCurrentSolBalance(null);

    try {
      console.log("Checking balance on Devnet for:", publicKey.toBase58());
      // Use direct Devnet connection instead of the wallet's connection
      const balanceLamports = await devnetConnection.getBalance(publicKey);
      console.log("Raw balance in lamports:", balanceLamports);
      const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
      console.log("Converted balance in SOL:", balanceSOL);
      
      setCurrentSolBalance(balanceSOL);

      if (balanceSOL >= minRequiredSOL) {
        console.log("Quest completed! Balance sufficient:", balanceSOL, "≥", minRequiredSOL);
        setIsQuestMarkedComplete(true);
        onQuestComplete();
      } else {
        console.log("Quest not completed. Insufficient balance:", balanceSOL, "<", minRequiredSOL);
        setIsQuestMarkedComplete(false);
      }
    } catch (error) {
      console.error('Error verifying SOL balance:', error);
      alert(`Error checking balance: ${error instanceof Error ? error.message : String(error)}`);
      setIsQuestMarkedComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, devnetConnection, minRequiredSOL, onQuestComplete]);

  if (!connected || !publicKey) {
    return (
      <div style={styles.questContainer}>
        <h4>LayerZero Learning Path - Prerequisite</h4>
        <p>Please connect your Solana wallet to begin the quests.</p>
      </div>
    );
  }

  return (
    <div style={styles.questContainer}>
      <h3 style={styles.questTitle}>Quest 1: Fund Your Devnet Wallet</h3>
      {xpReward !== undefined && (
        <p style={styles.xpTextUnderTitle}>+{xpReward} XP</p>
      )}
      {isQuestMarkedComplete ? (
        <div style={styles.successMessage}>
          <p>✅ Quest Complete! You have {currentSolBalance?.toFixed(4)} Devnet SOL.</p>
          <p>You can now proceed to the next LayerZero quest.</p>
        </div>
      ) : (
        <>
          <div style={styles.descriptionContainer}>
            <div style={styles.descriptionParagraph}>
              <span style={styles.greenBullet}></span>
              <span style={styles.descriptionText}>
                Welcome to your first step in the LayerZero Learning Path! Before you can send cross-chain messages or bridge tokens, your Solana Devnet wallet needs a bit of "gas money."
              </span>
            </div>
            <div style={styles.descriptionParagraph}>
              <span style={styles.greenBullet}></span>
              <span style={styles.descriptionText}>
                <strong>Why do you need Devnet SOL?</strong> Transactions on any blockchain, including Solana's Devnet (a test network), require a small fee. This quest ensures you have enough Devnet SOL to cover these fees for the subsequent LayerZero quests.
              </span>
            </div>
            <div style={styles.descriptionParagraph}>
              <span style={styles.greenBullet}></span>
              <span style={styles.descriptionText}>
                Follow the steps below to get free Devnet SOL from a faucet. It's like a virtual ATM for test tokens!
              </span>
            </div>
          </div>

          <p style={styles.text}>
            1. Click the link below to visit a Solana Devnet faucet.
            <br />
            2. Request Devnet SOL to your connected wallet address: <strong style={styles.address}>{publicKey.toBase58()}</strong>
            <br />
            3. Once you've received the SOL, come back here and click "Verify My Balance".
          </p>
          <a
            href={SOLANA_FAUCET_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.button, ...styles.linkButton, margin: '10px 0' }}
          >
            Go to solfaucet.com
          </a>
          <button
            onClick={handleVerifyBalance}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? 'Verifying...' : 'Verify My Devnet SOL Balance'}
          </button>

          {questAttempted && !isLoading && currentSolBalance !== null && !isQuestMarkedComplete && (
            <p style={styles.errorMessage}>
              Verification Failed. You currently have {currentSolBalance?.toFixed(4) || '0'} Devnet SOL.
              Please ensure you have at least {minRequiredSOL} Devnet SOL from the faucet and try again.
            </p>
          )}
          {questAttempted && !isLoading && currentSolBalance === null && !isQuestMarkedComplete && (
            <p style={styles.errorMessage}>
              Could not retrieve balance. Please ensure you have a valid Solana wallet address and try again.
            </p>
          )}
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  questContainer: {
    padding: '20px',
    border: '1px solid #444',
    borderRadius: '8px',
    margin: '20px 0',
    backgroundColor: '#2a2a2a',
    color: '#e0e0e0',
  },
  questTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '4px',
  },
  xpText: {
    fontSize: '0.9em',
    fontWeight: 'bold',
    color: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: '3px 8px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 215, 0, 0.3)',
  },
  xpTextUnderTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: '1rem',
  },
  descriptionContainer: {
    marginBottom: '20px',
    color: '#c0c0c0',
  },
  descriptionParagraph: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  greenBullet: {
    flexShrink: 0,
    display: 'inline-block',
    width: '8px',
    height: '8px',
    backgroundColor: '#4CAF50',
    borderRadius: '50%',
    marginRight: '12px',
    marginTop: '6px',
  },
  descriptionText: {
    lineHeight: '1.6',
  },
  text: {
    marginBottom: '10px',
    lineHeight: '1.6',
  },
  address: {
    fontFamily: 'monospace',
    backgroundColor: '#333',
    padding: '2px 5px',
    borderRadius: '4px',
    wordBreak: 'break-all',
  },
  button: {
    padding: '10px 15px',
    margin: '5px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#6c00ff',
    color: 'white',
    fontSize: '1em',
    opacity: 1,
  },
  linkButton: {
    textDecoration: 'none',
    display: 'inline-block',
  },
  successMessage: {
    color: '#4CAF50',
    padding: '10px',
    border: '1px solid #4CAF50',
    borderRadius: '5px',
    backgroundColor: '#354e35',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#f44336',
    marginTop: '15px',
    padding: '10px',
    border: '1px solid #f44336',
    borderRadius: '5px',
    backgroundColor: '#5b3535',
  },
}; 