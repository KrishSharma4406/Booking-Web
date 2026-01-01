import { NextResponse } from 'next/server'
import { getAllUsers } from '@/lib/users'

// Get all users (for debugging)
export async function GET() {
  // In production, this should be protected with authentication
  const users = getAllUsers()
  
  return NextResponse.json({ 
    count: users.length,
    users: users 
  })
}
