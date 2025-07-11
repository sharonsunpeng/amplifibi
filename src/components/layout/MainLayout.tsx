'use client'

import { Box, CssBaseline } from '@mui/material'
import { SessionProvider } from 'next-auth/react'
import Sidebar from './Sidebar'
import Header from './Header'

const DRAWER_WIDTH = 280

interface MainLayoutProps {
  children: React.ReactNode
  session?: any
}

export default function MainLayout({ children, session }: MainLayoutProps) {
  return (
    <SessionProvider session={session}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Sidebar />
        <Header />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8, // AppBar height
            ml: 0,
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
          }}
        >
          {children}
        </Box>
      </Box>
    </SessionProvider>
  )
}