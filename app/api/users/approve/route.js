import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const admin = await User.findOne({ email: session.user.email })

    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can approve users' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, approved } = body

    const user = await User.findByIdAndUpdate(
      userId,
      {
        approved,
        approvedBy: approved ? admin._id : null,
        approvedAt: approved ? new Date() : null
      },
      { new: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user,
      message: approved ? 'User approved successfully!' : 'User approval revoked'
    }, { status: 200 })
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 })
  }
}
