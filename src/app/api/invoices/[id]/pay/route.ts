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

    const {
      paymentDate,
      paymentAmount,
      paymentMethod,
      bankAccountId,
      notes,
    } = await request.json()

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
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { message: 'Invoice is already paid' },
        { status: 400 }
      )
    }

    const outstandingAmount = Number(invoice.total) - Number(invoice.paidAmount)
    const finalPaymentAmount = paymentAmount || outstandingAmount

    if (finalPaymentAmount <= 0) {
      return NextResponse.json(
        { message: 'Payment amount must be greater than zero' },
        { status: 400 }
      )
    }

    if (finalPaymentAmount > outstandingAmount) {
      return NextResponse.json(
        { message: 'Payment amount cannot exceed outstanding amount' },
        { status: 400 }
      )
    }

    // Find the cash/bank account to receive payment
    let cashAccount
    if (bankAccountId) {
      cashAccount = await prisma.businessAccount.findFirst({
        where: {
          id: bankAccountId,
          userId: session.user.id,
          type: 'ASSET',
        },
      })
    } else {
      // Default to first cash/bank account
      cashAccount = await prisma.businessAccount.findFirst({
        where: {
          userId: session.user.id,
          type: 'ASSET',
          OR: [
            { name: { contains: 'cash' } },
            { name: { contains: 'bank' } },
          ],
          isActive: true,
        },
      })
    }

    if (!cashAccount) {
      return NextResponse.json(
        { message: 'No cash or bank account found for receiving payment' },
        { status: 400 }
      )
    }

    // Find accounts receivable account
    const receivableAccount = await prisma.businessAccount.findFirst({
      where: {
        userId: session.user.id,
        type: 'ASSET',
        name: { contains: 'Receivable' },
        isActive: true,
      },
    })

    if (!receivableAccount) {
      return NextResponse.json(
        { message: 'Accounts Receivable account not found. Please create one first.' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create accounting transaction for the payment
      // Debit: Cash/Bank (increases asset)
      // Credit: Accounts Receivable (decreases asset)
      const transaction = await tx.transaction.create({
        data: {
          date: new Date(paymentDate || new Date()),
          description: `Payment received for ${invoice.invoiceNumber} - ${invoice.customer.name}`,
          reference: invoice.invoiceNumber,
          amount: finalPaymentAmount,
          debitAccountId: cashAccount.id,
          creditAccountId: receivableAccount.id,
          invoiceId: invoice.id,
          userId: session.user.id,
        },
      })

      // Update account balances
      // Cash increases (debit)
      await tx.businessAccount.update({
        where: { id: cashAccount.id },
        data: {
          balance: {
            increment: finalPaymentAmount,
          },
        },
      })

      // Accounts Receivable decreases (credit to asset account)
      await tx.businessAccount.update({
        where: { id: receivableAccount.id },
        data: {
          balance: {
            decrement: finalPaymentAmount,
          },
        },
      })

      // Update invoice
      const newPaidAmount = Number(invoice.paidAmount) + finalPaymentAmount
      const isFullyPaid = newPaidAmount >= Number(invoice.total)

      const updatedInvoice = await tx.invoice.update({
        where: { id: id },
        data: {
          paidAmount: newPaidAmount,
          status: isFullyPaid ? 'PAID' : invoice.status,
          paidDate: isFullyPaid ? new Date() : invoice.paidDate,
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

      return { transaction, invoice: updatedInvoice }
    })

    return NextResponse.json({
      message: 'Payment recorded successfully',
      transaction: result.transaction,
      invoice: {
        ...result.invoice,
        subtotal: Number(result.invoice.subtotal),
        taxAmount: Number(result.invoice.taxAmount),
        total: Number(result.invoice.total),
        paidAmount: Number(result.invoice.paidAmount),
        outstandingAmount: Number(result.invoice.total) - Number(result.invoice.paidAmount),
        items: result.invoice.items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
          taxAmount: Number(item.taxAmount),
        })),
      },
    })
  } catch (error) {
    console.error('Invoice payment error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}