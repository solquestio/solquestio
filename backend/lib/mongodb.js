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
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.getCollection = getCollection;
const mongodb_1 = require("mongodb");
// Cache MongoDB connection
let cachedClient = null;
let cachedDb = null;
// Connect to MongoDB
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (cachedClient && cachedDb) {
            return { client: cachedClient, db: cachedDb };
        }
        // Get MongoDB connection string from environment variables
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('Please define the MONGODB_URI environment variable');
        }
        const client = new mongodb_1.MongoClient(uri);
        yield client.connect();
        const db = client.db(process.env.MONGODB_DB || 'solquestio');
        cachedClient = client;
        cachedDb = db;
        return { client, db };
    });
}
// Get a collection from the database
function getCollection(collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { db } = yield connectToDatabase();
        return db.collection(collectionName);
    });
}
