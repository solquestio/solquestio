// frontend/components/quests/FaucetQuest.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Connection } from '@solana/web3.js';

interface FaucetQuestProps {
  minRequiredSOL: number;
  onQuestComplete: () => void;
  xpReward?: number;
}

const MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com";

export const FaucetQuest: React.FC<FaucetQuestProps> = ({
  minRequiredSOL,
  onQuestComplete,
  xpReward,
}) => {
  const { publicKey, connected } = useWallet();

  const [currentSolBalance, setCurrentSolBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questAttempted, setQuestAttempted] = useState(false);
  const [isQuestMarkedComplete, setIsQuestMarkedComplete] = useState(false);

  // Create a direct Mainnet connection
  const mainnetConnection = new Connection(MAINNET_RPC_URL);

  const handleVerifyBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      alert('Please connect your Solana wallet first.');
      return;
    }

    setIsLoading(true);
    setQuestAttempted(true);
    setCurrentSolBalance(null);

    try {
      // Use direct Mainnet connection
      const balanceLamports = await mainnetConnection.getBalance(publicKey);
      const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
      setCurrentSolBalance(balanceSOL);

      if (balanceSOL >= minRequiredSOL) {
        setIsQuestMarkedComplete(true);
        onQuestComplete();
      } else {
        setIsQuestMarkedComplete(false);
      }
    } catch (error) {
      alert(`Error checking balance: ${error instanceof Error ? error.message : String(error)}`);
      setIsQuestMarkedComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, mainnetConnection, minRequiredSOL, onQuestComplete]);

  if (!connected || !publicKey) {
    return (
      <div style={styles.questContainer}>
        <h4>Solana Learning Path - Prerequisite</h4>
        <p>Please connect your Solana wallet to begin the quests.</p>
      </div>
    );
  }

  return (
    <div style={styles.questContainer}>
      <h3 style={styles.questTitle}>Quest: Fund Your Wallet</h3>
      {xpReward !== undefined && (
        <p style={styles.xpTextUnderTitle}>+{xpReward} XP</p>
      )}
      {isQuestMarkedComplete ? (
        <div style={styles.successMessage}>
          <p>✅ Quest Complete! You have {currentSolBalance?.toFixed(4)} SOL.</p>
          <p>You can now proceed to the next quest.</p>
        </div>
      ) : (
        <>
          <div style={styles.descriptionContainer}>
            <div style={styles.descriptionParagraph}>
              <span style={styles.greenBullet}></span>
              <span style={styles.descriptionText}>
                To interact with the Solana blockchain, your wallet needs a small amount of SOL to pay for transaction fees.
              </span>
            </div>
            <div style={styles.descriptionParagraph}>
              <span style={styles.greenBullet}></span>
              <span style={styles.descriptionText}>
                <strong>How to fund your wallet?</strong> Purchase or transfer at least {minRequiredSOL} SOL to your wallet address: <strong style={styles.address}>{publicKey.toBase58()}</strong> from an exchange or another wallet.
              </span>
            </div>
            <div style={styles.descriptionParagraph}>
              <span style={styles.greenBullet}></span>
              <span style={styles.descriptionText}>
                Once you have funded your wallet, click the button below to verify your balance.
              </span>
            </div>
          </div>

          <button
            onClick={handleVerifyBalance}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? 'Verifying...' : 'Verify My SOL Balance'}
          </button>

          {questAttempted && !isLoading && currentSolBalance !== null && !isQuestMarkedComplete && (
            <p style={styles.errorMessage}>
              Verification Failed. You currently have {currentSolBalance?.toFixed(4) || '0'} SOL.
              Please ensure you have at least {minRequiredSOL} SOL and try again.
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