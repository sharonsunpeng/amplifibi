'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Button,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material'
import {
  Receipt,
  Assessment,
  CalendarToday,
  Warning,
  CheckCircle,
  FileDownload,
  Send,
} from '@mui/icons-material'

interface TaxSummary {
  gstRegistered: boolean
  gstReturnFrequency: 'BI_MONTHLY' | 'SIX_MONTHLY'
  currentPeriod: {
    start: string
    end: string
    totalSales: number
    gstOnSales: number
    totalPurchases: number
    gstOnPurchases: number
    netGst: number
  }
  nextDeadline: string
  yearToDate: {
    totalGst: number
    gstReturns: number
  }
}

export default function TaxPage() {
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Simulate tax data - in production this would come from API
    setTimeout(() => {
      setTaxSummary({
        gstRegistered: true,
        gstReturnFrequency: 'BI_MONTHLY', // Can be 'BI_MONTHLY' or 'SIX_MONTHLY'
        currentPeriod: {
          start: '2024-11-01',
          end: '2024-12-31',
          totalSales: 45000,
          gstOnSales: 6750,
          totalPurchases: 15000,
          gstOnPurchases: 2250,
          netGst: 4500
        },
        nextDeadline: '2025-01-28',
        yearToDate: {
          totalGst: 18000,
          gstReturns: 6
        }
      })
      setLoading(false)
    }, 1000)
  }, [])

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

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const timeDiff = deadlineDate.getTime() - today.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading tax information...</Typography>
      </Box>
    )
  }

  if (error || !taxSummary) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || 'Unable to load tax information'}
        </Alert>
      </Box>
    )
  }

  const daysUntilDeadline = getDaysUntilDeadline(taxSummary.nextDeadline)
  const isOverdue = daysUntilDeadline < 0
  const isUrgent = daysUntilDeadline <= 7 && daysUntilDeadline >= 0

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Tax Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            GST returns, tax planning, and compliance tracking
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
          >
            Download Reports
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            disabled={!taxSummary.gstRegistered}
          >
            File GST Return
          </Button>
        </Box>
      </Box>

      {/* GST Registration Status */}
      <Alert 
        severity={taxSummary.gstRegistered ? "success" : "warning"}
        sx={{ mb: 3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography>
            {taxSummary.gstRegistered 
              ? `✅ GST Registered - Returns required ${taxSummary.gstReturnFrequency === 'BI_MONTHLY' ? 'bi-monthly' : 'six-monthly'}`
              : "⚠️ Not GST registered - Consider registering if annual turnover exceeds $60,000"
            }
          </Typography>
          {!taxSummary.gstRegistered && (
            <Button size="small" variant="outlined">
              Register for GST
            </Button>
          )}
        </Box>
      </Alert>

      {/* Deadline Alert */}
      {taxSummary.gstRegistered && (
        <Alert 
          severity={isOverdue ? "error" : isUrgent ? "warning" : "info"}
          sx={{ mb: 3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>
              <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
              Next GST return due: {formatDate(taxSummary.nextDeadline)}
              {isOverdue && " (OVERDUE)"}
              {isUrgent && !isOverdue && ` (${daysUntilDeadline} days remaining)`}
            </Typography>
            <Button 
              size="small" 
              variant={isOverdue || isUrgent ? "contained" : "outlined"}
              color={isOverdue ? "error" : isUrgent ? "warning" : "primary"}
            >
              {isOverdue ? "File Now" : "Prepare Return"}
            </Button>
          </Box>
        </Alert>
      )}

      {taxSummary.gstRegistered && (
        <Grid container spacing={3}>
          {/* Current Period Summary */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Current GST Period: {formatDate(taxSummary.currentPeriod.start)} - {formatDate(taxSummary.currentPeriod.end)}
                </Typography>
                
                <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>GST</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body2">
                            <strong>Total Sales</strong>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              GST on sales (Output Tax)
                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(taxSummary.currentPeriod.totalSales)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#ef4444', fontWeight: 500 }}>
                          {formatCurrency(taxSummary.currentPeriod.gstOnSales)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body2">
                            <strong>Total Purchases</strong>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              GST on purchases (Input Tax)
                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(taxSummary.currentPeriod.totalPurchases)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#10b981', fontWeight: 500 }}>
                          {formatCurrency(taxSummary.currentPeriod.gstOnPurchases)}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Net GST {taxSummary.currentPeriod.netGst >= 0 ? 'Payable' : 'Refund'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            Output - Input
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: taxSummary.currentPeriod.netGst >= 0 ? '#ef4444' : '#10b981'
                            }}
                          >
                            {formatCurrency(Math.abs(taxSummary.currentPeriod.netGst))}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Year to Date Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Year to Date
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total GST Paid
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ef4444' }}>
                    {formatCurrency(taxSummary.yearToDate.totalGst)}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    GST Returns Filed
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {taxSummary.yearToDate.gstReturns}
                  </Typography>
                </Box>
                <Chip
                  icon={<CheckCircle />}
                  label="Compliant"
                  color="success"
                  sx={{ fontWeight: 500 }}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Receipt />}
                    fullWidth
                  >
                    View Transaction Log
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Assessment />}
                    fullWidth
                  >
                    Generate Tax Report
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CalendarToday />}
                    fullWidth
                  >
                    Set Tax Reminders
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Non-GST Registered View */}
      {!taxSummary.gstRegistered && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  GST Registration Benefits
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>Claim GST on business purchases</li>
                  <li>Professional credibility with suppliers</li>
                  <li>Required if turnover exceeds $60,000</li>
                  <li>Voluntary registration available</li>
                </Box>
                <Button variant="contained" sx={{ mt: 2 }}>
                  Learn More About GST
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Other Tax Obligations
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <li>Income Tax (IR3/IR4) - Annual</li>
                  <li>Provisional Tax if required</li>
                  <li>PAYE if employing staff</li>
                  <li>FBT on fringe benefits</li>
                </Box>
                <Button variant="outlined" sx={{ mt: 2 }}>
                  Tax Planning Tools
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}