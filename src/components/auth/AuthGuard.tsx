'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          gap: 2 
        }}
      >
        <CircularProgress />
        <Typography>Checking authentication...</Typography>
      </Box>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          gap: 2 
        }}
      >
        <Typography variant="h6">Please sign in to continue</Typography>
        <Typography color="text.secondary">
          Redirecting to sign in page...
        </Typography>
      </Box>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}