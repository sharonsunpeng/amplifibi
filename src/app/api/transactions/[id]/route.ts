import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get existing transaction
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Verify new accounts belong to user
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

    // Start transaction to reverse old entry and create new one
    const result = await prisma.$transaction(async (tx) => {
      // Reverse the old transaction's effect on account balances
      const getBalanceChange = (accountType: string, isDebit: boolean, amount: number) => {
        if (['ASSET', 'EXPENSE'].includes(accountType)) {
          return isDebit ? amount : -amount
        } else {
          return isDebit ? -amount : amount
        }
      }

      // Reverse old transaction
      await tx.businessAccount.update({
        where: { id: existingTransaction.debitAccountId },
        data: {
          balance: {
            increment: -getBalanceChange(existingTransaction.debitAccount.type, true, existingTransaction.amount),
          },
        },
      })

      await tx.businessAccount.update({
        where: { id: existingTransaction.creditAccountId },
        data: {
          balance: {
            increment: -getBalanceChange(existingTransaction.creditAccount.type, false, existingTransaction.amount),
          },
        },
      })

      // Update the transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id: params.id },
        data: {
          date: new Date(date),
          description,
          reference: reference || null,
          amount,
          debitAccountId,
          creditAccountId,
          categoryId: categoryId || null,
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

      // Apply new transaction
      const newDebitAccount = accounts.find(a => a.id === debitAccountId)!
      const newCreditAccount = accounts.find(a => a.id === creditAccountId)!

      await tx.businessAccount.update({
        where: { id: debitAccountId },
        data: {
          balance: {
            increment: getBalanceChange(newDebitAccount.type, true, amount),
          },
        },
      })

      await tx.businessAccount.update({
        where: { id: creditAccountId },
        data: {
          balance: {
            increment: getBalanceChange(newCreditAccount.type, false, amount),
          },
        },
      })

      return updatedTransaction
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Transaction update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get existing transaction
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { message: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Start transaction to reverse balance changes and delete
    await prisma.$transaction(async (tx) => {
      // Reverse the transaction's effect on account balances
      const getBalanceChange = (accountType: string, isDebit: boolean, amount: number) => {
        if (['ASSET', 'EXPENSE'].includes(accountType)) {
          return isDebit ? amount : -amount
        } else {
          return isDebit ? -amount : amount
        }
      }

      await tx.businessAccount.update({
        where: { id: existingTransaction.debitAccountId },
        data: {
          balance: {
            increment: -getBalanceChange(existingTransaction.debitAccount.type, true, existingTransaction.amount),
          },
        },
      })

      await tx.businessAccount.update({
        where: { id: existingTransaction.creditAccountId },
        data: {
          balance: {
            increment: -getBalanceChange(existingTransaction.creditAccount.type, false, existingTransaction.amount),
          },
        },
      })

      // Delete the transaction
      await tx.transaction.delete({
        where: { id: params.id },
      })
    })

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Transaction deletion error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}