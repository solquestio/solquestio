const fs = require('fs');
const path = require('path');

// Pricing phases configuration - ULTRA-SIMPLE FREE MODEL
const PRICING_PHASES = [
  {
    phase: 0,
    name: 'Ultra-Simple Free Claiming',
    description: 'Connect wallet + claim free NFT (no codes needed)',
    price: 0,
    maxNFTs: 10000,
    targetAudience: 'Anyone with a Solana wallet',
    estimatedRevenue: 0
  }
];

const phasesPath = path.join(__dirname, '..', 'config', 'pricing-phases.json');

/**
 * Initialize pricing phases tracking
 */
function initializePricingPhases() {
  const phasesData = {
    currentPhase: 0,
    totalMinted: 0,
    phases: PRICING_PHASES.map(phase => ({
      ...phase,
      minted: 0,
      remaining: phase.maxNFTs,
      isActive: phase.phase === 0,
      isCompleted: false,
      startDate: phase.phase === 0 ? new Date().toISOString() : null,
      endDate: null
    })),
    lastUpdated: new Date().toISOString()
  };

  // Ensure config directory exists
  const configDir = path.dirname(phasesPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(phasesPath, JSON.stringify(phasesData, null, 2));
  console.log('✅ Pricing phases initialized');
  return phasesData;
}

/**
 * Get current pricing phases data
 */
function getPricingPhases() {
  if (!fs.existsSync(phasesPath)) {
    return initializePricingPhases();
  }

  try {
    return JSON.parse(fs.readFileSync(phasesPath, 'utf8'));
  } catch (error) {
    console.error('Error reading pricing phases:', error);
    return initializePricingPhases();
  }
}

/**
 * Update minting progress for current phase
 */
function updatePhaseProgress(mintType = 'paid', count = 1) {
  const phasesData = getPricingPhases();
  const currentPhase = phasesData.currentPhase;

  if (mintType === 'free') {
    // Update Phase 0 (free mints)
    const phase0 = phasesData.phases[0];
    phase0.minted += count;
    phase0.remaining = Math.max(0, phase0.maxNFTs - phase0.minted);
    
    if (phase0.minted >= phase0.maxNFTs) {
      phase0.isCompleted = true;
      phase0.isActive = false;
      phase0.endDate = new Date().toISOString();
    }
  } else {
    // Update current paid phase
    const activePhase = phasesData.phases[currentPhase];
    
    if (activePhase && activePhase.price > 0) {
      activePhase.minted += count;
      activePhase.remaining = Math.max(0, activePhase.maxNFTs - activePhase.minted);
      
      // Check if phase is complete
      if (activePhase.minted >= activePhase.maxNFTs) {
        activePhase.isCompleted = true;
        activePhase.isActive = false;
        activePhase.endDate = new Date().toISOString();
        
        // Activate next phase
        const nextPhaseIndex = currentPhase + 1;
        if (nextPhaseIndex < phasesData.phases.length) {
          phasesData.currentPhase = nextPhaseIndex;
          phasesData.phases[nextPhaseIndex].isActive = true;
          phasesData.phases[nextPhaseIndex].startDate = new Date().toISOString();
        }
      }
    }
  }

  // Update total minted
  phasesData.totalMinted = phasesData.phases.reduce((sum, phase) => sum + phase.minted, 0);
  phasesData.lastUpdated = new Date().toISOString();

  // Save updated data
  fs.writeFileSync(phasesPath, JSON.stringify(phasesData, null, 2));
  return phasesData;
}

/**
 * Get current pricing info
 */
function getCurrentPricing() {
  const phasesData = getPricingPhases();
  const currentPhase = phasesData.phases[phasesData.currentPhase];
  const phase0 = phasesData.phases[0]; // Free phase

  return {
    freeMintsRemaining: phase0.remaining,
    currentPaidPhase: {
      phase: currentPhase.phase,
      name: currentPhase.name,
      price: currentPhase.price,
      remaining: currentPhase.remaining,
      description: currentPhase.description
    },
    nextPhase: phasesData.currentPhase < phasesData.phases.length - 1 
      ? phasesData.phases[phasesData.currentPhase + 1]
      : null,
    totalProgress: {
      minted: phasesData.totalMinted,
      remaining: 10000 - phasesData.totalMinted,
      percentage: ((phasesData.totalMinted / 10000) * 100).toFixed(1)
    }
  };
}

/**
 * Display pricing phases status
 */
function displayPricingStatus() {
  console.log('💰 SolQuest OG NFT - Progressive Pricing Status\n');

  const phasesData = getPricingPhases();

  // Overall progress
  console.log('📊 Overall Progress:');
  console.log(`   Total minted: ${phasesData.totalMinted} / 10,000`);
  console.log(`   Progress: ${((phasesData.totalMinted / 10000) * 100).toFixed(1)}%`);
  console.log(`   Remaining: ${10000 - phasesData.totalMinted} NFTs`);
  console.log('');

  // Phase breakdown
  console.log('🎯 Phase Breakdown:');
  phasesData.phases.forEach((phase, index) => {
    const status = phase.isActive ? '🟢 ACTIVE' : 
                   phase.isCompleted ? '✅ COMPLETED' : 
                   '⏳ PENDING';
    
    const priceDisplay = phase.price === 0 ? 'FREE' : `${phase.price} SOL`;
    const progress = phase.maxNFTs > 0 ? `${phase.minted}/${phase.maxNFTs}` : '0/0';
    
    console.log(`   Phase ${phase.phase}: ${phase.name} ${status}`);
    console.log(`     Price: ${priceDisplay}`);
    console.log(`     Progress: ${progress} (${((phase.minted / phase.maxNFTs) * 100).toFixed(1)}%)`);
    console.log(`     Remaining: ${phase.remaining}`);
    
    if (phase.startDate) {
      console.log(`     Started: ${new Date(phase.startDate).toLocaleDateString()}`);
    }
    if (phase.endDate) {
      console.log(`     Ended: ${new Date(phase.endDate).toLocaleDateString()}`);
    }
    console.log('');
  });

  // Current pricing info
  const current = getCurrentPricing();
  console.log('💡 Current Status:');
  console.log(`   Free claims remaining: ${current.freeMintsRemaining}`);
  console.log(`   Claiming method: Connect wallet + click claim`);
  console.log(`   Current phase: ${current.currentPaidPhase.name}`);
  
  if (current.nextPhase) {
    console.log(`   Next phase: ${current.nextPhase.name}`);
  }

  // Revenue calculation
  const totalRevenue = phasesData.phases
    .filter(p => p.price > 0)
    .reduce((sum, phase) => sum + (phase.minted * phase.price), 0);
  
  console.log('');
  console.log('💰 Revenue Status:');
  console.log(`   Current revenue: ${totalRevenue.toFixed(2)} SOL (~$${(totalRevenue * 100).toFixed(0)})`);
  
  const maxRevenue = phasesData.phases
    .filter(p => p.price > 0)
    .reduce((sum, phase) => sum + (phase.maxNFTs * phase.price), 0);
  
  console.log(`   Maximum revenue: ${maxRevenue.toFixed(2)} SOL (~$${(maxRevenue * 100).toFixed(0)})`);
  console.log(`   Revenue progress: ${((totalRevenue / maxRevenue) * 100).toFixed(1)}%`);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npm run pricing-phases [options]');
    console.log('');
    console.log('Options:');
    console.log('  --init        Initialize pricing phases tracking');
    console.log('  --status      Show current pricing status (default)');
    console.log('  --update-free Update free mint count');
    console.log('  --update-paid Update paid mint count');
    console.log('');
    console.log('Examples:');
    console.log('  npm run pricing-phases --init');
    console.log('  npm run pricing-phases --status');
    process.exit(0);
  }

  if (args.includes('--init')) {
    initializePricingPhases();
  } else if (args.includes('--update-free')) {
    updatePhaseProgress('free', 1);
    console.log('✅ Updated free mint progress');
  } else if (args.includes('--update-paid')) {
    updatePhaseProgress('paid', 1);
    console.log('✅ Updated paid mint progress');
  } else {
    displayPricingStatus();
  }
}

module.exports = {
  initializePricingPhases,
  getPricingPhases,
  updatePhaseProgress,
  getCurrentPricing,
  displayPricingStatus,
  PRICING_PHASES
}; 