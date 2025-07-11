# AmplifiBI Development Log

## Project Setup & Planning (2025-01-26)

### 📋 Project Requirements & Strategy
- ✅ Created comprehensive project requirements documentation
- ✅ Defined business model: Open-core SaaS with $39/month premium tier
- ✅ Set target metrics: 5,000 total users, 2,000 premium subscribers (Year 1)
- ✅ Updated ideal metrics with three scenarios (optimal/average/below-expectation)

### 🏗️ Technical Architecture
- ✅ Researched Akahu API (NZ open banking) technical requirements
- ✅ Analyzed CDR Australia API specifications for future expansion
- ✅ Decided on phased approach:
  - **Year 1**: Next.js MVP (NZ focus)
  - **Year 2**: Hybrid architecture (AU expansion)
  - **Year 3**: Full microservices (Singapore entry)

### 🛠️ Core Development Setup

#### Database & Backend
- ✅ Initialized Next.js 14 project with TypeScript
- ✅ Configured Prisma ORM with PostgreSQL
- ✅ Created database schema with:
  - User management (FREE/PREMIUM tiers)
  - NextAuth.js integration (AuthAccount, Session, VerificationToken)
  - Chart of Accounts (BusinessAccount model)
  - Double-entry transaction system
  - Category management
  - Bank integration fields ready for Akahu API

#### Authentication System
- ✅ Installed and configured NextAuth.js
- ✅ Set up multiple auth providers:
  - Google OAuth
  - Email/password with bcrypt hashing
- ✅ Created Prisma adapter for session management
- ✅ Implemented JWT strategy with subscription tier support
- ✅ Added TypeScript types for custom session data

#### Frontend & UI
- ✅ Installed Material-UI component library
- ✅ Created custom theme with AmplifiBI branding
- ✅ Built responsive main layout system:
  - **Sidebar Navigation**: Dashboard, Accounts, Transactions, Reports
  - **Premium Features**: Business Health, Tax Filing (with "Pro" badges)
  - **User Profile**: Subscription tier display, settings menu
  - **Header**: Search, notifications, clean styling

#### Dashboard Implementation
- ✅ Created comprehensive dashboard page with:
  - Key metrics cards (Revenue, Balance, Expenses, Business Health Score)
  - Recent transactions placeholder
  - Quick actions sidebar
  - Setup progress tracker
  - Professional card-based layout

### 📁 File Structure Created
```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx (root layout with theme)
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── MainLayout.tsx
│   │   └── Sidebar.tsx
│   └── providers/
│       └── ThemeProvider.tsx
├── lib/
│   ├── auth.ts (NextAuth configuration)
│   └── prisma.ts (Prisma client)
└── types/
    └── next-auth.d.ts (TypeScript extensions)

prisma/
└── schema.prisma (Database schema)

Root files:
├── .env.example (Environment variables template)
└── DEVELOPMENT_LOG.md (This file)
```

### 🎨 Design System
- **Color Palette**: Blue primary (#3b82f6), Green secondary (#10b981)
- **Typography**: Inter font family, consistent weight hierarchy
- **Components**: Rounded corners (8-12px), subtle shadows, clean spacing
- **Free vs Premium**: Clear visual distinction with badges and disabled states

### 🔄 Current Status
- **Completed**: Project setup, database schema, authentication, main layout, dashboard
- **Next**: Authentication pages (sign-in/sign-up)
- **Pending**: Account management, transaction system, Akahu integration

### 📊 Database Schema Overview

#### Core Models
- **User**: Authentication + subscription management
- **BusinessAccount**: Chart of accounts for double-entry bookkeeping
- **Transaction**: Double-entry transactions with bank integration fields
- **Category**: Transaction categorization
- **AuthAccount/Session**: NextAuth.js authentication tables

#### Key Features Ready
- Multi-tenant user isolation
- Subscription tier enforcement
- Bank account integration fields (for Akahu API)
- Double-entry accounting foundation
- Transaction categorization system

### 🎯 Next Development Priorities
1. **Authentication Pages**: Sign-in/sign-up forms
2. **Account Management**: Chart of accounts CRUD
3. **Transaction System**: Basic transaction entry
4. **Akahu Integration**: Bank account connectivity
5. **Reports**: Basic financial reports (P&L, Balance Sheet)

### 💡 Technical Decisions Made
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers
- **UI Library**: Material-UI with custom theme
- **State Management**: Built-in React state (will add Zustand if needed)
- **Deployment**: TBD (likely Vercel + managed PostgreSQL)

### 🔧 Environment Configuration
- Database URL configuration for PostgreSQL
- NextAuth secret and URL configuration
- Google OAuth client credentials
- Akahu API credentials (for future use)

---

*Development started: 2025-01-26*  
*Last updated: 2025-01-26*