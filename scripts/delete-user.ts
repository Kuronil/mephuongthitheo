/**
 * Script to delete a user from the database
 * Usage: 
 *   - By ID: npx ts-node scripts/delete-user.ts --id=1
 *   - By Email: npx ts-node scripts/delete-user.ts --email=test@example.com
 *   - Delete all test users: npx ts-node scripts/delete-user.ts --delete-test-users
 *   - Delete all non-admin users: npx ts-node scripts/delete-user.ts --delete-all-except-admin
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUserData(userId: number) {
  // Delete related records in correct order
  await prisma.productReview.deleteMany({ where: { userId } })
  await prisma.cartItem.deleteMany({ where: { userId } })
  await prisma.wishlistItem.deleteMany({ where: { userId } })
  await prisma.loyaltyTransaction.deleteMany({ where: { userId } })
  await prisma.notification.deleteMany({ where: { userId } })
  
  // Delete order status logs where user was the changer
  await prisma.orderStatusLog.deleteMany({ where: { changedBy: userId } })
  
  // Delete orders and their related data
  const orders = await prisma.order.findMany({ where: { userId } })
  for (const order of orders) {
    await prisma.orderStatusLog.deleteMany({ where: { orderId: order.id } })
    await prisma.loyaltyTransaction.deleteMany({ where: { orderId: order.id } })
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } })
  }
  
  await prisma.order.deleteMany({ where: { userId } })
  
  // Finally delete user
  await prisma.user.delete({ where: { id: userId } })
}

async function deleteUser() {
  try {
    const args = process.argv.slice(2)
    
    // Parse arguments
    const idArg = args.find(arg => arg.startsWith('--id='))
    const emailArg = args.find(arg => arg.startsWith('--email='))
    const deleteTestUsers = args.includes('--delete-test-users')
    const deleteAllExceptAdmin = args.includes('--delete-all-except-admin')

    if (deleteAllExceptAdmin) {
      console.log('🗑️  Deleting all non-admin users...\n')
      
      const nonAdminUsers = await prisma.user.findMany({
        where: {
          isAdmin: false
        }
      })

      if (nonAdminUsers.length === 0) {
        console.log('✅ No non-admin users found')
        return
      }

      const adminUsers = await prisma.user.findMany({
        where: {
          isAdmin: true
        }
      })

      console.log(`Found ${nonAdminUsers.length} non-admin user(s) to delete:\n`)
      nonAdminUsers.forEach((user: any, index: number) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`)
      })

      console.log(`\n✅ Admin users that will be kept:`)
      adminUsers.forEach((user: any) => {
        console.log(`   👑 ${user.name} (${user.email})`)
      })

      console.log('\n⚠️  WARNING: This will delete ALL non-admin users and their related data!')
      console.log('⏳ Starting deletion in 3 seconds... Press Ctrl+C to cancel...\n')

      // Wait 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Delete users
      let deletedCount = 0
      for (const user of nonAdminUsers) {
        console.log(`[${deletedCount + 1}/${nonAdminUsers.length}] Deleting user: ${user.name} (${user.email})`)
        
        try {
          await deleteUserData(user.id)
          deletedCount++
          console.log(`  ✅ Deleted successfully (${deletedCount}/${nonAdminUsers.length})`)
        } catch (error: any) {
          console.log(`  ❌ Error: ${error.message}`)
        }
      }
      
      console.log(`\n✅ Successfully deleted ${deletedCount} out of ${nonAdminUsers.length} non-admin users!`)
      console.log(`👑 ${adminUsers.length} admin user(s) preserved.`)
      return
    }

    if (deleteTestUsers) {
      console.log('🗑️  Deleting all test users...\n')
      
      const testUsers = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: 'test' } },
            { email: { contains: '@example.com' } }
          ]
        }
      })

      if (testUsers.length === 0) {
        console.log('No test users found')
        return
      }

      console.log(`Found ${testUsers.length} test user(s) to delete:\n`)
      testUsers.forEach((user: any, index: number) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`)
      })

      console.log('\n⚠️  WARNING: This will delete all test users and their related data!')
      console.log('Press Ctrl+C to cancel...\n')

      // Delete users
      for (const user of testUsers) {
        console.log(`Deleting user: ${user.name} (${user.email})`)
        
        try {
          await deleteUserData(user.id)
          console.log(`  ✅ Deleted successfully`)
        } catch (error: any) {
          console.log(`  ❌ Error: ${error.message}`)
        }
      }
      
      console.log('\n✅ All test users deleted successfully!')
      return
    }

    if (idArg) {
      const userId = parseInt(idArg.split('=')[1])
      
      if (isNaN(userId)) {
        console.error('❌ Invalid user ID')
        process.exit(1)
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          orders: true
        }
      })

      if (!user) {
        console.error(`❌ User with ID ${userId} not found`)
        process.exit(1)
      }

      console.log(`\n🗑️  Deleting user:\n`)
      console.log(`Name: ${user.name}`)
      console.log(`Email: ${user.email}`)
      console.log(`Admin: ${user.isAdmin ? 'Yes' : 'No'}`)
      console.log(`Created: ${user.createdAt.toLocaleDateString()}`)
      console.log(`Orders: ${user.orders.length}`)

      if (user.isAdmin) {
        console.log('\n⚠️  WARNING: This is an ADMIN user!')
      }

      console.log('\n⚠️  This will delete the user and all related data!')
      console.log('Press Ctrl+C to cancel...\n')

      await deleteUserData(userId)

      console.log(`✅ User "${user.name}" deleted successfully!`)

    } else if (emailArg) {
      const email = emailArg.split('=')[1]

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          orders: true
        }
      })

      if (!user) {
        console.error(`❌ User with email "${email}" not found`)
        process.exit(1)
      }

      console.log(`\n🗑️  Deleting user:\n`)
      console.log(`Name: ${user.name}`)
      console.log(`Email: ${user.email}`)
      console.log(`Admin: ${user.isAdmin ? 'Yes' : 'No'}`)
      console.log(`Created: ${user.createdAt.toLocaleDateString()}`)
      console.log(`Orders: ${user.orders.length}`)

      if (user.isAdmin) {
        console.log('\n⚠️  WARNING: This is an ADMIN user!')
      }

      console.log('\n⚠️  This will delete the user and all related data!')
      console.log('Press Ctrl+C to cancel...\n')

      await deleteUserData(user.id)

      console.log(`✅ User "${user.name}" deleted successfully!`)

    } else {
      console.error('❌ Please provide a valid option')
      console.log('\nUsage:')
      console.log('  npx ts-node scripts/delete-user.ts --id=1')
      console.log('  npx ts-node scripts/delete-user.ts --email=test@example.com')
      console.log('  npx ts-node scripts/delete-user.ts --delete-test-users')
      console.log('  npx ts-node scripts/delete-user.ts --delete-all-except-admin')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Error deleting user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

deleteUser()
