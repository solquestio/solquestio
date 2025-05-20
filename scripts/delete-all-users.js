/**
 * Script to delete all users from the MongoDB database
 * 
 * Usage:
 * node scripts/delete-all-users.js <mongodb-uri> [--force]
 * 
 * Example:
 * node scripts/delete-all-users.js "mongodb+srv://username:password@cluster0.mongodb.net/solquestio"
 * 
 * Add --force to actually perform the deletion.
 */

const mongoose = require('mongoose');

// Get MongoDB URI from command line args
const args = process.argv.slice(2);
const mongoUri = args.find(arg => arg.startsWith('mongodb'));

if (!mongoUri) {
  console.error('Error: MongoDB URI not provided');
  console.error('Usage: node scripts/delete-all-users.js <mongodb-uri> [--force]');
  console.error('Example: node scripts/delete-all-users.js "mongodb+srv://username:password@cluster0.mongodb.net/solquestio"');
  process.exit(1);
}

// Connect to MongoDB
console.log(`Connecting to MongoDB at ${mongoUri.substring(0, 15)}...`);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return deleteAllUsers();
  })
  .then(result => {
    if (result && result.deletedCount) {
      console.log(`✅ Success! Deleted ${result.deletedCount} users from the database.`);
    }
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('Disconnected from MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

async function deleteAllUsers() {
  // Get the User model (we're using the raw collection for this operation)
  const User = mongoose.connection.collection('users');
  
  // First, count the users
  const count = await User.countDocuments();
  console.log(`Found ${count} users in the database`);
  
  // Confirm with the user
  if (count > 0) {
    if (process.argv.includes('--force')) {
      console.log(`Deleting ${count} users...`);
      return User.deleteMany({});
    } else {
      console.log('');
      console.log('⚠️  WARNING: This will permanently delete ALL USERS from the database!');
      console.log('⚠️  This action is irreversible and should only be used on development/testing environments.');
      console.log('');
      console.log('To confirm deletion, rerun this script with the --force flag:');
      console.log(`node scripts/delete-all-users.js "${mongoUri}" --force`);
      console.log('');
      process.exit(0);
    }
  } else {
    console.log('No users found in the database.');
    return { deletedCount: 0 };
  }
} 