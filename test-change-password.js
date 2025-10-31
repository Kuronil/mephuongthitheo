/**
 * Script để test API thay đổi mật khẩu
 * Chạy: node test-change-password.js
 */

const BASE_URL = 'http://localhost:3000'

// Test user credentials - thay đổi theo user test của bạn
const TEST_USER_ID = '1' // ID của user test
const CURRENT_PASSWORD = 'Test123' // Mật khẩu hiện tại
const NEW_PASSWORD = 'NewTest123' // Mật khẩu mới

async function testChangePasswordSuccess() {
  console.log('\n=== Testing Change Password - Success Case ===')
  try {
    const response = await fetch(`${BASE_URL}/api/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify({
        currentPassword: CURRENT_PASSWORD,
        newPassword: NEW_PASSWORD,
        confirmPassword: NEW_PASSWORD
      })
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('✅ Change password successful')
      return true
    } else {
      console.log('❌ Change password failed')
      return false
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function testWrongCurrentPassword() {
  console.log('\n=== Testing Wrong Current Password ===')
  try {
    const response = await fetch(`${BASE_URL}/api/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify({
        currentPassword: 'WrongPassword123',
        newPassword: 'NewTest456',
        confirmPassword: 'NewTest456'
      })
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 400 && data.error.includes('Mật khẩu hiện tại không đúng')) {
      console.log('✅ Correctly rejected wrong password')
      return true
    } else {
      console.log('❌ Should have rejected wrong password')
      return false
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function testPasswordMismatch() {
  console.log('\n=== Testing Password Mismatch ===')
  try {
    const response = await fetch(`${BASE_URL}/api/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify({
        currentPassword: CURRENT_PASSWORD,
        newPassword: 'NewTest456',
        confirmPassword: 'DifferentPassword456'
      })
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 400 && data.error.includes('không khớp')) {
      console.log('✅ Correctly rejected mismatched passwords')
      return true
    } else {
      console.log('❌ Should have rejected mismatched passwords')
      return false
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function testWeakPassword() {
  console.log('\n=== Testing Weak Password (no uppercase) ===')
  try {
    const response = await fetch(`${BASE_URL}/api/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify({
        currentPassword: CURRENT_PASSWORD,
        newPassword: 'weakpass123',
        confirmPassword: 'weakpass123'
      })
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 400 && data.error.includes('chữ hoa')) {
      console.log('✅ Correctly rejected weak password')
      return true
    } else {
      console.log('❌ Should have rejected weak password')
      return false
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function testShortPassword() {
  console.log('\n=== Testing Short Password ===')
  try {
    const response = await fetch(`${BASE_URL}/api/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify({
        currentPassword: CURRENT_PASSWORD,
        newPassword: 'Ab1',
        confirmPassword: 'Ab1'
      })
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 400 && data.error.includes('ít nhất 6 ký tự')) {
      console.log('✅ Correctly rejected short password')
      return true
    } else {
      console.log('❌ Should have rejected short password')
      return false
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function testSameAsCurrentPassword() {
  console.log('\n=== Testing Same as Current Password ===')
  try {
    const response = await fetch(`${BASE_URL}/api/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': TEST_USER_ID
      },
      body: JSON.stringify({
        currentPassword: CURRENT_PASSWORD,
        newPassword: CURRENT_PASSWORD,
        confirmPassword: CURRENT_PASSWORD
      })
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.status === 400 && data.error.includes('không được trùng')) {
      console.log('✅ Correctly rejected same password')
      return true
    } else {
      console.log('❌ Should have rejected same password')
      return false
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🧪 Starting Change Password API Tests...')
  console.log('Make sure the dev server is running on', BASE_URL)
  console.log('Using test user ID:', TEST_USER_ID)
  console.log('\n⚠️ IMPORTANT: Update CURRENT_PASSWORD and NEW_PASSWORD constants before running!')
  
  let passed = 0
  let failed = 0
  
  // Test validation errors first (don't change password)
  if (await testWrongCurrentPassword()) passed++; else failed++
  if (await testPasswordMismatch()) passed++; else failed++
  if (await testWeakPassword()) passed++; else failed++
  if (await testShortPassword()) passed++; else failed++
  if (await testSameAsCurrentPassword()) passed++; else failed++
  
  // Test successful password change (this will actually change the password)
  console.log('\n⚠️ WARNING: The next test will actually change the password!')
  console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  if (await testChangePasswordSuccess()) passed++; else failed++
  
  console.log('\n' + '='.repeat(50))
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log('='.repeat(50))
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!')
  } else {
    console.log('\n⚠️ Some tests failed. Please check the output above.')
  }
}

// Run tests
runAllTests().catch(console.error)

