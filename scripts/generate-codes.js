const { generateSecretCodes, saveCodes } = require('../backend/lib/secret-codes');

/**
 * Generate secret codes for various campaigns
 */
function generateCampaignCodes() {
  console.log('🎫 Generating secret codes for SolQuest OG NFT - 100% FREE MODEL...\n');

  // Campaign configurations for 10,000 FREE NFTs
  const campaigns = [
    { name: 'twitter-giveaway', count: 2500, description: 'Twitter/X giveaway campaigns' },
    { name: 'discord-contest', count: 2000, description: 'Discord community contests' },
    { name: 'influencer-collab', count: 1500, description: 'Influencer collaborations' },
    { name: 'beta-tester', count: 1000, description: 'Beta tester rewards' },
    { name: 'community-builder', count: 800, description: 'Community builder rewards' },
    { name: 'hackathon-prize', count: 600, description: 'Hackathon prizes' },
    { name: 'partnership', count: 600, description: 'Partnership rewards' },
    { name: 'early-adopter', count: 500, description: 'Early adopter rewards' },
    { name: 'quest-bonus', count: 500, description: 'Special quest completion bonuses' }
  ];

  let totalGenerated = 0;

  campaigns.forEach(campaign => {
    console.log(`📝 Generating ${campaign.count} codes for: ${campaign.description}`);
    
    const codes = generateSecretCodes(campaign.count, campaign.name);
    saveCodes(codes);
    
    totalGenerated += campaign.count;
    
    // Show sample codes
    console.log(`   Sample codes: ${codes.slice(0, 3).map(c => c.code).join(', ')}...`);
    console.log('');
  });

  console.log(`✅ Generated ${totalGenerated} total secret codes`);
  console.log(`📊 Target: 10,000 free NFTs (${totalGenerated >= 10000 ? 'COMPLETE' : 'NEED ' + (10000 - totalGenerated) + ' MORE'})`);
  
  if (totalGenerated !== 10000) {
    const remaining = 10000 - totalGenerated;
    if (remaining > 0) {
      console.log(`\n🔄 Generating ${remaining} additional general codes...`);
      const additionalCodes = generateSecretCodes(remaining, 'general');
      saveCodes(additionalCodes);
      console.log(`✅ Generated ${remaining} additional codes`);
    }
  }

  console.log('\n🎉 All 10,000 secret codes generated successfully!');
  console.log('\n📋 Usage:');
  console.log('- 100% FREE community NFT distribution');
  console.log('- Each code can only be used once');
  console.log('- Codes are case-insensitive');
  console.log('- Track usage with: npm run code-stats');
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npm run generate-codes');
    console.log('');
    console.log('Generates 10,000 secret codes for free NFT minting across various campaigns:');
    console.log('- Twitter giveaways');
    console.log('- Discord contests');
    console.log('- Influencer collaborations');
    console.log('- Beta tester rewards');
    console.log('- Community builder rewards');
    console.log('- And more...');
    process.exit(0);
  }

  generateCampaignCodes();
}

module.exports = { generateCampaignCodes }; 