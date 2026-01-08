// Run this script to make a user admin
// Usage: node scripts/make-admin.js your-email@example.com

const mongoose = require('mongoose')

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Bookingweb'

// User schema (simplified)
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String,
  role: { type: String, default: 'user' },
  approved: { type: Boolean, default: false },
  approvedAt: Date,
  provider: String,
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

async function makeAdmin(email) {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      console.log('User not found with email:', email)
      console.log('\nAvailable users:')
      const allUsers = await User.find({}).select('email name role')
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name}) - Role: ${u.role || 'user'}`)
      })
      process.exit(1)
    }

    console.log('Found user:', user.email)
    console.log('Current role:', user.role || 'user')

    // Update to admin
    user.role = 'admin'
    user.approved = true
    user.approvedAt = new Date()
    await user.save()

    console.log('SUCCESS! User is now an admin!')
    console.log('Updated role:', user.role)
    console.log('\nPlease logout and login again to see admin features.')
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Please provide an email address')
  console.log('Usage: node scripts/make-admin.js your-email@example.com')
  process.exit(1)
}

makeAdmin(email)
