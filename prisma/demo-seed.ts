import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting demo data seeding...')
  
  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('Demo123!', 12)
  
  // Create FREE demo user
  console.log('👤 Creating FREE demo user...')
  const freeUser = await prisma.user.upsert({
    where: { email: 'demo.free@amplifibi.com' },
    update: {},
    create: {
      email: 'demo.free@amplifibi.com',
      name: 'Sarah Johnson',
      password: hashedPassword,
      subscriptionTier: 'FREE',
      subscriptionStatus: 'ACTIVE',
      gstRegistered: true,
      gstNumber: 'GST123456789',
      gstReturnFrequency: 'BI_MONTHLY'
    }
  })
  
  // Create PREMIUM demo user
  console.log('👤 Creating PREMIUM demo user...')
  const premiumUser = await prisma.user.upsert({
    where: { email: 'demo.premium@amplifibi.com' },
    update: {},
    create: {
      email: 'demo.premium@amplifibi.com',
      name: 'Michael Chen',
      password: hashedPassword,
      subscriptionTier: 'PREMIUM',
      subscriptionStatus: 'ACTIVE',
      gstRegistered: true,
      gstNumber: 'GST987654321',
      gstReturnFrequency: 'SIX_MONTHLY'
    }
  })
  
  // Create chart of accounts for both users
  const accountTypes = [
    // Assets
    { name: 'Business Bank Account', code: '1000', type: 'ASSET', subType: 'Current Asset', balance: 25000 },
    { name: 'Accounts Receivable', code: '1200', type: 'ASSET', subType: 'Current Asset', balance: 8500 },
    { name: 'Office Equipment', code: '1500', type: 'ASSET', subType: 'Fixed Asset', balance: 12000 },
    { name: 'Computer Equipment', code: '1520', type: 'ASSET', subType: 'Fixed Asset', balance: 8000 },
    
    // Liabilities
    { name: 'Accounts Payable', code: '2000', type: 'LIABILITY', subType: 'Current Liability', balance: 3500 },
    { name: 'GST Payable', code: '2200', type: 'LIABILITY', subType: 'Current Liability', balance: 2100 },
    { name: 'Credit Card', code: '2100', type: 'LIABILITY', subType: 'Current Liability', balance: 1500 },
    
    // Equity
    { name: 'Owner Equity', code: '3000', type: 'EQUITY', subType: 'Owner Equity', balance: 45000 },
    { name: 'Retained Earnings', code: '3200', type: 'EQUITY', subType: 'Retained Earnings', balance: 1400 },
    
    // Revenue
    { name: 'Consulting Revenue', code: '4000', type: 'REVENUE', subType: 'Operating Revenue', balance: 45000 },
    { name: 'Product Sales', code: '4100', type: 'REVENUE', subType: 'Operating Revenue', balance: 28000 },
    
    // Expenses
    { name: 'Office Rent', code: '5000', type: 'EXPENSE', subType: 'Operating Expense', balance: 3600 },
    { name: 'Utilities', code: '5100', type: 'EXPENSE', subType: 'Operating Expense', balance: 800 },
    { name: 'Marketing', code: '5200', type: 'EXPENSE', subType: 'Operating Expense', balance: 2400 },
    { name: 'Professional Services', code: '5300', type: 'EXPENSE', subType: 'Operating Expense', balance: 1800 },
  ]
  
  console.log('💼 Creating business accounts...')
  for (const user of [freeUser, premiumUser]) {
    for (const account of accountTypes) {
      // Check if account already exists for this user
      const existingAccount = await prisma.businessAccount.findFirst({
        where: {
          userId: user.id,
          code: account.code
        }
      })
      
      if (!existingAccount) {
        await prisma.businessAccount.create({
          data: {
            ...account,
            userId: user.id,
          }
        })
      }
    }
  }
  
  // Create categories for both users
  const categories = [
    { name: 'Office Supplies', description: 'Stationery, equipment, etc.', color: '#3b82f6' },
    { name: 'Marketing & Advertising', description: 'Online ads, brochures, events', color: '#ef4444' },
    { name: 'Professional Services', description: 'Legal, accounting, consulting', color: '#10b981' },
    { name: 'Travel & Entertainment', description: 'Business trips, client meetings', color: '#f59e0b' },
    { name: 'Utilities', description: 'Phone, internet, electricity', color: '#8b5cf6' },
    { name: 'Software & Subscriptions', description: 'Business software, SaaS tools', color: '#06b6d4' },
  ]
  
  console.log('📂 Creating transaction categories...')
  for (const user of [freeUser, premiumUser]) {
    for (const category of categories) {
      // Check if category already exists for this user
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId: user.id,
          name: category.name
        }
      })
      
      if (!existingCategory) {
        await prisma.category.create({
          data: {
            ...category,
            userId: user.id,
          }
        })
      }
    }
  }
  
  // Create customers for both users
  const customers = [
    {
      name: 'Auckland Tech Ltd',
      email: 'accounts@aucklandtech.co.nz',
      phone: '+64 9 555 0123',
      companyName: 'Auckland Tech Ltd',
      taxNumber: 'GST555000123',
      address: '123 Queen Street',
      city: 'Auckland',
      state: 'Auckland',
      postalCode: '1010',
      country: 'New Zealand',
      paymentTerms: 30
    },
    {
      name: 'Wellington Consulting',
      email: 'billing@wellingtonconsulting.co.nz',
      phone: '+64 4 555 0456',
      companyName: 'Wellington Consulting Group',
      taxNumber: 'GST555000456',
      address: '456 Lambton Quay',
      city: 'Wellington',
      state: 'Wellington',
      postalCode: '6011',
      country: 'New Zealand',
      paymentTerms: 14
    },
    {
      name: 'Christchurch Retail Co',
      email: 'finance@christchurchretail.co.nz',
      phone: '+64 3 555 0789',
      companyName: 'Christchurch Retail Co',
      taxNumber: 'GST555000789',
      address: '789 Cashel Street',
      city: 'Christchurch',
      state: 'Canterbury',
      postalCode: '8011',
      country: 'New Zealand',
      paymentTerms: 30
    },
    {
      name: 'Hamilton Manufacturing',
      email: 'admin@hamiltonmfg.co.nz',
      phone: '+64 7 555 0321',
      companyName: 'Hamilton Manufacturing Ltd',
      taxNumber: 'GST555000321',
      address: '321 Victoria Street',
      city: 'Hamilton',
      state: 'Waikato',
      postalCode: '3204',
      country: 'New Zealand',
      paymentTerms: 45
    },
    {
      name: 'Dunedin Services',
      email: 'contact@dunedinservices.co.nz',
      phone: '+64 3 555 0654',
      companyName: 'Dunedin Services Ltd',
      taxNumber: null, // Not GST registered
      address: '654 George Street',
      city: 'Dunedin',
      state: 'Otago',
      postalCode: '9016',
      country: 'New Zealand',
      paymentTerms: 20
    }
  ]
  
  console.log('👥 Creating customers...')
  const createdCustomers = []
  for (const user of [freeUser, premiumUser]) {
    const userCustomers = []
    for (const customer of customers) {
      const created = await prisma.customer.create({
        data: {
          ...customer,
          userId: user.id,
        }
      })
      userCustomers.push(created)
    }
    createdCustomers.push({ userId: user.id, customers: userCustomers })
  }
  
  // Create invoices with different GST scenarios
  console.log('🧾 Creating sample invoices...')
  
  for (const userCustomers of createdCustomers) {
    const user = userCustomers.userId === freeUser.id ? freeUser : premiumUser
    const customers = userCustomers.customers
    const userPrefix = user.id === freeUser.id ? 'F' : 'P'
    
    // Invoice 1: GST Inclusive
    const invoice1 = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${userPrefix}001`,
        customerId: customers[0].id,
        userId: user.id,
        issueDate: new Date('2024-11-01'),
        dueDate: new Date('2024-12-01'),
        status: 'PAID',
        paidDate: new Date('2024-11-28'),
        subtotal: 4347.83, // Exclusive amount
        taxRate: 0.15,
        taxAmount: 652.17, // 15% GST
        total: 5000, // Inclusive total
        paidAmount: 5000,
        gstInclusive: true,
        exemptFromGst: false,
        notes: 'Consulting services for Q4 2024'
      }
    })
    
    await prisma.invoiceItem.createMany({
      data: [
        {
          invoiceId: invoice1.id,
          description: 'Strategic Business Consulting',
          quantity: 40,
          unitPrice: 100,
          total: 4000,
          taxRate: 0.15,
          taxAmount: 521.74
        },
        {
          invoiceId: invoice1.id,
          description: 'Market Analysis Report',
          quantity: 1,
          unitPrice: 1000,
          total: 1000,
          taxRate: 0.15,
          taxAmount: 130.43
        }
      ]
    })
    
    // Invoice 2: GST Exclusive
    const invoice2 = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${userPrefix}002`,
        customerId: customers[1].id,
        userId: user.id,
        issueDate: new Date('2024-11-15'),
        dueDate: new Date('2024-11-29'),
        status: 'SENT',
        subtotal: 3000,
        taxRate: 0.15,
        taxAmount: 450,
        total: 3450,
        paidAmount: 0,
        gstInclusive: false,
        exemptFromGst: false,
        notes: 'Software development services'
      }
    })
    
    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice2.id,
        description: 'Custom Software Development',
        quantity: 30,
        unitPrice: 100,
        total: 3000,
        taxRate: 0.15,
        taxAmount: 450
      }
    })
    
    // Invoice 3: GST Exempt (for non-GST registered customer)
    const invoice3 = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${userPrefix}003`,
        customerId: customers[4].id, // Dunedin Services (no GST)
        userId: user.id,
        issueDate: new Date('2024-12-01'),
        dueDate: new Date('2024-12-21'),
        status: 'DRAFT',
        subtotal: 1200,
        taxRate: 0,
        taxAmount: 0,
        total: 1200,
        paidAmount: 0,
        gstInclusive: false,
        exemptFromGst: true,
        notes: 'Training services - GST exempt'
      }
    })
    
    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice3.id,
        description: 'Staff Training Workshop',
        quantity: 8,
        unitPrice: 150,
        total: 1200,
        taxRate: 0,
        taxAmount: 0
      }
    })
    
    // Invoice 4: Overdue
    const invoice4 = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${userPrefix}004`,
        customerId: customers[2].id,
        userId: user.id,
        issueDate: new Date('2024-10-15'),
        dueDate: new Date('2024-11-15'),
        status: 'OVERDUE',
        subtotal: 2173.91,
        taxRate: 0.15,
        taxAmount: 326.09,
        total: 2500,
        paidAmount: 0,
        gstInclusive: true,
        exemptFromGst: false,
        notes: 'Monthly retainer - October 2024'
      }
    })
    
    await prisma.invoiceItem.create({
      data: {
        invoiceId: invoice4.id,
        description: 'Monthly Retainer Services',
        quantity: 1,
        unitPrice: 2500,
        total: 2500,
        taxRate: 0.15,
        taxAmount: 326.09
      }
    })
  }
  
  // Create sample transactions
  console.log('💰 Creating financial transactions...')
  
  for (const user of [freeUser, premiumUser]) {
    // Get user's accounts
    const userAccounts = await prisma.businessAccount.findMany({
      where: { userId: user.id }
    })
    
    const bankAccount = userAccounts.find(a => a.name === 'Business Bank Account')
    const revenueAccount = userAccounts.find(a => a.name === 'Consulting Revenue')
    const expenseAccount = userAccounts.find(a => a.name === 'Office Rent')
    const gstPayable = userAccounts.find(a => a.name === 'GST Payable')
    const accountsReceivable = userAccounts.find(a => a.name === 'Accounts Receivable')
    
    if (bankAccount && revenueAccount && expenseAccount && gstPayable && accountsReceivable) {
      // Revenue transaction
      await prisma.transaction.create({
        data: {
          date: new Date('2024-11-28'),
          description: 'Invoice payment received - Auckland Tech Ltd',
          reference: 'INV-001',
          amount: 5000,
          debitAccountId: bankAccount.id,
          creditAccountId: revenueAccount.id,
          userId: user.id
        }
      })
      
      // Expense transaction
      await prisma.transaction.create({
        data: {
          date: new Date('2024-11-01'),
          description: 'Monthly office rent payment',
          reference: 'RENT-NOV24',
          amount: 1500,
          debitAccountId: expenseAccount.id,
          creditAccountId: bankAccount.id,
          userId: user.id
        }
      })
      
      // GST transaction
      await prisma.transaction.create({
        data: {
          date: new Date('2024-11-15'),
          description: 'GST payment to IRD',
          reference: 'GST-SEP24',
          amount: 1200,
          debitAccountId: gstPayable.id,
          creditAccountId: bankAccount.id,
          userId: user.id
        }
      })
    }
  }
  
  console.log('✅ Demo data seeding completed!')
  console.log('\n📋 Demo User Accounts Created:')
  console.log('🆓 FREE User: demo.free@amplifibi.com (Password: Demo123!)')
  console.log('   - Sarah Johnson\'s Business')
  console.log('   - GST Registered: Yes (Bi-monthly returns)')
  console.log('   - Sample data: 5 customers, 4 invoices, financial transactions')
  console.log('')
  console.log('💎 PREMIUM User: demo.premium@amplifibi.com (Password: Demo123!)')
  console.log('   - Michael Chen\'s Business')
  console.log('   - GST Registered: Yes (Six-monthly returns)')
  console.log('   - Same sample data + access to premium features')
  console.log('')
  console.log('🧾 Invoice Scenarios:')
  console.log('   - GST Inclusive invoice (paid)')
  console.log('   - GST Exclusive invoice (sent)')
  console.log('   - GST Exempt invoice (draft)')
  console.log('   - Overdue invoice')
  console.log('')
  console.log('💰 Financial Data:')
  console.log('   - Complete chart of accounts')
  console.log('   - Sample transactions')
  console.log('   - Realistic account balances')
  console.log('   - Multiple GST scenarios')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding demo data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })