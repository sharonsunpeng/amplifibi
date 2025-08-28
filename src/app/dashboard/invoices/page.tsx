'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  Chip,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Menu,
  MenuList,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Payment,
  Send,
  Search,
  FilterList,
  MoreVert,
  Description,
  AccountBalance,
} from '@mui/icons-material'

interface Invoice {
  id: string
  invoiceNumber: string
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'OVERDUE' | 'PAID' | 'CANCELLED'
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  total: number
  paidAmount: number
  outstandingAmount: number
  customer: {
    id: string
    name: string
    companyName: string | null
    email: string | null
  }
  _count: {
    items: number
    transactions: number
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [searchTerm, statusFilter])

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      
      const response = await fetch(`/api/invoices?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices)
      } else {
        setError('Failed to fetch invoices')
      }
    } catch (error) {
      setError('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchInvoices()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to delete invoice')
      }
    } catch (error) {
      setError('An error occurred while deleting the invoice')
    }
  }

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchInvoices()
        handleCloseMenu()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to update invoice status')
      }
    } catch (error) {
      setError('An error occurred while updating the invoice')
    }
  }

  const handleRecordSale = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/record-sale`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchInvoices()
        handleCloseMenu()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to record sale')
      }
    } catch (error) {
      setError('An error occurred while recording the sale')
    }
  }

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentDate: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        await fetchInvoices()
        handleCloseMenu()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to mark invoice as paid')
      }
    } catch (error) {
      setError('An error occurred while processing the payment')
    }
  }

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, invoice: Invoice) => {
    setAnchorEl(event.currentTarget)
    setSelectedInvoice(invoice)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedInvoice(null)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return '#6b7280'
      case 'SENT': return '#3b82f6'
      case 'VIEWED': return '#f59e0b'
      case 'OVERDUE': return '#ef4444'
      case 'PAID': return '#10b981'
      case 'CANCELLED': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft'
      case 'SENT': return 'Sent'
      case 'VIEWED': return 'Viewed'
      case 'OVERDUE': return 'Overdue'
      case 'PAID': return 'Paid'
      case 'CANCELLED': return 'Cancelled'
      default: return status
    }
  }

  const isOverdue = (invoice: Invoice) => {
    return new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED'
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading invoices...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Invoices
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create, send, and manage your invoices
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          href="/dashboard/invoices/create"
          sx={{ borderRadius: 2 }}
        >
          Create Invoice
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
                placeholder="Search by invoice number, customer name, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="SENT">Sent</MenuItem>
                  <MenuItem value="VIEWED">Viewed</MenuItem>
                  <MenuItem value="OVERDUE">Overdue</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  size="small"
                >
                  More Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Issue Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Outstanding</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {invoice.invoiceNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice._count.items} item{invoice._count.items !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {invoice.customer.name}
                        </Typography>
                        {invoice.customer.companyName && (
                          <Typography variant="caption" color="text.secondary">
                            {invoice.customer.companyName}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(invoice.issueDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: isOverdue(invoice) ? '#ef4444' : 'text.primary',
                          fontWeight: isOverdue(invoice) ? 500 : 400
                        }}
                      >
                        {formatDate(invoice.dueDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(invoice.status)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(invoice.status),
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(invoice.total)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          color: invoice.outstandingAmount > 0 ? '#f59e0b' : '#10b981'
                        }}
                      >
                        {formatCurrency(invoice.outstandingAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          component={Link}
                          href={`/dashboard/invoices/${invoice.id}`}
                          sx={{ mr: 1 }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        {invoice.status === 'DRAFT' && (
                          <IconButton
                            size="small"
                            component={Link}
                            href={`/dashboard/invoices/${invoice.id}/edit`}
                            sx={{ mr: 1 }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, invoice)}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {searchTerm || statusFilter ? 'No invoices found matching your criteria.' : 'No invoices found. Create your first invoice to get started.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuList dense>
          {selectedInvoice?.status === 'DRAFT' && (
            <>
              <MenuItem onClick={() => selectedInvoice && handleRecordSale(selectedInvoice.id)}>
                <ListItemIcon>
                  <Send fontSize="small" />
                </ListItemIcon>
                <ListItemText>Send & Record Sale</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => selectedInvoice && handleStatusChange(selectedInvoice.id, 'SENT')}>
                <ListItemIcon>
                  <Send fontSize="small" />
                </ListItemIcon>
                <ListItemText>Mark as Sent</ListItemText>
              </MenuItem>
            </>
          )}
          {selectedInvoice?.status !== 'PAID' && selectedInvoice?.status !== 'CANCELLED' && (
            <MenuItem onClick={() => selectedInvoice && handleMarkPaid(selectedInvoice.id)}>
              <ListItemIcon>
                <Payment fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mark as Paid</ListItemText>
            </MenuItem>
          )}
          {selectedInvoice?.status !== 'PAID' && selectedInvoice?.status !== 'CANCELLED' && (
            <MenuItem onClick={() => selectedInvoice && handleStatusChange(selectedInvoice.id, 'CANCELLED')}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cancel Invoice</ListItemText>
            </MenuItem>
          )}
          {selectedInvoice?.status === 'DRAFT' && (
            <MenuItem 
              onClick={() => selectedInvoice && handleDeleteInvoice(selectedInvoice.id)}
              sx={{ color: '#ef4444' }}
            >
              <ListItemIcon>
                <Delete fontSize="small" sx={{ color: '#ef4444' }} />
              </ListItemIcon>
              <ListItemText>Delete Invoice</ListItemText>
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </Box>
  )
}