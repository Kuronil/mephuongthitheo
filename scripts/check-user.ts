/**
 * Script to check user information by email
 * Usage: npx ts-node scripts/check-user.ts <email>
 * Example: npx ts-node scripts/check-user.ts takamon654@gmail.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser(email: string) {
  try {
    console.log(`🔍 Đang tìm kiếm user với email: ${email}\n`)
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        phone: true,
        isAdmin: true,
        emailVerified: true,
        createdAt: true,
        password: true, // Only to check if exists, we won't display it
        loyaltyPoints: true,
        loyaltyTier: true
      }
    })

    if (!user) {
      console.error(`❌ Không tìm thấy user với email: ${email}`)
      process.exit(1)
    }

    console.log('✅ Thông tin tài khoản:')
    console.log('─'.repeat(50))
    console.log(`ID: ${user.id}`)
    console.log(`Tên: ${user.name}`)
    console.log(`Email: ${user.email}`)
    console.log(`Địa chỉ: ${user.address || 'Chưa cập nhật'}`)
    console.log(`Số điện thoại: ${user.phone || 'Chưa cập nhật'}`)
    console.log(`Admin: ${user.isAdmin ? '✅ Có' : '❌ Không'}`)
    console.log(`Email đã xác thực: ${user.emailVerified ? '✅ Có' : '❌ Chưa'}`)
    console.log(`Điểm loyalty: ${user.loyaltyPoints}`)
    console.log(`Hạng loyalty: ${user.loyaltyTier}`)
    console.log(`Ngày tạo: ${user.createdAt.toLocaleString('vi-VN')}`)
    console.log(`Mật khẩu: Đã được mã hóa (bcrypt hash) - Không thể xem mật khẩu gốc`)
    console.log('─'.repeat(50))
    
    if (user.password) {
      console.log(`\nℹ️  Mật khẩu đã được hash và lưu trữ an toàn.`)
      console.log(`   Hash mật khẩu bắt đầu với: ${user.password.substring(0, 20)}...`)
      console.log(`   Để đặt lại mật khẩu, sử dụng chức năng "Quên mật khẩu" trên website.`)
    } else {
      console.log(`\n⚠️  Tài khoản này không có mật khẩu (có thể đăng nhập bằng Google OAuth)`)
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.error('❌ Vui lòng cung cấp địa chỉ email')
  console.log('Usage: npx ts-node scripts/check-user.ts <email>')
  console.log('Example: npx ts-node scripts/check-user.ts takamon654@gmail.com')
  process.exit(1)
}

checkUser(email)







