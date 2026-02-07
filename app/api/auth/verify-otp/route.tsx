import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import { validatePhoneNumber } from '@/lib/sms'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json()

    // Validate inputs
    if (!phone || !validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find user by phone
    const user = await User.findOne({ phone })

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this phone number' },
        { status: 404 }
      )
    }

    // Check if OTP exists
    if (!user.otpCode) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if OTP has expired
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      // Clear expired OTP
      user.otpCode = undefined
      user.otpExpiry = undefined
      await user.save()

      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify OTP
    if (user.otpCode !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP code' },
        { status: 400 }
      )
    }

    // OTP is valid - mark phone as verified and clear OTP
    user.phoneVerified = true
    user.otpCode = undefined
    user.otpExpiry = undefined
    await user.save()

    // Return user data for authentication
    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
