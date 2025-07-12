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

    const { name, code, type, subType, balance } = await request.json()

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { message: 'Name and type are required' },
        { status: 400 }
      )
    }

    if (!['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].includes(type)) {
      return NextResponse.json(
        { message: 'Invalid account type' },
        { status: 400 }
      )
    }

    // Check if account exists and belongs to user
    const existingAccount = await prisma.businessAccount.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingAccount) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      )
    }

    // Check if account code already exists for this user (excluding current account)
    if (code && code !== existingAccount.code) {
      const duplicateAccount = await prisma.businessAccount.findFirst({
        where: {
          userId: session.user.id,
          code: code,
          id: { not: params.id },
        },
      })

      if (duplicateAccount) {
        return NextResponse.json(
          { message: 'Account code already exists' },
          { status: 400 }
        )
      }
    }

    const account = await prisma.businessAccount.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        code: code || null,
        type,
        subType: subType || null,
        balance: balance || 0,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Account update error:', error)
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

    // Check if account exists and belongs to user
    const existingAccount = await prisma.businessAccount.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingAccount) {
      return NextResponse.json(
        { message: 'Account not found' },
        { status: 404 }
      )
    }

    // Check if account has transactions
    const transactionCount = await prisma.transaction.count({
      where: {
        OR: [
          { debitAccountId: params.id },
          { creditAccountId: params.id },
        ],
      },
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete account with existing transactions' },
        { status: 400 }
      )
    }

    await prisma.businessAccount.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}