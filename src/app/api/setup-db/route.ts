import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Use Prisma's db push equivalent via raw SQL
    await prisma.$executeRaw`
      CREATE TYPE IF NOT EXISTS "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')
    `
    
    await prisma.$executeRaw`
      CREATE TYPE IF NOT EXISTS "SubscriptionTier" AS ENUM ('FREE', 'PREMIUM')
    `
    
    await prisma.$executeRaw`
      CREATE TYPE IF NOT EXISTS "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PAST_DUE')
    `

    // Create users table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "name" TEXT,
        "email" TEXT UNIQUE NOT NULL,
        "emailVerified" TIMESTAMP,
        "image" TEXT,
        "password" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "subscriptionTier" "SubscriptionTier" DEFAULT 'FREE',
        "subscriptionStatus" "SubscriptionStatus" DEFAULT 'ACTIVE',
        "subscriptionEndsAt" TIMESTAMP
      )
    `

    // Create business_accounts table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "business_accounts" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "code" TEXT,
        "type" "AccountType" NOT NULL,
        "subType" TEXT,
        "balance" DECIMAL(65,30) DEFAULT 0,
        "description" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "userId" TEXT NOT NULL,
        "bankAccountId" TEXT UNIQUE,
        "bankName" TEXT,
        "accountNumber" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `

    return NextResponse.json({ message: 'Database tables created successfully!' })
  } catch (error: any) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { 
        message: 'Database setup failed', 
        error: error.message 
      },
      { status: 500 }
    )
  }
}