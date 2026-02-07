import mongoose, { Schema, Model } from 'mongoose'
import type { IReview } from '@/types/models'

const ReviewSchema = new Schema<IReview>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  name: {
    type: String,
    required: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: [true, 'Please provide a review title'],
    maxlength: 100,
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: 1000,
  },
  category: {
    type: String,
    enum: ['food', 'service', 'ambiance', 'value', 'overall'],
    default: 'overall',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminReply: {
    type: String,
    maxlength: 500,
  },
  repliedAt: {
    type: Date,
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)
export default Review
