import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Razorpay from 'razorpay'

export const dynamic = 'force-dynamic'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, numberOfGuests, tableArea, bookingDate, bookingTime } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise (100 paise = 1 INR)
      currency: 'INR',
      receipt: `booking_${Date.now()}`,
      notes: {
        userEmail: session.user.email ?? '',
        numberOfGuests: numberOfGuests.toString(),
        tableArea: tableArea || 'indoor',
        bookingDate: bookingDate,
        bookingTime: bookingTime,
      }
    }) as { id: string; amount: number; currency: string }

    return NextResponse.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    }, { status: 200 })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Payment order creation error:', error)
    return NextResponse.json({ 
      error: err.message || 'Failed to create payment order' 
    }, { status: 500 })
  }
}
