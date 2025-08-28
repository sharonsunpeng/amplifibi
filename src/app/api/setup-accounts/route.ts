import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has accounts
    const existingAccounts = await prisma.businessAccount.findMany({
      where: { userId: session.user.id },
    })

    if (existingAccounts.length > 0) {
      return NextResponse.json({ message: 'Chart of accounts already exists' })
    }

    // Create basic chart of accounts
    const defaultAccounts = [
      // Assets
      { name: 'Cash on Hand', code: '1000', type: 'ASSET', subType: 'Current Asset', balance: 0 },
      { name: 'Business Bank Account', code: '1010', type: 'ASSET', subType: 'Current Asset', balance: 0 },
      { name: 'Accounts Receivable', code: '1100', type: 'ASSET', subType: 'Current Asset', balance: 0 },
      { name: 'Inventory', code: '1200', type: 'ASSET', subType: 'Current Asset', balance: 0 },
      { name: 'Prepaid Expenses', code: '1300', type: 'ASSET', subType: 'Current Asset', balance: 0 },
      { name: 'Equipment', code: '1500', type: 'ASSET', subType: 'Fixed Asset', balance: 0 },
      
      // Liabilities
      { name: 'Accounts Payable', code: '2000', type: 'LIABILITY', subType: 'Current Liability', balance: 0 },
      { name: 'Credit Card', code: '2100', type: 'LIABILITY', subType: 'Current Liability', balance: 0 },
      { name: 'GST Payable', code: '2200', type: 'LIABILITY', subType: 'Current Liability', balance: 0 },
      
      // Equity
      { name: 'Owner\'s Equity', code: '3000', type: 'EQUITY', subType: 'Owner\'s Equity', balance: 0 },
      { name: 'Retained Earnings', code: '3100', type: 'EQUITY', subType: 'Retained Earnings', balance: 0 },
      
      // Revenue
      { name: 'Sales Revenue', code: '4000', type: 'REVENUE', subType: 'Operating Revenue', balance: 0 },
      { name: 'Service Revenue', code: '4100', type: 'REVENUE', subType: 'Operating Revenue', balance: 0 },
      { name: 'Interest Income', code: '4500', type: 'REVENUE', subType: 'Other Revenue', balance: 0 },
      
      // Expenses
      { name: 'Cost of Goods Sold', code: '5000', type: 'EXPENSE', subType: 'Cost of Sales', balance: 0 },
      { name: 'Office Supplies', code: '6000', type: 'EXPENSE', subType: 'Operating Expense', balance: 0 },
      { name: 'Rent Expense', code: '6100', type: 'EXPENSE', subType: 'Operating Expense', balance: 0 },
      { name: 'Utilities', code: '6200', type: 'EXPENSE', subType: 'Operating Expense', balance: 0 },
      { name: 'Insurance', code: '6300', type: 'EXPENSE', subType: 'Operating Expense', balance: 0 },
      { name: 'Professional Fees', code: '6400', type: 'EXPENSE', subType: 'Operating Expense', balance: 0 },
      { name: 'Marketing & Advertising', code: '6500', type: 'EXPENSE', subType: 'Operating Expense', balance: 0 },
      { name: 'Travel & Entertainment', code: '6600', type: 'EXPENSE', subType: 'Operating Expense', balance: 0 },
      { name: 'Bank Fees', code: '6700', type: 'EXPENSE', subType: 'Operating Expense', balance: 0 },
      { name: 'General Expenses', code: '6800', type: 'EXPENSE', subType: 'Operating Expense', balance: 0 },
    ]

    const createdAccounts = await Promise.all(
      defaultAccounts.map(account =>
        prisma.businessAccount.create({
          data: {
            ...account,
            userId: session.user.id,
            description: `Default ${account.type.toLowerCase()} account`,
            isActive: true,
          },
        })
      )
    )

    // Also create some default categories
    const defaultCategories = [
      { name: 'Sales', color: '#10b981' },
      { name: 'Office Expenses', color: '#f59e0b' },
      { name: 'Travel', color: '#3b82f6' },
      { name: 'Marketing', color: '#8b5cf6' },
      { name: 'Professional Services', color: '#ef4444' },
      { name: 'Utilities', color: '#6b7280' },
    ]

    const createdCategories = await Promise.all(
      defaultCategories.map(category =>
        prisma.category.create({
          data: {
            ...category,
            userId: session.user.id,
          },
        })
      )
    )

    return NextResponse.json({
      message: 'Chart of accounts created successfully',
      accountsCreated: createdAccounts.length,
      categoriesCreated: createdCategories.length,
    })
  } catch (error) {
    console.error('Setup accounts error:', error)
    return NextResponse.json(
      { message: 'Failed to create chart of accounts' },
      { status: 500 }
    )
  }
}