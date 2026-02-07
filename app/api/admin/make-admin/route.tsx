import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

// POST - Make first user admin or self-promote with secret key
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await connectDB()

    // Allow bypass with ADMIN_SECRET from environment variable
    let bypassCheck = false
    try {
      const body = await req.json()
      if (body?.secret && process.env.ADMIN_SECRET && body.secret === process.env.ADMIN_SECRET) {
        bypassCheck = true
      }
    } catch {
      // No body or invalid JSON — continue without bypass
    }

    if (!bypassCheck) {
      // Check if any admin exists
      const adminExists = await User.findOne({ role: 'admin' })

      if (adminExists) {
        return NextResponse.json(
          { error: 'An admin already exists. Contact existing admin for promotion.' },
          { status: 403 }
        )
      }
    }

    // Make current user admin (upsert - create if not found)
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        role: 'admin',
        $setOnInsert: {
          name: session.user.name || 'Admin',
          email: session.user.email,
          image: session.user.image || '',
          provider: 'credentials',
        }
      },
      { new: true, upsert: true }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create/update user' },
        { status: 500 }
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
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Make admin error:', errMsg)
    return NextResponse.json(
      { error: 'Failed to make admin: ' + errMsg },
      { status: 500 }
    )
  }
}
