const { verifyNFTOwnership } = require('./nft-integration');

// Monthly leaderboard reward tiers
const LEADERBOARD_REWARDS = {
  1: 5.0,    // 1st place: 5 SOL
  2: 3.0,    // 2nd place: 3 SOL  
  3: 2.0,    // 3rd place: 2 SOL
  4: 1.5,    // 4th place: 1.5 SOL
  5: 1.0,    // 5th place: 1 SOL
  6: 0.8,    // 6th place: 0.8 SOL
  7: 0.6,    // 7th place: 0.6 SOL
  8: 0.5,    // 8th place: 0.5 SOL
  9: 0.4,    // 9th place: 0.4 SOL
  10: 0.3    // 10th place: 0.3 SOL
};

/**
 * Calculate leaderboard reward with OG NFT bonus
 * @param {number} rank - User's leaderboard rank (1-based)
 * @param {string} walletAddress - User's wallet address
 * @param {string} ogCollectionMint - OG collection mint address
 * @returns {Promise<Object>} Reward calculation details
 */
async function calculateLeaderboardReward(rank, walletAddress, ogCollectionMint) {
  try {
    // Get base reward for rank
    const baseReward = LEADERBOARD_REWARDS[rank] || 0;
    
    if (baseReward === 0) {
      return {
        rank,
        baseReward: 0,
        hasOGNFT: false,
        bonusMultiplier: 1.0,
        finalReward: 0,
        bonusAmount: 0
      };
    }

    // Check if user owns OG NFT
    let hasOGNFT = false;
    try {
      hasOGNFT = await verifyNFTOwnership(walletAddress, ogCollectionMint);
    } catch (error) {
      console.error('Error checking OG NFT ownership:', error);
      // Continue without bonus if verification fails
    }

    // Calculate bonus
    const bonusMultiplier = hasOGNFT ? 1.1 : 1.0; // 10% bonus for OG NFT holders
    const finalReward = baseReward * bonusMultiplier;
    const bonusAmount = finalReward - baseReward;

    return {
      rank,
      baseReward,
      hasOGNFT,
      bonusMultiplier,
      finalReward,
      bonusAmount,
      walletAddress
    };

  } catch (error) {
    console.error('Error calculating leaderboard reward:', error);
    throw error;
  }
}

/**
 * Process monthly leaderboard rewards for all winners
 * @param {Array} leaderboard - Array of user objects with rank and walletAddress
 * @param {string} ogCollectionMint - OG collection mint address
 * @returns {Promise<Array>} Array of reward calculations
 */
async function processMonthlyRewards(leaderboard, ogCollectionMint) {
  const rewardCalculations = [];
  
  console.log('🏆 Processing monthly leaderboard rewards...');
  
  for (const user of leaderboard) {
    if (user.rank <= 10) { // Only top 10 get rewards
      const reward = await calculateLeaderboardReward(
        user.rank, 
        user.walletAddress, 
        ogCollectionMint
      );
      
      rewardCalculations.push(reward);
      
      console.log(`Rank ${reward.rank}: ${user.walletAddress}`);
      console.log(`  Base reward: ${reward.baseReward} SOL`);
      console.log(`  OG NFT holder: ${reward.hasOGNFT ? 'Yes' : 'No'}`);
      console.log(`  Final reward: ${reward.finalReward} SOL`);
      if (reward.bonusAmount > 0) {
        console.log(`  🎉 OG Bonus: +${reward.bonusAmount.toFixed(3)} SOL`);
      }
      console.log('');
    }
  }
  
  const totalRewards = rewardCalculations.reduce((sum, r) => sum + r.finalReward, 0);
  const totalBonuses = rewardCalculations.reduce((sum, r) => sum + r.bonusAmount, 0);
  const ogHolders = rewardCalculations.filter(r => r.hasOGNFT).length;
  
  console.log('📊 Monthly Rewards Summary:');
  console.log(`Total SOL distributed: ${totalRewards.toFixed(3)} SOL`);
  console.log(`Total OG bonuses: ${totalBonuses.toFixed(3)} SOL`);
  console.log(`OG NFT holders in top 10: ${ogHolders}/10`);
  
  return rewardCalculations;
}

/**
 * Get reward tier information
 * @returns {Object} Reward tier structure
 */
function getRewardTiers() {
  return {
    tiers: LEADERBOARD_REWARDS,
    ogBonus: '10%',
    description: 'Monthly leaderboard rewards with 10% bonus for OG NFT holders',
    example: {
      rank1_base: '5.0 SOL',
      rank1_with_og: '5.5 SOL',
      bonus_amount: '0.5 SOL'
    }
  };
}

/**
 * Simulate reward calculation for demonstration
 * @param {number} rank - User rank
 * @param {boolean} hasOGNFT - Whether user owns OG NFT
 * @returns {Object} Reward calculation
 */
function simulateReward(rank, hasOGNFT = false) {
  const baseReward = LEADERBOARD_REWARDS[rank] || 0;
  const bonusMultiplier = hasOGNFT ? 1.1 : 1.0;
  const finalReward = baseReward * bonusMultiplier;
  const bonusAmount = finalReward - baseReward;

  return {
    rank,
    baseReward,
    hasOGNFT,
    bonusMultiplier,
    finalReward,
    bonusAmount,
    simulation: true
  };
}

module.exports = {
  calculateLeaderboardReward,
  processMonthlyRewards,
  getRewardTiers,
  simulateReward,
  LEADERBOARD_REWARDS
}; 