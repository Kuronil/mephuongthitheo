/**
 * Script to set a user as admin
 * Usage: npx ts-node scripts/set-admin.ts <email>
 * Example: npx ts-node scripts/set-admin.ts admin@example.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setAdmin(email: string) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`)
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      process.exit(1)
    }

    // Update user to be admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isAdmin: true }
    })

    console.log(`✅ Successfully set ${updatedUser.name} (${updatedUser.email}) as admin`)
    console.log(`   User ID: ${updatedUser.id}`)
    
  } catch (error) {
    console.error('❌ Error setting admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npx ts-node scripts/set-admin.ts <email>')
  console.log('Example: npx ts-node scripts/set-admin.ts admin@example.com')
  process.exit(1)
}

setAdmin(email)



