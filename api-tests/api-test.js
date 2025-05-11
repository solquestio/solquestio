const fetch = require('node-fetch');

/**
 * API Testing Script for SolQuestio
 * This script tests all major API endpoints to verify they're working correctly.
 */

// Configuration
const API_URL = 'https://api.solquest.io';
const TEST_WALLET = '8ZGTbuqVzUNZYCWJ6TRRXwyHQeogKnEYrxCpho7jXBQu'; // Replace with a test wallet address
const ENDPOINTS = {
  // Public endpoints (no auth required)
  public: [
    { name: 'API Root', path: '/api', method: 'GET' },
    { name: 'Learning Paths', path: '/api/quests/paths', method: 'GET' },
    { name: 'Leaderboard', path: '/api/users?path=leaderboard&limit=3', method: 'GET' },
    { name: 'User API Info', path: '/api/users', method: 'GET' },
    { name: 'User Me Direct Path (Expect Default/404)', path: '/api/users/me', method: 'GET' },
  ],
  
  // Auth endpoints
  auth: [
    { 
      name: 'Auth Challenge', 
      path: '/api/auth/challenge', 
      method: 'POST',
      body: { walletAddress: TEST_WALLET }
    },
    { 
      name: 'Auth Verify (Malformed)', 
      path: '/api/auth/verify', 
      method: 'POST',
      body: { walletAddress: TEST_WALLET, signature: 'dummysignature', message: 'dummymessage' }
    }
    // Note: Auth verify requires real signature which we can't generate in this script
  ],
  
  // Protected endpoints (require auth)
  protected: [
    { name: 'User Profile', path: '/api/users?path=me', method: 'GET' },
    { name: 'All Quests', path: '/api/quests', method: 'GET' },
    // Add more protected endpoints as needed
  ]
};

// Test results storage
const results = {
  success: [],
  failure: []
};

/**
 * Run tests for all endpoints
 */
async function runTests() {
  console.log('🧪 Starting SolQuestio API Tests 🧪');
  console.log('===================================');
  console.log(`API URL: ${API_URL}`);
  console.log('===================================\n');
  
  // 1. Test public endpoints
  console.log('Testing Public Endpoints...');
  for (const endpoint of ENDPOINTS.public) {
    await testEndpoint(endpoint);
  }
  
  // 2. Test auth endpoints
  console.log('\nTesting Auth Endpoints...');
  for (const endpoint of ENDPOINTS.auth) {
    await testEndpoint(endpoint);
  }
  
  // Note: We're skipping protected endpoints as they require auth
  // You would need to implement a full auth flow to test these
  console.log('\nSkipping Protected Endpoints (require authentication)');
  
  // 3. Print summary
  printSummary();
}

/**
 * Test a specific endpoint
 */
async function testEndpoint(endpoint) {
  const url = `${API_URL}${endpoint.path}`;
  const options = {
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (endpoint.body) {
    options.body = JSON.stringify(endpoint.body);
  }
  
  try {
    console.log(`Testing: ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
    const response = await fetch(url, options);
    const status = response.status;
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text(); // Get text if JSON parsing fails
    }
    
    if (status >= 200 && status < 300) {
      console.log(`  ✅ Success (${status})`);
      results.success.push({...endpoint, status});
    } else {
      console.log(`  ❌ Failed (${status})`);
      // Log more of the response if it's short, or just a summary
      const responsePreview = typeof data === 'string' ? data.substring(0, 200) : JSON.stringify(data).substring(0, 200);
      console.log(`  Response: ${responsePreview}...`);
      results.failure.push({...endpoint, status, data});
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    results.failure.push({...endpoint, error: error.message});
  }
}

/**
 * Print a summary of all tests
 */
function printSummary() {
  console.log('\n===================================');
  console.log('📊 Test Summary');
  console.log('===================================');
  console.log(`Total Endpoints Tested: ${results.success.length + results.failure.length}`);
  console.log(`✅ Successful: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failure.length}`);
  
  if (results.failure.length > 0) {
    console.log('\nFailed Endpoints Details:');
    results.failure.forEach(fail => {
      console.log(`- ${fail.name} (${fail.method} ${fail.path}) - Status: ${fail.status}`);
      if(fail.data) {
        const dataPreview = typeof fail.data === 'string' ? fail.data.substring(0,100) : JSON.stringify(fail.data).substring(0,100);
        console.log(`    Response: ${dataPreview}...`);
      }
      if(fail.error) {
        console.log(`    Error: ${fail.error}`);
      }
    });
  }
  
  console.log('\n===================================');
  console.log('🏁 Testing Complete');
  console.log('===================================');
}

// Run the tests
runTests();
