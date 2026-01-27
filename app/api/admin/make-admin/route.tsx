import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

// POST - Make first user admin or self-promote if no admins exist
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await connectDB()

    // Check if any admin exists
    const adminExists = await User.findOne({ role: 'admin' })

    if (adminExists) {
      return NextResponse.json(
        { error: 'An admin already exists. Contact existing admin for promotion.' },
        { status: 403 }
      )
    }

    // Make current user admin if no admin exists
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        role: 'admin',
        approved: true,
        approvedAt: new Date()
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'You are now an admin! Please refresh the page.',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json(
      { error: 'Failed to make admin' },
      { status: 500 }
    )
  }
}
