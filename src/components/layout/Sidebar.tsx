'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material'
import {
  Dashboard,
  AccountBalance,
  Receipt,
  Assessment,
  Settings,
  Help,
  AccountCircle,
  Logout,
  CreditCard,
  TrendingUp,
} from '@mui/icons-material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const DRAWER_WIDTH = 280

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, href: '/dashboard' },
  { text: 'Accounts', icon: <AccountBalance />, href: '/accounts' },
  { text: 'Transactions', icon: <Receipt />, href: '/transactions' },
  { text: 'Reports', icon: <Assessment />, href: '/reports' },
  { text: 'Business Health', icon: <TrendingUp />, href: '/health', premium: true },
  { text: 'Tax Filing', icon: <CreditCard />, href: '/tax', premium: true },
]

const bottomMenuItems = [
  { text: 'Settings', icon: <Settings />, href: '/settings' },
  { text: 'Help', icon: <Help />, href: '/help' },
]

export default function Sidebar() {
  const { data: session, status } = useSession()
  
  // Return null while loading or if not authenticated
  if (status === 'loading' || status === 'unauthenticated' || !session) {
    return null
  }
  const pathname = usePathname()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSignOut = () => {
    signOut()
    handleUserMenuClose()
  }

  const isPremium = session?.user?.subscriptionTier === 'PREMIUM'

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#f8fafc',
          borderRight: '1px solid #e2e8f0',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
          AmplifiBI
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          Smart Business Finance
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <List sx={{ flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const isDisabled = item.premium && !isPremium

            return (
              <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
                <ListItemButton
                  component={Link}
                  href={isDisabled ? '#' : item.href}
                  disabled={isDisabled}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor: isActive ? '#3b82f6' : 'transparent',
                    color: isActive ? 'white' : isDisabled ? '#94a3b8' : '#475569',
                    '&:hover': {
                      backgroundColor: isActive ? '#2563eb' : '#e2e8f0',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'white' : isDisabled ? '#94a3b8' : '#64748b',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                      },
                    }}
                  />
                  {item.premium && !isPremium && (
                    <Chip
                      label="Pro"
                      size="small"
                      sx={{
                        backgroundColor: '#fbbf24',
                        color: 'white',
                        fontSize: '0.625rem',
                        height: 20,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>

        <Divider />

        <List>
          {bottomMenuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor: isActive ? '#3b82f6' : 'transparent',
                    color: isActive ? 'white' : '#475569',
                    '&:hover': {
                      backgroundColor: isActive ? '#2563eb' : '#e2e8f0',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'white' : '#64748b',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>

        <Divider />

        {session?.user && (
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1,
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
              }}
            >
              <Avatar
                src={session.user.image || undefined}
                sx={{ width: 32, height: 32 }}
              >
                {session.user.name?.[0] || session.user.email?.[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                  {session.user.name || 'User'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }} noWrap>
                    {session.user.email}
                  </Typography>
                  <Chip
                    label={isPremium ? 'Premium' : 'Free'}
                    size="small"
                    sx={{
                      backgroundColor: isPremium ? '#10b981' : '#6b7280',
                      color: 'white',
                      fontSize: '0.625rem',
                      height: 16,
                    }}
                  />
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={handleUserMenuOpen}
                sx={{ color: '#64748b' }}
              >
                <AccountCircle />
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <MenuItem onClick={handleUserMenuClose} component={Link} href="/profile">
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSignOut}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}