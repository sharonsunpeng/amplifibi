'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

interface Account {
  id: string
  name: string
  code: string | null
  type: string
}

interface Category {
  id: string
  name: string
  color: string | null
}

interface QuickTransactionFormProps {
  open: boolean
  onClose: () => void
  onSave: () => void
}

export default function QuickTransactionForm({ open, onClose, onSave }: QuickTransactionFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>('income')
  const [formData, setFormData] = useState({
    date: new Date(),
    description: '',
    amount: 0,
    accountId: '', // The primary account (cash/bank for income/expense, source for transfer)
    categoryId: '',
    reference: '',
    transferToAccountId: '', // Only for transfers
  })

  useEffect(() => {
    if (open) {
      fetchAccounts()
      fetchCategories()
    }
  }, [open])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const data = await response.json()
        
        // If no accounts exist, set up default chart of accounts
        if (data.length === 0) {
          const setupResponse = await fetch('/api/setup-accounts', {
            method: 'POST',
          })
          
          if (setupResponse.ok) {
            // Refetch accounts after setup
            const newResponse = await fetch('/api/accounts')
            if (newResponse.ok) {
              const newData = await newResponse.json()
              setAccounts(newData)
              
              // Auto-select first cash/bank account
              const cashAccount = newData.find((acc: Account) => 
                acc.type === 'ASSET' && (
                  acc.name.toLowerCase().includes('cash') || 
                  acc.name.toLowerCase().includes('bank')
                )
              )
              if (cashAccount) {
                setFormData(prev => ({ ...prev, accountId: cashAccount.id }))
              }
            }
          }
        } else {
          setAccounts(data)
          
          // Auto-select first cash/bank account for income/expense
          const cashAccount = data.find((acc: Account) => 
            acc.type === 'ASSET' && (
              acc.name.toLowerCase().includes('cash') || 
              acc.name.toLowerCase().includes('bank') ||
              acc.name.toLowerCase().includes('checking')
            )
          )
          if (cashAccount && !formData.accountId) {
            setFormData(prev => ({ ...prev, accountId: cashAccount.id }))
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      // Validate form
      if (!formData.description || !formData.accountId || formData.amount <= 0) {
        setError('Please fill in all required fields')
        return
      }

      if (transactionType === 'transfer' && !formData.transferToAccountId) {
        setError('Please select a destination account for the transfer')
        return
      }

      if (transactionType === 'transfer' && formData.accountId === formData.transferToAccountId) {
        setError('Source and destination accounts must be different')
        return
      }

      // Determine debit and credit accounts based on transaction type
      let debitAccountId = ''
      let creditAccountId = ''

      if (transactionType === 'income') {
        // Income: Debit Cash/Bank, Credit Revenue
        debitAccountId = formData.accountId // Cash/Bank account
        
        // Find appropriate revenue account based on category or use default
        let revenueAccount
        if (formData.categoryId) {
          const category = categories.find(cat => cat.id === formData.categoryId)
          if (category?.name.toLowerCase().includes('sales')) {
            revenueAccount = accounts.find(acc => acc.type === 'REVENUE' && acc.name.toLowerCase().includes('sales'))
          } else if (category?.name.toLowerCase().includes('service')) {
            revenueAccount = accounts.find(acc => acc.type === 'REVENUE' && acc.name.toLowerCase().includes('service'))
          }
        }
        
        // Fallback to first revenue account
        if (!revenueAccount) {
          revenueAccount = accounts.find(acc => acc.type === 'REVENUE')
        }
        
        if (!revenueAccount) {
          setError('No revenue account found. Please create a revenue account first.')
          return
        }
        creditAccountId = revenueAccount.id
      } else if (transactionType === 'expense') {
        // Expense: Debit Expense, Credit Cash/Bank
        let expenseAccount
        
        // Find appropriate expense account based on category
        if (formData.categoryId) {
          const category = categories.find(cat => cat.id === formData.categoryId)
          if (category) {
            // Try to match category to expense account
            expenseAccount = accounts.find(acc => 
              acc.type === 'EXPENSE' && 
              acc.name.toLowerCase().includes(category.name.toLowerCase())
            )
            
            // If no exact match, try partial matches
            if (!expenseAccount) {
              const categoryWords = category.name.toLowerCase().split(' ')
              expenseAccount = accounts.find(acc => 
                acc.type === 'EXPENSE' && 
                categoryWords.some(word => acc.name.toLowerCase().includes(word))
              )
            }
          }
        }
        
        // Fallback to general expense account
        if (!expenseAccount) {
          expenseAccount = accounts.find(acc => 
            acc.type === 'EXPENSE' && 
            (acc.name.toLowerCase().includes('general') || acc.name.toLowerCase().includes('expense'))
          )
        }
        
        // Ultimate fallback to first expense account
        if (!expenseAccount) {
          expenseAccount = accounts.find(acc => acc.type === 'EXPENSE')
        }
        
        if (!expenseAccount) {
          setError('No expense account found. Please create an expense account first.')
          return
        }
        debitAccountId = expenseAccount.id
        creditAccountId = formData.accountId // Cash/Bank account
      } else if (transactionType === 'transfer') {
        // Transfer: Debit destination account, Credit source account
        debitAccountId = formData.transferToAccountId
        creditAccountId = formData.accountId
      }

      // Create transaction
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date.toISOString(),
          description: formData.description,
          reference: formData.reference || null,
          amount: formData.amount,
          debitAccountId,
          creditAccountId,
          categoryId: formData.categoryId || null,
        }),
      })

      if (response.ok) {
        onSave()
        handleClose()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to create transaction')
      }
    } catch (error) {
      setError('An error occurred while creating the transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      date: new Date(),
      description: '',
      amount: 0,
      accountId: '',
      categoryId: '',
      reference: '',
      transferToAccountId: '',
    })
    setError('')
    setTransactionType('income')
    onClose()
  }

  const getCashAccounts = () => {
    return accounts.filter(acc => 
      acc.type === 'ASSET' && (
        acc.name.toLowerCase().includes('cash') || 
        acc.name.toLowerCase().includes('bank') ||
        acc.name.toLowerCase().includes('checking') ||
        acc.name.toLowerCase().includes('savings')
      )
    )
  }

  const getExpenseCategories = () => {
    return categories.filter(cat => cat.name.toLowerCase().includes('expense'))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ pt: 1 }}>
            {/* Transaction Type Tabs */}
            <Tabs 
              value={transactionType} 
              onChange={(_, newValue) => setTransactionType(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label="Income" value="income" />
              <Tab label="Expense" value="expense" />
              <Tab label="Transfer" value="transfer" />
            </Tabs>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => setFormData({ ...formData, date: newValue || new Date() })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder={
                    transactionType === 'income' ? 'e.g., Client payment, Sales revenue' :
                    transactionType === 'expense' ? 'e.g., Office supplies, Rent payment' :
                    'e.g., Transfer to savings account'
                  }
                />
              </Grid>

              {/* Account Selection based on transaction type */}
              <Grid item xs={12} md={transactionType === 'transfer' ? 6 : 12}>
                <FormControl fullWidth required>
                  <InputLabel>
                    {transactionType === 'income' ? 'Deposit to Account' :
                     transactionType === 'expense' ? 'Pay from Account' :
                     'From Account'}
                  </InputLabel>
                  <Select
                    value={formData.accountId}
                    label={
                      transactionType === 'income' ? 'Deposit to Account' :
                      transactionType === 'expense' ? 'Pay from Account' :
                      'From Account'
                    }
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  >
                    {getCashAccounts().map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.code ? `${account.code} - ` : ''}{account.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Transfer destination account */}
              {transactionType === 'transfer' && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>To Account</InputLabel>
                    <Select
                      value={formData.transferToAccountId}
                      label="To Account"
                      onChange={(e) => setFormData({ ...formData, transferToAccountId: e.target.value })}
                    >
                      {accounts
                        .filter(acc => acc.id !== formData.accountId)
                        .map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.code ? `${account.code} - ` : ''}{account.name} ({account.type})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Category for income and expense */}
              {transactionType !== 'transfer' && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.categoryId}
                      label="Category"
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Invoice #, Check #, etc."
                />
              </Grid>
            </Grid>

            {/* Transaction Preview */}
            {formData.amount > 0 && formData.accountId && (
              <Card sx={{ mt: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Accounting Entry Preview:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {transactionType === 'income' && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            <strong>Debit:</strong> {accounts.find(a => a.id === formData.accountId)?.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#10b981' }}>
                            +{formatCurrency(formData.amount)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            <strong>Credit:</strong> Revenue
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#10b981' }}>
                            +{formatCurrency(formData.amount)}
                          </Typography>
                        </Box>
                      </>
                    )}
                    {transactionType === 'expense' && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            <strong>Debit:</strong> Expense
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#ef4444' }}>
                            +{formatCurrency(formData.amount)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            <strong>Credit:</strong> {accounts.find(a => a.id === formData.accountId)?.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#ef4444' }}>
                            -{formatCurrency(formData.amount)}
                          </Typography>
                        </Box>
                      </>
                    )}
                    {transactionType === 'transfer' && formData.transferToAccountId && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            <strong>Debit:</strong> {accounts.find(a => a.id === formData.transferToAccountId)?.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#3b82f6' }}>
                            +{formatCurrency(formData.amount)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            <strong>Credit:</strong> {accounts.find(a => a.id === formData.accountId)?.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#3b82f6' }}>
                            -{formatCurrency(formData.amount)}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !formData.description || !formData.accountId || formData.amount <= 0}
          >
            {loading ? 'Creating...' : 'Create Transaction'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}