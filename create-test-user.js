/**
 * Script tạo user test để kiểm tra các chức năng
 * Chạy lệnh: node create-test-user.js
 */

const API_URL = 'http://localhost:3000';

// Thông tin user test
const testUserData = {
  name: "Nguyễn Văn Test",
  email: `testuser${Date.now()}@example.com`, // Sử dụng timestamp để tránh trùng email
  phone: "0912345678",
  password: "Test123456", // Có chữ hoa, chữ thường và số
  address: "123 Đường Test, Quận 1, TP.HCM"
};

async function createTestUser() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   TẠO USER TEST                          ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  console.log('📝 Thông tin user sẽ được tạo:');
  console.log('-------------------------------');
  console.log(`👤 Tên: ${testUserData.name}`);
  console.log(`📧 Email: ${testUserData.email}`);
  console.log(`📱 Số điện thoại: ${testUserData.phone}`);
  console.log(`🔒 Mật khẩu: ${testUserData.password}`);
  console.log(`🏠 Địa chỉ: ${testUserData.address}`);
  console.log('');

  try {
    console.log('📡 Đang gửi request tạo user...');
    
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData)
    });

    const data = await response.json();

    console.log('📊 KẾT QUẢ:');
    console.log('-------------------------------');
    console.log(`Status: ${response.status}`);

    if (response.ok) {
      console.log('✅ TẠO USER THÀNH CÔNG!');
      console.log('-------------------------------');
      console.log('Thông tin user đã tạo:');
      console.log(`  - ID: ${data.id}`);
      console.log(`  - Tên: ${data.name}`);
      console.log(`  - Email: ${data.email}`);
      console.log(`  - Số điện thoại: ${data.phone || 'Chưa có'}`);
      console.log(`  - Địa chỉ: ${data.address}`);
      console.log(`  - Is Admin: ${data.isAdmin ? 'Có' : 'Không'}`);
      console.log(`  - Email Verified: ${data.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}`);
      console.log(`  - Ngày tạo: ${new Date(data.createdAt).toLocaleString('vi-VN')}`);
      console.log('');
      console.log('🔐 THÔNG TIN ĐĂNG NHẬP:');
      console.log('-------------------------------');
      console.log(`Email: ${testUserData.email}`);
      console.log(`Password: ${testUserData.password}`);
      console.log('');
      console.log('💡 Bạn có thể sử dụng thông tin này để:');
      console.log('   - Đăng nhập vào hệ thống');
      console.log('   - Test các chức năng khác');
      console.log('   - Chạy: node test-login.js ' + testUserData.email + ' ' + testUserData.password);
      
      return { success: true, user: data, credentials: testUserData };
    } else {
      console.log('❌ TẠO USER THẤT BẠI!');
      console.log('-------------------------------');
      console.log('Lỗi:', data.error);
      if (data.message) {
        console.log('Chi tiết:', data.message);
      }
      
      return { success: false, error: data.error };
    }

  } catch (error) {
    console.error('❌ LỖI KHI TẠO USER:', error.message);
    console.log('');
    console.log('💡 KIỂM TRA:');
    console.log('   - Server có đang chạy trên port 3000 không?');
    console.log('   - Database có kết nối được không?');
    console.log('   - API endpoint /api/auth/register có hoạt động không?');
    
    return { success: false, error: error.message };
  }
}

async function testLoginWithCreatedUser(credentials) {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   KIỂM TRA ĐĂNG NHẬP VỚI USER VỪA TẠO    ║');
  console.log('╚═══════════════════════════════════════════╝');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ ĐĂNG NHẬP THÀNH CÔNG!');
      console.log('-------------------------------');
      console.log('Xác nhận user đã được tạo và có thể đăng nhập.');
      console.log(`User ID: ${data.id}`);
      console.log(`Tên: ${data.name}`);
      console.log(`Email: ${data.email}`);
    } else {
      console.log('❌ ĐĂNG NHẬP THẤT BẠI!');
      console.log('Lỗi:', data.error);
    }
  } catch (error) {
    console.error('❌ Lỗi khi test đăng nhập:', error.message);
  }
}

// Chạy script
(async () => {
  try {
    console.log('⚠️  Đảm bảo server đang chạy trên http://localhost:3000');
    console.log('');
    
    const result = await createTestUser();
    
    if (result.success) {
      // Test đăng nhập với user vừa tạo
      await testLoginWithCreatedUser(result.credentials);
    }
    
    console.log('');
    console.log('✨ HOÀN THÀNH!');
    
  } catch (error) {
    console.error('💥 Lỗi không mong muốn:', error);
  }
})();
