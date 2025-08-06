import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // The database will be seeded when users register and create accounts
  // For now, just verify the connection
  await prisma.$connect()
  console.log('✅ Database connected successfully')
  
  console.log('🎉 Database ready for AmplifiBI!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })