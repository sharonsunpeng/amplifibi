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

    // Delete all transactions for this user
    await prisma.transaction.deleteMany({
      where: { userId: session.user.id }
    })

    // Reset all account balances to 0
    await prisma.businessAccount.updateMany({
      where: { userId: session.user.id },
      data: { balance: 0 }
    })

    return NextResponse.json({ 
      message: 'All transaction data reset successfully. Account balances reset to zero.' 
    })
  } catch (error) {
    console.error('Reset data error:', error)
    return NextResponse.json(
      { message: 'Failed to reset data' },
      { status: 500 }
    )
  }
}