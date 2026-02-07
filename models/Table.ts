import mongoose, { Schema, Model } from 'mongoose'
import type { ITable } from '@/types/models'

const TableSchema = new Schema<ITable>({
  tableNumber: {
    type: Number,
    required: [true, 'Please provide table number'],
    unique: true,
  },
  tableName: {
    type: String,
    required: [true, 'Please provide table name'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide table capacity'],
    min: 1,
    max: 20,
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'private-room', 'bar-area', 'patio', 'rooftop'],
    default: 'indoor',
  },
  pricePerPerson: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available',
  },
  features: [{
    type: String,
    enum: ['window-view', 'near-kitchen', 'quiet-corner', 'romantic', 'family-friendly', 'accessible', 'vip'],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

const Table: Model<ITable> = mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema)
export default Table
