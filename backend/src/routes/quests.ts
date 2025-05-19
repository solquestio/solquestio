import express, { Request, Response, Router } from 'express';
import { protect } from '../middleware/authMiddleware'; // Import protect middleware
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose'; // Import mongoose for Types.ObjectId
// Referral utils import removed

// Define QuestDefinition interface
interface QuestDefinition {
  id: string;
  pathId: string;
  order: number;
  title: string;
  shortDescription: string;
  description: string;
  xpReward: number;
  difficulty: string;
  verificationType: string;
  correctAnswer?: string;
  actionText?: string;
}

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
const MINT_OG_NFT_QUEST_ID = 'mint-og-nft';
// Referral quest ID removed

// Define Path IDs
const SOLANA_FOUNDATIONS_PATH_ID = 'solana-foundations';
const SOLQUEST_OG_PATH_ID = 'solquest-og';

// Define new Path ID for ZK Compression
const ZK_COMPRESSION_PATH_ID = 'zk-compression-path';

const OG_NFT_XP_BOOST = 1.2; // Example: 20% XP boost

// Quest Definitions (Consider moving to a separate file or database in a real app)
const QUEST_DEFINITIONS: { [key: string]: QuestDefinition } = {
  // == LayerZero V2 Omnichain Path Quests ==
  'lzv2-q1-concepts': {
    id: 'lzv2-q1-concepts',
    pathId: 'layerzero-path',
    order: 1,
    title: 'Intro to Omnichain & LayerZero V2',
    shortDescription: 'Understand interoperability and LayerZero V2.',
    description: 'Learn the core concepts of omnichain communication, what LayerZero is, its architecture (Endpoints, OApps, Message Libraries), and the key improvements in V2. Resources: [LayerZero V2 Docs](https://docs.layerzero.network/v2)',
    xpReward: 200,
    difficulty: 'Beginner',
    verificationType: 'input_answer',
    correctAnswer: 'OApp',
    actionText: 'Review Docs & Answer',
  },
  'lzv2-q2-setup': {
    id: 'lzv2-q2-setup',
    pathId: 'layerzero-path',
    order: 2,
    title: 'Solana Dev Environment for LayerZero',
    shortDescription: 'Prepare your local setup for Solana and LayerZero development.',
    description: 'Ensure you have Rust, Solana CLI, Anchor (optional but recommended for complex projects), and Node.js/npm installed. Get familiar with requesting Devnet SOL for deployments and testing. Key step: Clone the LayerZero V2 examples repository: `git clone https://github.com/LayerZero-Labs/devtools.git` and navigate to `examples/oft-solana`.',
    xpReward: 250,
    difficulty: 'Beginner',
    verificationType: 'input_answer',
    correctAnswer: 'devtools',
    actionText: 'Confirm Setup Step',
  },
  'lzv2-q3-endpoint': {
    id: 'lzv2-q3-endpoint',
    pathId: 'layerzero-path',
    order: 3,
    title: 'Understanding LayerZero V2 Endpoints on Solana',
    shortDescription: 'Explore the code and role of a Solana LayerZero Endpoint.',
    description: 'Dive into the `examples/oft-solana/programs/layerzero-solana-endpoint` directory from the cloned `devtools` repo. Understand how an Endpoint is a deployed contract that other OApps on Solana will use to send and receive messages. What is the typical command to build this endpoint program using Anchor?',
    xpReward: 300,
    difficulty: 'Intermediate',
    verificationType: 'input_answer',
    correctAnswer: 'anchor build',
    actionText: 'Analyze Endpoint & Answer',
  },
  'lzv2-q4-send-message': {
    id: 'lzv2-q4-send-message',
    pathId: 'layerzero-path',
    order: 4,
    title: 'Sending Your First LayerZero Message (Conceptual)',
    shortDescription: 'Learn to structure and dispatch an omnichain message from Solana.',
    description: 'Review the `send_message` instruction in `examples/oft-solana/programs/oft/src/lib.rs`. Focus on how it uses `lz_send` from the LayerZero Endpoint. What key parameters are required for `lz_send` (e.g., destination chain ID, receiver address, message payload, options)? For this quest, list three essential parameters.',
    xpReward: 400,
    difficulty: 'Intermediate',
    verificationType: 'input_answer',
    correctAnswer: 'destination chain id, receiver address, message payload',
    actionText: 'Study Sending Logic & Answer',
  },
  'lzv2-q5-receive-message': {
    id: 'lzv2-q5-receive-message',
    pathId: 'layerzero-path',
    order: 5,
    title: 'Receiving a LayerZero Message on Solana (Conceptual)',
    shortDescription: 'Understand how a Solana OApp processes incoming omnichain messages.',
    description: 'Examine the `lz_receive` instruction in `examples/oft-solana/programs/oft/src/lib.rs`. How does the OApp ensure the message is authentic and from a trusted remote source? What role does `setConfig` or similar admin functions play in establishing trusted remotes?',
    xpReward: 400,
    difficulty: 'Intermediate',
    verificationType: 'input_answer',
    correctAnswer: 'trusted remote lookup',
    actionText: 'Study Receiving Logic & Answer',
  },
  'lzv2-q6-oft-explore': {
    id: 'lzv2-q6-oft-explore',
    pathId: 'layerzero-path',
    order: 6,
    title: 'Exploring an Omnichain Fungible Token (OFT) V2',
    shortDescription: 'Understand how OFTs enable cross-chain token transfers.',
    description: 'The `oft` example in the `devtools` repository demonstrates how to create a token that can be seamlessly transferred across chains using LayerZero. What are the main functions an OFT contract implements to handle sending and receiving tokens (e.g., `send`, `credit`, `debit`)? List two.',
    xpReward: 450,
    difficulty: 'Advanced',
    verificationType: 'input_answer',
    correctAnswer: 'send, credit',
    actionText: 'Analyze OFT & Answer',
  },
  'lzv2-q7-capstone': {
    id: 'lzv2-q7-capstone',
    pathId: 'layerzero-path',
    order: 7,
    title: 'Capstone: Omnichain Proof-of-Learning Beacon',
    shortDescription: 'Design a simple cross-chain "proof-of-learning" system.',
    description: 'Conceptually design and describe the key components of an OApp on Solana that sends a LayerZero message to another chain (e.g., Ethereum Sepolia) when this quest is "completed". The message should contain your Solana wallet address and the path ID (`layerzero-path`). What would be the `messagePayload` format (e.g., stringified JSON)? Provide an example payload.',
    xpReward: 500,
    difficulty: 'Advanced',
    verificationType: 'input_answer',
    correctAnswer: '{"wallet":"[YOUR_SOL_ADDRESS]","pathId":"layerzero-path"}',
    actionText: 'Design Beacon & Submit Payload Format',
  },

  // == ZK Compression Path Quests ==
  'zk-q1-intro': {
    id: 'zk-q1-intro',
    pathId: ZK_COMPRESSION_PATH_ID,
    order: 1,
    title: 'Introduction to ZK Compression',
    shortDescription: 'Learn the fundamentals of state compression on Solana',
    description: 'Zero-Knowledge (ZK) Compression on Solana allows for significant storage cost reduction while maintaining security and composability. This quest introduces state compression concepts, merkle trees, and how ZK proofs enable secure compression on-chain. Resources: [ZK Compression Overview](https://solana.com/developers/guides/state-compression), [Merkle Trees Explained](https://www.helius.dev/blog/state-compression-on-solana-understanding-merkle-trees)',
    xpReward: 200,
    difficulty: 'Beginner',
    verificationType: 'input_answer',
    correctAnswer: 'merkle tree',
    actionText: 'What data structure is at the core of state compression on Solana?',
  },
  'zk-q2-setup': {
    id: 'zk-q2-setup',
    pathId: ZK_COMPRESSION_PATH_ID,
    order: 2,
    title: 'Setting Up Your Compression Environment',
    shortDescription: 'Configure your developer environment for compressed NFTs and tokens',
    description: 'To work with ZK Compression, you\'ll need the Solana CLI, Node.js, and specific libraries. This quest walks you through setting up your environment, installing the @solana/spl-account-compression library and other tools necessary for compression. Resources: [Solana CLI Setup](https://docs.solana.com/cli/install-solana-cli-tools), [Account Compression Library](https://github.com/solana-labs/solana-program-library/tree/master/account-compression/sdk)',
    xpReward: 250,
    difficulty: 'Beginner',
    verificationType: 'input_answer',
    correctAnswer: '@solana/spl-account-compression',
    actionText: 'What is the main npm package needed for working with compressed accounts?',
  },
  'zk-q3-compressed-nfts': {
    id: 'zk-q3-compressed-nfts',
    pathId: ZK_COMPRESSION_PATH_ID,
    order: 3,
    title: 'Creating Your First Compressed NFT',
    shortDescription: 'Learn to mint and manage compressed NFTs on Solana',
    description: 'Compressed NFTs (cNFTs) can be created for a fraction of the cost of regular NFTs. This quest explains how to create a compressed NFT collection using Metaplex\'s Bubblegum program, from setting up the merkle tree to minting your first cNFT. Resources: [Helius cNFT Guide](https://docs.helius.dev/compression-and-das-api/cnfts), [Metaplex Bubblegum](https://developers.metaplex.com/bubblegum)',
    xpReward: 300,
    difficulty: 'Intermediate',
    verificationType: 'input_answer',
    correctAnswer: 'bubblegum',
    actionText: 'What is the name of Metaplex\'s program used for creating compressed NFTs?',
  },
  'zk-q4-compressed-tokens': {
    id: 'zk-q4-compressed-tokens',
    pathId: ZK_COMPRESSION_PATH_ID,
    order: 4,
    title: 'Working with Compressed Tokens (cTokens)',
    shortDescription: 'Create and transact with compressed fungible tokens',
    description: 'Compressed tokens (cTokens) offer scalable token transactions with minimal storage costs. Learn how to create a cToken, transfer cTokens between wallets, and understand the differences between cTokens and regular SPL tokens. Resources: [Light Protocol cToken Guide](https://www.lightprotocol.com/), [cToken Documentation](https://docs.lightprotocol.com/)',
    xpReward: 350,
    difficulty: 'Intermediate',
    verificationType: 'input_answer',
    correctAnswer: 'light protocol',
    actionText: 'Which protocol is commonly used for cToken operations on Solana?',
  },
  'zk-q5-compression-api': {
    id: 'zk-q5-compression-api',
    pathId: ZK_COMPRESSION_PATH_ID,
    order: 5,
    title: 'Using the Digital Asset Standard (DAS) API',
    shortDescription: 'Query and retrieve data for compressed assets',
    description: 'The Digital Asset Standard (DAS) API allows developers to fetch information about compressed assets. This quest covers how to use the DAS API through Helius to find cNFTs, get asset details, and monitor compressed collections. Resources: [DAS API Reference](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api)',
    xpReward: 350,
    difficulty: 'Intermediate',
    verificationType: 'input_answer',
    correctAnswer: 'helius',
    actionText: 'Which service provides a comprehensive API for querying compressed NFTs?',
  },
  'zk-q6-merkle-tree-advanced': {
    id: 'zk-q6-merkle-tree-advanced',
    pathId: ZK_COMPRESSION_PATH_ID,
    order: 6,
    title: 'Advanced Merkle Tree Operations',
    shortDescription: 'Deep dive into merkle tree configuration and optimization',
    description: 'To maximize compression benefits, developers need to understand merkle tree configurations. This quest explores canopy depth, maximum depth, and buffer size parameters to optimize for different use cases. Resources: [Merkle Tree Configuration Guide](https://docs.helius.dev/compression-and-das-api/cnfts/create-a-compressed-nft-collection)',
    xpReward: 400,
    difficulty: 'Advanced',
    verificationType: 'input_answer',
    correctAnswer: 'canopy',
    actionText: 'What merkle tree configuration parameter helps reduce on-chain verification costs?',
  },
  'zk-q7-integration': {
    id: 'zk-q7-integration',
    pathId: ZK_COMPRESSION_PATH_ID,
    order: 7,
    title: 'Integrating Compression into dApps',
    shortDescription: 'Build user interfaces for compressed assets',
    description: 'This quest demonstrates how to integrate compressed assets into web applications. Learn to build interfaces that let users view, transfer, and interact with compressed NFTs and tokens, including wallet integration considerations. Resources: [Frontend Integration Examples](https://developers.metaplex.com/bubblegum/frontend)',
    xpReward: 450,
    difficulty: 'Advanced',
    verificationType: 'input_answer',
    correctAnswer: 'wallet adapter',
    actionText: 'What Solana library is essential for integrating wallet functionality with compressed assets?',
  },
  'zk-q8-capstone': {
    id: 'zk-q8-capstone',
    pathId: ZK_COMPRESSION_PATH_ID,
    order: 8,
    title: 'Capstone: Build a Compressed Asset Marketplace',
    shortDescription: 'Create a simple marketplace for compressed NFTs',
    description: 'Apply everything you\'ve learned to build a simplified marketplace for compressed NFTs. This capstone project involves creating merkle trees, minting sample cNFTs, and building an interface where users can browse and "purchase" these assets. Document your implementation with code examples. Resources: [Marketplace Reference Implementation](https://github.com/solana-labs/solana-program-library/tree/master/account-compression/programs/account-compression)',
    xpReward: 500,
    difficulty: 'Advanced',
    verificationType: 'input_answer',
    correctAnswer: 'concurrentmerkletree',
    actionText: 'What Solana program is used to create and manage concurrent merkle trees?',
  },

  // Intentionally leaving out other old quest definitions
  // You can add back other path quests if needed
};

// TODO: Configure RPC connection (potentially move to a config file)
// Ensure NEXT_PUBLIC_HELIUS_RPC_URL is set in your backend .env file
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com'; 
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// --- Referral Bonus Helper ---
// const REFERRAL_BONUS_PERCENTAGE = 0.01; // REMOVE
// const awardReferralBonus = async (referredUserId: mongoose.Types.ObjectId, xpGainedByReferredUser: number) => { // REMOVE
// ... (function body removed) ...
// }; // REMOVE

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
                graphicType: 'image',
                imageUrl: '/solana_v2_2b.jpg'
            },
            {
                id: SOLQUEST_OG_PATH_ID,
                title: 'SolQuest OG Path',
                description: 'Exclusive quests and learning experiences for SolQuest enthusiasts. Kick off your journey by connecting with our community!',
                questCount: solquestOgDetails.count,
                totalXp: solquestOgDetails.totalXp,
                isLocked: false,
                graphicType: 'image',
                imageUrl: '/Union.svg'
            },
            {
                id: ZK_COMPRESSION_PATH_ID,
                title: 'ZK Compression Developer Path',
                description: "Learn to build with ZK Compression on Solana. Master the technical skills needed to create scalable applications using compressed tokens and accounts while maintaining security and performance.",
                questCount: 8,
                totalXp: 2800, 
                isLocked: false,
                graphicType: 'image',
                imageUrl: '/zk-compression.svg'
            }
        ];

        res.status(200).json({ paths: pathsMetadata });

    } catch (error: any) {
        console.error('Error fetching paths metadata:', error);
        res.status(500).json({ message: 'Error fetching paths metadata', error: error.message });
    }
});

// POST /api/quests/check-balance
router.post('/check-balance', protect, async (req: Request, res: Response) => {
    if (!req.user || !req.user.userId) return res.status(401).json({ message: 'Not authorized' });
    const userId = req.user.userId;
    const balanceThresholdSOL = 0.01;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const questDefinition = QUEST_DEFINITIONS[FUND_WALLET_QUEST_ID];
        if (!questDefinition) {
            console.error(`Quest definition for ${FUND_WALLET_QUEST_ID} not found.`);
            return res.status(500).json({ message: 'Quest configuration error.' });
        }
        const baseReward = questDefinition.xpReward || 0;
        const finalReward = Math.round(baseReward * (user.ownsOgNft ? OG_NFT_XP_BOOST : 1));

        console.log(`Checking balance for user ${userId} (${user.walletAddress}) for quest ${FUND_WALLET_QUEST_ID}`);

        if (user.completedQuestIds.includes(FUND_WALLET_QUEST_ID)) {
             console.log(`Quest ${FUND_WALLET_QUEST_ID} already completed for user ${userId}.`);
             return res.status(200).json({
                message: 'Balance sufficient, quest already completed.',
                questCompleted: true,
                user 
            });
        }

        const publicKey = new PublicKey(user.walletAddress);
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
        console.log(`User ${userId} balance: ${balanceSOL} SOL`);

        if (balanceSOL >= balanceThresholdSOL) {
            // Add XP event
            const xpEvent = {
              type: 'quest',
              amount: finalReward,
              description: questDefinition.title,
              date: new Date()
            };
            const updatedUserDoc = await User.findByIdAndUpdate(
                userId,
                {
                    $push: { completedQuestIds: FUND_WALLET_QUEST_ID, xpEvents: xpEvent },
                    $inc: { xp: finalReward } 
                },
                { new: true } 
            );

            if (updatedUserDoc) {
                const updatedUser = updatedUserDoc as IUser; // Cast for type safety
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
             return res.status(200).json({
                message: 'Balance not sufficient to complete quest.',
                balance: balanceSOL,
                questCompleted: false,
                user 
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
        return res.status(401).json({ message: 'Not authorized, no token' });
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
            .filter(quest => quest.pathId === pathId); 

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
    if (!req.user || !req.user.userId) return res.status(401).json({ message: 'Not authorized' });
    const { userId } = req.user;
    const { questId, answer } = req.body;

    // 1. Input Validation
    if (questId !== EXPLORE_TRANSACTION_QUEST_ID) { // Only handle this specific quest for now
        return res.status(400).json({ message: 'Invalid quest ID for this endpoint.' });
    }
    if (!answer || typeof answer !== 'string') {
        return res.status(400).json({ message: 'Answer is required and must be a string.' });
    }

    const verifiedQuestId = questId as string; // Change this to string type
    console.log(`Verifying answer '${answer}' for quest '${verifiedQuestId}' for user ${userId}`);

    try {
        // Use the verified ID with string type
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
        
        // Ensure correctAnswer is not undefined
        if (!questDefinition.correctAnswer) {
            console.error(`Quest ${verifiedQuestId} has undefined correctAnswer.`);
            return res.status(500).json({ message: 'Quest configuration error.' });
        }
        
        const correctAnswer = questDefinition.correctAnswer as string;
        const isCorrect = answer.trim().toLowerCase() === correctAnswer.toLowerCase();
        if (!isCorrect) {
            console.log(`Incorrect answer submitted by user ${userId} for quest ${verifiedQuestId}.`);
            return res.status(400).json({ message: 'Incorrect answer. Please check the block explorer again.' });
        }
         console.log(`Correct answer submitted by user ${userId} for quest ${verifiedQuestId}.`);
         const baseReward = questDefinition.xpReward || 0;
         const finalReward = Math.round(baseReward * (user.ownsOgNft ? OG_NFT_XP_BOOST : 1));
         
         // Add XP event
         const xpEvent = {
           type: 'quest',
           amount: finalReward,
           description: questDefinition.title,
           date: new Date()
         };
         const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $push: { completedQuestIds: verifiedQuestId, xpEvents: xpEvent },
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
    if (!req.user || !req.user.userId) { 
        return res.status(401).json({ message: 'Not authorized' });
    }
    const userId = req.user.userId; 
    const { questId, answer } = req.body;

    if (!questId || typeof questId !== 'string') {
        return res.status(400).json({ message: 'Quest ID is required.' });
    }
    
    const questDefinition = QUEST_DEFINITIONS[questId as keyof typeof QUEST_DEFINITIONS];
    if (!questDefinition) return res.status(404).json({ message: 'Quest not found.' });

    if ((questDefinition.verificationType === 'input_answer' || questDefinition.verificationType === 'community_link_click') && (typeof answer !== 'string' || !answer.trim())) {
        return res.status(400).json({ message: 'A non-empty answer is required for this quest type.' });
    }
    
    console.log(`Verifying answer for quest '${questId}' for user ${userId}. Received answer: '${answer}'`);

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.completedQuestIds.includes(questId)) {
            return res.status(200).json({ message: 'Quest already completed.', questCompleted: true, user });
        }

        let isCorrect = false;
        let specificErrorMessage: string | null = null;

        // Referral validation logic removed 
        // Check for quests with a specific correctAnswer defined
        if ('correctAnswer' in questDefinition && typeof questDefinition.correctAnswer === 'string') {
            isCorrect = answer.trim().toLowerCase() === questDefinition.correctAnswer.toLowerCase();
            if (!isCorrect && questId === MINT_OG_NFT_QUEST_ID) {
                 specificErrorMessage = "NFT Mint verification is not yet active or your input is incorrect.";
            }
        } 
        // Fallback for other input_answer or community_link_click quests that DON'T have a correctAnswer 
        // (This block should ideally not be hit if all such quests are handled above or have specific correctAnswers)
        else if (questDefinition.verificationType === 'input_answer' || questDefinition.verificationType === 'community_link_click') {
            // This was the previous lenient logic. We keep it for any other generic input quests
            // that might be added without specific validation and without a correctAnswer.
            console.warn(`Quest ${questId} (type ${questDefinition.verificationType}) has no correctAnswer and no specific validation logic. Accepting non-empty answer.`);
            isCorrect = true; 
        } 
        // For any other quest types not handled above (e.g., 'signature', 'balance_check' if they were misrouted here)
        else {
            console.warn(`Quest ${questId} (type ${questDefinition.verificationType}) fell through verification logic.`);
            isCorrect = false; 
        }

        if (!isCorrect) {
            console.log(`Verification failed for user ${userId} for quest ${questId}. Reason: ${specificErrorMessage || 'Answer incorrect or condition not met.'}`);
            return res.status(400).json({ message: specificErrorMessage || 'Incorrect answer or action not confirmed.' });
        }

        console.log(`Correct answer or condition met by user ${userId} for quest ${questId}.`);
        const baseReward = questDefinition.xpReward || 0;
        const finalReward = Math.round(baseReward * (user.ownsOgNft ? OG_NFT_XP_BOOST : 1));
        
        // Add XP event
        const xpEvent = {
          type: 'quest',
          amount: finalReward,
          description: questDefinition.title,
          date: new Date()
        };
        const updatedUserDoc = await User.findByIdAndUpdate(userId, { $push: { completedQuestIds: questId, xpEvents: xpEvent }, $inc: { xp: finalReward } }, { new: true }).select('-__v');
        if (!updatedUserDoc) return res.status(500).json({ message: 'Failed to update user data.' });
        
        const updatedUser = updatedUserDoc as IUser;
        console.log(`Quest ${questId} completed. XP: ${finalReward}.`);
        res.status(200).json({ message: 'Quest completed!', xpAwarded: finalReward, questCompleted: true, user: updatedUser });

    } catch (error: any) {
        console.error(`Error verifying answer for quest ${questId} for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error verifying quest answer.', error: error.message });
    }
});

// === Wormhole Quest TX Verification ===
router.post('/wormhole/verify-tx', async (req: Request, res: Response) => {
  try {
    const { userId, questId, txHash } = req.body;
    if (!userId || !questId || !txHash) {
      return res.status(400).json({ error: 'Missing userId, questId, or txHash' });
    }
    // TODO: Optionally, verify txHash on WormholeScan API
    // For now, just mark quest as complete for the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.completedQuestIds) user.completedQuestIds = [];
    if (!user.completedQuestIds.includes(questId)) {
      user.completedQuestIds.push(questId);
      user.xp = (user.xp || 0) + 500; // Award XP (adjust as needed)
      if (!user.xpEvents) user.xpEvents = [];
      user.xpEvents.push({
        type: 'quest',
        amount: 500,
        description: `Wormhole Quest: ${questId}`,
        date: new Date()
      });
      await user.save();
    }
    return res.json({ success: true, message: 'Quest completed!', xp: user.xp });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: 'Server error', details: errorMessage });
  }
});

// Export quest definitions for use in other files
export { QUEST_DEFINITIONS };

export default router;