'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  Google,
} from '@mui/icons-material'
import Link from 'next/link'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)

    try {
      // Create account via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account')
      }

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but sign in failed. Please try signing in manually.')
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        py: 4,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Create account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start your journey with AmplifiBI
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              helperText="Must be at least 8 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <MuiLink href="/terms" sx={{ fontWeight: 500 }}>
                    Terms of Service
                  </MuiLink>{' '}
                  and{' '}
                  <MuiLink href="/privacy" sx={{ fontWeight: 500 }}>
                    Privacy Policy
                  </MuiLink>
                </Typography>
              }
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 3, py: 1.5 }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Or continue with
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Google />}
            onClick={handleGoogleSignUp}
            sx={{ mb: 3, py: 1.5 }}
          >
            Sign up with Google
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <MuiLink component={Link} href="/auth/signin" sx={{ fontWeight: 500 }}>
                Sign in
              </MuiLink>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}