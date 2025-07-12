'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  AccountBalance,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material'

interface Account {
  id: string
  name: string
  code: string | null
  type: string
  subType: string | null
  balance: number
  isActive: boolean
}

const AccountTypeColors: Record<string, string> = {
  ASSET: '#10b981',
  LIABILITY: '#f59e0b',
  EQUITY: '#8b5cf6',
  REVENUE: '#3b82f6',
  EXPENSE: '#ef4444',
}

export default function AccountsPage() {
  const { data: session } = useSession()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'ASSET',
    subType: '',
    balance: 0,
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      } else {
        setError('Failed to fetch accounts')
      }
    } catch (error) {
      setError('An error occurred while fetching accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAccount = async () => {
    try {
      const url = editingAccount ? `/api/accounts/${editingAccount.id}` : '/api/accounts'
      const method = editingAccount ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchAccounts()
        handleCloseDialog()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to save account')
      }
    } catch (error) {
      setError('An error occurred while saving the account')
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return

    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAccounts()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to delete account')
      }
    } catch (error) {
      setError('An error occurred while deleting the account')
    }
  }

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditingAccount(account)
      setFormData({
        name: account.name,
        code: account.code || '',
        type: account.type,
        subType: account.subType || '',
        balance: account.balance,
      })
    } else {
      setEditingAccount(null)
      setFormData({
        name: '',
        code: '',
        type: 'ASSET',
        subType: '',
        balance: 0,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingAccount(null)
    setError('')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
  }

  const getAccountsByType = () => {
    return accounts.reduce((acc, account) => {
      if (!acc[account.type]) acc[account.type] = []
      acc[account.type].push(account)
      return acc
    }, {} as Record<string, Account[]>)
  }

  const accountsByType = getAccountsByType()

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading accounts...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Chart of Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your business accounts and track financial health
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Account
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Account Type Sections */}
      {Object.entries(accountsByType).map(([type, typeAccounts]) => (
        <Card key={type} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalance sx={{ mr: 1, color: AccountTypeColors[type] }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </Typography>
              <Chip
                label={typeAccounts.length}
                size="small"
                sx={{ ml: 2, backgroundColor: AccountTypeColors[type], color: 'white' }}
              />
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Account Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Sub Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Balance</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {typeAccounts.map((account) => (
                    <TableRow key={account.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {account.code || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {account.name}
                          </Typography>
                          {!account.isActive && (
                            <Chip label="Inactive" size="small" sx={{ ml: 1 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {account.subType || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {account.balance > 0 ? (
                            <TrendingUp sx={{ color: '#10b981', fontSize: 16, mr: 0.5 }} />
                          ) : account.balance < 0 ? (
                            <TrendingDown sx={{ color: '#ef4444', fontSize: 16, mr: 0.5 }} />
                          ) : null}
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: account.balance >= 0 ? 'text.primary' : '#ef4444',
                            }}
                          >
                            {formatCurrency(account.balance)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(account)}
                          sx={{ mr: 1 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAccount(account.id)}
                          sx={{ color: '#ef4444' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}

      {/* Add/Edit Account Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAccount ? 'Edit Account' : 'Add New Account'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Account Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 3 }}
              required
            />

            <TextField
              fullWidth
              label="Account Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              sx={{ mb: 3 }}
              helperText="Optional account code for organization"
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={formData.type}
                label="Account Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="ASSET">Asset</MenuItem>
                <MenuItem value="LIABILITY">Liability</MenuItem>
                <MenuItem value="EQUITY">Equity</MenuItem>
                <MenuItem value="REVENUE">Revenue</MenuItem>
                <MenuItem value="EXPENSE">Expense</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Sub Type"
              value={formData.subType}
              onChange={(e) => setFormData({ ...formData, subType: e.target.value })}
              sx={{ mb: 3 }}
              helperText="Optional sub-category (e.g., Current Assets, Fixed Assets)"
            />

            <TextField
              fullWidth
              label="Opening Balance"
              type="number"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveAccount}
            variant="contained"
            disabled={!formData.name}
          >
            {editingAccount ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}