import connectDB from './mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function createUser(email, password, name = null, provider = 'credentials', phone = null) {
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

  const hashedPassword = provider === 'credentials'
    ? await bcrypt.hash(password, 10)
    : password

  const userData = {
    email: email.toLowerCase(),
    password: hashedPassword,
    name: name || email.split('@')[0],
    provider
  }

  if (phone) {
    userData.phone = phone
  }

  const user = await User.create(userData)

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    phone: user.phone,
    createdAt: user.createdAt
  }
}

export async function findUserByEmail(email) {
  await connectDB()
  const user = await User.findOne({ email: email.toLowerCase() })

  if (!user) return null

  return {
    id: user._id.toString(),
    email: user.email,
    password: user.password,
    name: user.name,
    provider: user.provider,
    createdAt: user.createdAt
  }
}

export async function findUserById(id) {
  await connectDB()
  const user = await User.findById(id)

  if (!user) return null

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    provider: user.provider,
    createdAt: user.createdAt
  }
}

export async function getAllUsers() {
  await connectDB()
  const users = await User.find({}).select('-password').sort({ createdAt: -1 })

  return users.map(user => ({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    provider: user.provider,
    createdAt: user.createdAt
  }))
}

export async function updateUserResetToken(email, token, expiry) {
  await connectDB()
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { resetToken: token, resetTokenExpiry: expiry },
    { new: true }
  )
  return user
}

export async function findUserByResetToken(token) {
  await connectDB()
  const user = await User.findOne({
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

export async function updateUserPassword(userId, newPassword) {
  await connectDB()
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await User.findByIdAndUpdate(userId, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null
  })
}
