import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Create a properly typed PrismaClient instance with error handling
const prismaClientSingleton = () => {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    })
  } catch (error) {
    console.error('Failed to create Prisma Client:', error)
    throw error
  }
}

export const prisma = global.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Don't connect on import - let Prisma connect lazily when needed
// This prevents errors during SSR of client components

