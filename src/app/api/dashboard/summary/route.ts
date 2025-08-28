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

    // Get all accounts with their balances
    const accounts = await prisma.businessAccount.findMany({
      where: { 
        userId: session.user.id,
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        balance: true,
      },
      orderBy: [
        { type: 'asc' },
        { code: 'asc' }
      ]
    })

    // Calculate totals by account type
    const summary = accounts.reduce((acc, account) => {
      const balance = Number(account.balance)
      
      switch (account.type) {
        case 'ASSET':
          acc.totalAssets += balance
          break
        case 'LIABILITY':
          acc.totalLiabilities += balance
          break
        case 'EQUITY':
          acc.totalEquity += balance
          break
        case 'REVENUE':
          acc.totalRevenue += balance
          break
        case 'EXPENSE':
          acc.totalExpenses += balance
          break
      }
      return acc
    }, {
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalRevenue: 0,
      totalExpenses: 0,
    })

    // Calculate key metrics
    const netIncome = summary.totalRevenue - summary.totalExpenses
    const totalCash = accounts
      .filter(acc => 
        acc.type === 'ASSET' && 
        (acc.name.toLowerCase().includes('cash') || acc.name.toLowerCase().includes('bank'))
      )
      .reduce((sum, acc) => sum + Number(acc.balance), 0)

    // Get transaction count
    const transactionCount = await prisma.transaction.count({
      where: { userId: session.user.id }
    })

    return NextResponse.json({
      summary: {
        ...summary,
        netIncome,
        totalCash,
        transactionCount,
      },
      accounts: accounts.map(acc => ({
        ...acc,
        balance: Number(acc.balance)
      }))
    })
  } catch (error) {
    console.error('Dashboard summary error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch dashboard summary' },
      { status: 500 }
    )
  }
}