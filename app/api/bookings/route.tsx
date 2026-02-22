import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import User from '@/models/User'
import Table from '@/models/Table'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { sendBookingConfirmation } from '@/lib/email'

export const dynamic = 'force-dynamic'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
})

export async function GET(req: Request) {
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

export async function POST(req: Request) {
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

    const body = await req.json()
    const { 
      guestName, 
      guestEmail, 
      guestPhone, 
      numberOfGuests, 
      bookingDate, 
      bookingTime, 
      specialRequests,
      tableNumber,
      tableArea,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentAmount
    } = body

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !paymentAmount) {
      return NextResponse.json({ 
        error: 'Payment information is required' 
      }, { status: 400 })
    }

    // Verify Razorpay payment signature
    try {
      const body = razorpayOrderId + '|' + razorpayPaymentId
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex')

      if (expectedSignature !== razorpaySignature) {
        return NextResponse.json({ 
          error: 'Payment verification failed. Invalid signature.' 
        }, { status: 400 })
      }

      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(razorpayPaymentId)
      
      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        return NextResponse.json({ 
          error: 'Payment not completed. Please complete the payment first.' 
        }, { status: 400 })
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      return NextResponse.json({ 
        error: 'Payment verification failed' 
      }, { status: 400 })
    }

    // Check table availability if tableNumber is provided
    if (tableNumber) {
      const table = await Table.findOne({ tableNumber })
      
      if (!table || !table.isActive) {
        return NextResponse.json({ 
          error: 'Selected table is not available' 
        }, { status: 400 })
      }

      // Check if table is already booked for this date/time
      const bookingDateTime = new Date(bookingDate)
      const existingBooking = await Booking.findOne({
        tableNumber,
        bookingDate: bookingDateTime,
        bookingTime,
        status: { $in: ['pending', 'confirmed'] }
      })

      if (existingBooking) {
        return NextResponse.json({ 
          error: 'This table is already booked for the selected time' 
        }, { status: 400 })
      }

      // Verify table capacity
      if (numberOfGuests > table.capacity) {
        return NextResponse.json({ 
          error: `Selected table can only accommodate ${table.capacity} guests` 
        }, { status: 400 })
      }
    }

    const booking = await Booking.create({
      user: user._id,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests,
      bookingDate,
      bookingTime,
      specialRequests,
      tableNumber,
      tableArea: tableArea || 'indoor',
      paymentAmount,
      paymentId: razorpayPaymentId,
      paymentStatus: 'paid',
      paymentMethod: 'razorpay',
      status: 'confirmed', // Auto-confirm booking after successful payment
    })

    await booking.populate('user', 'name email')

    // Send booking confirmation email immediately
    console.log('Sending booking confirmation email...')
    try {
      const emailResult = await sendBookingConfirmation({
        guestName,
        guestEmail,
        guestPhone,
        numberOfGuests,
        bookingDate,
        bookingTime,
        specialRequests,
        tableNumber,
        tableArea: tableArea || 'indoor',
        paymentAmount,
        paymentId: razorpayPaymentId,
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
        status: 'confirmed'
      })
      
      if (emailResult.success) {
        console.log('Booking confirmation email sent successfully!')
      } else {
        console.error('Failed to send confirmation email:', emailResult.error)
        // Don't fail the booking if email fails
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the booking if email fails
    }

    console.log('Booking created and confirmed successfully!')

    return NextResponse.json({ 
      booking, 
      message: 'Booking confirmed! Payment successful. A confirmation email has been sent to your email address.' 
    }, { status: 201 })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error creating booking:', error)
    return NextResponse.json({ 
      error: err.message || 'Failed to create booking' 
    }, { status: 500 })
  }
}
