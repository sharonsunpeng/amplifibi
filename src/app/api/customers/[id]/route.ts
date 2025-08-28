import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            issueDate: true,
            dueDate: true,
            subtotal: true,
            taxAmount: true,
            total: true,
            paidAmount: true,
          },
          orderBy: {
            issueDate: 'desc',
          },
        },
        _count: {
          select: {
            invoices: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Calculate customer statistics
    const stats = {
      totalInvoiced: customer.invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
      totalPaid: customer.invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0),
      totalOutstanding: customer.invoices
        .filter(inv => !['PAID', 'CANCELLED'].includes(inv.status))
        .reduce((sum, inv) => sum + (Number(inv.total) - Number(inv.paidAmount)), 0),
      overdueAmount: customer.invoices
        .filter(inv => inv.status === 'OVERDUE')
        .reduce((sum, inv) => sum + (Number(inv.total) - Number(inv.paidAmount)), 0),
      invoiceCount: customer._count.invoices,
    }

    return NextResponse.json({
      ...customer,
      stats,
    })
  } catch (error) {
    console.error('Customer fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

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
    } = await request.json()

    // Verify customer exists and belongs to user
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Validation
    if (!name) {
      return NextResponse.json(
        { message: 'Customer name is required' },
        { status: 400 }
      )
    }

    // Check if email is being changed and conflicts with another customer
    if (email && email !== existingCustomer.email) {
      const emailConflict = await prisma.customer.findFirst({
        where: {
          userId: session.user.id,
          email: email,
          id: { not: id },
        },
      })

      if (emailConflict) {
        return NextResponse.json(
          { message: 'Another customer with this email already exists' },
          { status: 400 }
        )
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: id },
      data: {
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
      },
      include: {
        _count: {
          select: {
            invoices: true,
          },
        },
      },
    })

    return NextResponse.json(updatedCustomer)
  } catch (error) {
    console.error('Customer update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Verify customer exists and belongs to user
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: id,
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

    if (!existingCustomer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if customer has invoices
    if (existingCustomer._count.invoices > 0) {
      return NextResponse.json(
        { message: 'Cannot delete customer with existing invoices. Please delete or reassign invoices first.' },
        { status: 400 }
      )
    }

    await prisma.customer.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('Customer deletion error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}