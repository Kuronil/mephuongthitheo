// Quick script to check database status
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to Neon PostgreSQL database!\n')

    // Count records in each table
    const stats = {
      users: await prisma.user.count(),
      products: await prisma.product.count(),
      orders: await prisma.order.count(),
      cartItems: await prisma.cartItem.count(),
      wishlistItems: await prisma.wishlistItem.count(),
      reviews: await prisma.productReview.count(),
      discountCodes: await prisma.discountCode.count(),
      notifications: await prisma.notification.count(),
    }

    console.log('📊 Database Statistics:')
    console.log('='.repeat(40))
    Object.entries(stats).forEach(([table, count]) => {
      console.log(`  ${table.padEnd(20)}: ${count}`)
    })
    console.log('='.repeat(40))

    const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0)
    
    if (totalRecords === 0) {
      console.log('\n✅ Database is empty and ready for use!')
      console.log('💡 Next steps:')
      console.log('   - Seed initial data: npm run seed (if available)')
      console.log('   - Or use Prisma Studio: npx prisma studio')
      console.log('   - Or start using the application: npm run dev')
    } else {
      console.log(`\n📦 Database contains ${totalRecords} records`)
    }

    await prisma.$disconnect()
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkDatabase()








