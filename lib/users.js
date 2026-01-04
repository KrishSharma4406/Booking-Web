import connectDB from './mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function createUser(email, password, name = null, provider = 'credentials') {
  await connectDB()

  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    throw new Error('User already exists')
  }
  const hashedPassword = provider === 'credentials'
    ? await bcrypt.hash(password, 10)
    : password

  const user = await User.create({
    email: email.toLowerCase(),
    password: hashedPassword,
    name: name || email.split('@')[0],
    provider
  })

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
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
