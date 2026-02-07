import { Document, Types } from 'mongoose'

// ─── User ───────────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  password: string
  image?: string
  provider: 'credentials' | 'google' | 'github' | 'facebook'
  role: 'user' | 'admin'
  phone?: string
  phoneVerified: boolean
  otpCode?: string
  otpExpiry?: Date
  resetToken?: string
  resetTokenExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

// ─── Table ──────────────────────────────────────────────────────────
export type TableLocation = 'indoor' | 'outdoor' | 'private-room' | 'bar-area' | 'patio' | 'rooftop'
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance'
export type TableFeature = 'window-view' | 'near-kitchen' | 'quiet-corner' | 'romantic' | 'family-friendly' | 'accessible' | 'vip'

export interface ITable extends Document {
  _id: Types.ObjectId
  tableNumber: number
  tableName: string
  capacity: number
  location: TableLocation
  pricePerPerson: number
  status: TableStatus
  features: TableFeature[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ─── Booking ────────────────────────────────────────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface IBooking extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  guestName: string
  guestEmail: string
  guestPhone: string
  numberOfGuests: number
  bookingDate: Date
  bookingTime: string
  tableNumber?: number
  tableArea?: TableLocation
  status: BookingStatus
  specialRequests?: string
  paymentStatus: PaymentStatus
  paymentAmount: number
  paymentId?: string
  paymentMethod?: string
  confirmedBy?: Types.ObjectId
  confirmedAt?: Date
  cancelledReason?: string
  createdAt: Date
  updatedAt: Date
}

// ─── Review ─────────────────────────────────────────────────────────
export type ReviewCategory = 'food' | 'service' | 'ambiance' | 'value' | 'overall'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface IReview extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  booking?: Types.ObjectId
  name: string
  email: string
  rating: number
  title: string
  comment: string
  category: ReviewCategory
  status: ReviewStatus
  adminReply?: string
  repliedAt?: Date
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
}

// ─── Email ──────────────────────────────────────────────────────────
export interface BookingEmailData {
  guestName: string
  guestEmail: string
  guestPhone?: string
  numberOfGuests: number
  bookingDate: Date | string
  bookingTime: string
  tableNumber?: number
  tableArea?: string
  specialRequests?: string
  status?: string
  paymentAmount?: number
  paymentId?: string
  paymentStatus?: string
  paymentMethod?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// ─── API helpers ────────────────────────────────────────────────────
export interface UserPublic {
  id: string
  email: string
  name: string
  phone?: string
  provider?: string
  role?: string
  createdAt?: Date
}

export interface UserWithPassword extends UserPublic {
  password: string
}
