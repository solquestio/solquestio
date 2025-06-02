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
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
// Global variables to maintain connection state
let cachedConnection = null;
let isConnecting = false;
let connectionPromise = null;
/**
 * Connects to MongoDB
 * Optimized for serverless environments with connection pooling
 */
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    // If we already have a cached connection, return it
    if (cachedConnection) {
        return cachedConnection;
    }
    // If a connection is in progress, wait for it to complete
    if (isConnecting && connectionPromise) {
        return connectionPromise;
    }
    // Check if MongoDB URI is defined
    if (!config_1.DB_CONFIG.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables');
    }
    try {
        isConnecting = true;
        // Create a connection promise to handle concurrent connection attempts
        connectionPromise = mongoose_1.default.connect(config_1.DB_CONFIG.MONGO_URI, {
            // Mongoose 6+ options for better serverless performance
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10, // Maintain up to 10 socket connections
        });
        // Wait for connection to establish
        cachedConnection = yield connectionPromise;
        // Set strictQuery to false to prepare for Mongoose 7
        mongoose_1.default.set('strictQuery', false);
        console.log(`MongoDB connected successfully: ${mongoose_1.default.connection.readyState}`);
        return cachedConnection;
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
    finally {
        isConnecting = false;
        connectionPromise = null;
    }
});
exports.connectDB = connectDB;
/**
 * Disconnect from MongoDB
 * Typically used for testing or cleanup
 */
const disconnectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!cachedConnection) {
        return;
    }
    try {
        yield mongoose_1.default.disconnect();
        cachedConnection = null;
        console.log('MongoDB disconnected');
    }
    catch (error) {
        console.error('Error while disconnecting from MongoDB:', error);
        throw error;
    }
});
exports.disconnectDB = disconnectDB;
