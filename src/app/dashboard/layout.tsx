'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import MainLayout from '@/components/layout/MainLayout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Skip auth during SSR/build
  if (typeof window === 'undefined') {
    return <MainLayout>{children}</MainLayout>
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
          Please sign in to access the dashboard.
        </Typography>
      </Box>
    )
  }

  return <MainLayout>{children}</MainLayout>
}