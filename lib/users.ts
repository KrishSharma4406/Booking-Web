import connectDB from './mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import type { IUser, UserPublic, UserWithPassword } from '@/types/models'

export async function createUser(
  email: string,
  password: string,
  name: string | null = null,
  provider: string = 'credentials',
  phone: string | null = null
): Promise<UserPublic> {
  await connectDB()

  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    throw new Error('User already exists')
  }

  // Check if phone number already exists (if provided)
  if (phone) {
    const existingPhone = await User.findOne({ phone })
    if (existingPhone) {
      throw new Error('Phone number already registered')
    }
  }

  const hashedPassword: string = provider === 'credentials'
    ? await bcrypt.hash(password, 10)
    : password

  const userData: Record<string, string> = {
    email: email.toLowerCase(),
    password: hashedPassword,
    name: name || email.split('@')[0],
    provider
  }

  if (phone) {
    userData.phone = phone
  }

  const user: IUser = await User.create(userData)

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    phone: user.phone,
    createdAt: user.createdAt
  }
}

export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  await connectDB()
  const user: IUser | null = await User.findOne({ email: email.toLowerCase() })

  if (!user) return null

  return {
    id: user._id.toString(),
    email: user.email,
    password: user.password,
    name: user.name,
    provider: user.provider,
    role: user.role,
    phone: user.phone,
    createdAt: user.createdAt
  }
}

export async function findUserById(id: string): Promise<UserPublic | null> {
  await connectDB()
  const user: IUser | null = await User.findById(id)

  if (!user) return null

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    provider: user.provider,
    createdAt: user.createdAt
  }
}

export async function getAllUsers(): Promise<UserPublic[]> {
  await connectDB()
  const users: IUser[] = await User.find({}).select('-password').sort({ createdAt: -1 })

  return users.map((user) => ({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    provider: user.provider,
    createdAt: user.createdAt
  }))
}

export async function updateUserResetToken(
  email: string,
  token: string,
  expiry: Date
): Promise<IUser | null> {
  await connectDB()
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { resetToken: token, resetTokenExpiry: expiry },
    { new: true }
  )
  return user
}

export async function findUserByResetToken(token: string): Promise<UserPublic | null> {
  await connectDB()
  const user: IUser | null = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() }
  })

  if (!user) return null

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  await connectDB()
  const hashedPassword: string = await bcrypt.hash(newPassword, 10)
  await User.findByIdAndUpdate(userId, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null
  })
}
