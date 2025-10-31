/**
 * Script to list all users in the database
 * Usage: npx ts-node scripts/list-users.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    console.log('📋 Listing all users...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (users.length === 0) {
      console.log('No users found in database')
      return
    }

    console.log(`Found ${users.length} user(s):\n`)
    
    users.forEach((user, index) => {
      const adminBadge = user.isAdmin ? '👑 ADMIN' : ''
      console.log(`${index + 1}. ${user.name} ${adminBadge}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error listing users:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()



