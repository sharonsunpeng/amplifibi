'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export const dynamic = 'force-dynamic'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Paper,
  Grid,
  Avatar,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Receipt,
  ArrowForward,
  FilterList,
  Search,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

interface Transaction {
  id: string
  date: string
  description: string
  reference: string | null
  amount: number
  debitAccount: {
    id: string
    name: string
    code: string | null
    type: string
  }
  creditAccount: {
    id: string
    name: string
    code: string | null
    type: string
  }
  category: {
    id: string
    name: string
    color: string | null
  } | null
}

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

export default function TransactionsPage() {
  // Skip useSession during SSR/build  
  const { data: session } = typeof window !== 'undefined' ? useSession() : { data: null }
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    date: new Date(),
    description: '',
    reference: '',
    amount: 0,
    debitAccountId: '',
    creditAccountId: '',
    categoryId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchTransactions(),
        fetchAccounts(),
        fetchCategories(),
      ])
    } catch (error) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    const response = await fetch('/api/transactions')
    if (response.ok) {
      const data = await response.json()
      setTransactions(data)
    }
  }

  const fetchAccounts = async () => {
    const response = await fetch('/api/accounts')
    if (response.ok) {
      const data = await response.json()
      setAccounts(data)
    }
  }

  const fetchCategories = async () => {
    const response = await fetch('/api/categories')
    if (response.ok) {
      const data = await response.json()
      setCategories(data)
    }
  }

  const handleSaveTransaction = async () => {
    try {
      if (formData.debitAccountId === formData.creditAccountId) {
        setError('Debit and credit accounts must be different')
        return
      }

      if (formData.amount <= 0) {
        setError('Amount must be greater than zero')
        return
      }

      const url = editingTransaction ? `/api/transactions/${editingTransaction.id}` : '/api/transactions'
      const method = editingTransaction ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: formData.date.toISOString(),
        }),
      })

      if (response.ok) {
        await fetchTransactions()
        handleCloseDialog()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to save transaction')
      }
    } catch (error) {
      setError('An error occurred while saving the transaction')
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTransactions()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to delete transaction')
      }
    } catch (error) {
      setError('An error occurred while deleting the transaction')
    }
  }

  const handleOpenDialog = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction)
      setFormData({
        date: new Date(transaction.date),
        description: transaction.description,
        reference: transaction.reference || '',
        amount: transaction.amount,
        debitAccountId: transaction.debitAccount.id,
        creditAccountId: transaction.creditAccount.id,
        categoryId: transaction.category?.id || '',
      })
    } else {
      setEditingTransaction(null)
      setFormData({
        date: new Date(),
        description: '',
        reference: '',
        amount: 0,
        debitAccountId: '',
        creditAccountId: '',
        categoryId: '',
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingTransaction(null)
    setError('')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ')
  }

  const getAccountsByType = (type: string) => {
    return accounts.filter(account => account.type === type)
  }

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.debitAccount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.creditAccount.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading transactions...</Typography>
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Transactions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Record and manage your business transactions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add Transaction
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    size="small"
                  >
                    Filter
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Double Entry</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(transaction.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {transaction.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.reference || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                              Dr: {transaction.debitAccount.name}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {transaction.debitAccount.code}
                            </Typography>
                          </Box>
                          <ArrowForward sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                              Cr: {transaction.creditAccount.name}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {transaction.creditAccount.code}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {transaction.category ? (
                          <Chip
                            label={transaction.category.name}
                            size="small"
                            sx={{
                              backgroundColor: transaction.category.color || '#e2e8f0',
                              color: 'white',
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(transaction)}
                          sx={{ mr: 1 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          sx={{ color: '#ef4444' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No transactions found. Create your first transaction to get started.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Add/Edit Transaction Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={(newValue) => setFormData({ ...formData, date: newValue || new Date() })}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: { mb: 2 }
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
                    sx={{ mb: 2 }}
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
                    sx={{ mb: 2 }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    sx={{ mb: 2 }}
                    helperText="Optional reference number"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
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
              </Grid>

              {/* Double Entry Section */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                Double Entry Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Debit Account</InputLabel>
                    <Select
                      value={formData.debitAccountId}
                      label="Debit Account"
                      onChange={(e) => setFormData({ ...formData, debitAccountId: e.target.value })}
                      required
                    >
                      {accounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.code ? `${account.code} - ` : ''}{account.name} ({account.type})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Credit Account</InputLabel>
                    <Select
                      value={formData.creditAccountId}
                      label="Credit Account"
                      onChange={(e) => setFormData({ ...formData, creditAccountId: e.target.value })}
                      required
                    >
                      {accounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.code ? `${account.code} - ` : ''}{account.name} ({account.type})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Double Entry Preview */}
              {formData.debitAccountId && formData.creditAccountId && formData.amount > 0 && (
                <Card sx={{ mt: 2, backgroundColor: '#f8fafc' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Journal Entry Preview:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Dr: {accounts.find(a => a.id === formData.debitAccountId)?.name}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#10b981' }}>
                          {formatCurrency(formData.amount)}
                        </Typography>
                      </Box>
                      <ArrowForward sx={{ color: 'text.secondary' }} />
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Cr: {accounts.find(a => a.id === formData.creditAccountId)?.name}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#ef4444' }}>
                          {formatCurrency(formData.amount)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSaveTransaction}
              variant="contained"
              disabled={!formData.description || !formData.debitAccountId || !formData.creditAccountId || formData.amount <= 0}
            >
              {editingTransaction ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}