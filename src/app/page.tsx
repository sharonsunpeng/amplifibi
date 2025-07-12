'use client'

import { useSession, SessionProvider } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material'
import {
  TrendingUp,
  AccountBalance,
  Assessment,
  Security,
  Speed,
  CloudSync,
} from '@mui/icons-material'
import Link from 'next/link'

const FeatureCard = ({ icon, title, description }: any) => (
  <Card sx={{ height: '100%', textAlign: 'center' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
)

function HomePageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip 
            label="Open Source" 
            sx={{ mb: 3, backgroundColor: '#dcfce7', color: '#166534', fontWeight: 500 }}
          />
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' }, 
              fontWeight: 'bold', 
              mb: 3,
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Smart Business Finance for SMEs
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4, 
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Open-source accounting with AI-powered insights, tax filing, and open banking integration for New Zealand and Australian businesses.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              component={Link} 
              href="/auth/signup"
              sx={{ px: 4, py: 1.5 }}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              component={Link} 
              href="/auth/signin"
              sx={{ px: 4, py: 1.5 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<AccountBalance sx={{ fontSize: 48, color: '#3b82f6' }} />}
              title="Complete Accounting"
              description="Full double-entry bookkeeping, invoicing, and financial reporting. Open source core features free forever."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<CloudSync sx={{ fontSize: 48, color: '#10b981' }} />}
              title="Open Banking"
              description="Connect your bank accounts securely via Akahu (NZ) and CDR (AU) for automatic transaction sync."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FeatureCard
              icon={<Assessment sx={{ fontSize: 48, color: '#8b5cf6' }} />}
              title="Business Intelligence"
              description="AI-powered business health scoring, cash flow forecasting, and actionable insights for growth."
            />
          </Grid>
        </Grid>

        {/* Pricing Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
            Start free, upgrade when you need advanced features
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={5}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    Free
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                    $0
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Perfect for getting started
                  </Typography>
                  <Box sx={{ textAlign: 'left', mb: 4 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>✅ Basic accounting features</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>✅ Invoicing & expenses</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>✅ Financial reports</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>✅ Single user</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>✅ Community support</Typography>
                  </Box>
                  <Button variant="outlined" fullWidth component={Link} href="/auth/signup">
                    Get Started Free
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Card sx={{ border: '2px solid #3b82f6', position: 'relative' }}>
                <Chip 
                  label="Most Popular" 
                  sx={{ 
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                  }}
                />
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    Premium
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                    $39
                    <Typography component="span" variant="h6" color="text.secondary">
                      /month
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Everything in Free, plus:
                  </Typography>
                  <Box sx={{ textAlign: 'left', mb: 4 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>✅ Open banking integration</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>✅ GST & income tax filing</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>✅ Business health scoring</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>✅ Advanced analytics</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>✅ Multi-user access</Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>✅ Priority support</Typography>
                  </Box>
                  <Button variant="contained" fullWidth component={Link} href="/auth/signup">
                    Start Premium Trial
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Trust Indicators */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Trusted by businesses across New Zealand and Australia
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security sx={{ color: '#10b981' }} />
              <Typography variant="body2">Bank-grade security</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Speed sx={{ color: '#3b82f6' }} />
              <Typography variant="body2">Fast & reliable</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ color: '#8b5cf6' }} />
              <Typography variant="body2">Growing community</Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default function HomePage() {
  return (
    <SessionProvider>
      <HomePageContent />
    </SessionProvider>
  )
}