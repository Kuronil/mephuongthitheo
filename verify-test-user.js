/**
 * Script để verify email của user test
 * Chạy lệnh: node verify-test-user.js
 */

const API_URL = 'http://localhost:3000';

// Thông tin user test đã tạo
const testUserEmail = 'testuser1761703396563@example.com';
const testUserPassword = 'Test123456';

async function verifyUserEmail(email) {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   VERIFY EMAIL CHO USER TEST              ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  console.log(`📧 Đang verify email: ${email}`);
  console.log('');

  try {
    // Sử dụng Prisma để update user trực tiếp
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Update user để set emailVerified = true
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { 
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      }
    });

    console.log('✅ VERIFY EMAIL THÀNH CÔNG!');
    console.log('-------------------------------');
    console.log('Thông tin user đã được update:');
    console.log(`  - ID: ${updatedUser.id}`);
    console.log(`  - Tên: ${updatedUser.name}`);
    console.log(`  - Email: ${updatedUser.email}`);
    console.log(`  - Email Verified: ${updatedUser.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}`);
    console.log('');

    await prisma.$disconnect();
    return { success: true, user: updatedUser };

  } catch (error) {
    console.error('❌ LỖI KHI VERIFY EMAIL:', error.message);
    console.log('');
    console.log('💡 KIỂM TRA:');
    console.log('   - Email có tồn tại trong database không?');
    console.log('   - Database có kết nối được không?');
    console.log('   - Prisma client có hoạt động không?');
    
    return { success: false, error: error.message };
  }
}

async function testLoginAfterVerification(email, password) {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   TEST ĐĂNG NHẬP SAU KHI VERIFY          ║');
  console.log('╚═══════════════════════════════════════════╝');
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ ĐĂNG NHẬP THÀNH CÔNG!');
      console.log('-------------------------------');
      console.log('User đã có thể đăng nhập sau khi verify email:');
      console.log(`  - ID: ${data.id}`);
      console.log(`  - Tên: ${data.name}`);
      console.log(`  - Email: ${data.email}`);
      console.log(`  - Email Verified: ${data.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}`);
      console.log(`  - Is Admin: ${data.isAdmin ? 'Có' : 'Không'}`);
      console.log('');
      console.log('🎉 USER TEST ĐÃ SẴN SÀNG ĐỂ SỬ DỤNG!');
      console.log('');
      console.log('🔐 THÔNG TIN ĐĂNG NHẬP:');
      console.log('-------------------------------');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log('');
      console.log('💡 Bạn có thể sử dụng thông tin này để:');
      console.log('   - Đăng nhập vào hệ thống');
      console.log('   - Test các chức năng khác');
      console.log('   - Chạy: node test-login.js ' + email + ' ' + password);
      
      return { success: true, user: data };
    } else {
      console.log('❌ ĐĂNG NHẬP THẤT BẠI!');
      console.log('Lỗi:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('❌ Lỗi khi test đăng nhập:', error.message);
    return { success: false, error: error.message };
  }
}

// Chạy script
(async () => {
  try {
    console.log('⚠️  Đảm bảo server đang chạy trên http://localhost:3000');
    console.log('');
    
    const verifyResult = await verifyUserEmail(testUserEmail);
    
    if (verifyResult.success) {
      // Test đăng nhập sau khi verify
      await testLoginAfterVerification(testUserEmail, testUserPassword);
    }
    
    console.log('');
    console.log('✨ HOÀN THÀNH!');
    
  } catch (error) {
    console.error('💥 Lỗi không mong muốn:', error);
  }
})();
