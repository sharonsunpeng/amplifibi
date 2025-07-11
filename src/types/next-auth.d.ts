import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    subscriptionTier: string
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      subscriptionTier: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    subscriptionTier: string
  }
}