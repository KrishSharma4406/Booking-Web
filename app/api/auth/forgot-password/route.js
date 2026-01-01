import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { findUserByEmail } from '@/lib/users'
import { sendPasswordResetEmail } from '@/lib/email'

// In-memory storage for reset tokens (in production, use a database)
const resetTokens = new Map()

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = findUserByEmail(email)

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a password reset link.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = Date.now() + 3600000 // 1 hour from now

    // Store token with expiry
    resetTokens.set(resetToken, {
      email: user.email,
      expiry: tokenExpiry
    })

    // Send email
    try {
      const emailResult = await sendPasswordResetEmail(user.email, resetToken)

      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error)
        return NextResponse.json(
          { error: 'Failed to send email. Please check your email configuration.' },
          { status: 500 }
        )
      }
    } catch (emailError) {
      console.error('Email error:', emailError)
      return NextResponse.json(
        { error: 'Email service error. Please check your SMTP settings.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Password reset link has been sent to your email!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: `An error occurred: ${error.message}` },
      { status: 500 }
    )
  }
}

// Export resetTokens for use in reset password route
export { resetTokens }