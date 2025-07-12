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

    const categories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories fetch error:', error)
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

    const { name, description, color } = await request.json()

    // Validation
    if (!name) {
      return NextResponse.json(
        { message: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category name already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name: name,
      },
    })

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Category name already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        color: color || null,
        userId: session.user.id,
        isSystem: false,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}