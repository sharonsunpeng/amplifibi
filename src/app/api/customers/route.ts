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
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereClause = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { companyName: { contains: search } },
        ],
      }),
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
            dueDate: true,
          },
        },
        _count: {
          select: {
            invoices: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
      skip: offset,
    })

    // Calculate totals for each customer
    const customersWithTotals = customers.map(customer => ({
      ...customer,
      totalInvoiced: customer.invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
      totalOutstanding: customer.invoices
        .filter(inv => ['SENT', 'VIEWED', 'OVERDUE'].includes(inv.status))
        .reduce((sum, inv) => sum + Number(inv.total), 0),
      invoiceCount: customer._count.invoices,
    }))

    const total = await prisma.customer.count({ where: whereClause })

    return NextResponse.json({
      customers: customersWithTotals,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Customers fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Customer POST request received')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('No session or user ID found')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', session.user.id)
    
    const requestData = await request.json()
    console.log('Request data received:', requestData)
    
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      companyName,
      taxNumber,
      paymentTerms,
    } = requestData

    // Validation
    if (!name) {
      console.log('Validation failed: name is required')
      return NextResponse.json(
        { message: 'Customer name is required' },
        { status: 400 }
      )
    }
    
    console.log('Validation passed, creating customer with name:', name)

    // Check if customer with same email already exists (if email provided)
    if (email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          userId: session.user.id,
          email: email,
        },
      })

      if (existingCustomer) {
        return NextResponse.json(
          { message: 'Customer with this email already exists' },
          { status: 400 }
        )
      }
    }

    console.log('About to create customer in database')
    
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        country: country || 'New Zealand',
        companyName,
        taxNumber,
        paymentTerms: paymentTerms || 30,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            invoices: true,
          },
        },
      },
    })

    console.log('Customer created successfully:', customer.id)
    return NextResponse.json(customer, { status: 201 })
  } catch (error: any) {
    console.error('Customer creation error:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}