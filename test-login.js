/**
 * Script kiểm tra chức năng đăng nhập
 * Chạy lệnh: node test-login.js
 */

const testLogin = async (email, password) => {
  try {
    console.log('\n🔐 Đang kiểm tra đăng nhập...')
    console.log('Email:', email)
    console.log('-------------------')

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })

    const data = await response.json()

    console.log('📊 KẾT QUẢ:')
    console.log('Status:', response.status)
    console.log('-------------------')

    if (response.ok) {
      console.log('✅ ĐĂNG NHẬP THÀNH CÔNG!')
      console.log('-------------------')
      console.log('Thông tin user:')
      console.log('  - ID:', data.id)
      console.log('  - Name:', data.name)
      console.log('  - Email:', data.email)
      console.log('  - Phone:', data.phone || 'Chưa có')
      console.log('  - Address:', data.address || 'Chưa có')
      console.log('  - Is Admin:', data.isAdmin ? 'Có' : 'Không')
      console.log('  - Email Verified:', data.emailVerified ? 'Đã xác thực' : 'Chưa xác thực')
      console.log('  - Created At:', new Date(data.createdAt).toLocaleString('vi-VN'))
    } else {
      console.log('❌ ĐĂNG NHẬP THẤT BẠI!')
      console.log('-------------------')
      console.log('Lỗi:', data.error)
      if (data.message) {
        console.log('Chi tiết:', data.message)
      }
      if (data.code) {
        console.log('Mã lỗi:', data.code)
      }
    }

    console.log('-------------------\n')
    return { success: response.ok, data }

  } catch (error) {
    console.error('❌ LỖI KHI KIỂM TRA:', error.message)
    return { success: false, error: error.message }
  }
}

// Test các trường hợp khác nhau
const runAllTests = async () => {
  console.log('╔═══════════════════════════════════════════╗')
  console.log('║   KIỂM TRA CHỨC NĂNG ĐĂNG NHẬP           ║')
  console.log('╚═══════════════════════════════════════════╝')
  console.log('⚠️  Đảm bảo server đang chạy trên port 3000')
  console.log('')

  // Test 1: Đăng nhập với tài khoản hợp lệ
  console.log('📝 TEST 1: Đăng nhập với tài khoản hợp lệ')
  await testLogin('test@example.com', 'password123')

  // Test 2: Đăng nhập với email không tồn tại
  console.log('📝 TEST 2: Đăng nhập với email không tồn tại')
  await testLogin('notexist@example.com', 'password123')

  // Test 3: Đăng nhập với mật khẩu sai
  console.log('📝 TEST 3: Đăng nhập với mật khẩu sai')
  await testLogin('test@example.com', 'wrongpassword')

  // Test 4: Đăng nhập với email rỗng
  console.log('📝 TEST 4: Đăng nhập với email rỗng')
  await testLogin('', 'password123')

  // Test 5: Đăng nhập với mật khẩu rỗng
  console.log('📝 TEST 5: Đăng nhập với mật khẩu rỗng')
  await testLogin('test@example.com', '')

  console.log('✅ HOÀN THÀNH TẤT CẢ TESTS!\n')
}

// Kiểm tra nếu có tham số dòng lệnh
const args = process.argv.slice(2)

if (args.length === 2) {
  // Nếu có email và password từ command line
  const [email, password] = args
  console.log('╔═══════════════════════════════════════════╗')
  console.log('║   KIỂM TRA ĐĂNG NHẬP                     ║')
  console.log('╚═══════════════════════════════════════════╝')
  testLogin(email, password)
} else if (args.length === 0) {
  // Chạy tất cả các test
  runAllTests()
} else {
  console.log('📖 HƯỚNG DẪN SỬ DỤNG:')
  console.log('-------------------')
  console.log('1. Chạy tất cả tests:')
  console.log('   node test-login.js')
  console.log('')
  console.log('2. Kiểm tra với email và password cụ thể:')
  console.log('   node test-login.js email@example.com password123')
  console.log('')
  console.log('VÍ DỤ:')
  console.log('   node test-login.js test@example.com password123')
  console.log('')
}

