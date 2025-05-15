import { MongoClient, Collection } from 'mongodb';

// Cache MongoDB connection
let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

// Connect to MongoDB
export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Get MongoDB connection string from environment variables
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  const client = new MongoClient(uri);
  await client.connect();
  
  const db = client.db(process.env.MONGODB_DB || 'solquestio');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

// Get a collection from the database
export async function getCollection(collectionName: string): Promise<Collection> {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
} 