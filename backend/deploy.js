/**
 * Deployment helper script for Vercel
 * Run with: node deploy.js
 */
const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('Warning: No .env file found. You should create one before deploying.');
  console.log('You can copy .env.example to .env and fill in the values.');
}

// Check if vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.log('Vercel CLI is not installed. Installing...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
}

console.log('\n=== SolQuestio Backend Deployment ===');
console.log('This script will help you deploy the backend to Vercel');

rl.question('\nDo you want to deploy to production? (y/n): ', (answer) => {
  const isProd = answer.toLowerCase() === 'y';
  
  try {
    // Run vercel command
    if (isProd) {
      console.log('\nDeploying to production...');
      execSync('vercel --prod', { stdio: 'inherit' });
    } else {
      console.log('\nDeploying to preview environment...');
      execSync('vercel', { stdio: 'inherit' });
    }
    
    console.log('\n=== Post-Deployment Checklist ===');
    console.log('1. Test your API with: <your-vercel-url>/api/public');
    console.log('2. Ensure all environment variables are set in Vercel dashboard');
    console.log('3. Configure CORS in the Vercel dashboard to allow your frontend domain');
    
  } catch (error) {
    console.error('\nDeployment failed:', error.message);
    console.log('\nTry running these commands manually:');
    console.log('1. vercel login');
    console.log('2. vercel link');
    console.log('3. vercel');
  }
  
  rl.close();
});
