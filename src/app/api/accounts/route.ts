import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await prisma.businessAccount.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { type: 'asc' },
        { code: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Accounts fetch error:', error)
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

    // Check if account code already exists for this user
    if (code) {
      const existingAccount = await prisma.businessAccount.findFirst({
        where: {
          userId: session.user.id,
          code: code,
        },
      })

      if (existingAccount) {
        return NextResponse.json(
          { message: 'Account code already exists' },
          { status: 400 }
        )
      }
    }

    const account = await prisma.businessAccount.create({
      data: {
        name,
        code: code || null,
        type,
        subType: subType || null,
        balance: balance || 0,
        userId: session.user.id,
        isActive: true,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Account creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}