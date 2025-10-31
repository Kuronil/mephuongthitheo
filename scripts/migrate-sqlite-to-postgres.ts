/**
 * Data Migration Script: SQLite → PostgreSQL
 * 
 * Usage:
 *   SQLITE_DATABASE_URL="file:./dev.db" \
 *   DATABASE_URL="postgresql://user:password@host:5432/database" \
 *   npx tsx scripts/migrate-sqlite-to-postgres.ts
 * 
 * Or with ts-node:
 *   ts-node scripts/migrate-sqlite-to-postgres.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// Custom Prisma clients for different databases
const getSqliteClient = () => {
  const sqliteUrl = process.env.SQLITE_DATABASE_URL || 'file:./prisma/dev.db'
  return new PrismaClient({
    datasources: {
      db: { url: sqliteUrl }
    }
  })
}

const getPostgresClient = () => {
  const postgresUrl = process.env.DATABASE_URL
  if (!postgresUrl || !postgresUrl.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string')
  }
  return new PrismaClient({
    datasources: {
      db: { url: postgresUrl }
    }
  })
}

interface MigrationStats {
  users: number
  products: number
  orders: number
  orderItems: number
  cartItems: number
  wishlistItems: number
  discountCodes: number
  reviews: number
  notifications: number
  loyaltyTransactions: number
  adminLogs: number
  productHistory: number
  orderHistory: number
  orderStatusLogs: number
}

async function migrateData() {
  const sqliteClient = getSqliteClient()
  const postgresClient = getPostgresClient()
  
  const stats: MigrationStats = {
    users: 0,
    products: 0,
    orders: 0,
    orderItems: 0,
    cartItems: 0,
    wishlistItems: 0,
    discountCodes: 0,
    reviews: 0,
    notifications: 0,
    loyaltyTransactions: 0,
    adminLogs: 0,
    productHistory: 0,
    orderHistory: 0,
    orderStatusLogs: 0
  }

  try {
    console.log('🔄 Starting data migration from SQLite to PostgreSQL...\n')

    // Test connections
    await sqliteClient.$connect()
    console.log('✅ Connected to SQLite database')
    
    await postgresClient.$connect()
    console.log('✅ Connected to PostgreSQL database\n')

    // 1. Migrate Users
    console.log('📦 Migrating Users...')
    const users = await sqliteClient.user.findMany()
    console.log(`   Found ${users.length} users`)
    
    for (const user of users) {
      await postgresClient.user.upsert({
        where: { email: user.email },
        update: {},
        create: user
      })
    }
    stats.users = users.length
    console.log(`✅ Migrated ${users.length} users\n`)

    // 2. Migrate Products
    console.log('📦 Migrating Products...')
    const products = await sqliteClient.product.findMany()
    console.log(`   Found ${products.length} products`)
    
    for (const product of products) {
      await postgresClient.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product
      })
    }
    stats.products = products.length
    console.log(`✅ Migrated ${products.length} products\n`)

    // 3. Migrate Discount Codes
    console.log('📦 Migrating Discount Codes...')
    const discountCodes = await sqliteClient.discountCode.findMany()
    console.log(`   Found ${discountCodes.length} discount codes`)
    
    for (const code of discountCodes) {
      await postgresClient.discountCode.upsert({
        where: { code: code.code },
        update: {},
        create: code
      })
    }
    stats.discountCodes = discountCodes.length
    console.log(`✅ Migrated ${discountCodes.length} discount codes\n`)

    // 4. Migrate Orders (with items)
    console.log('📦 Migrating Orders...')
    const orders = await sqliteClient.order.findMany({
      include: { items: true }
    })
    console.log(`   Found ${orders.length} orders`)
    
    for (const order of orders) {
      // Check if order already exists
      const existingOrder = await postgresClient.order.findUnique({
        where: { id: order.id }
      })
      
      if (!existingOrder) {
        await postgresClient.order.create({
          data: {
            ...order,
            userId: order.userId || undefined,
            items: {
              create: order.items.map((item: any) => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image || undefined
              }))
            }
          }
        })
        stats.orders++
        stats.orderItems += order.items.length
      }
    }
    console.log(`✅ Migrated ${stats.orders} orders with ${stats.orderItems} order items\n`)

    // 5. Migrate Cart Items
    console.log('📦 Migrating Cart Items...')
    const cartItems = await sqliteClient.cartItem.findMany()
    console.log(`   Found ${cartItems.length} cart items`)
    
    for (const item of cartItems) {
      // Skip if user/product doesn't exist in PostgreSQL
      const userExists = await postgresClient.user.findUnique({ where: { id: item.userId } })
      const productExists = await postgresClient.product.findUnique({ where: { id: item.productId } })
      
      if (userExists && productExists) {
        await postgresClient.cartItem.upsert({
          where: { id: item.id },
          update: {},
          create: item
        })
        stats.cartItems++
      }
    }
    console.log(`✅ Migrated ${stats.cartItems} cart items\n`)

    // 6. Migrate Wishlist Items
    console.log('📦 Migrating Wishlist Items...')
    const wishlistItems = await sqliteClient.wishlistItem.findMany()
    console.log(`   Found ${wishlistItems.length} wishlist items`)
    
    for (const item of wishlistItems) {
      const userExists = await postgresClient.user.findUnique({ where: { id: item.userId } })
      const productExists = await postgresClient.product.findUnique({ where: { id: item.productId } })
      
      if (userExists && productExists) {
        await postgresClient.wishlistItem.upsert({
          where: { id: item.id },
          update: {},
          create: item
        })
        stats.wishlistItems++
      }
    }
    console.log(`✅ Migrated ${stats.wishlistItems} wishlist items\n`)

    // 7. Migrate Product Reviews
    console.log('📦 Migrating Product Reviews...')
    const reviews = await sqliteClient.productReview.findMany()
    console.log(`   Found ${reviews.length} reviews`)
    
    for (const review of reviews) {
      const userExists = await postgresClient.user.findUnique({ where: { id: review.userId } })
      const productExists = await postgresClient.product.findUnique({ where: { id: review.productId } })
      
      if (userExists && productExists) {
        await postgresClient.productReview.upsert({
          where: { id: review.id },
          update: {},
          create: review
        })
        stats.reviews++
      }
    }
    console.log(`✅ Migrated ${stats.reviews} reviews\n`)

    // 8. Migrate Notifications
    console.log('📦 Migrating Notifications...')
    const notifications = await sqliteClient.notification.findMany()
    console.log(`   Found ${notifications.length} notifications`)
    
    for (const notification of notifications) {
      if (!notification.userId) {
        // Global notification
        await postgresClient.notification.create({ data: notification })
      } else {
        const userExists = await postgresClient.user.findUnique({ where: { id: notification.userId } })
        if (userExists) {
          await postgresClient.notification.upsert({
            where: { id: notification.id },
            update: {},
            create: notification
          })
        }
      }
      stats.notifications++
    }
    console.log(`✅ Migrated ${stats.notifications} notifications\n`)

    // 9. Migrate Loyalty Transactions
    console.log('📦 Migrating Loyalty Transactions...')
    const loyaltyTransactions = await sqliteClient.loyaltyTransaction.findMany()
    console.log(`   Found ${loyaltyTransactions.length} loyalty transactions`)
    
    for (const transaction of loyaltyTransactions) {
      const userExists = await postgresClient.user.findUnique({ where: { id: transaction.userId } })
      
      if (userExists) {
        await postgresClient.loyaltyTransaction.create({
          data: {
            ...transaction,
            orderId: transaction.orderId || undefined
          }
        })
        stats.loyaltyTransactions++
      }
    }
    console.log(`✅ Migrated ${stats.loyaltyTransactions} loyalty transactions\n`)

    // 10. Migrate Order Status Logs
    console.log('📦 Migrating Order Status Logs...')
    const statusLogs = await sqliteClient.orderStatusLog.findMany()
    console.log(`   Found ${statusLogs.length} order status logs`)
    
    for (const log of statusLogs) {
      const orderExists = await postgresClient.order.findUnique({ where: { id: log.orderId } })
      const userExists = await postgresClient.user.findUnique({ where: { id: log.changedBy } })
      
      if (orderExists && userExists) {
        await postgresClient.orderStatusLog.create({ data: log })
        stats.orderStatusLogs++
      }
    }
    console.log(`✅ Migrated ${stats.orderStatusLogs} order status logs\n`)

    // 11. Migrate Admin Logs
    console.log('📦 Migrating Admin Logs...')
    const adminLogs = await sqliteClient.adminLog.findMany()
    console.log(`   Found ${adminLogs.length} admin logs`)
    
    for (const log of adminLogs) {
      const userExists = await postgresClient.user.findUnique({ where: { id: log.adminId } })
      
      if (userExists) {
        await postgresClient.adminLog.create({ data: log })
        stats.adminLogs++
      }
    }
    console.log(`✅ Migrated ${stats.adminLogs} admin logs\n`)

    // 12. Migrate Product History
    console.log('📦 Migrating Product History...')
    const productHistory = await sqliteClient.productHistory.findMany()
    console.log(`   Found ${productHistory.length} product history entries`)
    
    for (const history of productHistory) {
      const productExists = await postgresClient.product.findUnique({ where: { id: history.productId } })
      const userExists = await postgresClient.user.findUnique({ where: { id: history.changedBy } })
      
      if (productExists && userExists) {
        await postgresClient.productHistory.create({ data: history })
        stats.productHistory++
      }
    }
    console.log(`✅ Migrated ${stats.productHistory} product history entries\n`)

    // 13. Migrate Order History
    console.log('📦 Migrating Order History...')
    const orderHistory = await sqliteClient.orderHistory.findMany()
    console.log(`   Found ${orderHistory.length} order history entries`)
    
    for (const history of orderHistory) {
      const orderExists = await postgresClient.order.findUnique({ where: { id: history.orderId } })
      const userExists = await postgresClient.user.findUnique({ where: { id: history.changedBy } })
      
      if (orderExists && userExists) {
        await postgresClient.orderHistory.create({ data: history })
        stats.orderHistory++
      }
    }
    console.log(`✅ Migrated ${stats.orderHistory} order history entries\n`)

    // Print summary
    console.log('='.repeat(50))
    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!')
    console.log('='.repeat(50))
    console.log('\n📊 Migration Statistics:')
    console.log(`   Users: ${stats.users}`)
    console.log(`   Products: ${stats.products}`)
    console.log(`   Orders: ${stats.orders}`)
    console.log(`   Order Items: ${stats.orderItems}`)
    console.log(`   Cart Items: ${stats.cartItems}`)
    console.log(`   Wishlist Items: ${stats.wishlistItems}`)
    console.log(`   Discount Codes: ${stats.discountCodes}`)
    console.log(`   Reviews: ${stats.reviews}`)
    console.log(`   Notifications: ${stats.notifications}`)
    console.log(`   Loyalty Transactions: ${stats.loyaltyTransactions}`)
    console.log(`   Admin Logs: ${stats.adminLogs}`)
    console.log(`   Product History: ${stats.productHistory}`)
    console.log(`   Order History: ${stats.orderHistory}`)
    console.log(`   Order Status Logs: ${stats.orderStatusLogs}`)
    console.log('\n🎉 All data has been migrated to PostgreSQL!')

  } catch (error) {
    console.error('\n❌ Migration Error:', error)
    throw error
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
    console.log('\n✅ Database connections closed')
  }
}

// Run migration
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('\n✅ Migration script completed')
      process.exit(0)
    })
    .catch((error: unknown) => {
      console.error('\n❌ Migration failed:', error)
      process.exit(1)
    })
}

export { migrateData }

