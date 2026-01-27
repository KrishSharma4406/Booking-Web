import { NextResponse } from 'next/server'
import { sendBookingConfirmation } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    console.log('Testing booking confirmation email...')
    
    const testBookingData = {
      guestName: 'Test User',
      guestEmail: 'krishkumar.bcse2024@huroorkee.ac.in', // Change this to your test email
      guestPhone: '+91 9876543210',
      numberOfGuests: 4,
      bookingDate: new Date(),
      bookingTime: '19:00',
      specialRequests: 'Window seat preferred',
      tableNumber: 5,
      tableArea: 'indoor',
      paymentAmount: 2000,
      paymentId: 'test_payment_' + Date.now(),
      paymentStatus: 'paid',
      paymentMethod: 'razorpay'
    }

    console.log('Sending test email to:', testBookingData.guestEmail)
    const result = await sendBookingConfirmation(testBookingData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId,
        sentTo: testBookingData.guestEmail
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
