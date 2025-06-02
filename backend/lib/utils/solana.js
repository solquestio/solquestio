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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyNftOwnership = exports.generateChallengeMessage = exports.verifySignature = void 0;
const web3_js_1 = require("@solana/web3.js");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const bs58_1 = __importDefault(require("bs58"));
/**
 * Verify a signature from a Solana wallet
 * @param walletAddress The wallet address that signed the message (as a string)
 * @param signature The signature (base58 encoded string)
 * @param message The message that was signed
 * @returns boolean indicating if the signature is valid
 */
const verifySignature = (walletAddress, signature, message) => {
    try {
        // Convert the wallet address to a PublicKey
        const publicKey = new web3_js_1.PublicKey(walletAddress);
        // Convert the message to Uint8Array (UTF-8 encoded)
        const messageBytes = new TextEncoder().encode(message);
        // Decode the signature from base58
        const signatureBytes = bs58_1.default.decode(signature);
        // Verify the signature
        return tweetnacl_1.default.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());
    }
    catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
};
exports.verifySignature = verifySignature;
/**
 * Generate a challenge message for authentication
 * @param walletAddress Wallet address to include in the challenge
 * @returns A challenge message for the user to sign
 */
const generateChallengeMessage = (walletAddress) => {
    const timestamp = new Date().toISOString();
    return `Sign this message to authenticate with SolQuest.io. Wallet: ${walletAddress}. Timestamp: ${timestamp}`;
};
exports.generateChallengeMessage = generateChallengeMessage;
/**
 * Verify if an address owns a specific NFT
 * @param walletAddress The wallet address to check
 * @param mintAddress The NFT mint address
 * @returns Promise resolving to boolean indicating ownership
 */
const verifyNftOwnership = (walletAddress, mintAddress) => __awaiter(void 0, void 0, void 0, function* () {
    // In production, this would use Helius API or similar to verify ownership
    // For now, we'll implement a placeholder that returns false
    console.log(`Checking if wallet ${walletAddress} owns NFT ${mintAddress}`);
    return false;
});
exports.verifyNftOwnership = verifyNftOwnership;
