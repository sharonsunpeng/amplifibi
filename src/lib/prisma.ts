import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with safe configuration
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
  errorFormat: 'minimal',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Only attempt connection in runtime, not during build
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  prisma.$connect().catch((err) => {
    console.warn('Database connection failed during initialization:', err.message)
  })
}