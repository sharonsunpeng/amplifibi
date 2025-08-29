import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    subscriptionTier: string
    gstRegistered?: boolean
    gstNumber?: string | null
    gstReturnFrequency?: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      subscriptionTier: string
      gstRegistered?: boolean
      gstNumber?: string | null
      gstReturnFrequency?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    subscriptionTier: string
  }
}