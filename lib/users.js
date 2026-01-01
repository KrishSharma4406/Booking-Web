// Simple in-memory user database
// In production, use a real database like MongoDB, PostgreSQL, etc.

const users = []

// Make users accessible for admin purposes
if (typeof global !== 'undefined') {
  global.users = users
}

export function createUser(email, password, name = null) {
  const existingUser = users.find(u => u.email === email)
  if (existingUser) {
    throw new Error('User already exists')
  }
  
  const user = {
    id: Date.now().toString(),
    email,
    password, // In production, this should be hashed
    name: name || email.split('@')[0],
    createdAt: new Date().toISOString()
  }
  
  users.push(user)
  return user
}

export function findUserByEmail(email) {
  return users.find(u => u.email === email)
}

export function findUserById(id) {
  return users.find(u => u.id === id)
}

// Export users array for admin purposes
export function getAllUsers() {
  return users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  }))
}

// For demo purposes, create a test user
// Email: test@example.com
// Password: test123
import bcrypt from 'bcryptjs'
const hashedPassword = bcrypt.hashSync('test123', 10)
users.push({
  id: '1',
  email: 'test@example.com',
  password: hashedPassword,
  name: 'Test User',
  createdAt: new Date().toISOString()
})
