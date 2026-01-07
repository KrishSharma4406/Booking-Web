// Reset user password
// Usage: node scripts/reset-password.js your-email@example.com newpassword

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Bookingweb'

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String,
  role: String,
  approved: Boolean,
  provider: String
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

async function resetPassword(email, newPassword) {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      console.log('❌ User not found:', email)
      process.exit(1)
    }

    console.log('👤 Found user:', user.email)

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword
    await user.save()

    console.log('✅ Password reset successfully!')
    console.log('📧 Email:', user.email)
    console.log('🔑 New password:', newPassword)
    console.log('\n🔄 You can now login with your new password.')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
  console.log('❌ Please provide email and new password')
  console.log('Usage: node scripts/reset-password.js your-email@example.com newpassword')
  process.exit(1)
}

resetPassword(email, newPassword)
