import { prisma } from './prisma'

// Check if database is initialized
export async function isDatabaseInitialized() {
  try {
    await prisma.user.findFirst()
    return true
  } catch (error: any) {
    // If the table doesn't exist, Prisma will throw an error
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      return false
    }
    // For other errors, assume the database exists but is empty
    return true
  }
}