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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    // Get all accounts for the user
    const accounts = await prisma.businessAccount.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
      },
    })

    // Get transactions within the date range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        debitAccount: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        creditAccount: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    // Calculate account balances for the period
    const accountBalances = new Map<string, number>()
    
    // Initialize balances
    accounts.forEach(account => {
      accountBalances.set(account.id, 0)
    })

    // Process transactions to calculate period activity
    transactions.forEach(transaction => {
      const debitAccountType = transaction.debitAccount.type
      const creditAccountType = transaction.creditAccount.type
      const amount = transaction.amount

      // Apply transaction effects based on account types
      const applyTransactionEffect = (accountId: string, accountType: string, isDebit: boolean, amount: number) => {
        const currentBalance = accountBalances.get(accountId) || 0
        
        // Standard accounting rules:
        // Assets and Expenses increase with debits, decrease with credits
        // Liabilities, Equity, and Revenue increase with credits, decrease with debits
        let effect = 0
        if (['ASSET', 'EXPENSE'].includes(accountType)) {
          effect = isDebit ? amount : -amount
        } else {
          effect = isDebit ? -amount : amount
        }
        
        accountBalances.set(accountId, currentBalance + effect)
      }

      applyTransactionEffect(transaction.debitAccountId, debitAccountType, true, amount)
      applyTransactionEffect(transaction.creditAccountId, creditAccountType, false, amount)
    })

    // Generate Profit & Loss Report
    const revenueAccounts = accounts.filter(account => account.type === 'REVENUE')
    const expenseAccounts = accounts.filter(account => account.type === 'EXPENSE')

    const revenue = revenueAccounts.map(account => ({
      account: account.name,
      amount: Math.abs(accountBalances.get(account.id) || 0), // Revenue is shown as positive
    })).filter(item => item.amount > 0)

    const expenses = expenseAccounts.map(account => ({
      account: account.name,
      amount: accountBalances.get(account.id) || 0, // Expenses are shown as positive
    })).filter(item => item.amount > 0)

    const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0)
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
    const netIncome = totalRevenue - totalExpenses

    // Generate Balance Sheet Report (using current balances, not period activity)
    const assetAccounts = accounts.filter(account => account.type === 'ASSET')
    const liabilityAccounts = accounts.filter(account => account.type === 'LIABILITY')
    const equityAccounts = accounts.filter(account => account.type === 'EQUITY')

    const assets = assetAccounts.map(account => ({
      account: account.name,
      amount: account.balance,
    })).filter(item => item.amount !== 0)

    const liabilities = liabilityAccounts.map(account => ({
      account: account.name,
      amount: Math.abs(account.balance), // Show as positive
    })).filter(item => item.amount !== 0)

    const equity = equityAccounts.map(account => ({
      account: account.name,
      amount: Math.abs(account.balance), // Show as positive
    })).filter(item => item.amount !== 0)

    // Add retained earnings (net income) to equity
    if (netIncome !== 0) {
      equity.push({
        account: 'Retained Earnings (Current Period)',
        amount: Math.abs(netIncome),
      })
    }

    const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0)
    const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0)
    const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0)

    const reportData = {
      profitLoss: {
        revenue,
        expenses,
        totalRevenue,
        totalExpenses,
        netIncome,
      },
      balanceSheet: {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
      },
      period: {
        startDate,
        endDate,
      },
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Reports generation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}