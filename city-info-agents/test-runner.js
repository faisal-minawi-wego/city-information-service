#!/usr/bin/env node

/**
 * Test Runner for City Information Multi-Agent System
 * 
 * This script tests the actual functionality of the multi-agent system
 * by making API calls to the running Mastra dev server.
 * 
 * Usage:
 * 1. Start the dev server: npm run dev
 * 2. In another terminal, run: node test-runner.js
 */

const baseUrl = 'http://localhost:4112';

// Test cities
const testCities = [
  { city: 'Tokyo', country: 'Japan' },
  { city: 'London', country: 'UK' },
  { city: 'Paris' }, // Without country
  { city: 'New York', country: 'USA' },
];

// Helper function to make API calls
async function makeRequest(endpoint, data) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return null;
  }
}

// Note: Weather workflow has been removed - weather is now integrated into city info workflow

// Test city information workflow
async function testCityInfoWorkflow(cityData) {
  const cityName = cityData.city + (cityData.country ? `, ${cityData.country}` : '');
  console.log(`\n🏙️  Testing City Info Workflow for ${cityName}...`);
  
  const result = await makeRequest('/api/workflow/city-info-workflow', cityData);

  if (result) {
    console.log(`✅ City info workflow successful for ${cityName}`);
    console.log(`📊 Response length: ${result.city_information?.length || 0} characters`);
    
    if (result.city_information) {
      // Check for expected sections
      const expectedSections = ['🏙️', '☀️', '🎯', '🍽️', '📸', '⚠️'];
      const foundSections = expectedSections.filter(section => 
        result.city_information.includes(section)
      );
      
      console.log(`📋 Sections found: ${foundSections.length}/${expectedSections.length}`);
      console.log(`📝 First 300 chars: ${result.city_information.substring(0, 300)}...`);
    }
    return true;
  } else {
    console.log(`❌ City info workflow failed for ${cityName}`);
    return false;
  }
}

// Test server availability
async function testServerAvailability() {
  console.log('🔍 Checking server availability...');
  
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (response.ok) {
      console.log('✅ Server is available');
      return true;
    } else {
      console.log('⚠️  Server responded but health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not available');
    console.log('💡 Make sure to start the dev server first: npm run dev');
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Multi-Agent System Tests\n');
  console.log('=' .repeat(50));

  // Check if server is running
  const serverAvailable = await testServerAvailability();
  if (!serverAvailable) {
    console.log('\n❌ Cannot proceed with tests - server is not available');
    console.log('Please start the dev server first: npm run dev');
    process.exit(1);
  }

  let totalTests = 0;
  let passedTests = 0;

  // Test city information workflow for all test cities (includes weather data)
  console.log('\n🏙️  CITY INFORMATION WORKFLOW TESTS');
  console.log('=' .repeat(40));
  
  for (const cityData of testCities) {
    totalTests++;
    if (await testCityInfoWorkflow(cityData)) {
      passedTests++;
    }
    // Add a small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('=' .repeat(20));
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Multi-agent system is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above.');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Add fetch polyfill for older Node.js versions
if (!globalThis.fetch) {
  console.log('Installing fetch polyfill...');
  import('node-fetch').then(({ default: fetch }) => {
    globalThis.fetch = fetch;
    runTests();
  }).catch(() => {
    console.error('❌ Failed to load fetch polyfill. Please install node-fetch:');
    console.error('npm install node-fetch');
    process.exit(1);
  });
} else {
  runTests();
} 