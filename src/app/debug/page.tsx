'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [apiTest, setApiTest] = useState<string>('')

  const testCustomersAPI = async () => {
    try {
      console.log('Testing customers API...')
      const response = await fetch('/api/customers')
      console.log('API Response status:', response.status)
      
      const data = await response.json()
      console.log('API Response data:', data)
      
      setApiTest(`Status: ${response.status}, Data: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      console.error('API Test error:', error)
      setApiTest(`Error: ${error.message}`)
    }
  }

  useEffect(() => {
    console.log('Debug page - Session status:', status)
    console.log('Debug page - Session data:', session)
  }, [status, session])

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Authentication Debug Page
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Session Status:</Typography>
        <Alert severity={status === 'authenticated' ? 'success' : status === 'loading' ? 'info' : 'warning'}>
          Status: {status}
        </Alert>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Session Data:</Typography>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          {JSON.stringify(session, null, 2)}
        </pre>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">API Test:</Typography>
        <Button variant="contained" onClick={testCustomersAPI} sx={{ mb: 2 }}>
          Test Customers API
        </Button>
        {apiTest && (
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
            {apiTest}
          </pre>
        )}
      </Box>
      
      <Typography variant="body2" color="text.secondary">
        Open browser developer console (F12) to see detailed logs
      </Typography>
    </Box>
  )
}