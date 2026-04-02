import { type Session } from 'next-auth'
import { connectDB } from './mongodb'
import User from '@/models/User'

/**
 * Ensures a user exists in the database from the session.
 * If the user is authenticated but not in the database, creates them automatically.
 * This handles cases where OAuth users sign in without being created in DB.
 */
export async function ensureUserExists(session: Session): Promise<any> {
  if (!session?.user?.email) {
    throw new Error('No user email in session')
  }

  await connectDB()

  const userEmail = session.user.email.toLowerCase()
  let user = await User.findOne({ email: userEmail })

  if (!user) {
    console.log('📍 [ensureUserExists] User not found, creating:', userEmail)
    
    // Create user from session data
    user = await User.create({
      email: userEmail,
      name: session.user.name || userEmail.split('@')[0],
      image: session.user.image || undefined,
      password: require('crypto').randomBytes(32).toString('hex'), // Random password for OAuth users
      provider: 'oauth', // OAuth users
      phoneVerified: false,
      role: 'user'
    })
    
    console.log('✅ [ensureUserExists] User created automatically:', user._id.toString())
  }

  return user
}
