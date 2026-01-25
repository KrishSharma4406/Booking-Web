import { Document } from 'mongoose'

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  password?: string
  role: 'user' | 'admin'
  phone?: string
  phoneVerified: boolean
  otpCode?: string
  otpExpiry?: Date
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ITable extends Document {
  _id: string
  tableNumber: number
  seats: number
  description?: string
  status: 'available' | 'occupied' | 'reserved'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IBooking extends Document {
  _id: string
  user: string
  table: string
  date: Date
  startTime: string
  endTime: string
  guests: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentId?: string
  amount?: number
  createdAt: Date
  updatedAt: Date
}
