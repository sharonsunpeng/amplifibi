'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  ArrowBack,
  Download,
  Send,
  Payment,
  Edit,
  Delete,
  MoreVert,
  Print,
  Email,
  Receipt,
} from '@mui/icons-material'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

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
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes: string | null
  customer: Customer
  items: InvoiceItem[]
  createdAt: string
  updatedAt: string
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string)
    }
  }, [params.id])

  const fetchInvoice = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invoices/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch invoice')
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      setError('Failed to fetch invoice details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!invoice) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        setInvoice(updatedInvoice)
        setSuccess(`Invoice ${newStatus.toLowerCase()} successfully!`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || `Failed to ${newStatus.toLowerCase()} invoice`)
      }
    } catch (error) {
      setError(`Error updating invoice status`)
      console.error('Status update error:', error)
    } finally {
      setActionLoading(false)
      setMenuAnchorEl(null)
    }
  }

  const handleRecordPayment = async () => {
    if (!invoice) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: invoice.total,
          paymentDate: new Date().toISOString(),
          paymentMethod: 'Bank Transfer',
          reference: `Payment for ${invoice.invoiceNumber}`,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setInvoice(result.invoice)
        setSuccess('Payment recorded successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to record payment')
      }
    } catch (error) {
      setError('Error recording payment')
      console.error('Payment recording error:', error)
    } finally {
      setActionLoading(false)
      setMenuAnchorEl(null)
    }
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return '#6b7280'
      case 'SENT': return '#3b82f6'
      case 'VIEWED': return '#8b5cf6'
      case 'PAID': return '#10b981'
      case 'OVERDUE': return '#ef4444'
      case 'CANCELLED': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return '#f3f4f6'
      case 'SENT': return '#dbeafe'
      case 'VIEWED': return '#e7d3ff'
      case 'PAID': return '#d1fae5'
      case 'OVERDUE': return '#fee2e2'
      case 'CANCELLED': return '#f3f4f6'
      default: return '#f3f4f6'
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading invoice...</Typography>
      </Box>
    )
  }

  if (error && !invoice) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/invoices')}
          variant="outlined"
        >
          Back to Invoices
        </Button>
      </Box>
    )
  }

  if (!invoice) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Invoice not found</Typography>
      </Box>
    )
  }

  return (
    <Box className="invoice-detail" sx={{ '@media print': { p: 0 } }}>
      {/* Header */}
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          '@media print': { display: 'none' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/dashboard/invoices')}
            variant="outlined"
          >
            Back to Invoices
          </Button>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Invoice {invoice.invoiceNumber}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Created on {formatDate(invoice.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={invoice.status}
            sx={{
              bgcolor: getStatusBgColor(invoice.status),
              color: getStatusColor(invoice.status),
              fontWeight: 600,
            }}
          />
          
          <IconButton
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
            disabled={actionLoading}
          >
            <MoreVert />
          </IconButton>

          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
          >
            <MenuItem onClick={handlePrintInvoice}>
              <ListItemIcon><Print fontSize="small" /></ListItemIcon>
              <ListItemText>Print Invoice</ListItemText>
            </MenuItem>
            
            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
              <MenuItem onClick={handleRecordPayment}>
                <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
                <ListItemText>Record Payment</ListItemText>
              </MenuItem>
            )}

            {invoice.status === 'DRAFT' && (
              <MenuItem onClick={() => handleStatusUpdate('SENT')}>
                <ListItemIcon><Send fontSize="small" /></ListItemIcon>
                <ListItemText>Send Invoice</ListItemText>
              </MenuItem>
            )}

            {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
              <MenuItem onClick={() => handleStatusUpdate('CANCELLED')}>
                <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
                <ListItemText>Cancel Invoice</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, '@media print': { display: 'none' } }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, '@media print': { display: 'none' } }}>
          {success}
        </Alert>
      )}

      {/* Invoice Content */}
      <Card sx={{ '@media print': { boxShadow: 'none', border: 'none' } }}>
        <CardContent sx={{ p: 4 }}>
          {/* Invoice Header */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                AmplifiBI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Smart Business Finance<br />
                Auckland, New Zealand<br />
                support@amplifibi.com
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                INVOICE
              </Typography>
              <Typography variant="h6" sx={{ mb: 1 }}>
                #{invoice.invoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Issue Date: {formatDate(invoice.issueDate)}<br />
                Due Date: {formatDate(invoice.dueDate)}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Customer Information */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Bill To:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                {invoice.customer.name}
              </Typography>
              {invoice.customer.companyName && (
                <Typography variant="body2" color="text.secondary">
                  {invoice.customer.companyName}
                </Typography>
              )}
              {invoice.customer.address && (
                <Typography variant="body2" color="text.secondary">
                  {invoice.customer.address}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {[
                  invoice.customer.city,
                  invoice.customer.state,
                  invoice.customer.postalCode,
                  invoice.customer.country
                ].filter(Boolean).join(', ')}
              </Typography>
              {invoice.customer.email && (
                <Typography variant="body2" color="text.secondary">
                  {invoice.customer.email}
                </Typography>
              )}
              {invoice.customer.phone && (
                <Typography variant="body2" color="text.secondary">
                  {invoice.customer.phone}
                </Typography>
              )}
              {invoice.customer.taxNumber && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Tax Number: {invoice.customer.taxNumber}
                </Typography>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Invoice Items */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Items
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 100 }} align="center">Qty</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 120 }} align="right">Unit Price</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 120 }} align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Invoice Totals */}
          <Grid container>
            <Grid item xs={12} md={8}></Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatCurrency(invoice.subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Tax ({(invoice.taxRate * 100).toFixed(0)}%):
                  </Typography>
                  <Typography variant="body2">{formatCurrency(invoice.taxAmount)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(invoice.total)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Notes */}
          {invoice.notes && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Notes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {invoice.notes}
              </Typography>
            </>
          )}

          {/* Footer */}
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            Thank you for your business!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}