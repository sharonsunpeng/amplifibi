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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Paper,
  Grid,
  Avatar,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  People,
  Email,
  Phone,
  Business,
  Search,
} from '@mui/icons-material'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  companyName: string | null
  taxNumber: string | null
  paymentTerms: number
  totalInvoiced: number
  totalOutstanding: number
  invoiceCount: number
}

export default function CustomersPage() {
  const { data: session, status } = useSession()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'New Zealand',
    companyName: '',
    taxNumber: '',
    paymentTerms: 30,
  })

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
  }, [status, session])

  useEffect(() => {
    const initializePage = async () => {
      console.log('Initializing customers page, session status:', status)
      
      // Wait for authentication to be determined
      if (status === 'loading') {
        console.log('Still loading session, waiting...')
        return
      }
      
      if (status === 'unauthenticated' || !session) {
        console.log('No session found, redirecting to signin')
        setError('Please log in to access customers')
        setLoading(false)
        return
      }
      
      console.log('Session authenticated, proceeding with page initialization')
      
      // Ensure accounts are set up first
      try {
        await fetch('/api/setup-accounts', { method: 'POST' })
      } catch (error) {
        console.log('Accounts setup skipped or failed:', error)
      }
      // Then fetch customers
      fetchCustomers()
    }
    
    initializePage()
  }, [searchTerm, status, session])

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers...')
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/customers?${params}`)
      console.log('Customers API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Customers data received:', data)
        setCustomers(data.customers)
      } else {
        const errorData = await response.json()
        console.log('Customers API error:', errorData)
        
        if (response.status === 401) {
          setError('Please log in to access customers. Redirecting to login page...')
          setTimeout(() => {
            window.location.href = '/auth/signin'
          }, 2000)
        } else {
          setError(`Error ${response.status}: ${errorData.message || 'Failed to fetch customers'}. ${errorData.error || ''}`)
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError(`Network error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCustomer = async () => {
    if (saving) return // Prevent multiple submissions
    
    try {
      setSaving(true)
      setError('')
      console.log('Attempting to save customer:', formData)
      
      if (!formData.name) {
        setError('Customer name is required')
        return
      }

      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers'
      const method = editingCustomer ? 'PUT' : 'POST'
      
      console.log('Making request to:', url, 'with method:', method)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Customer saved successfully:', result)
        await fetchCustomers()
        handleCloseDialog()
      } else {
        const data = await response.json()
        console.error('Failed to save customer:', data)
        setError(data.message || 'Failed to save customer')
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      setError('An error occurred while saving the customer')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCustomers()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to delete customer')
      }
    } catch (error) {
      setError('An error occurred while deleting the customer')
    }
  }

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postalCode: customer.postalCode || '',
        country: customer.country || 'New Zealand',
        companyName: customer.companyName || '',
        taxNumber: customer.taxNumber || '',
        paymentTerms: customer.paymentTerms,
      })
    } else {
      setEditingCustomer(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'New Zealand',
        companyName: '',
        taxNumber: '',
        paymentTerms: 30,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingCustomer(null)
    setError('')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
  }

  const getCustomerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading customers...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Customers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer database and track invoicing
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Customer
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search customers by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Payment Terms</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Total Invoiced</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Outstanding</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Invoices</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#3b82f6' }}>
                          {getCustomerInitials(customer.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {customer.name}
                          </Typography>
                          {customer.companyName && (
                            <Typography variant="caption" color="text.secondary">
                              {customer.companyName}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {customer.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption">{customer.email}</Typography>
                          </Box>
                        )}
                        {customer.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption">{customer.phone}</Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {[customer.city, customer.state, customer.country]
                          .filter(Boolean)
                          .join(', ') || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {customer.paymentTerms} days
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(customer.totalInvoiced)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          color: customer.totalOutstanding > 0 ? '#f59e0b' : 'text.primary'
                        }}
                      >
                        {formatCurrency(customer.totalOutstanding)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={customer.invoiceCount}
                        size="small"
                        sx={{ bgcolor: '#e2e8f0', color: 'text.primary' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(customer)}
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCustomer(customer.id)}
                        sx={{ color: '#ef4444' }}
                        disabled={customer.invoiceCount > 0}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {searchTerm ? 'No customers found matching your search.' : 'No customers found. Create your first customer to get started.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  sx={{ mb: 2 }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State/Province"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Postal Code"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={formData.country}
                    label="Country"
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  >
                    <MenuItem value="New Zealand">New Zealand</MenuItem>
                    <MenuItem value="Australia">Australia</MenuItem>
                    <MenuItem value="United States">United States</MenuItem>
                    <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                    <MenuItem value="Canada">Canada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Number (GST/ABN)"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  sx={{ mb: 2 }}
                  helperText="GST number for NZ, ABN for Australia"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Terms (Days)"
                  type="number"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: Number(e.target.value) })}
                  sx={{ mb: 2 }}
                  inputProps={{ min: 0, max: 365 }}
                  helperText="Number of days customers have to pay invoices"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveCustomer}
            variant="contained"
            disabled={!formData.name || saving}
          >
            {saving ? 'Saving...' : (editingCustomer ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}