import mongoose from 'mongoose'

const BookingSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  specialRequests: {
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

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema)
