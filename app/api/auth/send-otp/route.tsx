import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { generateOTP, sendOTP, validatePhoneNumber } from '@/lib/sms'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { phone } = await request.json()

    if (!phone || !validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use Indian number with format: +91XXXXXXXXXX' },
        { status: 400 }
      )
    }

    // Check if number is from India
    if (!phone.startsWith('+91')) {
      return NextResponse.json(
        { error: 'OTP service is only available for Indian phone numbers (+91)' },
        { status: 403 }
      )
    }

    await connectDB()

    // Find user by phone number
    let user = await User.findOne({ phone })

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this phone number. Please sign up first.' },
        { status: 404 }
      )
    }

    // Generate OTP
    const otpCode = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP to database
    user.otpCode = otpCode
    user.otpExpiry = otpExpiry
    await user.save()

    console.log('=================================')
    console.log('📱 OTP GENERATED FOR:', phone)
    console.log('🔑 OTP CODE:', otpCode)
    console.log('⏰ EXPIRES AT:', otpExpiry.toLocaleString())
    console.log('=================================')

    // Send OTP via SMS
    const sent = await sendOTP(phone, otpCode)

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600,
      // In development, include OTP for testing (remove in production!)
      ...(process.env.NODE_ENV === 'development' && { devOTP: otpCode })
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
