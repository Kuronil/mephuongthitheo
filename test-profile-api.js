/**
 * Script để test các API endpoint của profile
 * Chạy: node test-profile-api.js
 */

const BASE_URL = 'http://localhost:3000'

// Test user credentials - thay đổi theo user test của bạn
const TEST_USER_ID = '1' // ID của user test

async function testGetStats() {
  console.log('\n=== Testing GET /api/user/stats ===')
  try {
    const response = await fetch(`${BASE_URL}/api/user/stats`, {
      headers: {
        'x-user-id': TEST_USER_ID
      }
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('✅ GET stats successful')
      return data
    } else {
      console.log('❌ GET stats failed')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function testGetProfile() {
  console.log('\n=== Testing GET /api/user/profile ===')
  try {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: {
        'x-user-id': TEST_USER_ID
      }
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('✅ GET profile successful')
      return data
    } else {
      console.log('❌ GET profile failed')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function testUpdateProfile() {
  console.log('\n=== Testing PUT /api/user/profile ===')
  
  const updateData = {
    name: 'Test User Updated',
    email: 'test@example.com',
    phone: '0123456789',
    address: '123 Test Street, Test City'
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify(updateData)
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('✅ PUT profile successful')
      return data
    } else {
      console.log('❌ PUT profile failed')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function testInvalidEmail() {
  console.log('\n=== Testing PUT with invalid email ===')
  
  const updateData = {
    name: 'Test User',
    email: 'invalid-email',
    phone: '0123456789',
    address: '123 Test Street'
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify(updateData)
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 400) {
      console.log('✅ Validation working correctly')
    } else {
      console.log('❌ Validation failed to catch invalid email')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function testInvalidPhone() {
  console.log('\n=== Testing PUT with invalid phone ===')
  
  const updateData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '123', // Too short
    address: '123 Test Street'
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify(updateData)
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 400) {
      console.log('✅ Phone validation working correctly')
    } else {
      console.log('❌ Validation failed to catch invalid phone')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

async function runAllTests() {
  console.log('🧪 Starting Profile API Tests...')
  console.log('Make sure the dev server is running on', BASE_URL)
  console.log('Using test user ID:', TEST_USER_ID)
  
  await testGetProfile()
  await testGetStats()
  await testUpdateProfile()
  await testInvalidEmail()
  await testInvalidPhone()
  
  console.log('\n✅ All tests completed!')
}

// Run tests
runAllTests().catch(console.error)

