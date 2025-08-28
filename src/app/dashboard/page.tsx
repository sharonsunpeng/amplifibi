'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  LinearProgress,
} from '@mui/material'
import {
  TrendingUp,
  AccountBalance,
  Receipt,
  Assessment,
  Add,
} from '@mui/icons-material'
import QuickTransactionForm from '@/components/transactions/QuickTransactionForm'

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp sx={{ color: '#10b981', fontSize: 16 }} />
          <Typography variant="caption" sx={{ color: '#10b981' }}>
            {trend}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
)

export default function DashboardPage() {
  const [openTransactionForm, setOpenTransactionForm] = useState(false)
  const router = useRouter()

  const handleTransactionSaved = () => {
    // Refresh dashboard data here
    console.log('Transaction saved - refreshing dashboard data')
  }

  const handleConnectBank = () => {
    // For now, just show an alert - bank integration would go here
    alert('Bank integration feature coming soon! This will connect to your bank account via Akahu API.')
  }

  const handleCreateInvoice = () => {
    router.push('/dashboard/invoices/create')
  }

  const handleAddExpense = () => {
    setOpenTransactionForm(true)
  }

  const handleViewReports = () => {
    router.push('/dashboard/reports')
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Welcome back!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your business today.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ borderRadius: 2 }}
          onClick={() => setOpenTransactionForm(true)}
        >
          Add Transaction
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value="$24,500"
            icon={<TrendingUp />}
            color="#10b981"
            trend="+12% from last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bank Balance"
            value="$18,250"
            icon={<AccountBalance />}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Expenses"
            value="$8,900"
            icon={<Receipt />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Business Health"
            value="85/100"
            icon={<Assessment />}
            color="#8b5cf6"
            trend="Excellent"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Recent Transactions
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">
                  Connect your bank account to see transactions
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ justifyContent: 'flex-start' }}
                  onClick={handleConnectBank}
                >
                  Connect Bank Account
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ justifyContent: 'flex-start' }}
                  onClick={handleCreateInvoice}
                >
                  Create Invoice
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ justifyContent: 'flex-start' }}
                  onClick={handleAddExpense}
                >
                  Add Expense
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  sx={{ justifyContent: 'flex-start' }}
                  onClick={handleViewReports}
                >
                  View Reports
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Setup Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Complete your setup: 2/5
                </Typography>
                <LinearProgress variant="determinate" value={40} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  ✅ Create account
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ✅ Set up company profile
                </Typography>
                <Typography variant="caption">
                  🔲 Connect bank account
                </Typography>
                <Typography variant="caption">
                  🔲 Add first transaction
                </Typography>
                <Typography variant="caption">
                  🔲 Generate first report
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Transaction Form */}
      <QuickTransactionForm
        open={openTransactionForm}
        onClose={() => setOpenTransactionForm(false)}
        onSave={handleTransactionSaved}
      />
    </Box>
  )
}