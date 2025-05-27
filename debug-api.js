/**
 * SolQuestio API Debugging Script
 * This script tests various backend API endpoints and logs the results
 */

const fetch = require('node-fetch');

// Configuration
const BACKEND_URL = 'https://solquestio.vercel.app';  // Change if needed
const ENDPOINTS = [
  '/api',                 // Basic root endpoint
  '/api/utils?path=health',  // Health check
  '/api/debug',           // Debug info
  '/api/quests/paths',    // Learning paths
  'ew'  // Leaderboard
];

// Add colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to test an endpoint
async function testEndpoint(endpoint) {
  console.log(`${colors.blue}Testing ${colors.cyan}${endpoint}${colors.blue}...${colors.reset}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://solquest.io'  // Simulate request from frontend
      }
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const statusOk = response.ok;
    const status = response.status;
    const statusText = response.statusText;
    
    // Get response headers
    const headers = {};
    response.headers.forEach((value, name) => {
      headers[name] = value;
    });
    
    // Check CORS headers
    const corsHeaders = {
      'access-control-allow-origin': headers['access-control-allow-origin'],
      'access-control-allow-methods': headers['access-control-allow-methods'],
      'access-control-allow-headers': headers['access-control-allow-headers'],
      'access-control-allow-credentials': headers['access-control-allow-credentials']
    };
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      responseData = { error: 'Failed to parse JSON response' };
    }
    
    console.log(`${colors.blue}Status: ${statusOk ? colors.green : colors.red}${status} ${statusText}${colors.reset}`);
    console.log(`${colors.blue}Response time: ${responseTime}ms${colors.reset}`);
    console.log(`${colors.yellow}CORS Headers:${colors.reset}`, corsHeaders);
    console.log(`${colors.magenta}Response data:${colors.reset}`, JSON.stringify(responseData, null, 2));
    
    return { endpoint, success: statusOk, status, responseTime, corsHeaders, data: responseData };
  } catch (error) {
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    return { endpoint, success: false, error: error.message };
  }
}

// Main function to test all endpoints
async function testAllEndpoints() {
  console.log(`${colors.green}====== SolQuestio API Debug Script ======${colors.reset}`);
  console.log(`${colors.blue}Testing backend URL: ${colors.cyan}${BACKEND_URL}${colors.reset}`);
  console.log(`${colors.blue}Time: ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.green}========================================${colors.reset}\n`);
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log(`${colors.green}----------------------------------------${colors.reset}\n`);
  }
  
  // Summary
  console.log(`${colors.green}====== Summary ======${colors.reset}`);
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  console.log(`${colors.blue}Total endpoints tested: ${colors.cyan}${results.length}${colors.reset}`);
  console.log(`${colors.blue}Successful: ${colors.green}${successCount}${colors.reset}`);
  console.log(`${colors.blue}Failed: ${colors.red}${failCount}${colors.reset}`);
  
  if (failCount > 0) {
    console.log(`\n${colors.red}Failed endpoints:${colors.reset}`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`${colors.red}- ${r.endpoint}: ${r.error || r.status}${colors.reset}`);
    });
  }
}

// Run the tests
testAllEndpoints().catch(console.error);
