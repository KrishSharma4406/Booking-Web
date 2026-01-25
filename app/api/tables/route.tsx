import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import Table from '@/models/Table'

export async function GET(req) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const availableOnly = searchParams.get('available') === 'true'
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const guests = parseInt(searchParams.get('guests') || '1')

    let query = { isActive: true }

    if (availableOnly) {
      query.status = 'available'
      query.capacity = { $gte: guests }
    }

    const tables = await Table.find(query).sort({ tableNumber: 1 })

    if (date && time && availableOnly) {
      const Booking = (await import('@/models/Booking')).default
      const bookingDate = new Date(date)

      const existingBookings = await Booking.find({
        bookingDate: {
          $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
          $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
        },
        bookingTime: time,
        status: { $in: ['pending', 'confirmed'] }
      }).select('tableNumber')

      const bookedTableNumbers = existingBookings
        .map(b => b.tableNumber)
        .filter(tn => tn != null)

      const availableTables = tables.filter(
        table => !bookedTableNumbers.includes(table.tableNumber)
      )

      return NextResponse.json({
        tables: availableTables,
        count: availableTables.length
      })
    }

    return NextResponse.json({
      tables,
      count: tables.length
    })
  } catch (error) {
    console.error('Tables GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await connectDB()
    const User = (await import('@/models/User')).default
    const user = await User.findOne({ email: session.user.email })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    const data = await req.json()
    const table = await Table.create(data)

    return NextResponse.json({
      message: 'Table created successfully',
      table
    }, { status: 201 })
  } catch (error) {
    console.error('Table POST error:', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Table number already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    )
  }
}
