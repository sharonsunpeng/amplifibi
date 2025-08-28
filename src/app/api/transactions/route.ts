import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        debitAccount: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        creditAccount: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
      skip: offset,
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { 
      date, 
      description, 
      reference, 
      amount, 
      debitAccountId, 
      creditAccountId, 
      categoryId 
    } = await request.json()

    // Validation
    if (!date || !description || !amount || !debitAccountId || !creditAccountId) {
      return NextResponse.json(
        { message: 'Date, description, amount, debit account, and credit account are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { message: 'Amount must be greater than zero' },
        { status: 400 }
      )
    }

    if (debitAccountId === creditAccountId) {
      return NextResponse.json(
        { message: 'Debit and credit accounts must be different' },
        { status: 400 }
      )
    }

    // Verify accounts belong to user
    const accounts = await prisma.businessAccount.findMany({
      where: {
        id: { in: [debitAccountId, creditAccountId] },
        userId: session.user.id,
      },
    })

    if (accounts.length !== 2) {
      return NextResponse.json(
        { message: 'Invalid account selection' },
        { status: 400 }
      )
    }

    // Verify category belongs to user (if provided)
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: session.user.id,
        },
      })

      if (!category) {
        return NextResponse.json(
          { message: 'Invalid category selection' },
          { status: 400 }
        )
      }
    }

    // Start transaction to update accounts and create transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          date: new Date(date),
          description,
          reference: reference || null,
          amount,
          debitAccountId,
          creditAccountId,
          categoryId: categoryId || null,
          userId: session.user.id,
        },
        include: {
          debitAccount: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
            },
          },
          creditAccount: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      })

      // Update account balances based on accounting rules
      const debitAccount = accounts.find(a => a.id === debitAccountId)!
      const creditAccount = accounts.find(a => a.id === creditAccountId)!

      // Calculate balance changes based on account types
      // Standard accounting equation: Assets = Liabilities + Equity + Revenue - Expenses
      // Normal balances: Assets (Debit), Liabilities (Credit), Equity (Credit), Revenue (Credit), Expenses (Debit)
      const getBalanceChange = (accountType: string, isDebit: boolean) => {
        // Assets and Expenses have normal debit balances (increase with debits, decrease with credits)
        if (['ASSET', 'EXPENSE'].includes(accountType)) {
          return isDebit ? amount : -amount
        } 
        // Liabilities, Equity, and Revenue have normal credit balances (increase with credits, decrease with debits)
        else if (['LIABILITY', 'EQUITY', 'REVENUE'].includes(accountType)) {
          return isDebit ? -amount : amount
        }
        // Default fallback
        return 0
      }

      await tx.businessAccount.update({
        where: { id: debitAccountId },
        data: {
          balance: {
            increment: getBalanceChange(debitAccount.type, true),
          },
        },
      })

      await tx.businessAccount.update({
        where: { id: creditAccountId },
        data: {
          balance: {
            increment: getBalanceChange(creditAccount.type, false),
          },
        },
      })

      return transaction
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Transaction creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}