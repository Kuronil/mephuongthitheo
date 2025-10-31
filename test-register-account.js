/**
 * Test register account to check validation
 */

async function testRegister() {
  const testData = {
    name: "Nguyễn Văn Test",
    email: "testuser@gmail.com",
    phone: "0912345678",
    password: "Test123456",  // Has uppercase, lowercase, and numbers
    address: "123 Đường Test, Quận 1, TP.HCM"
  }

  console.log('🧪 Testing registration with data:')
  console.log(JSON.stringify(testData, null, 2))
  console.log('\n📡 Sending request to /api/auth/register...\n')

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    const data = await response.json()

    console.log('Response Status:', response.status)
    console.log('Response Data:', JSON.stringify(data, null, 2))

    if (response.ok) {
      console.log('\n✅ Registration successful!')
    } else {
      console.log('\n❌ Registration failed!')
      console.log('Error:', data.error)
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

testRegister()


