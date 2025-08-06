import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Test database connection first
    try {
      await prisma.$connect()
      console.log('Database connected successfully')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { message: 'Database connection failed. Please try again later.' },
        { status: 503 }
      )
    }

    // Check if user already exists
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({
        where: { email }
      })
    } catch (findError: any) {
      console.error('User lookup failed:', findError)
      
      // If table doesn't exist, provide a helpful error
      if (findError.code === 'P2021' || findError.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            message: 'Database not initialized. Please contact support.',
            needsSetup: true
          },
          { status: 503 }
        )
      }
      throw findError
    }

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with retry logic
    let user
    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          subscriptionTier: 'FREE',
          subscriptionStatus: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionTier: true,
          createdAt: true,
        },
      })
    } catch (createError: any) {
      console.error('User creation failed:', createError)
      
      return NextResponse.json(
        { 
          message: 'Failed to create user account',
          error: createError.message,
          code: createError.code
        },
        { status: 500 }
      )
    }

    // Try to create default accounts, but don't fail if it doesn't work
    try {
      await createDefaultAccounts(user.id)
    } catch (accountError) {
      console.warn('Default accounts creation failed, but user was created:', accountError)
    }

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    
    return NextResponse.json(
      { 
        message: 'Registration failed',
        error: error?.message || 'Internal server error',
        code: error?.code,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

async function createDefaultAccounts(userId: string) {
  const defaultAccounts = [
    // Assets
    { name: 'Cash and Bank', code: '1000', type: 'ASSET', subType: 'Current Assets' },
    { name: 'Accounts Receivable', code: '1200', type: 'ASSET', subType: 'Current Assets' },
    { name: 'Office Equipment', code: '1500', type: 'ASSET', subType: 'Fixed Assets' },
    
    // Liabilities
    { name: 'Accounts Payable', code: '2000', type: 'LIABILITY', subType: 'Current Liabilities' },
    { name: 'GST Payable', code: '2100', type: 'LIABILITY', subType: 'Current Liabilities' },
    
    // Equity
    { name: 'Owner\'s Equity', code: '3000', type: 'EQUITY', subType: 'Capital' },
    { name: 'Retained Earnings', code: '3200', type: 'EQUITY', subType: 'Retained Earnings' },
    
    // Revenue
    { name: 'Sales Revenue', code: '4000', type: 'REVENUE', subType: 'Operating Revenue' },
    { name: 'Other Income', code: '4900', type: 'REVENUE', subType: 'Other Revenue' },
    
    // Expenses
    { name: 'Office Expenses', code: '5000', type: 'EXPENSE', subType: 'Operating Expenses' },
    { name: 'Marketing Expenses', code: '5100', type: 'EXPENSE', subType: 'Operating Expenses' },
    { name: 'Professional Fees', code: '5200', type: 'EXPENSE', subType: 'Operating Expenses' },
  ]

  await prisma.businessAccount.createMany({
    data: defaultAccounts.map(account => ({
      ...account,
      userId,
      balance: 0,
      isActive: true,
    })),
  })
}