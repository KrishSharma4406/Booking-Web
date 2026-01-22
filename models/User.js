import mongoose from 'mongoose'


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  image: {
    type: String,
  },
  provider: {
    type: String,
    default: 'credentials',
    enum: ['credentials', 'google', 'github', 'facebook']
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  otpCode: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  resetToken: {
    type: String,
  },
  resetTokenExpiry: {
    type: Date,
  },
}, {
  timestamps: true,
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
