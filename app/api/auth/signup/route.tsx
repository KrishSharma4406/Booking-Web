import { NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '@/lib/users'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email, password, name, phone } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate phone number format if provided
    if (phone && !phone.startsWith('+')) {
      return NextResponse.json(
        { error: 'Phone number must include country code (e.g., +1234567890)' },
        { status: 400 }
      )
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const user = await createUser(email, password, name, 'credentials', phone)

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          phone: user.phone 
        }
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    const err = error as Error
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: err.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}
