/**
 * SolQuestio Production Deployment Script
 * 
 * This script automates the steps to deploy both frontend and backend to production
 * It performs pre-deployment checks and verifies environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Constants
const frontendDir = path.join(__dirname, 'frontend');
const backendDir = path.join(__dirname, 'backend');
const prodEnvFile = path.join(frontendDir, '.env.production');

// Create an interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to execute commands and log output
function executeCommand(command, cwd) {
  try {
    console.log(`\n📋 Executing: ${command}`);
    const output = execSync(command, { cwd, encoding: 'utf8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error) {
    console.error(`\n❌ Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    return { success: false, error };
  }
}

// Check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Confirm with user before proceeding
function confirmWithUser(message) {
  return new Promise((resolve) => {
    rl.question(`\n${message} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Check if frontend build exists and is up to date
async function checkFrontendBuild() {
  console.log('\n🔍 Checking frontend build...');
  
  const buildDir = path.join(frontendDir, '.next');
  
  if (!fileExists(buildDir)) {
    console.log('❓ Frontend build not found. Build first?');
    const shouldBuild = await confirmWithUser('Do you want to build the frontend now?');
    
    if (shouldBuild) {
      console.log('\n🔨 Building frontend...');
      const result = executeCommand('npm run build', frontendDir);
      if (!result.success) {
        console.error('❌ Frontend build failed!');
        return false;
      }
      console.log('✅ Frontend built successfully!');
    } else {
      console.log('⚠️ Skipping frontend build. Make sure to build before deploying!');
      return false;
    }
  } else {
    console.log('✅ Frontend build exists!');
  }
  
  return true;
}

// Check for production environment variables
function checkProductionEnv() {
  console.log('\n🔍 Checking production environment...');
  
  if (!fileExists(prodEnvFile)) {
    console.log('⚠️ .env.production file not found!');
    console.log('Creating default .env.production file...');
    
    const envContent = `# Production environment configuration
NEXT_PUBLIC_BACKEND_URL=https://api.solquest.io
NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=0abb48db-ebdd-4297-aa63-5f4d79234d9e`;
    
    try {
      fs.writeFileSync(prodEnvFile, envContent, 'utf8');
      console.log('✅ Created .env.production file!');
    } catch (error) {
      console.error(`❌ Failed to create .env.production: ${error.message}`);
      return false;
    }
  } else {
    console.log('✅ .env.production file exists!');
    
    try {
      const envContent = fs.readFileSync(prodEnvFile, 'utf8');
      if (!envContent.includes('NEXT_PUBLIC_BACKEND_URL=')) {
        console.error('❌ .env.production file does not contain NEXT_PUBLIC_BACKEND_URL!');
        return false;
      }
      console.log('✅ Environment variables look good!');
    } catch (error) {
      console.error(`❌ Failed to read .env.production: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

// Deploy frontend and backend
async function deploy() {
  console.log('\n🚀 Starting deployment process...');
  
  // Step 1: Check frontend build
  const frontendBuildOk = await checkFrontendBuild();
  if (!frontendBuildOk) {
    console.log('⚠️ Fix frontend build issues before continuing.');
    return;
  }
  
  // Step 2: Check production environment
  const envOk = checkProductionEnv();
  if (!envOk) {
    console.log('⚠️ Fix environment issues before continuing.');
    return;
  }
  
  // Step 3: Confirm deployment
  console.log('\n🚨 Ready to deploy to PRODUCTION! This will affect real users.');
  const shouldDeploy = await confirmWithUser('Are you SURE you want to deploy to production?');
  
  if (!shouldDeploy) {
    console.log('🛑 Deployment cancelled by user.');
    return;
  }
  
  // Step 4: Deploy backend
  console.log('\n🔄 Deploying backend...');
  const backendResult = executeCommand('npx vercel --prod', backendDir);
  
  if (!backendResult.success) {
    console.error('❌ Backend deployment failed!');
    console.log('⚠️ Fix backend deployment issues before continuing with frontend.');
    return;
  }
  
  console.log('✅ Backend deployed successfully!');
  
  // Step 5: Deploy frontend
  console.log('\n🔄 Deploying frontend...');
  const frontendResult = executeCommand('npx vercel --prod', frontendDir);
  
  if (!frontendResult.success) {
    console.error('❌ Frontend deployment failed!');
    return;
  }
  
  console.log('✅ Frontend deployed successfully!');
  
  // Step 6: Final confirmation
  console.log('\n🎉 Deployment complete! URLs:');
  console.log('Backend: https://api.solquest.io');
  console.log('Frontend: https://solquest.io (once DNS is configured)');
  console.log('Frontend Fallback: https://solquestio-frontend.vercel.app');
}

// Main function
async function main() {
  console.log('🚀 SolQuestio Production Deployment');
  
  try {
    await deploy();
  } catch (error) {
    console.error(`\n❌ Deployment error: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Run the deployment
main(); 