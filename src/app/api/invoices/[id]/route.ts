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

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        customer: true,
        items: {
          orderBy: { createdAt: 'asc' },
        },
        transactions: {
          select: {
            id: true,
            date: true,
            description: true,
            amount: true,
          },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...invoice,
      subtotal: Number(invoice.subtotal),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      paidAmount: Number(invoice.paidAmount),
      outstandingAmount: Number(invoice.total) - Number(invoice.paidAmount),
      items: invoice.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        taxAmount: Number(item.taxAmount),
      })),
    })
  } catch (error) {
    console.error('Invoice fetch error:', error)
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
      customerId,
      issueDate,
      dueDate,
      items,
      notes,
      termsConditions,
      status,
      taxRate,
    } = await request.json()

    // Verify invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Only allow editing of draft invoices or status updates
    if (existingInvoice.status !== 'DRAFT' && items) {
      return NextResponse.json(
        { message: 'Cannot edit items of a sent invoice. Only status can be updated.' },
        { status: 400 }
      )
    }

    // If updating customer, verify they belong to user
    if (customerId && customerId !== existingInvoice.customerId) {
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
    }

    let updateData: any = {
      notes,
      termsConditions,
    }

    // Only update these fields if invoice is still draft
    if (existingInvoice.status === 'DRAFT') {
      if (customerId) updateData.customerId = customerId
      if (issueDate) updateData.issueDate = new Date(issueDate)
      if (dueDate) updateData.dueDate = new Date(dueDate)
      
      // Update items if provided
      if (items && items.length > 0) {
        const finalTaxRate = taxRate !== undefined ? taxRate : Number(existingInvoice.taxRate)
        let subtotal = 0
        
        const processedItems = items.map((item: any) => {
          const itemTotal = Number(item.quantity) * Number(item.unitPrice)
          subtotal += itemTotal
          
          return {
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            total: itemTotal,
            taxRate: finalTaxRate,
            taxAmount: itemTotal * finalTaxRate,
          }
        })

        const taxAmount = subtotal * finalTaxRate
        const total = subtotal + taxAmount

        updateData.subtotal = subtotal
        updateData.taxRate = finalTaxRate
        updateData.taxAmount = taxAmount
        updateData.total = total
        
        // Delete existing items and create new ones
        await prisma.invoiceItem.deleteMany({
          where: { invoiceId: id },
        })

        updateData.items = {
          create: processedItems,
        }
      }
    }

    // Status can always be updated
    if (status) {
      updateData.status = status
      
      // Set paid date if status is PAID
      if (status === 'PAID' && existingInvoice.status !== 'PAID') {
        updateData.paidDate = new Date()
        updateData.paidAmount = existingInvoice.total
      }
      
      // Clear paid date if status is changed from PAID
      if (status !== 'PAID' && existingInvoice.status === 'PAID') {
        updateData.paidDate = null
        updateData.paidAmount = 0
      }
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: id },
      data: updateData,
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
        transactions: {
          select: {
            id: true,
            date: true,
            description: true,
            amount: true,
          },
        },
      },
    })

    return NextResponse.json({
      ...updatedInvoice,
      subtotal: Number(updatedInvoice.subtotal),
      taxAmount: Number(updatedInvoice.taxAmount),
      total: Number(updatedInvoice.total),
      paidAmount: Number(updatedInvoice.paidAmount),
      outstandingAmount: Number(updatedInvoice.total) - Number(updatedInvoice.paidAmount),
      items: updatedInvoice.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        taxAmount: Number(item.taxAmount),
      })),
    })
  } catch (error) {
    console.error('Invoice update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Check if invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: { 
        id: id,
        userId: session.user.id 
      },
    })

    if (!existingInvoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 })
    }

    // Only allow certain fields to be updated via PATCH
    const allowedUpdates = ['status', 'notes']
    const updates = Object.keys(body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key]
        return obj
      }, {} as any)

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No valid updates provided' }, { status: 400 })
    }

    // Handle status changes
    if (updates.status) {
      if (updates.status === 'PAID' && existingInvoice.status !== 'PAID') {
        updates.paidDate = new Date()
        updates.paidAmount = existingInvoice.total
      } else if (updates.status !== 'PAID' && existingInvoice.status === 'PAID') {
        updates.paidDate = null
        updates.paidAmount = 0
      }
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
            companyName: true,
            taxNumber: true,
          },
        },
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    return NextResponse.json({
      ...updatedInvoice,
      subtotal: Number(updatedInvoice.subtotal),
      taxAmount: Number(updatedInvoice.taxAmount),
      total: Number(updatedInvoice.total),
      paidAmount: Number(updatedInvoice.paidAmount),
      outstandingAmount: Number(updatedInvoice.total) - Number(updatedInvoice.paidAmount),
      items: updatedInvoice.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        taxAmount: Number(item.taxAmount),
      })),
    })
  } catch (error) {
    console.error('Invoice patch error:', error)
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

    // Verify invoice exists and belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        transactions: true,
      },
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check if invoice has been paid or has transactions
    if (existingInvoice.status === 'PAID' || existingInvoice.transactions.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete a paid invoice or invoice with transactions. Please cancel it instead.' },
        { status: 400 }
      )
    }

    // Delete invoice and its items (cascade will handle items)
    await prisma.invoice.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error('Invoice deletion error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}