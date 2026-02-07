import mongoose, { Schema, Model } from 'mongoose'
import type { IBooking } from '@/types/models'

const BookingSchema = new Schema<IBooking>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  guestName: {
    type: String,
    required: [true, 'Please provide guest name'],
  },
  guestEmail: {
    type: String,
    required: [true, 'Please provide guest email'],
  },
  guestPhone: {
    type: String,
    required: [true, 'Please provide phone number'],
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'Please provide number of guests'],
    min: 1,
    max: 20,
  },
  bookingDate: {
    type: Date,
    required: [true, 'Please provide booking date'],
  },
  bookingTime: {
    type: String,
    required: [true, 'Please provide booking time'],
  },
  tableNumber: {
    type: Number,
  },
  tableArea: {
    type: String,
    enum: ['indoor', 'outdoor', 'private-room', 'bar-area', 'patio', 'rooftop'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  specialRequests: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  paymentId: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmedAt: {
    type: Date,
  },
  cancelledReason: {
    type: String,
  },
}, {
  timestamps: true,
})

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)
export default Booking
