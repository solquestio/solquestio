import express, { Request, Response, Router } from 'express';
import { protect } from '../middleware/authMiddleware'; // Import protect middleware
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import User from '../models/User';

const router: Router = express.Router();

// Define Quest IDs
const FUND_WALLET_QUEST_ID = 'fund-wallet';
const VERIFY_WALLET_QUEST_ID = 'verify-wallet'; // Added for clarity

// Hardcoded quest definitions - Include XP Rewards
// TODO: Move this to database later
const QUEST_DEFINITIONS = {
    [VERIFY_WALLET_QUEST_ID]: { id: VERIFY_WALLET_QUEST_ID, title: 'Verify Wallet Ownership', description: 'Connect and sign a message to prove you own your wallet.', path: 'Solana Explorer', order: 1, xpReward: 10 },
    [FUND_WALLET_QUEST_ID]: { id: FUND_WALLET_QUEST_ID, title: 'Fund Your Wallet', description: 'Ensure your mainnet wallet has some SOL.', path: 'Solana Explorer', order: 2, xpReward: 20 },
    // Add more quests here later
};

// TODO: Configure RPC connection (potentially move to a config file)
// Ensure NEXT_PUBLIC_HELIUS_RPC_URL is set in your backend .env file
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com'; 
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// POST /api/quests/check-balance - Check user's mainnet balance for Quest 2
router.post('/check-balance', protect, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const { userId, walletAddress } = req.user;
    const balanceThresholdSOL = 0.0001;
    const questReward = QUEST_DEFINITIONS[FUND_WALLET_QUEST_ID]?.xpReward || 0;

    console.log(`Checking balance for user ${userId} (${walletAddress}) for quest ${FUND_WALLET_QUEST_ID}`);

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const publicKey = new PublicKey(walletAddress);
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;

        console.log(`User ${userId} balance: ${balanceSOL} SOL`);

        // Check if quest already completed
        if (user.completedQuestIds.includes(FUND_WALLET_QUEST_ID)) {
             console.log(`Quest ${FUND_WALLET_QUEST_ID} already completed for user ${userId}.`);
             return res.status(200).json({
                message: 'Balance sufficient, quest already completed.',
                balance: balanceSOL,
                questCompleted: true,
                user // Send existing user data
            });
        }

        // Check if balance is sufficient
        if (balanceSOL >= balanceThresholdSOL) {
            // Balance sufficient & quest not completed -> Update user
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    $push: { completedQuestIds: FUND_WALLET_QUEST_ID },
                    $inc: { xp: questReward }
                },
                { new: true } // Return the updated document
            );

            if (updatedUser) {
                console.log(`Quest ${FUND_WALLET_QUEST_ID} completed for user ${userId}. Awarded ${questReward} XP.`);
                return res.status(200).json({
                    message: 'Balance verified and quest completed.',
                    balance: balanceSOL,
                    questCompleted: true,
                    user: updatedUser
                });
            } else {
                console.error(`Failed to update user ${userId} after completing quest ${FUND_WALLET_QUEST_ID}.`);
                // Don't return user data if update failed
                return res.status(500).json({ message: 'Failed to update user data after quest completion.' });
            }
        } else {
            // Balance not sufficient & quest not completed
             return res.status(200).json({
                message: 'Balance not sufficient to complete quest.',
                balance: balanceSOL,
                questCompleted: false,
                user // Send existing user data
            });
        }

    } catch (error: any) {
        console.error(`Error checking balance for user ${userId}:`, error);
        // Simplified error handling in catch block
        if (error.message.includes('Invalid public key')) {
            return res.status(400).json({ message: 'Invalid wallet address format associated with user' });
        }
        // Generic server error - no need to return user data here
        res.status(500).json({ message: 'Error checking balance', error: error.message });
    }
});

// GET /api/quests - Get list of available quests
router.get('/', protect, async (req: Request, res: Response) => {
     if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const { userId } = req.user;

    try {
        const user = await User.findById(userId).select('completedQuestIds');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get quest definitions as an array
        const quests = Object.values(QUEST_DEFINITIONS);

        // Map quests and add completion status
        const questsWithStatus = quests.map(quest => ({
            ...quest,
            isCompleted: user.completedQuestIds.includes(quest.id)
        }));

        res.status(200).json(questsWithStatus);

    } catch (error: any) {
        console.error(`Error fetching quests for user ${userId}:`, error);
        res.status(500).json({ message: 'Error fetching quests', error: error.message });
    }
});


export default router; 