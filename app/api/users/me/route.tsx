import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { ensureUserExists } from '@/lib/ensure-user'
import Booking from '@/models/Booking'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('[GET /api/users/me] Starting request...')
    
    const session = await getServerSession(authOptions)
    console.log('[GET /api/users/me] Session check completed:', session ? `User: ${session.user?.email}` : 'No session')

    if (!session) {
      console.log('[GET /api/users/me] No session found - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[GET /api/users/me] Connecting to database...')
    await connectDB()
    console.log('[GET /api/users/me] Database connection successful')

    // Ensure user exists in database (auto-create if missing)
    console.log('[GET /api/users/me] Ensuring user exists in database...')
    await ensureUserExists(session)
    console.log('[GET /api/users/me] User exists in database')

    console.log('[GET /api/users/me] Querying user by email:', session.user?.email)
    const user = await User.findOne({ email: session.user.email })
      .select('-password')
    console.log('[GET /api/users/me] User query result:', user ? 'Found' : 'Not found')

    if (!user) {
      console.log('[GET /api/users/me] User not found in database - returning 404')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return clean user object with all fields
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      provider: user.provider,
      phoneVerified: user.phoneVerified,
      image: user.image,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString()
    }

    console.log('[GET /api/users/me] Returning user data successfully')
    return NextResponse.json(userData, { status: 200 })
  } catch (error) {
    console.error('[GET /api/users/me] Exception caught:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Failed to fetch user',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone } = body

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user fields
    if (name) user.name = name
    if (phone !== undefined) user.phone = phone

    await user.save()

    const updatedUser = await User.findById(user._id).select('-password')

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to retrieve updated user' }, { status: 500 })
    }

    // Return clean user object
    const userData = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      provider: updatedUser.provider,
      phoneVerified: updatedUser.phoneVerified,
      image: updatedUser.image,
      createdAt: updatedUser.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: updatedUser.updatedAt?.toISOString() || new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userData
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete all user's bookings
    await Booking.deleteMany({ userId: user._id })

    // Delete the user account
    await User.findByIdAndDelete(user._id)

    return NextResponse.json({
      message: 'Account deleted successfully',
      success: true
    }, { status: 200 })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
