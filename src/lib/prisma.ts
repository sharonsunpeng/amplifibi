import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with proper error handling for Vercel
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'minimal',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful connection handling
prisma.$connect().catch((err) => {
  console.warn('Database connection failed during initialization:', err.message)
})