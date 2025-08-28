'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  AccountBalance,
  Assessment,
  Security,
  Business,
  Gavel,
  Refresh,
  Insights,
  Recommend,
  CompareArrows,
} from '@mui/icons-material'

interface HealthScore {
  overall: number
  grade: string
  components: {
    liquidity: ComponentScore
    profitability: ComponentScore
    leverage: ComponentScore
    operational: ComponentScore
    compliance: ComponentScore
  }
  loanEligibility: {
    secured: boolean
    unsecured: boolean
    growth: boolean
    estimatedAmount: number
    confidenceLevel: number
  }
  benchmarkComparison: {
    percentile: number
    industry: string
    peerComparison: string
    keyStrengths: string[]
  }
  insights: string[]
  recommendations: Array<{
    type: string
    priority: 'High' | 'Medium' | 'Low'
    title: string
    description: string
    impact: number
  }>
  calculatedAt: string
}

interface ComponentScore {
  score: number
  grade: string
  factors: string[]
  insights: string[]
}

export default function HealthScorePage() {
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHealthScore()
  }, [])

  const fetchHealthScore = async () => {
    try {
      setError('')
      const response = await fetch('/api/health-score')
      
      if (response.ok) {
        const data = await response.json()
        setHealthScore(data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch health score')
      }
    } catch (error) {
      console.error('Error fetching health score:', error)
      setError('Failed to fetch health score')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/health-score', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setHealthScore(data.healthScore)
      } else {
        setError('Failed to refresh health score')
      }
    } catch (error) {
      setError('Failed to refresh health score')
    } finally {
      setRefreshing(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return '#10b981'
      case 'B+':
      case 'B': return '#3b82f6'
      case 'C+':
      case 'C': return '#f59e0b'
      case 'D': return '#ef4444'
      case 'F': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#ef4444'
      case 'Medium': return '#f59e0b'
      case 'Low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'liquidity': return <AccountBalance />
      case 'profitability': return <TrendingUp />
      case 'leverage': return <Security />
      case 'operational': return <Business />
      case 'compliance': return <Gavel />
      default: return <Assessment />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Calculating your business health score...
        </Typography>
      </Box>
    )
  }

  if (error && !healthScore) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchHealthScore}>
          Try Again
        </Button>
      </Box>
    )
  }

  if (!healthScore) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">No health score data available</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Business Health Score
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive analysis of your business financial health
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Score'}
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Overall Health Score */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', 
                color: getGradeColor(healthScore.grade),
                mb: 2 
              }}>
                {healthScore.overall}
              </Typography>
              <Chip
                label={`Grade ${healthScore.grade}`}
                sx={{
                  bgcolor: getGradeColor(healthScore.grade),
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  mb: 2
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Overall Health Score
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Last updated: {new Date(healthScore.calculatedAt).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Loan Eligibility */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
                Loan Eligibility
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Estimated Loan Amount
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                  {formatCurrency(healthScore.loanEligibility.estimatedAmount)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {healthScore.loanEligibility.secured && (
                  <Chip label="Secured Loans" color="success" size="small" />
                )}
                {healthScore.loanEligibility.unsecured && (
                  <Chip label="Unsecured Loans" color="primary" size="small" />
                )}
                {healthScore.loanEligibility.growth && (
                  <Chip label="Growth Capital" color="secondary" size="small" />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Confidence: {Math.round(healthScore.loanEligibility.confidenceLevel * 100)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Industry Comparison */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
                Industry Comparison
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Percentile Ranking
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {healthScore.benchmarkComparison.percentile}th
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Industry:</strong> {healthScore.benchmarkComparison.industry}
              </Typography>
              <Typography variant="body2">
                <strong>Performance:</strong> {healthScore.benchmarkComparison.peerComparison}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Component Scores */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Component Breakdown
              </Typography>
              <Grid container spacing={3}>
                {Object.entries(healthScore.components).map(([key, component]) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={key}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Box sx={{ color: getGradeColor(component.grade), mb: 1 }}>
                        {getComponentIcon(key)}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {component.score}
                      </Typography>
                      <Chip
                        label={component.grade}
                        size="small"
                        sx={{
                          bgcolor: getGradeColor(component.grade),
                          color: 'white',
                          mb: 1
                        }}
                      />
                      <Typography variant="caption" sx={{ 
                        textTransform: 'capitalize',
                        display: 'block',
                        fontWeight: 500
                      }}>
                        {key}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={component.score}
                        sx={{ 
                          mt: 1,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getGradeColor(component.grade)
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Insights */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Insights sx={{ mr: 1, verticalAlign: 'middle' }} />
                Key Insights
              </Typography>
              {healthScore.insights.length > 0 ? (
                <List>
                  {healthScore.insights.slice(0, 5).map((insight, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemIcon>
                        <TrendingFlat color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={insight}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No specific insights available at this time.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Recommend sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recommendations
              </Typography>
              {healthScore.recommendations.length > 0 ? (
                <List>
                  {healthScore.recommendations.slice(0, 5).map((rec, index) => (
                    <ListItem key={index} sx={{ py: 1, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ mt: 0.5 }}>
                        <Chip
                          label={rec.priority}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(rec.priority),
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 'auto',
                            '& .MuiChip-label': { px: 1, py: 0.5 }
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={rec.title}
                        secondary={rec.description}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Your business is performing well! Keep up the good work.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}