import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  id: string
}

export async function POST(
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
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        transactions: {
          where: {
            description: {
              contains: 'Invoice created',
            },
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check if sale has already been recorded
    if (invoice.transactions.length > 0) {
      return NextResponse.json(
        { message: 'Sale has already been recorded for this invoice' },
        { status: 400 }
      )
    }

    // Find required accounts
    const receivableAccount = await prisma.businessAccount.findFirst({
      where: {
        userId: session.user.id,
        type: 'ASSET',
        name: { contains: 'Receivable' },
        isActive: true,
      },
    })

    const revenueAccount = await prisma.businessAccount.findFirst({
      where: {
        userId: session.user.id,
        type: 'REVENUE',
        OR: [
          { name: { contains: 'Sales' } },
          { name: { contains: 'Service' } },
          { name: { contains: 'Revenue' } },
        ],
        isActive: true,
      },
    })

    if (!receivableAccount || !revenueAccount) {
      return NextResponse.json(
        { message: 'Required accounts (Accounts Receivable and Revenue) not found. Please check your chart of accounts.' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create accounting transaction for the sale
      // Debit: Accounts Receivable (increases asset)
      // Credit: Revenue (increases revenue)
      const transaction = await tx.transaction.create({
        data: {
          date: invoice.issueDate,
          description: `Invoice created ${invoice.invoiceNumber} - ${invoice.customer.name}`,
          reference: invoice.invoiceNumber,
          amount: Number(invoice.total),
          debitAccountId: receivableAccount.id,
          creditAccountId: revenueAccount.id,
          invoiceId: invoice.id,
          userId: session.user.id,
        },
      })

      // Update account balances
      // Accounts Receivable increases (debit to asset)
      await tx.businessAccount.update({
        where: { id: receivableAccount.id },
        data: {
          balance: {
            increment: Number(invoice.total),
          },
        },
      })

      // Revenue increases (credit to revenue)
      await tx.businessAccount.update({
        where: { id: revenueAccount.id },
        data: {
          balance: {
            increment: Number(invoice.total),
          },
        },
      })

      // Update invoice status to SENT if it's still DRAFT
      let updatedInvoice = invoice
      if (invoice.status === 'DRAFT') {
        updatedInvoice = await tx.invoice.update({
          where: { id: id },
          data: {
            status: 'SENT',
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
          },
        })
      }

      return { transaction, invoice: updatedInvoice }
    })

    return NextResponse.json({
      message: 'Sale recorded successfully',
      transaction: {
        ...result.transaction,
        amount: Number(result.transaction.amount),
      },
      invoice: {
        ...result.invoice,
        subtotal: Number(result.invoice.subtotal),
        taxAmount: Number(result.invoice.taxAmount),
        total: Number(result.invoice.total),
        paidAmount: Number(result.invoice.paidAmount),
      },
    })
  } catch (error) {
    console.error('Record sale error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}