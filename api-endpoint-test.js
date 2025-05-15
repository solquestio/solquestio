/**
 * SolQuestio API Endpoint Testing Script
 * 
 * This script tests all API endpoints to ensure they are working correctly
 * Run this script before deploying to production
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
let authToken = null;

// List of endpoints to test with their metadata
const endpoints = [
  { path: '/api/health', method: 'GET', requiresAuth: false, description: 'Health check endpoint' },
  { path: '/api/public', method: 'GET', requiresAuth: false, description: 'Public endpoint for basic info' },
  { path: '/api/auth/challenge', method: 'POST', requiresAuth: false, description: 'Generate authentication challenge' },
  { path: '/api/auth/verify', method: 'POST', requiresAuth: false, description: 'Verify authentication' },
  { path: '/api/users/me', method: 'GET', requiresAuth: true, description: 'Get user profile' },
  { path: '/api/users/check-in', method: 'POST', requiresAuth: true, description: 'Daily check-in' },
  { path: '/api/quests', method: 'GET', requiresAuth: true, description: 'Get all quests' },
  { path: '/api/quests/paths', method: 'GET', requiresAuth: false, description: 'Get all quest paths' },
  { path: '/api/quests/path/zk-compression', method: 'GET', requiresAuth: true, description: 'Get ZK Compression path quests' },
  { path: '/api/quests/path/layerzero', method: 'GET', requiresAuth: true, description: 'Get LayerZero path quests' },
  { path: '/api/quests/path/substreams', method: 'GET', requiresAuth: true, description: 'Get Substreams path quests' },
  { path: '/api/quests/path/bitcoin-solana', method: 'GET', requiresAuth: true, description: 'Get Bitcoin-Solana path quests' },
  { path: '/api/users/leaderboard', method: 'GET', requiresAuth: false, description: 'Get leaderboard' },
];

// Helper to print results with color
const printResult = (endpoint, success, status, details) => {
  const color = success ? '\x1b[32m' : '\x1b[31m'; // Green or Red
  const reset = '\x1b[0m';
  const statusColor = status >= 200 && status < 300 ? '\x1b[32m' : '\x1b[31m';
  
  console.log(`${color}[${success ? 'PASS' : 'FAIL'}]${reset} ${endpoint.method} ${endpoint.path} - ${statusColor}${status}${reset}`);
  if (details) {
    console.log(`  ${details}`);
  }
  if (endpoint.description) {
    console.log(`  Description: ${endpoint.description}`);
  }
  console.log('');
};

// Function to test a single endpoint
async function testEndpoint(endpoint) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (endpoint.requiresAuth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
      method: endpoint.method,
      headers,
    });
    
    const success = response.status >= 200 && response.status < 300;
    
    let responseText = '';
    try {
      responseText = await response.text();
    } catch (e) {
      // Ignore if we can't get response text
    }
    
    printResult(
      endpoint,
      success,
      response.status,
      success ? null : `Response: ${responseText.substring(0, 100)}...`
    );
    
    return { success, endpoint };
  } catch (error) {
    printResult(endpoint, false, 'ERROR', `Error: ${error.message}`);
    return { success: false, endpoint };
  }
}

// Main function to run all tests
async function runTests() {
  console.log('\x1b[36m%s\x1b[0m', '=== SolQuestio API Endpoint Test ===');
  console.log(`Testing against: ${API_BASE_URL}`);
  console.log('');
  
  const results = [];
  
  // First test the health endpoint
  const healthEndpoint = endpoints.find(e => e.path === '/api/health');
  if (healthEndpoint) {
    const result = await testEndpoint(healthEndpoint);
    results.push(result);
    
    if (!result.success) {
      console.log('\x1b[31m%s\x1b[0m', 'Health check failed! Aborting further tests.');
      return;
    }
  }
  
  // Test remaining endpoints
  for (const endpoint of endpoints) {
    if (endpoint.path !== '/api/health') {
      const result = await testEndpoint(endpoint);
      results.push(result);
    }
  }
  
  // Print summary
  const passCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log('\x1b[36m%s\x1b[0m', '=== Test Summary ===');
  console.log(`Total: ${results.length}, Passed: ${passCount}, Failed: ${failCount}`);
  
  if (failCount > 0) {
    console.log('\x1b[33m%s\x1b[0m', 'Some endpoints failed! Review before deployment.');
  } else {
    console.log('\x1b[32m%s\x1b[0m', 'All endpoints passed! Ready for deployment.');
  }
}

// Run the tests
runTests().catch(console.error); 