'use client'

import { useSession } from 'next-auth/react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  TextField,
  Grid,
  Chip,
} from '@mui/material'
import {
  AccountCircle,
  Security,
  Upgrade,
} from '@mui/icons-material'

export default function ProfilePage() {
  const { data: session } = useSession()
  
  if (!session?.user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Please sign in to view your profile</Alert>
      </Box>
    )
  }

  // Check if this is a demo account
  const isDemoAccount = session.user.email?.includes('@amplifibi.com')
  const isPremium = session.user.subscriptionTier === 'PREMIUM'

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          User Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and subscription
        </Typography>
      </Box>

      {isDemoAccount && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<Security />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Demo Account Protection
          </Typography>
          <Typography variant="body2">
            This is a demo account for exploring AmplifiBI features. 
            Email and password changes are disabled to maintain demo integrity.
            Create your own account to get full profile management capabilities.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccountCircle sx={{ mr: 2, fontSize: 40, color: '#64748b' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your account details
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={session.user.name || ''}
                  disabled={isDemoAccount}
                  sx={{ mb: 2 }}
                  helperText={isDemoAccount ? "Protected in demo account" : ""}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  value={session.user.email || ''}
                  disabled={isDemoAccount}
                  helperText={isDemoAccount ? "Protected in demo account" : ""}
                />
              </Box>

              {!isDemoAccount && (
                <Button variant="outlined" disabled>
                  Update Profile (Coming Soon)
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription & Security */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Subscription
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body1">Current Plan:</Typography>
                <Chip
                  label={isPremium ? 'PREMIUM' : 'FREE'}
                  color={isPremium ? 'success' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {isPremium 
                  ? "You have access to all advanced features including Business Health Score, Advanced Tax Management, and AI-powered insights."
                  : "You're on the FREE plan with access to core accounting features. Upgrade for advanced business intelligence and AI insights."
                }
              </Typography>

              {!isPremium && (
                <Button
                  variant="contained"
                  startIcon={<Upgrade />}
                  color="primary"
                >
                  Upgrade to Premium
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Security
              </Typography>
              
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                disabled={isDemoAccount}
                sx={{ mb: 2 }}
                helperText={isDemoAccount ? "Password changes disabled for demo account" : ""}
              />
              
              {!isDemoAccount && (
                <>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    sx={{ mb: 2 }}
                    disabled
                  />
                  <Button variant="outlined" disabled>
                    Change Password (Coming Soon)
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* GST Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                GST Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="GST Registration Status"
                    value={session.user.gstRegistered ? 'Registered' : 'Not Registered'}
                    disabled
                    helperText="Contact support to modify GST settings"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="GST Number"
                    value={session.user.gstNumber || 'Not Registered'}
                    disabled
                    helperText="Your IRD GST number"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Return Frequency"
                    value={session.user.gstReturnFrequency === 'BI_MONTHLY' ? 'Bi-monthly' : 'Six-monthly'}
                    disabled
                    helperText="How often you file GST returns"
                  />
                </Grid>
              </Grid>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                GST settings are configured during account setup. Contact support for changes to ensure compliance.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}