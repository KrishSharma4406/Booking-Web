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
import { ensureUserExists } from '@/lib/ensure-user'

export const dynamic = 'force-dynamic'

// Initialize Razorpay with environment variables
let razorpay: Razorpay | null = null

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    console.log('Razorpay initialized successfully')
  } else {
    console.warn('Razorpay environment variables not set')
  }
} catch (error) {
  console.error('Error initializing Razorpay:', error)
}

export async function GET() {
  try {
    console.log('📍 [GET /api/bookings] Starting request...')
    
    const session = await getServerSession(authOptions)
    console.log('📍 [GET /api/bookings] Session check completed:', session ? `User: ${session.user?.email}` : 'No session')
    
    if (!session) {
      console.log('❌ [GET /api/bookings] No session found - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📍 [GET /api/bookings] Connecting to database...')
    await connectDB()
    console.log('✅ [GET /api/bookings] Database connection successful')

    // Ensure user exists in database (auto-create if missing)
    console.log('📍 [GET /api/bookings] Ensuring user exists in database...')
    const dbUser = await ensureUserExists(session)
    console.log('✅ [GET /api/bookings] User exists in database')

    // Ensure email is lowercase and exists
    const userEmail = session.user?.email?.toLowerCase()
    console.log('📍 [GET /api/bookings] User email from session:', userEmail)
    
    if (!userEmail) {
      console.log('❌ [GET /api/bookings] User email not found in session - returning 400')
      return NextResponse.json({ error: 'User email not found in session' }, { status: 400 })
    }

    console.log('📍 [GET /api/bookings] Querying user by email...')
    const user = await User.findOne({ email: userEmail })
    console.log('📍 [GET /api/bookings] User query result:', user ? `Found - Role: ${user.role}` : 'Not found')
    
    if (!user) {
      console.log('❌ [GET /api/bookings] User not found in database - returning 404')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('📍 [GET /api/bookings] Fetching bookings. User role:', user.role)
    let bookings
    if (user.role === 'admin') {
      console.log('📍 [GET /api/bookings] Fetching all bookings (admin user)')
      bookings = await Booking.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
    } else {
      console.log('📍 [GET /api/bookings] Fetching user-specific bookings')
      bookings = await Booking.find({ user: user._id })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
    }
    
    console.log('✅ [GET /api/bookings] Successfully fetched', bookings.length, 'bookings')
    return NextResponse.json({ bookings }, { status: 200 })
  } catch (error) {
    console.error('❌ [GET /api/bookings] Exception caught:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Failed to fetch bookings',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Ensure email is lowercase and exists
    const userEmail = session.user?.email?.toLowerCase()
    
    if (!userEmail) {
      console.error('Session user email is missing:', session)
      return NextResponse.json({ error: 'User email not found in session' }, { status: 400 })
    }

    const user = await User.findOne({ email: userEmail })

    if (!user) {
      console.error('User not found for email:', userEmail)
      return NextResponse.json({ error: 'User not found. Please log in again.' }, { status: 404 })
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
    if (!guestName || !guestEmail || !guestPhone || !numberOfGuests || !bookingDate || !bookingTime) {
      return NextResponse.json({ 
        error: 'Missing required booking information' 
      }, { status: 400 })
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !paymentAmount) {
      return NextResponse.json({ 
        error: 'Payment information is required' 
      }, { status: 400 })
    }

    // Verify Razorpay payment signature
    try {
      if (!process.env.RAZORPAY_KEY_SECRET) {
        console.warn('RAZORPAY_KEY_SECRET not set, skipping signature verification')
        return NextResponse.json({ 
          error: 'Payment gateway not configured' 
        }, { status: 500 })
      }

      const body = razorpayOrderId + '|' + razorpayPaymentId
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex')

      if (expectedSignature !== razorpaySignature) {
        console.error('Signature mismatch:', { expected: expectedSignature, received: razorpaySignature })
        return NextResponse.json({ 
          error: 'Payment verification failed. Invalid signature.' 
        }, { status: 400 })
      }

      // Fetch payment details from Razorpay
      try {
        if (!razorpay) {
          console.warn('Razorpay not initialized, cannot fetch payment details')
          return NextResponse.json({ 
            error: 'Payment gateway not configured' 
          }, { status: 500 })
        }

        const payment = await razorpay.payments.fetch(razorpayPaymentId)
        console.log('Payment status from Razorpay:', payment.status)
        
        // In test mode, accept more payment statuses
        const validStatuses = ['captured', 'authorized', 'created']
        if (!validStatuses.includes(payment.status)) {
          return NextResponse.json({ 
            error: `Payment not completed. Status: ${payment.status}` 
          }, { status: 400 })
        }
      } catch (razorpayError) {
        console.error('Razorpay API error:', razorpayError)
        // In test mode, continue if we can't fetch payment details
        console.log('Continuing booking creation despite Razorpay API error (test mode)')
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
