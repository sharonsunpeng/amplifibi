'use client'

import { useSession } from 'next-auth/react'

// Force dynamic rendering for all dashboard pages
export const dynamic = 'force-dynamic'
import { Box, Typography, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily disable auth during build - will be restored via environment variable check
  if (typeof window === 'undefined') {
    // Server-side rendering - skip auth check
    return <>{children}</>
  }

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
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
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          gap: 2,
          p: 3
        }}
      >
        <Typography variant="h5">Access Restricted</Typography>
        <Typography color="text.secondary">
          Please sign in to access this page.
        </Typography>
      </Box>
    )
  }

  return <>{children}</>
}