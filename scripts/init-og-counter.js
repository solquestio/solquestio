const fs = require('fs');
const path = require('path');

// Initialize OG NFT token counter
function initializeOGCounter() {
  const configDir = path.join(__dirname, '..', 'config');
  const counterPath = path.join(configDir, 'og-nft-counter.json');
  
  // Ensure config directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    console.log('Created config directory');
  }
  
  // Initialize counter if it doesn't exist
  if (!fs.existsSync(counterPath)) {
    const initialCounter = {
      nextId: 1,
      initialized: new Date().toISOString(),
      description: "Token ID counter for SolQuest OG NFT collection"
    };
    
    fs.writeFileSync(counterPath, JSON.stringify(initialCounter, null, 2));
    console.log('✅ Initialized OG NFT token counter at:', counterPath);
    console.log('Next token ID will be: 1');
  } else {
    const counter = JSON.parse(fs.readFileSync(counterPath, 'utf8'));
    console.log('✅ OG NFT token counter already exists');
    console.log('Next token ID will be:', counter.nextId);
  }
}

// Run if called directly
if (require.main === module) {
  initializeOGCounter();
}

module.exports = { initializeOGCounter }; 