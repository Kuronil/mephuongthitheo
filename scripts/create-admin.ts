/**
 * Script to create an admin user for development
 * Usage: npx ts-node scripts/create-admin.ts
 * Or with custom email/password: npx ts-node scripts/create-admin.ts admin@example.com Password123
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin(email?: string, password?: string) {
  try {
    const adminEmail = email || 'admin@mephuongthitheo.com'
    const adminPassword = password || 'Admin123'
    const adminName = 'Admin User'

    console.log(`🔍 Checking if user exists: ${adminEmail}`)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingUser) {
      console.log(`⚠️  User with email ${adminEmail} already exists`)
      console.log(`   Updating to admin and verifying email...`)
      
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          isAdmin: true,
          emailVerified: true
        }
      })

      console.log(`✅ Updated user to admin: ${updatedUser.name} (${updatedUser.email})`)
      console.log(`   User ID: ${updatedUser.id}`)
      console.log(`   Is Admin: ${updatedUser.isAdmin}`)
      console.log(`   Email Verified: ${updatedUser.emailVerified}`)
      return
    }

    console.log(`📝 Creating new admin user...`)
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        address: '123 Admin Street',
        phone: '0123456789',
        isAdmin: true,
        emailVerified: true, // Auto-verify for dev
        loyaltyPoints: 0,
        loyaltyTier: 'BRONZE'
      }
    })

    console.log(`✅ Successfully created admin user!`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Is Admin: ${user.isAdmin}`)
    console.log(`   Email Verified: ${user.emailVerified}`)
    console.log(`\n💡 You can now login with:`)
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    
  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email and password from command line arguments
const email = process.argv[2]
const password = process.argv[3]

createAdmin(email, password)

