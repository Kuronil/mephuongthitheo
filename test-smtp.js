// test-smtp.js - Script kiểm tra SMTP connection
// Script này đọc cấu hình từ file .env

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Testing SMTP Connection...\n');

// Cấu hình SMTP - Đọc từ file .env
const config = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

console.log('📧 SMTP Configuration:');
console.log('   Host:', config.host);
console.log('   Port:', config.port);
console.log('   User:', config.auth.user);
console.log('   Pass:', config.auth.pass.replace(/./g, '*'), '(hidden)');
console.log('');

// Tạo transporter
const transporter = nodemailer.createTransport(config);

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Connection FAILED!');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('  1. Check SMTP_USER - phải là email đầy đủ (có @gmail.com)');
    console.log('  2. Check SMTP_PASS - phải là App Password 16 ký tự');
    console.log('  3. Đảm bảo đã bật 2-Step Verification');
    console.log('  4. Tạo App Password mới tại: https://myaccount.google.com/apppasswords');
    console.log('');
  } else {
    console.log('✅ SMTP Connection SUCCESSFUL!');
    console.log('');
    console.log('🎉 Server is ready to send emails!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Copy SMTP_USER và SMTP_PASS vào file .env');
    console.log('  2. Restart server: npm run dev');
    console.log('  3. Test đăng ký tài khoản');
    console.log('');
  }
});

