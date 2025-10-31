/**
 * Script xác thực email cho user
 * Chạy: npx ts-node scripts/verify-user-email.ts <email>
 * Hoặc verify tất cả: npx ts-node scripts/verify-user-email.ts --all
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyUserEmail(email?: string) {
  try {
    if (!email || email === '--all') {
      // Verify tất cả users
      console.log('🔄 Đang xác thực email cho TẤT CẢ users...\n')
      
      const result = await prisma.user.updateMany({
        where: {
          emailVerified: false
        },
        data: {
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null
        }
      })

      console.log(`✅ Đã xác thực ${result.count} tài khoản!`)
      
      // Hiển thị danh sách users
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
          emailVerified: true,
          createdAt: true
        }
      })

      console.log('\n📋 DANH SÁCH TẤT CẢ USERS:')
      console.log('═══════════════════════════════════════════════════════════')
      users.forEach(user => {
        console.log(`ID: ${user.id}`)
        console.log(`  Name: ${user.name}`)
        console.log(`  Email: ${user.email}`)
        console.log(`  Admin: ${user.isAdmin ? '✅ Có' : '❌ Không'}`)
        console.log(`  Email Verified: ${user.emailVerified ? '✅ Đã xác thực' : '❌ Chưa xác thực'}`)
        console.log(`  Created: ${user.createdAt.toLocaleString('vi-VN')}`)
        console.log('───────────────────────────────────────────────────────────')
      })
      
    } else {
      // Verify một user cụ thể
      console.log(`🔄 Đang xác thực email cho: ${email}\n`)
      
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        console.log(`❌ Không tìm thấy user với email: ${email}`)
        return
      }

      if (user.emailVerified) {
        console.log(`✅ Email đã được xác thực trước đó!`)
        console.log(`   User: ${user.name} (${user.email})`)
        return
      }

      // Update emailVerified
      const updated = await prisma.user.update({
        where: { email },
        data: {
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null
        }
      })

      console.log('✅ XÁC THỰC EMAIL THÀNH CÔNG!')
      console.log('═══════════════════════════════════════════')
      console.log(`ID: ${updated.id}`)
      console.log(`Name: ${updated.name}`)
      console.log(`Email: ${updated.email}`)
      console.log(`Admin: ${updated.isAdmin ? 'Có' : 'Không'}`)
      console.log(`Email Verified: Đã xác thực ✅`)
      console.log('═══════════════════════════════════════════')
      console.log('\n🎉 Bây giờ bạn có thể đăng nhập với tài khoản này!')
    }

  } catch (error) {
    console.error('❌ Lỗi:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Lấy email từ command line arguments
const email = process.argv[2]

if (!email) {
  console.log('📖 HƯỚNG DẪN SỬ DỤNG:')
  console.log('═══════════════════════════════════════════')
  console.log('1. Xác thực email cho một user:')
  console.log('   npx ts-node scripts/verify-user-email.ts email@example.com')
  console.log('')
  console.log('2. Xác thực email cho TẤT CẢ users:')
  console.log('   npx ts-node scripts/verify-user-email.ts --all')
  console.log('═══════════════════════════════════════════')
  process.exit(0)
}

verifyUserEmail(email)

