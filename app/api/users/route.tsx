import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const currentUser = await User.findOne({ email: session.user.email })

    if (!currentUser || currentUser.role !== 'admin') {
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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const currentUser = await User.findOne({ email: session.user.email })

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete users' }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent admin from deleting themselves
    if (userId === currentUser._id.toString()) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    const deletedUser = await User.findByIdAndDelete(userId)

    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${deletedUser.email} has been deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
