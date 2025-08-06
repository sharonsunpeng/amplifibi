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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
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

    // Create default chart of accounts for new user
    await createDefaultAccounts(user.id)

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // More detailed error reporting
    const errorMessage = error?.message || 'Internal server error'
    console.error('Detailed error:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
    
    return NextResponse.json(
      { 
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error'
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