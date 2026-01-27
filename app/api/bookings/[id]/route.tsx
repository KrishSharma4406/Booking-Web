import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update bookings' }, { status: 403 })
    }

    const { id } = params
    const body = await req.json()
    const { status, tableNumber } = body

    const updateData = { status }
    if (status === 'confirmed') {
      updateData.confirmedBy = user._id
      updateData.confirmedAt = new Date()
      if (tableNumber) {
        updateData.tableNumber = tableNumber
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('user', 'name email')

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ booking, message: 'Booking updated successfully!' }, { status: 200 })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })
    const { id } = params

    const booking = await Booking.findById(id)

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Users can delete their own bookings, admins can delete any
    if (user.role !== 'admin' && booking.user.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await Booking.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Booking deleted successfully!' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
