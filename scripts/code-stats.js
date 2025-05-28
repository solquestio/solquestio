const { getCodeStats, getUnusedCodes } = require('../backend/lib/secret-codes');

/**
 * Display secret code statistics
 */
function displayCodeStats() {
  console.log('📊 SolQuest OG NFT Secret Code Statistics\n');

  const stats = getCodeStats();

  if (stats.total === 0) {
    console.log('❌ No secret codes found. Run "npm run generate-codes" first.');
    return;
  }

  // Overall statistics
  console.log('🎯 Overall Statistics:');
  console.log(`   Total codes: ${stats.total}`);
  console.log(`   Used codes: ${stats.used}`);
  console.log(`   Remaining codes: ${stats.remaining}`);
  console.log(`   Usage rate: ${((stats.used / stats.total) * 100).toFixed(1)}%`);
  console.log('');

  // Campaign breakdown
  console.log('📋 Campaign Breakdown:');
  Object.entries(stats.campaigns).forEach(([campaign, data]) => {
    const usageRate = data.total > 0 ? ((data.used / data.total) * 100).toFixed(1) : '0.0';
    console.log(`   ${campaign}:`);
    console.log(`     Total: ${data.total} | Used: ${data.used} | Remaining: ${data.remaining} | Usage: ${usageRate}%`);
  });
  console.log('');

  // Progress towards free NFT goal
  const freeNFTGoal = 10000; // 100% free model
  const progressPercentage = ((stats.used / freeNFTGoal) * 100).toFixed(1);
  console.log('🎁 Free NFT Distribution Progress:');
  console.log(`   Goal: ${freeNFTGoal} free NFTs (100% of collection)`);
  console.log(`   Distributed: ${stats.used} NFTs`);
  console.log(`   Progress: ${progressPercentage}%`);
  console.log(`   Remaining: ${freeNFTGoal - stats.used} NFTs`);
  console.log('');

  // Show some unused codes for each campaign
  console.log('🎫 Sample Unused Codes by Campaign:');
  Object.keys(stats.campaigns).forEach(campaign => {
    const unusedCodes = getUnusedCodes(campaign, 3);
    if (unusedCodes.length > 0) {
      console.log(`   ${campaign}: ${unusedCodes.map(c => c.code).join(', ')}...`);
    } else {
      console.log(`   ${campaign}: No unused codes remaining`);
    }
  });
  console.log('');

  // Recommendations
  console.log('💡 Recommendations:');
  if (stats.remaining === 0) {
    console.log('   ⚠️  All codes have been used! Generate more codes if needed.');
  } else if (stats.remaining < 100) {
    console.log('   ⚠️  Running low on codes. Consider generating more soon.');
  } else {
    console.log('   ✅ Good code availability for campaigns.');
  }

  // Find campaigns with low remaining codes
  const lowStockCampaigns = Object.entries(stats.campaigns)
    .filter(([_, data]) => data.remaining < 10 && data.remaining > 0)
    .map(([campaign, _]) => campaign);

  if (lowStockCampaigns.length > 0) {
    console.log(`   📉 Low stock campaigns: ${lowStockCampaigns.join(', ')}`);
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npm run code-stats');
    console.log('');
    console.log('Displays statistics about secret code usage including:');
    console.log('- Overall usage statistics');
    console.log('- Campaign breakdown');
    console.log('- Progress towards free NFT distribution goal');
    console.log('- Sample unused codes');
    console.log('- Recommendations');
    process.exit(0);
  }

  displayCodeStats();
}

module.exports = { displayCodeStats }; 