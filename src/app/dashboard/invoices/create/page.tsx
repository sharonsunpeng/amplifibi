'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import {
  ArrowBack,
  Add,
  Delete,
  Save,
  Send,
} from '@mui/icons-material'

interface Customer {
  id: string
  name: string
  email: string | null
  paymentTerms: number
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface InvoiceFormData {
  customerId: string
  issueDate: string
  dueDate: string
  taxRate: number
  gstInclusive: boolean
  exemptFromGst: boolean
  notes: string
  items: InvoiceItem[]
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    taxRate: 0.15, // 15% GST default for NZ
    gstInclusive: true, // Default to GST inclusive
    exemptFromGst: false, // Default to GST applicable
    notes: '',
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ],
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (selectedCustomer) {
      const issueDate = new Date(formData.issueDate)
      const dueDate = new Date(issueDate)
      dueDate.setDate(dueDate.getDate() + selectedCustomer.paymentTerms)
      setFormData(prev => ({
        ...prev,
        customerId: selectedCustomer.id,
        dueDate: dueDate.toISOString().split('T')[0],
      }))
    }
  }, [selectedCustomer, formData.issueDate])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }))
  }

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value }
          // Recalculate total when quantity or unitPrice changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      }),
    }))
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    if (formData.exemptFromGst) {
      return 0
    }
    
    const subtotal = calculateSubtotal()
    
    if (formData.gstInclusive) {
      // GST inclusive: Tax = Total / (1 + taxRate) * taxRate
      return subtotal / (1 + formData.taxRate) * formData.taxRate
    } else {
      // GST exclusive: Tax = Subtotal * taxRate
      return subtotal * formData.taxRate
    }
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax()
    
    if (formData.gstInclusive) {
      // GST inclusive: Total = Subtotal (GST already included)
      return subtotal
    } else {
      // GST exclusive: Total = Subtotal + Tax
      return subtotal + tax
    }
  }

  const calculateExclusiveSubtotal = () => {
    if (formData.exemptFromGst) {
      return calculateSubtotal()
    }
    
    if (formData.gstInclusive) {
      // GST inclusive: Exclusive subtotal = Total - Tax
      return calculateSubtotal() - calculateTax()
    } else {
      // GST exclusive: Exclusive subtotal = Subtotal
      return calculateSubtotal()
    }
  }

  const handleSave = async (status: 'DRAFT' | 'SENT') => {
    if (!selectedCustomer) {
      setError('Please select a customer')
      return
    }

    if (formData.items.length === 0 || formData.items.every(item => !item.description)) {
      setError('Please add at least one invoice item')
      return
    }

    setLoading(true)
    setError('')

    try {
      const invoiceData = {
        customerId: formData.customerId,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        status,
        taxRate: formData.taxRate,
        gstInclusive: formData.gstInclusive,
        exemptFromGst: formData.exemptFromGst,
        notes: formData.notes,
        items: formData.items.filter(item => item.description.trim() !== ''),
        subtotal: calculateExclusiveSubtotal(),
        taxAmount: calculateTax(),
        total: calculateTotal(),
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(`Invoice ${result.invoiceNumber} ${status === 'DRAFT' ? 'saved as draft' : 'created and sent'} successfully!`)
        
        setTimeout(() => {
          router.push('/dashboard/invoices')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create invoice')
      }
    } catch (error: any) {
      setError('An error occurred while creating the invoice')
      console.error('Invoice creation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard/invoices')}
          variant="outlined"
        >
          Back to Invoices
        </Button>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Create New Invoice
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and send invoices to your customers
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={customers}
                    getOptionLabel={(customer) => `${customer.name}${customer.email ? ` (${customer.email})` : ''}`}
                    value={selectedCustomer}
                    onChange={(_, newValue) => setSelectedCustomer(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Customer"
                        fullWidth
                        required
                        helperText="Select a customer for this invoice"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Issue Date"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    helperText={selectedCustomer ? `Payment terms: ${selectedCustomer.paymentTerms} days` : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tax Rate</InputLabel>
                    <Select
                      value={formData.taxRate}
                      label="Tax Rate"
                      onChange={(e) => setFormData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                      disabled={formData.exemptFromGst}
                    >
                      <MenuItem value={0}>0% (No Tax)</MenuItem>
                      <MenuItem value={0.15}>15% (GST)</MenuItem>
                      <MenuItem value={0.10}>10% (GST - Australia)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.exemptFromGst}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            exemptFromGst: e.target.checked,
                            taxRate: e.target.checked ? 0 : 0.15
                          }))}
                        />
                      }
                      label="GST Exempt Transaction"
                    />
                    {!formData.exemptFromGst && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.gstInclusive}
                            onChange={(e) => setFormData(prev => ({ ...prev, gstInclusive: e.target.checked }))}
                          />
                        }
                        label="GST Inclusive Pricing"
                      />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Invoice Items
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={addItem}
                  variant="outlined"
                  size="small"
                >
                  Add Item
                </Button>
              </Box>

              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 100 }}>Qty</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 120 }}>Unit Price</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 120 }} align="right">Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 50 }} align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <TextField
                            fullWidth
                            placeholder={`Item ${index + 1} description`}
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                            variant="outlined"
                            size="small"
                            inputProps={{ min: 0, step: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                            variant="outlined"
                            size="small"
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatCurrency(item.total)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => removeItem(item.id)}
                            disabled={formData.items.length === 1}
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

              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or terms for this invoice..."
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Summary
              </Typography>

              <Box sx={{ mb: 3 }}>
                {formData.gstInclusive && !formData.exemptFromGst && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal (excl. GST):</Typography>
                    <Typography variant="body2">{formatCurrency(calculateExclusiveSubtotal())}</Typography>
                  </Box>
                )}
                {!formData.gstInclusive && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">{formatCurrency(calculateSubtotal())}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {formData.exemptFromGst ? 'GST (Exempt)' : `GST ${formData.gstInclusive ? '(included)' : ''} (${(formData.taxRate * 100).toFixed(0)}%)`}:
                  </Typography>
                  <Typography variant="body2">{formatCurrency(calculateTax())}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total {formData.gstInclusive && !formData.exemptFromGst ? '(incl. GST)' : ''}:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{formatCurrency(calculateTotal())}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={() => handleSave('DRAFT')}
                  disabled={loading}
                  fullWidth
                >
                  Save as Draft
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={() => handleSave('SENT')}
                  disabled={loading}
                  fullWidth
                >
                  Create & Send Invoice
                </Button>
              </Box>

              {selectedCustomer && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Customer Details
                  </Typography>
                  <Typography variant="body2">
                    <strong>{selectedCustomer.name}</strong>
                  </Typography>
                  {selectedCustomer.email && (
                    <Typography variant="body2" color="text.secondary">
                      {selectedCustomer.email}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Payment terms: {selectedCustomer.paymentTerms} days
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}