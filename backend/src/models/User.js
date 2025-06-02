"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Schema corresponding to the document interface.
const UserSchema = new mongoose_1.Schema({
    walletAddress: {
        type: String,
        required: [true, 'Wallet address is required'],
        unique: true,
        trim: true,
        index: true, // Index for faster lookups
    },
    username: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null/undefined values for uniqueness
        trim: true,
    },
    completedQuestIds: {
        type: [String], // Defines an array of strings
        required: true,
        default: [], // Defaults to an empty array
    },
    xp: {
        type: Number,
        required: true,
        default: 0, // Start users with 0 XP
    },
    lastCheckedInAt: {
        type: Date,
        required: false,
    },
    checkInStreak: {
        type: Number,
        required: true,
        default: 0, // Default streak is 0
    },
    ownsOgNft: {
        type: Boolean,
        required: true,
        default: false, // Default to false
    },
    xpEvents: [
        {
            type: { type: String, required: true },
            amount: { type: Number, required: true },
            timestamp: { type: Date, default: Date.now },
            description: { type: String }
        }
    ],
    xpHistory: [
        {
            description: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            amount: { type: Number, required: true }
        }
    ],
    social: {
        github: { type: String, unique: true, sparse: true },
        twitter: { type: String, unique: true, sparse: true },
        photo_url: { type: String }
    }
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});
// Export the Mongoose model.
exports.default = mongoose_1.default.model('User', UserSchema);
