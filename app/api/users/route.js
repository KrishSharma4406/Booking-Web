import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'


export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const currentUser = await User.findOne({ email: session.user.email })

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can view all users' }, { status: 403 })
    }

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      count: users.length,
      users: users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
