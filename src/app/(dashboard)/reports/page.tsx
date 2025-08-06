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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material'
import {
  Assessment,
  TrendingUp,
  PictureAsPdf,
  GetApp,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ReportData {
  profitLoss: {
    revenue: Array<{ account: string; amount: number }>
    expenses: Array<{ account: string; amount: number }>
    totalRevenue: number
    totalExpenses: number
    netIncome: number
  }
  balanceSheet: {
    assets: Array<{ account: string; amount: number }>
    liabilities: Array<{ account: string; amount: number }>
    equity: Array<{ account: string; amount: number }>
    totalAssets: number
    totalLiabilities: number
    totalEquity: number
  }
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ReportsPage() {
  // Temporarily commented for build - will fix after deployment
  // const { data: session } = useSession()
  const session = { user: { id: 'temp' } } // Temporary for build
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    endDate: new Date(), // Today
  })

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      })

      const response = await fetch(`/api/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        setError('Failed to fetch report data')
      }
    } catch (error) {
      setError('An error occurred while fetching reports')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-NZ')
  }

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading reports...</Typography>
      </Box>
    )
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Financial Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdf />}
              disabled
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              disabled
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Date Range Selection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={(newValue) => 
                    setDateRange({ ...dateRange, startDate: newValue || new Date() })
                  }
                  slotProps={{
                    textField: { fullWidth: true, size: 'small' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={(newValue) => 
                    setDateRange({ ...dateRange, endDate: newValue || new Date() })
                  }
                  slotProps={{
                    textField: { fullWidth: true, size: 'small' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Quick Select</InputLabel>
                  <Select
                    value=""
                    label="Quick Select"
                    onChange={(e) => {
                      const value = e.target.value
                      const today = new Date()
                      let startDate = new Date()
                      
                      switch (value) {
                        case 'thisMonth':
                          startDate = new Date(today.getFullYear(), today.getMonth(), 1)
                          break
                        case 'thisQuarter':
                          const quarter = Math.floor(today.getMonth() / 3)
                          startDate = new Date(today.getFullYear(), quarter * 3, 1)
                          break
                        case 'thisYear':
                          startDate = new Date(today.getFullYear(), 0, 1)
                          break
                        case 'lastMonth':
                          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                          const endDate = new Date(today.getFullYear(), today.getMonth(), 0)
                          setDateRange({ startDate, endDate })
                          return
                      }
                      setDateRange({ startDate, endDate: today })
                    }}
                  >
                    <MenuItem value="thisMonth">This Month</MenuItem>
                    <MenuItem value="thisQuarter">This Quarter</MenuItem>
                    <MenuItem value="thisYear">This Year</MenuItem>
                    <MenuItem value="lastMonth">Last Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Profit & Loss" />
              <Tab label="Balance Sheet" />
              <Tab label="Charts & Analysis" />
            </Tabs>
          </Box>

          {/* Profit & Loss Report */}
          <TabPanel value={tabValue} index={0}>
            <CardContent>
              {reportData ? (
                <Box>
                  {/* Revenue Section */}
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#10b981' }}>
                    Revenue
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ mb: 4 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.profitLoss.revenue.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.account}</TableCell>
                            <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Total Revenue</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(reportData.profitLoss.totalRevenue)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Expenses Section */}
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#ef4444' }}>
                    Expenses
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ mb: 4 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.profitLoss.expenses.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.account}</TableCell>
                            <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Total Expenses</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(reportData.profitLoss.totalExpenses)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Net Income */}
                  <Card sx={{ backgroundColor: reportData.profitLoss.netIncome >= 0 ? '#dcfce7' : '#fee2e2' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Net Income
                        </Typography>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: reportData.profitLoss.netIncome >= 0 ? '#166534' : '#dc2626'
                          }}
                        >
                          {formatCurrency(reportData.profitLoss.netIncome)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No data available for the selected period.
                </Typography>
              )}
            </CardContent>
          </TabPanel>

          {/* Balance Sheet Report */}
          <TabPanel value={tabValue} index={1}>
            <CardContent>
              {reportData ? (
                <Grid container spacing={4}>
                  {/* Assets */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#3b82f6' }}>
                      Assets
                    </Typography>
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableBody>
                          {reportData.balanceSheet.assets.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.account}</TableCell>
                              <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Total Assets</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              {formatCurrency(reportData.balanceSheet.totalAssets)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  {/* Liabilities */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#f59e0b' }}>
                      Liabilities
                    </Typography>
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableBody>
                          {reportData.balanceSheet.liabilities.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.account}</TableCell>
                              <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Total Liabilities</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              {formatCurrency(reportData.balanceSheet.totalLiabilities)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  {/* Equity */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#8b5cf6' }}>
                      Equity
                    </Typography>
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableBody>
                          {reportData.balanceSheet.equity.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.account}</TableCell>
                              <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Total Equity</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              {formatCurrency(reportData.balanceSheet.totalEquity)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  {/* Balance Check */}
                  <Grid item xs={12}>
                    <Card sx={{ mt: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">Balance Check</Typography>
                          <Typography variant="body1">
                            Assets: {formatCurrency(reportData.balanceSheet.totalAssets)} = 
                            Liabilities + Equity: {formatCurrency(reportData.balanceSheet.totalLiabilities + reportData.balanceSheet.totalEquity)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No data available for the selected period.
                </Typography>
              )}
            </CardContent>
          </TabPanel>

          {/* Charts & Analysis */}
          <TabPanel value={tabValue} index={2}>
            <CardContent>
              {reportData ? (
                <Grid container spacing={4}>
                  {/* Revenue vs Expenses */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Revenue vs Expenses
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: 'Revenue', amount: reportData.profitLoss.totalRevenue },
                        { name: 'Expenses', amount: reportData.profitLoss.totalExpenses },
                        { name: 'Net Income', amount: reportData.profitLoss.netIncome },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="amount" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Grid>

                  {/* Asset Breakdown */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Asset Breakdown
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reportData.balanceSheet.assets}
                          dataKey="amount"
                          nameKey="account"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ account, amount }) => `${account}: ${formatCurrency(amount)}`}
                        >
                          {reportData.balanceSheet.assets.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No data available for the selected period.
                </Typography>
              )}
            </CardContent>
          </TabPanel>
        </Card>
      </Box>
    </LocalizationProvider>
  )
}