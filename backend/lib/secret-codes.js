const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Secret codes storage
const codesPath = path.join(__dirname, '..', '..', 'config', 'secret-codes.json');

/**
 * Generate secret codes for free NFT minting
 * @param {number} count - Number of codes to generate
 * @param {string} campaign - Campaign name (e.g., 'twitter-giveaway', 'discord-contest')
 * @returns {Array} Array of generated codes
 */
function generateSecretCodes(count, campaign = 'general') {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    codes.push({
      code,
      campaign,
      createdAt: new Date().toISOString(),
      used: false,
      usedBy: null,
      usedAt: null
    });
  }
  
  return codes;
}

/**
 * Save codes to storage
 * @param {Array} newCodes - Array of codes to save
 */
function saveCodes(newCodes) {
  let existingCodes = [];
  
  // Load existing codes if file exists
  if (fs.existsSync(codesPath)) {
    try {
      existingCodes = JSON.parse(fs.readFileSync(codesPath, 'utf8'));
    } catch (error) {
      console.error('Error loading existing codes:', error);
    }
  }
  
  // Merge with new codes
  const allCodes = [...existingCodes, ...newCodes];
  
  // Ensure config directory exists
  const configDir = path.dirname(codesPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Save to file
  fs.writeFileSync(codesPath, JSON.stringify(allCodes, null, 2));
  
  console.log(`✅ Saved ${newCodes.length} codes to ${codesPath}`);
  console.log(`📊 Total codes: ${allCodes.length}`);
}

/**
 * Validate and use a secret code
 * @param {string} code - The secret code to validate
 * @param {string} walletAddress - Wallet address using the code
 * @returns {Object} Validation result
 */
function useSecretCode(code, walletAddress) {
  if (!fs.existsSync(codesPath)) {
    return { valid: false, reason: 'No codes available' };
  }
  
  try {
    const codes = JSON.parse(fs.readFileSync(codesPath, 'utf8'));
    const codeIndex = codes.findIndex(c => c.code === code.toUpperCase());
    
    if (codeIndex === -1) {
      return { valid: false, reason: 'Invalid code' };
    }
    
    const codeData = codes[codeIndex];
    
    if (codeData.used) {
      return { 
        valid: false, 
        reason: 'Code already used',
        usedBy: codeData.usedBy,
        usedAt: codeData.usedAt
      };
    }
    
    // Mark code as used
    codes[codeIndex] = {
      ...codeData,
      used: true,
      usedBy: walletAddress,
      usedAt: new Date().toISOString()
    };
    
    // Save updated codes
    fs.writeFileSync(codesPath, JSON.stringify(codes, null, 2));
    
    return {
      valid: true,
      campaign: codeData.campaign,
      createdAt: codeData.createdAt
    };
    
  } catch (error) {
    console.error('Error validating code:', error);
    return { valid: false, reason: 'Error validating code' };
  }
}

/**
 * Get code statistics
 * @returns {Object} Code usage statistics
 */
function getCodeStats() {
  if (!fs.existsSync(codesPath)) {
    return {
      total: 0,
      used: 0,
      remaining: 0,
      campaigns: {}
    };
  }
  
  try {
    const codes = JSON.parse(fs.readFileSync(codesPath, 'utf8'));
    const used = codes.filter(c => c.used);
    const remaining = codes.filter(c => !c.used);
    
    // Group by campaign
    const campaigns = {};
    codes.forEach(code => {
      if (!campaigns[code.campaign]) {
        campaigns[code.campaign] = { total: 0, used: 0, remaining: 0 };
      }
      campaigns[code.campaign].total++;
      if (code.used) {
        campaigns[code.campaign].used++;
      } else {
        campaigns[code.campaign].remaining++;
      }
    });
    
    return {
      total: codes.length,
      used: used.length,
      remaining: remaining.length,
      campaigns
    };
    
  } catch (error) {
    console.error('Error getting code stats:', error);
    return { total: 0, used: 0, remaining: 0, campaigns: {} };
  }
}

/**
 * Check if wallet has already used a code
 * @param {string} walletAddress - Wallet address to check
 * @returns {boolean} True if wallet has used a code
 */
function hasWalletUsedCode(walletAddress) {
  if (!fs.existsSync(codesPath)) {
    return false;
  }
  
  try {
    const codes = JSON.parse(fs.readFileSync(codesPath, 'utf8'));
    return codes.some(code => code.used && code.usedBy === walletAddress);
  } catch (error) {
    console.error('Error checking wallet code usage:', error);
    return false;
  }
}

/**
 * Get unused codes for a specific campaign
 * @param {string} campaign - Campaign name
 * @param {number} limit - Maximum number of codes to return
 * @returns {Array} Array of unused codes
 */
function getUnusedCodes(campaign = null, limit = 10) {
  if (!fs.existsSync(codesPath)) {
    return [];
  }
  
  try {
    const codes = JSON.parse(fs.readFileSync(codesPath, 'utf8'));
    let unusedCodes = codes.filter(c => !c.used);
    
    if (campaign) {
      unusedCodes = unusedCodes.filter(c => c.campaign === campaign);
    }
    
    return unusedCodes.slice(0, limit).map(c => ({
      code: c.code,
      campaign: c.campaign,
      createdAt: c.createdAt
    }));
    
  } catch (error) {
    console.error('Error getting unused codes:', error);
    return [];
  }
}

module.exports = {
  generateSecretCodes,
  saveCodes,
  useSecretCode,
  getCodeStats,
  hasWalletUsedCode,
  getUnusedCodes
}; 