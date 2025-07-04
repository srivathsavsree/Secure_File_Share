const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const NUM_REQUESTS = 70; // Should trigger rate limiting
const DELAY_BETWEEN_BATCHES = 2000; // ms

// Test auth endpoint (stricter rate limit)
async function testAuthEndpoint() {
  console.log('Testing Auth Endpoint (10 requests per 15 minutes limit)');
  
  const promises = [];
  for (let i = 0; i < 15; i++) {
    promises.push(
      axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      })
      .then(res => ({ status: res.status, data: res.data }))
      .catch(err => ({ 
        status: err.response?.status, 
        data: err.response?.data,
        message: err.message
      }))
    );
  }
  
  const results = await Promise.all(promises);
  
  // Count successful and rate-limited responses
  const success = results.filter(r => r.status === 200 || r.status === 201).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  
  console.log(`Auth Endpoint Results: ${success} successful, ${rateLimited} rate-limited`);
  
  // Show the first rate limited response
  const firstRateLimited = results.find(r => r.status === 429);
  if (firstRateLimited) {
    console.log('Sample rate-limited response:', firstRateLimited.data);
  }
}

// Test API endpoint (less strict rate limit)
async function testApiEndpoint() {
  console.log('\nTesting API Endpoint (60 requests per minute limit)');
  
  // Send requests in batches to better see the rate limiting
  const batchSize = 30;
  const numBatches = 3;
  
  for (let batch = 0; batch < numBatches; batch++) {
    console.log(`Sending batch ${batch + 1} of ${batchSize} requests...`);
    
    const promises = [];
    for (let i = 0; i < batchSize; i++) {
      promises.push(
        axios.get(`${API_BASE_URL}/status`)
        .then(res => ({ status: res.status, data: res.data }))
        .catch(err => ({ 
          status: err.response?.status, 
          data: err.response?.data,
          message: err.message
        }))
      );
    }
    
    const results = await Promise.all(promises);
    
    // Count successful and rate-limited responses
    const success = results.filter(r => r.status === 200).length;
    const rateLimited = results.filter(r => r.status === 429).length;
    
    console.log(`Batch ${batch + 1} Results: ${success} successful, ${rateLimited} rate-limited`);
    
    // If this isn't the last batch, wait before sending more
    if (batch < numBatches - 1) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }
}

// Run the tests
async function runTests() {
  try {
    await testAuthEndpoint();
    await testApiEndpoint();
    console.log('\nAll tests completed.');
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

runTests();
