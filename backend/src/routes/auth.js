"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const bs58_1 = __importDefault(require("bs58"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // Import jwt
const web3_js_1 = require("@solana/web3.js"); // Import PublicKey for validation
const User_1 = __importDefault(require("../models/User")); // Import the User model and IUser interface
const quests_1 = require("./quests"); // Import quest definitions as named import
const helius_sdk_1 = require("helius-sdk"); // Import Helius SDK
const dotenv_1 = __importDefault(require("dotenv"));
// Referral imports removed
dotenv_1.default.config(); // Load .env variables
const router = express_1.default.Router();
const VERIFY_WALLET_QUEST_ID = 'verify-wallet'; // Define quest ID
// --- Helius Setup --- 
const heliusApiKey = (_a = process.env.NEXT_PUBLIC_HELIUS_RPC_URL) === null || _a === void 0 ? void 0 : _a.split('/').pop(); // Extract API key from RPC URL
const helius = new helius_sdk_1.Helius(heliusApiKey || "");
// --- Constants --- 
const JWT_SECRET = process.env.JWT_SECRET;
const OG_NFT_COLLECTION_MINT = process.env.SOLQUEST_OG_NFT_COLLECTION_MINT;
// Helper function to check NFT ownership
const checkOgNftOwnership = (walletAddress) => __awaiter(void 0, void 0, void 0, function* () {
    if (!OG_NFT_COLLECTION_MINT || !heliusApiKey) {
        console.warn('OG NFT Collection Mint or Helius API key not configured, skipping ownership check.');
        return false;
    }
    try {
        console.log(`Checking OG NFT ownership for ${walletAddress} against collection ${OG_NFT_COLLECTION_MINT}...`);
        // Use Helius DAS API getAssetsByOwner - fetch first page only is usually enough for checking *if* they own any
        const response = yield helius.rpc.getAssetsByOwner({
            ownerAddress: walletAddress,
            page: 1,
            limit: 100 // Limit the number of assets fetched for efficiency
        });
        // Iterate through assets to find one matching the collection mint
        const ownsNft = response.items.some(asset => {
            var _a;
            return (_a = asset.grouping) === null || _a === void 0 ? void 0 : _a.some(group => group.group_key === 'collection' && group.group_value === OG_NFT_COLLECTION_MINT);
        });
        console.log(`NFT ownership check result for ${walletAddress}: ${ownsNft}`);
        return ownsNft;
    }
    catch (error) {
        console.error(`Error checking NFT ownership for ${walletAddress}:`, error.message);
        // Don't fail the login if the NFT check fails, just assume they don't own it
        return false;
    }
});
// POST /api/auth/verify - Verify signature and login/register user
router.post('/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { walletAddress, signature, message } = req.body;
    // Access directly from process.env
    if (!JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables.');
        return res.status(500).json({ message: 'Server configuration error [JWT]' });
    }
    // 1. Input Validation
    if (!walletAddress || !signature || !message) {
        return res.status(400).json({ message: 'Missing walletAddress, signature, or message' });
    }
    try {
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58_1.default.decode(signature);
        const publicKeyBytes = new web3_js_1.PublicKey(walletAddress).toBytes(); // Validate and get bytes
        // 2. Signature Verification
        const isVerified = tweetnacl_1.default.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
        if (!isVerified) {
            console.warn(`Signature verification failed for ${walletAddress}`);
            return res.status(401).json({ message: 'Invalid signature' });
        }
        console.log(`Signature verified successfully for ${walletAddress}`);
        // 3. Find or Create User & Award XP
        let userDoc = yield User_1.default.findOne({ walletAddress });
        let finalUserDataForToken;
        let questRewardForVerification = ((_a = quests_1.QUEST_DEFINITIONS[VERIFY_WALLET_QUEST_ID]) === null || _a === void 0 ? void 0 : _a.xpReward) || 0;
        if (!userDoc) {
            console.log(`User not found, creating new user for ${walletAddress}`);
            // Step 1: Create user object with referral code
            let initialNewUserData = {
                walletAddress,
                completedQuestIds: [VERIFY_WALLET_QUEST_ID],
                xp: questRewardForVerification,
                checkInStreak: 0,
                ownsOgNft: false,
                xpEvents: [{
                        type: 'quest',
                        amount: questRewardForVerification,
                        description: 'Verify Wallet',
                        date: new Date()
                    }],
                // Referral code removed
            };
            // Step 2: Save initial user to DB
            let savedNewUserDoc = yield new User_1.default(initialNewUserData).save();
            // Step 3: Use the saved document (which is typed as IUser via Mongoose)
            let userBeingProcessed = savedNewUserDoc;
            // Referral logic removed
            // Save the user (not needed after removing referral logic, but kept for clarity)
            yield userBeingProcessed.save();
            finalUserDataForToken = userBeingProcessed;
            console.log(`New user created with ID: ${userBeingProcessed._id}. Quest '${VERIFY_WALLET_QUEST_ID}' completed. Awarded ${questRewardForVerification} XP.`);
            // Referral bonus logic removed
        }
        else {
            console.log(`Existing user found with ID: ${userDoc._id}`);
            let updatedExistingUser = userDoc;
            let awardedXpThisSession = 0; // Track if XP was awarded in this specific login for this quest
            if (!userDoc.completedQuestIds.includes(VERIFY_WALLET_QUEST_ID)) {
                const xpEvent = {
                    type: 'quest',
                    amount: questRewardForVerification,
                    description: 'Verify Wallet',
                    date: new Date()
                };
                const result = yield User_1.default.findByIdAndUpdate(userDoc._id, {
                    $push: { completedQuestIds: VERIFY_WALLET_QUEST_ID, xpEvents: xpEvent },
                    $inc: { xp: questRewardForVerification }
                }, { new: true });
                if (result) {
                    updatedExistingUser = result;
                    awardedXpThisSession = questRewardForVerification;
                    console.log(`Quest '${VERIFY_WALLET_QUEST_ID}' completed for existing user ${userDoc._id}. Awarded ${questRewardForVerification} XP.`);
                }
                else {
                    console.error(`Failed to update user ${userDoc._id} for quest ${VERIFY_WALLET_QUEST_ID}`);
                }
            }
            finalUserDataForToken = updatedExistingUser;
            // Referral bonus logic removed
        }
        const ownsOgNft = yield checkOgNftOwnership(finalUserDataForToken.walletAddress);
        if (finalUserDataForToken.ownsOgNft !== ownsOgNft) {
            finalUserDataForToken.ownsOgNft = ownsOgNft;
            yield finalUserDataForToken.save(); // Save if NFT status changed
        }
        // Re-fetch to ensure all updates are present and __v is excluded for token/response
        const userForResponse = yield User_1.default.findById(finalUserDataForToken._id).select('-__v');
        if (!userForResponse) {
            console.error(`Failed to re-fetch user ${finalUserDataForToken._id} before sending response.`);
            return res.status(500).json({ message: 'Internal server error finalizing user data' });
        }
        const tokenPayload = {
            userId: userForResponse._id,
            walletAddress: userForResponse.walletAddress
        };
        const token = jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
        // Return token and updated user info (including XP and ownsOgNft)
        res.status(200).json({
            message: 'Authentication successful',
            token,
            user: userForResponse // Return the saved user data (including ownsOgNft)
        });
    }
    catch (error) {
        console.error('Auth verification error:', error);
        // Handle potential PublicKey validation error
        if (error.message.includes('Invalid public key')) {
            return res.status(400).json({ message: 'Invalid wallet address format' });
        }
        res.status(500).json({ message: 'Internal server error during verification' });
    }
}));
exports.default = router;
