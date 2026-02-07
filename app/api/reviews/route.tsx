import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Review from '@/models/Review'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

// GET all reviews (admin) or user's own reviews
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let reviews
    if (user.role === 'admin') {
      reviews = await Review.find()
        .populate('user', 'name email image')
        .populate('booking', 'bookingDate bookingTime guestName')
        .sort({ createdAt: -1 })
    } else {
      reviews = await Review.find({ user: user._id })
        .populate('booking', 'bookingDate bookingTime guestName')
        .sort({ createdAt: -1 })
    }

    return NextResponse.json({ reviews }, { status: 200 })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST - Create a new review
export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { rating, title, comment, category, booking } = body

    if (!rating || !title || !comment) {
      return NextResponse.json({ error: 'Rating, title, and comment are required' }, { status: 400 })
    }

    const review = await Review.create({
      user: user._id,
      booking: booking || undefined,
      name: user.name,
      email: user.email,
      rating,
      title,
      comment,
      category: category || 'overall',
      status: 'pending',
    })

    return NextResponse.json({ review, message: 'Review submitted successfully!' }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
