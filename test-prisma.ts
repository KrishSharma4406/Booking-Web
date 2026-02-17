// Quick test to verify Prisma is working
// Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' test-prisma.ts
// Or add this code to any API route to test

import db from './lib/db-queries'

async function testPrismaConnection() {
  console.log('Testing Prisma connection...\n')

  try {
    // Test 1: Count users
    const userCount = await db.user.count()
    console.log('User count:', userCount)

    // Test 2: Count bookings
    const bookingCount = await db.booking.findAll({ take: 5 })
    console.log('Recent bookings:', bookingCount.length)

    // Test 3: Count tables
    const tableCount = await db.table.count()
    console.log('Table count:', tableCount)

    // Test 4: Get analytics
    const stats = await db.analytics.getDashboardStats()
    console.log('Dashboard stats:', stats)

    console.log('\nPrisma is working perfectly!')
    console.log('You can now use db.user, db.booking, db.table, db.review queries in your API routes.')
    
  } catch (error) {
    console.error('Error testing Prisma:', error)
    console.log('\nMake sure:')
    console.log('1. MongoDB is running and accessible')
    console.log('2. MONGODB_URI is set in .env file')
    console.log('3. You ran: npx prisma generate')
    console.log('4. You ran: npx prisma db push')
  }
}

// Uncomment to run test
// testPrismaConnection()

export default testPrismaConnection
