/**
 * SolQuestio Deployment Script with Token
 * 
 * This script deploys both frontend and backend to Vercel using a deployment token
 * To use this script:
 * 1. First create a token: run 'npx vercel login' then 'npx vercel tokens create'
 * 2. Set the token as an environment variable: $env:VERCEL_TOKEN = "your_token"
 * 3. Run this script: node deploy-with-token.js
 */

const { execSync } = require('child_process');
const path = require('path');

// Paths
const frontendDir = path.join(__dirname, 'frontend');
const backendDir = path.join(__dirname, 'backend');

// Get token from environment
const token = process.env.VERCEL_TOKEN;

if (!token) {
  console.error('❌ VERCEL_TOKEN environment variable not set!');
  console.log('Please set the token: $env:VERCEL_TOKEN = "your_token"');
  process.exit(1);
}

// Helper to execute commands
function executeCommand(command, cwd) {
  try {
    console.log(`\n📋 Executing: ${command}`);
    const output = execSync(command, { cwd, encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
    return { success: true, output };
  } catch (error) {
    console.error(`\n❌ Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    return { success: false, error };
  }
}

// Deploy backend
console.log('\n🔄 Deploying backend...');
executeCommand(`npx vercel --token=${token} --confirm --prod`, backendDir);

// Deploy frontend
console.log('\n🔄 Deploying frontend...');
executeCommand(`npx vercel --token=${token} --confirm --prod`, frontendDir);

console.log('\n✅ Deployment completed!'); 