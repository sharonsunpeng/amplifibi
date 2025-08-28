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
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereClause: any = {
      userId: session.user.id,
    }

    if (status) {
      whereClause.status = status
    }

    if (customerId) {
      whereClause.customerId = customerId
    }

    if (search) {
      whereClause.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { companyName: { contains: search } } },
      ]
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            total: true,
          },
        },
        _count: {
          select: {
            items: true,
            transactions: true,
          },
        },
      },
      orderBy: {
        issueDate: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const total = await prisma.invoice.count({ where: whereClause })

    return NextResponse.json({
      invoices: invoices.map(invoice => ({
        ...invoice,
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.taxAmount),
        total: Number(invoice.total),
        paidAmount: Number(invoice.paidAmount),
        outstandingAmount: Number(invoice.total) - Number(invoice.paidAmount),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Invoices fetch error:', error)
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
      customerId,
      issueDate,
      dueDate,
      items,
      notes,
      termsConditions,
      taxRate,
      gstInclusive = true,
      exemptFromGst = false,
    } = await request.json()

    // Validation
    if (!customerId || !issueDate || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Customer, issue date, and at least one item are required' },
        { status: 400 }
      )
    }

    // Verify customer belongs to user
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId: session.user.id,
      },
    })

    if (!customer) {
      return NextResponse.json(
        { message: 'Customer not found' },
        { status: 404 }
      )
    }

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { invoiceNumber: true },
    })

    let nextInvoiceNumber = 'INV-001'
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1] || '0')
      nextInvoiceNumber = `INV-${String(lastNumber + 1).padStart(3, '0')}`
    }

    // Calculate totals
    const finalTaxRate = exemptFromGst ? 0 : (taxRate !== undefined ? taxRate : 0.15) // Default 15% GST
    let itemSubtotal = 0
    
    const processedItems = items.map((item: any) => {
      const itemTotal = Number(item.quantity) * Number(item.unitPrice)
      itemSubtotal += itemTotal
      
      let itemTaxAmount = 0
      if (!exemptFromGst) {
        if (gstInclusive) {
          // GST inclusive: Tax = Total / (1 + taxRate) * taxRate
          itemTaxAmount = itemTotal / (1 + finalTaxRate) * finalTaxRate
        } else {
          // GST exclusive: Tax = Total * taxRate
          itemTaxAmount = itemTotal * finalTaxRate
        }
      }
      
      return {
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: itemTotal,
        taxRate: finalTaxRate,
        taxAmount: itemTaxAmount,
      }
    })

    // Calculate final amounts
    let taxAmount = 0
    let subtotal = itemSubtotal
    let total = itemSubtotal
    
    if (!exemptFromGst) {
      if (gstInclusive) {
        // GST inclusive: Tax = Total / (1 + taxRate) * taxRate, Subtotal = Total - Tax
        taxAmount = itemSubtotal / (1 + finalTaxRate) * finalTaxRate
        subtotal = itemSubtotal - taxAmount
        total = itemSubtotal
      } else {
        // GST exclusive: Tax = Subtotal * taxRate, Total = Subtotal + Tax
        taxAmount = itemSubtotal * finalTaxRate
        subtotal = itemSubtotal
        total = itemSubtotal + taxAmount
      }
    }

    // Calculate due date if not provided
    const finalDueDate = dueDate || new Date(
      new Date(issueDate).getTime() + (customer.paymentTerms * 24 * 60 * 60 * 1000)
    )

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: nextInvoiceNumber,
        customerId,
        userId: session.user.id,
        issueDate: new Date(issueDate),
        dueDate: new Date(finalDueDate),
        subtotal,
        taxRate: finalTaxRate,
        taxAmount,
        total,
        gstInclusive,
        exemptFromGst,
        notes,
        termsConditions,
        items: {
          create: processedItems,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
          },
        },
        items: true,
      },
    })

    return NextResponse.json({
      ...invoice,
      subtotal: Number(invoice.subtotal),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      paidAmount: Number(invoice.paidAmount),
    }, { status: 201 })
  } catch (error) {
    console.error('Invoice creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}