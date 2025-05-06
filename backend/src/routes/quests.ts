import express, { Request, Response, Router } from 'express';
import { protect } from '../middleware/authMiddleware'; // Import protect middleware
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import User from '../models/User';

const router: Router = express.Router();

// Define Quest IDs
const FUND_WALLET_QUEST_ID = 'fund-wallet';
const VERIFY_WALLET_QUEST_ID = 'verify-wallet';
const EXPLORE_TRANSACTION_QUEST_ID = 'explore-transaction-1';
const FIND_NFT_AUTHORITY_QUEST_ID = 'find-nft-authority-1';
const FIND_FIRST_TX_QUEST_ID = 'find-first-tx-1';

// Community Quest IDs for Solana Explorer Path
const VISIT_X_SE_QUEST_ID = 'visit-x-se';
const JOIN_DISCORD_SE_QUEST_ID = 'join-discord-se';

// Community Quest IDs for SolQuest OG Path
const VISIT_X_OG_QUEST_ID = 'visit-x-og';
const JOIN_DISCORD_OG_QUEST_ID = 'join-discord-og';

// Define Path IDs
const SOLANA_FOUNDATIONS_PATH_ID = 'solana-foundations';
const SOLQUEST_OG_PATH_ID = 'solquest-og';

const OG_NFT_XP_BOOST = 1.2; // Example: 20% XP boost

// Export quest definitions so they can be imported elsewhere
export const QUEST_DEFINITIONS = {
    // --- Community Quests for Solana Explorer Path ---
    [VISIT_X_SE_QUEST_ID]: {
        id: VISIT_X_SE_QUEST_ID,
        title: 'Visit Solana on X',
        description: 'Stay updated with official announcements from Solana by visiting their X (formerly Twitter) page.',
        pathId: SOLANA_FOUNDATIONS_PATH_ID,
        order: 1,
        xpReward: 10,
        verificationType: 'community_link_click',
        actionText: 'Visit Solana on X',
        actionUrl: 'https://x.com/solana',
        correctAnswer: 'action_confirmed'
    },
    [JOIN_DISCORD_SE_QUEST_ID]: {
        id: JOIN_DISCORD_SE_QUEST_ID,
        title: 'Join the Solana Discord',
        description: 'Become a part of the official Solana community on Discord! Get help, share ideas, and connect with fellow Solana enthusiasts and developers.',
        pathId: SOLANA_FOUNDATIONS_PATH_ID,
        order: 2,
        xpReward: 15,
        verificationType: 'community_link_click',
        actionText: 'Join Solana Discord',
        actionUrl: 'https://discord.gg/solana',
        correctAnswer: 'action_confirmed'
    },

    // --- Solana Explorer Path Specific Quests ---
    [VERIFY_WALLET_QUEST_ID]: { id: VERIFY_WALLET_QUEST_ID, title: 'Verify Wallet Ownership', description: 'Connect and sign a message to prove you own your wallet.', pathId: SOLANA_FOUNDATIONS_PATH_ID, order: 3, xpReward: 10, verificationType: 'signature' },
    [FUND_WALLET_QUEST_ID]: { id: FUND_WALLET_QUEST_ID, title: 'Fund Your Wallet', description: 'Ensure your mainnet wallet has at least 0.01 SOL.', pathId: SOLANA_FOUNDATIONS_PATH_ID, order: 4, xpReward: 20, verificationType: 'balance_check' },
    [EXPLORE_TRANSACTION_QUEST_ID]: {
        id: EXPLORE_TRANSACTION_QUEST_ID,
        title: 'Explore a Transaction',
        description: 'Use a block explorer like [Solscan](https://solscan.io/) or [SolanaFM](https://solana.fm/) to find the compute units consumed by transaction: `3rTBBBx2J8j6HwuKxQiMfsFRNb1z2EseVeJbPbKKB9dVewPrGRT14yyowQnnrr7XV6Ma6jnYwwXA6ibDkYayp3ES` (Click the address to copy!). Enter the CU value below.',
        pathId: SOLANA_FOUNDATIONS_PATH_ID,
        order: 5,
        xpReward: 30,
        correctAnswer: '150',
        verificationType: 'input_answer'
    },
    [FIND_NFT_AUTHORITY_QUEST_ID]: {
        id: FIND_NFT_AUTHORITY_QUEST_ID,
        title: 'Find NFT Collection Authority',
        description: 'Using a Solana explorer (like [Solscan](https://solscan.io/) or [SolanaFM](https://solana.fm/)), find the **Update Authority** address for the **Mad Lads NFT Collection** (Mint Address: `J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w`). Enter the Update Authority address below.',
        pathId: SOLANA_FOUNDATIONS_PATH_ID,
        order: 6,
        xpReward: 40,
        correctAnswer: '2RtGg6fsFiiF1EQzHqbd66AhW7R5bWeQGpTbv2UMkCdW',
        verificationType: 'input_answer'
    },
    [FIND_FIRST_TX_QUEST_ID]: {
        id: FIND_FIRST_TX_QUEST_ID,
        title: 'Find First Transaction',
        description: 'Using a Solana explorer (like [Solscan](https://solscan.io/) or [SolanaFM](https://solana.fm/)), find the signature of the *very first* transaction ever made by the wallet address: `DevRk1Y4SftxH47JkXjNPAk4Qh9f7XHXBHp53vZAe9eF`. (Hint: Look for the oldest transaction date). Enter the full transaction signature below.',
        pathId: SOLANA_FOUNDATIONS_PATH_ID,
        order: 7,
        xpReward: 50,
        correctAnswer: '2rNSt8n54Y7cF5o3FGU8Wdqac9TzgdiyMErq1ns9g7L8o1M1N1aH4B99RnHvjcF1SbCHHsmWw4h51W8s1t1F7tLz',
        verificationType: 'input_answer'
    },

    // --- Community Quests for SolQuest OG Path ---
    [VISIT_X_OG_QUEST_ID]: {
        id: VISIT_X_OG_QUEST_ID,
        title: 'Visit SolQuest on X',
        description: 'Stay updated with the latest announcements and join the conversation by visiting our official X (formerly Twitter) page.',
        pathId: SOLQUEST_OG_PATH_ID,
        order: 1,
        xpReward: 10,
        verificationType: 'community_link_click',
        actionText: 'Visit SolQuest on X',
        actionUrl: 'https://x.com/SolQuestio',
        correctAnswer: 'action_confirmed'
    },
    [JOIN_DISCORD_OG_QUEST_ID]: {
        id: JOIN_DISCORD_OG_QUEST_ID,
        title: 'Join the SolQuest Discord',
        description: 'Become a part of our vibrant community on Discord! Get help, share ideas, and connect with fellow SolQuesters.',
        pathId: SOLQUEST_OG_PATH_ID,
        order: 2,
        xpReward: 15,
        verificationType: 'community_link_click',
        actionText: 'Join Discord',
        actionUrl: 'https://discord.gg/your-invite-code',
        correctAnswer: 'action_confirmed'
    }
    // Add more SolQuest OG specific quests here later, e.g., order: 3 onwards for pathId: SOLQUEST_OG_PATH_ID
};

// TODO: Configure RPC connection (potentially move to a config file)
// Ensure NEXT_PUBLIC_HELIUS_RPC_URL is set in your backend .env file
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com'; 
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// NEW: GET /api/quests/paths - Get list of available learning paths metadata
router.get('/paths', (req: Request, res: Response) => {
    try {
        const allQuests = Object.values(QUEST_DEFINITIONS);

        const getPathDetails = (pathIdToProcess: string): { count: number, totalXp: number } => {
            let count = 0;
            let totalXp = 0;
            allQuests.forEach(quest => {
                if (quest.pathId === pathIdToProcess) {
                    count++;
                    totalXp += quest.xpReward || 0;
                }
            });
            return { count, totalXp };
        };

        const solanaFoundationsDetails = getPathDetails(SOLANA_FOUNDATIONS_PATH_ID);
        const solquestOgDetails = getPathDetails(SOLQUEST_OG_PATH_ID);

        const pathsMetadata = [
            {
                id: SOLANA_FOUNDATIONS_PATH_ID,
                title: 'Solana Explorer Path',
                description: "Dive deep into Solana's core concepts, learn to navigate the ecosystem, and complete foundational quests, starting with community engagement.",
                questCount: solanaFoundationsDetails.count,
                totalXp: solanaFoundationsDetails.totalXp,
                isLocked: false,
            },
            {
                id: SOLQUEST_OG_PATH_ID,
                title: 'SolQuest OG Path',
                description: 'Exclusive quests and learning experiences for SolQuest enthusiasts. Kick off your journey by connecting with our community!',
                questCount: solquestOgDetails.count,
                totalXp: solquestOgDetails.totalXp,
                isLocked: false, // Can be set to true to gate content later
            }
            // Future paths can be added here
        ];

        res.status(200).json(pathsMetadata);

    } catch (error: any) {
        console.error('Error fetching paths metadata:', error);
        res.status(500).json({ message: 'Error fetching paths metadata', error: error.message });
    }
});

// POST /api/quests/check-balance
router.post('/check-balance', protect, async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const { userId } = req.user;
    const balanceThresholdSOL = 0.01;

    try {
        // Fetch user *first* to check ownsOgNft status
        const user = await User.findById(userId); 
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Calculate rewards based on user's NFT status
        const baseReward = QUEST_DEFINITIONS[FUND_WALLET_QUEST_ID]?.xpReward || 0;
        const finalReward = Math.round(baseReward * (user.ownsOgNft ? OG_NFT_XP_BOOST : 1));

        console.log(`Checking balance for user ${userId} (${user.walletAddress}) for quest ${FUND_WALLET_QUEST_ID}`);

        // Check if already completed
        if (user.completedQuestIds.includes(FUND_WALLET_QUEST_ID)) {
             console.log(`Quest ${FUND_WALLET_QUEST_ID} already completed for user ${userId}.`);
             return res.status(200).json({
                message: 'Balance sufficient, quest already completed.',
                // balance: balanceSOL, // Balance check happens later
                questCompleted: true,
                user // Send existing user data
            });
        }

        // Now check balance
        const publicKey = new PublicKey(user.walletAddress); // Use user.walletAddress
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
        console.log(`User ${userId} balance: ${balanceSOL} SOL`);

        // Check if balance is sufficient
        if (balanceSOL >= balanceThresholdSOL) {
            // Balance sufficient & quest not completed -> Update user
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    $push: { completedQuestIds: FUND_WALLET_QUEST_ID },
                    $inc: { xp: finalReward } // Use finalReward
                },
                { new: true } 
            );

            if (updatedUser) {
                // Use updatedUser for consistency, assuming ownsOgNft doesn't change mid-request
                console.log(`Quest ${FUND_WALLET_QUEST_ID} completed by ${userId}. BaseXP: ${baseReward}. NFT Boost: ${updatedUser.ownsOgNft}. Final XP: ${finalReward}.`);
                return res.status(200).json({
                    message: 'Balance verified and quest completed.',
                    balance: balanceSOL,
                    questCompleted: true,
                    user: updatedUser
                });
            } else {
                console.error(`Failed to update user ${userId} after completing quest ${FUND_WALLET_QUEST_ID}.`);
                return res.status(500).json({ message: 'Failed to update user data after quest completion.' });
            }
        } else {
            // Balance not sufficient
             return res.status(200).json({
                message: 'Balance not sufficient to complete quest.',
                balance: balanceSOL,
                questCompleted: false,
                user // Send existing user data
            });
        }

    } catch (error: any) {
        console.error(`Error checking balance for user ${userId}:`, error);
        if (error.message.includes('Invalid public key')) {
            return res.status(400).json({ message: 'Invalid wallet address format associated with user' });
        }
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

// GET /api/quests/path/:pathId - Get quests for a specific learning path
router.get('/path/:pathId', protect, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const { userId } = req.user;
    const { pathId } = req.params; // Get pathId from URL parameters

    console.log(`Fetching quests for path '${pathId}' for user ${userId}`);

    try {
        // Fetch user completion data
        const user = await User.findById(userId).select('completedQuestIds');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter quests from definitions based on pathId
        const pathQuests = Object.values(QUEST_DEFINITIONS)
            .filter(quest => quest.pathId === pathId); // Changed 'path' to 'pathId' to match new definitions

        if (pathQuests.length === 0) {
             console.log(`No quests found for path ID: ${pathId}`);
             // Return empty array or a specific message?
             return res.status(200).json([]); // Return empty array if path has no quests or ID is invalid
        }

        // Map quests and add completion status
        const questsWithStatus = pathQuests.map(quest => ({
            ...quest,
            isCompleted: user.completedQuestIds.includes(quest.id)
        }));

        res.status(200).json(questsWithStatus);

    } catch (error: any) {
        console.error(`Error fetching quests for path ${pathId} for user ${userId}:`, error);
        res.status(500).json({ message: 'Error fetching quests for path', error: error.message });
    }
});

// POST /api/quests/verify-transaction - Verify user's answer for explore tx quest
router.post('/verify-transaction', protect, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const { userId } = req.user;
    const { questId, answer } = req.body;

    // 1. Input Validation
    if (questId !== EXPLORE_TRANSACTION_QUEST_ID) { // Only handle this specific quest for now
        return res.status(400).json({ message: 'Invalid quest ID for this endpoint.' });
    }
    if (!answer || typeof answer !== 'string') {
        return res.status(400).json({ message: 'Answer is required and must be a string.' });
    }

    const verifiedQuestId = questId as keyof typeof QUEST_DEFINITIONS; // Assert type

    console.log(`Verifying answer '${answer}' for quest '${verifiedQuestId}' for user ${userId}`);

    try {
        // Use the verified ID with asserted type
        const questDefinition = QUEST_DEFINITIONS[verifiedQuestId];

        // Type guard to ensure correctAnswer exists for this quest type
        if (!('correctAnswer' in questDefinition)) {
            console.error(`Quest ${verifiedQuestId} is missing correctAnswer in definition.`);
            return res.status(500).json({ message: 'Quest configuration error.' });
        }
        // Now TypeScript knows questDefinition has correctAnswer

        // Fetch user to check completion status
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.completedQuestIds.includes(verifiedQuestId)) {
             console.log(`Quest ${verifiedQuestId} already completed for user ${userId}.`);
             return res.status(200).json({ message: 'Quest already completed.', questCompleted: true, user });
        }
        const isCorrect = answer.trim().toLowerCase() === questDefinition.correctAnswer.toLowerCase();
        if (!isCorrect) {
            console.log(`Incorrect answer submitted by user ${userId} for quest ${verifiedQuestId}.`);
            return res.status(400).json({ message: 'Incorrect answer. Please check the block explorer again.' });
        }
         console.log(`Correct answer submitted by user ${userId} for quest ${verifiedQuestId}.`);
         const baseReward = questDefinition.xpReward || 0;
         const finalReward = Math.round(baseReward * (user.ownsOgNft ? OG_NFT_XP_BOOST : 1));
         
         const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $push: { completedQuestIds: verifiedQuestId },
                $inc: { xp: finalReward }
            },
            { new: true }
        ).select('-__v');
         if (!updatedUser) {
            console.error(`Failed to update user ${userId} after completing quest ${verifiedQuestId}.`);
            return res.status(500).json({ message: 'Failed to update user data after quest completion.' });
        }
        console.log(`Quest ${verifiedQuestId} completed by ${userId}. BaseXP: ${baseReward}. NFT Boost: ${user.ownsOgNft}. Final XP: ${finalReward}.`);
        res.status(200).json({
            message: 'Correct answer! Quest completed.',
            questCompleted: true,
            user: updatedUser
        });

    } catch (error: any) {
        console.error(`Error verifying transaction quest for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error verifying quest.', error: error.message });
    }
});

// POST /api/quests/verify-answer - Generic route to verify submitted answers
router.post('/verify-answer', protect, async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const { userId } = req.user;
    const { questId, answer } = req.body;

    // 1. Input Validation
    if (!questId || typeof questId !== 'string') {
        return res.status(400).json({ message: 'Quest ID is required.' });
    }
    
    const questDefinition = QUEST_DEFINITIONS[questId as keyof typeof QUEST_DEFINITIONS];

    if (!questDefinition) {
        return res.status(404).json({ message: 'Quest not found.' });
    }

    if ((questDefinition.verificationType === 'input_answer' || questDefinition.verificationType === 'community_link_click') && (!answer || typeof answer !== 'string')) {
        return res.status(400).json({ message: 'Answer is required for this quest type.' });
    }
    
    console.log(`Verifying answer for quest '${questId}' for user ${userId}. Received answer: '${answer}'`);

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.completedQuestIds.includes(questId)) {
            console.log(`Quest ${questId} already completed for user ${userId}.`);
            return res.status(200).json({ message: 'Quest already completed.', questCompleted: true, user });
        }

        let isCorrect = false;
        // Only attempt to access correctAnswer if the quest type expects it
        if (questDefinition.verificationType === 'input_answer' || questDefinition.verificationType === 'community_link_click') {
            // Type assertion to inform TypeScript about the expected structure for these types
            const answerQuest = questDefinition as typeof QUEST_DEFINITIONS[typeof EXPLORE_TRANSACTION_QUEST_ID] | typeof QUEST_DEFINITIONS[typeof VISIT_X_SE_QUEST_ID];
            if (!answerQuest.correctAnswer || typeof answerQuest.correctAnswer !== 'string') {
                console.error(`Quest ${questId} of type '${answerQuest.verificationType}' is missing a valid correctAnswer string in definition.`);
                return res.status(500).json({ message: 'Quest configuration error (missing correctAnswer).' });
            }
            isCorrect = answer.trim().toLowerCase() === answerQuest.correctAnswer.toLowerCase();
        } else {
            // Handle other verification types or quests that don't use a direct 'answer' field in the same way.
            // For types like 'signature' or 'balance_check', this endpoint might be called post-verification elsewhere,
            // or they might have their own dedicated verification routes.
            // If such a quest *does* have a 'correctAnswer' (e.g. 'action_confirmed' after a signature), it could be handled here.
            // This logic branch assumes that if it's not 'input_answer' or 'community_link_click',
            // and it reaches here, 'isCorrect' remains false unless specific logic is added.
            console.warn(`Quest ${questId} has verificationType '${questDefinition.verificationType}'. This type may not be directly verifiable by a simple answer submission to /verify-answer unless a 'correctAnswer' is defined and matched.`);
            // If a generic 'action_confirmed' is expected for other types, that can be checked:
            if (('correctAnswer' in questDefinition && typeof questDefinition.correctAnswer === 'string' && answer && answer.trim().toLowerCase() === questDefinition.correctAnswer.toLowerCase())) {
                isCorrect = true;
            } else {
                 // If not 'input_answer' or 'community_link_click', and no matching 'correctAnswer' is found,
                 // then the answer is considered incorrect for this generic endpoint.
                 console.log(`Answer for quest ${questId} (type ${questDefinition.verificationType}) did not match an expected 'correctAnswer' or is not an input-based quest.`);
            }
        }

        if (!isCorrect) {
            console.log(`Incorrect answer or verification failed for user ${userId} for quest ${questId}.`);
            return res.status(400).json({ message: 'Incorrect answer or action not confirmed.' });
        }

        console.log(`Correct answer confirmed by user ${userId} for quest ${questId}.`);
        const baseReward = questDefinition.xpReward || 0;
        const finalReward = Math.round(baseReward * (user.ownsOgNft ? OG_NFT_XP_BOOST : 1));
         
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $push: { completedQuestIds: questId },
                $inc: { xp: finalReward } 
            },
            { new: true }
        ).select('-__v');

        if (!updatedUser) {
            console.error(`Failed to update user ${userId} after completing quest ${questId}.`);
            return res.status(500).json({ message: 'Failed to update user data after quest completion.' });
        }
        
        console.log(`Quest ${questId} completed by ${userId}. BaseXP: ${baseReward}. NFT Boost: ${user.ownsOgNft}. Final XP: ${finalReward}.`);
        res.status(200).json({
            message: 'Correct answer! Quest completed.',
            xpAwarded: finalReward,
            questCompleted: true,
            user: updatedUser
        });

    } catch (error: any) {
        console.error(`Error verifying answer for quest ${questId} for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error verifying quest answer.', error: error.message });
    }
});

export default router;