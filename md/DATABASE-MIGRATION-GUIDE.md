# Database Migration Guide: SQLite → PostgreSQL

## 📋 Overview

Hướng dẫn này sẽ giúp bạn migrate từ SQLite sang PostgreSQL cho production environment.

---

## ✅ Prerequisites

1. **PostgreSQL Database** - Cần có PostgreSQL server:
   - Local: [PostgreSQL Download](https://www.postgresql.org/download/)
   - Cloud: Vercel Postgres, AWS RDS, Supabase, Neon, Railway, etc.

2. **Backup SQLite Database** - **QUAN TRỌNG!**
   ```bash
   # Copy database file
   cp prisma/dev.db prisma/dev.db.backup
   ```

3. **Node.js packages** - Đã có `@prisma/client`, không cần thêm package mới

---

## 🔧 Step 1: Setup PostgreSQL Database

### Option A: Local PostgreSQL

1. **Install PostgreSQL:**
   - Windows: [Download PostgreSQL](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database:**
   ```bash
   # Start PostgreSQL service
   # Windows: Services → Start PostgreSQL
   # macOS/Linux: brew services start postgresql

   # Connect to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE mephuongthitheo;
   
   # Create user (optional but recommended)
   CREATE USER app_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE mephuongthitheo TO app_user;
   \q
   ```

### Option B: Cloud PostgreSQL (Recommended for Production)

**Vercel Postgres:**
```bash
# Install Vercel CLI
npm i -g vercel

# Create Postgres database
vercel postgres create mephuongthitheo-db
```

**Supabase (Free tier available):**
1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database

**Neon (Serverless PostgreSQL):**
1. Sign up at [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string

---

## 🔑 Step 2: Update Environment Variables

### Development (.env.local)
```env
# Keep SQLite for local development (optional)
DATABASE_URL="file:./dev.db"
```

### Production (.env.production)
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/mephuongthitheo?schema=public"

# Example formats:
# Local: postgresql://postgres:password@localhost:5432/mephuongthitheo
# Vercel: postgresql://user:password@host.vercel-storage.com:5432/database
# Supabase: postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
# Neon: postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
```

**Connection String Format:**
```
postgresql://[username]:[password]@[host]:[port]/[database]?schema=public
```

---

## 📦 Step 3: Update Prisma Schema

Schema đã được update để support PostgreSQL! Kiểm tra `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 🚀 Step 4: Generate Prisma Client

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate
```

---

## 📊 Step 5: Run Migrations

### Option A: Fresh Migration (New Database - Recommended)

Nếu database mới hoàn toàn, chạy migrations:

```bash
# Create and apply migrations
npx prisma migrate dev --name init_postgresql

# Or for production
npx prisma migrate deploy
```

### Option B: Migrate Existing Data

Nếu bạn có data trong SQLite cần migrate:

```bash
# 1. Export data from SQLite
npx prisma db pull --schema=./prisma/schema-sqlite.prisma  # if you kept SQLite schema

# 2. Use migration script (see Step 6)
```

---

## 🔄 Step 6: Data Migration Script

Nếu bạn có existing data trong SQLite, sử dụng script này để migrate:

**Create: `scripts/migrate-sqlite-to-postgres.ts`**

```typescript
import { PrismaClient as SQLiteClient } from '@prisma/client'
import { PrismaClient as PostgresClient } from '@prisma/client'

// Initialize clients
const sqliteClient = new PrismaClient({
  datasources: {
    db: { url: process.env.SQLITE_DATABASE_URL }
  }
})

const postgresClient = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
})

async function migrateData() {
  try {
    console.log('🔄 Starting data migration...')

    // Migrate Users
    const users = await sqliteClient.user.findMany()
    console.log(`📦 Found ${users.length} users`)
    for (const user of users) {
      await postgresClient.user.upsert({
        where: { email: user.email },
        update: {},
        create: user
      })
    }
    console.log('✅ Users migrated')

    // Migrate Products
    const products = await sqliteClient.product.findMany()
    console.log(`📦 Found ${products.length} products`)
    for (const product of products) {
      await postgresClient.product.upsert({
        where: { slug: product.slug },
        update: {},
        create: product
      })
    }
    console.log('✅ Products migrated')

    // Migrate Orders
    const orders = await sqliteClient.order.findMany({
      include: { items: true }
    })
    console.log(`📦 Found ${orders.length} orders`)
    for (const order of orders) {
      await postgresClient.order.create({
        data: {
          ...order,
          items: {
            create: order.items
          }
        }
      })
    }
    console.log('✅ Orders migrated')

    // Migrate other tables...
    // CartItems, WishlistItems, DiscountCodes, etc.

    console.log('✅ Migration completed!')
  } catch (error) {
    console.error('❌ Migration error:', error)
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

migrateData()
```

**Run migration:**
```bash
# Set both database URLs
SQLITE_DATABASE_URL="file:./dev.db" \
DATABASE_URL="postgresql://..." \
npx tsx scripts/migrate-sqlite-to-postgres.ts
```

---

## ✅ Step 7: Verify Migration

```bash
# Check database connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio

# Check tables
npx prisma db execute --stdin < prisma/migrations/.../migration.sql
```

---

## 🔧 Step 8: Update Application Code

Code không cần thay đổi! Prisma client tự động handle differences giữa SQLite và PostgreSQL.

**Lưu ý:**
- ✅ Transactions work better trong PostgreSQL
- ✅ Better performance với indexes
- ✅ Support JSON queries (nếu cần sau này)

---

## 🚨 Troubleshooting

### Error: "relation does not exist"
```bash
# Run migrations
npx prisma migrate deploy
```

### Error: "connection refused"
- Kiểm tra PostgreSQL service đang chạy
- Kiểm tra connection string đúng
- Kiểm tra firewall/network

### Error: "authentication failed"
- Kiểm tra username/password
- Kiểm tra database user permissions

### Reset database (development only):
```bash
npx prisma migrate reset
```

---

## 📝 Configuration for Both Environments

### Development (SQLite)
```env
# .env.local
DATABASE_URL="file:./dev.db"
```

### Production (PostgreSQL)
```env
# .env.production
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Dual Environment Setup (Optional)

Nếu muốn dùng PostgreSQL cho cả dev và production:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'
  
  // Detect provider from URL
  const isPostgres = databaseUrl.startsWith('postgresql://')
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    // PostgreSQL-specific optimizations
    ...(isPostgres && {
      // Connection pool settings
    })
  })
}
```

---

## 🎯 Production Checklist

- [ ] PostgreSQL database created
- [ ] Environment variables updated
- [ ] Prisma schema updated to PostgreSQL
- [ ] Backup SQLite database
- [ ] Run migrations on production
- [ ] Verify data migration (if applicable)
- [ ] Test application with PostgreSQL
- [ ] Monitor performance
- [ ] Setup database backups
- [ ] Configure connection pooling (if needed)

---

## 📊 Benefits of PostgreSQL

1. **Better Performance**
   - Faster queries với indexes
   - Better query optimization
   - Support complex queries

2. **Scalability**
   - Handle concurrent connections
   - Better for high traffic
   - Connection pooling support

3. **Features**
   - JSON/JSONB support
   - Full-text search
   - Advanced data types
   - Transactions

4. **Production Ready**
   - Enterprise-grade reliability
   - Better backup/restore
   - Security features

---

## 🔄 Rollback Plan

Nếu cần rollback về SQLite:

1. **Restore backup:**
   ```bash
   cp prisma/dev.db.backup prisma/dev.db
   ```

2. **Update schema:**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. **Regenerate client:**
   ```bash
   npx prisma generate
   ```

---

## 📚 Additional Resources

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase Docs](https://supabase.com/docs)

---

## ❓ Support

Nếu gặp vấn đề trong quá trình migration:
1. Kiểm tra Prisma logs
2. Verify connection string
3. Check database permissions
4. Review migration scripts

---

**Migration completed successfully! 🎉**

