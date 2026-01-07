import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import User from '@/models/User'

export async function GET(req) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })
    
    let bookings
    if (user.role === 'admin') {
      bookings = await Booking.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
    } else {
      bookings = await Booking.find({ user: user._id })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
    }

    return NextResponse.json({ bookings }, { status: 200 })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    const body = await req.json()
    const { guestName, guestEmail, guestPhone, numberOfGuests, bookingDate, bookingTime, specialRequests } = body

    const booking = await Booking.create({
      user: user._id,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests,
      bookingDate,
      bookingTime,
      specialRequests,
    })

    await booking.populate('user', 'name email')

    return NextResponse.json({ booking, message: 'Booking created successfully!' }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 500 })
  }
}
