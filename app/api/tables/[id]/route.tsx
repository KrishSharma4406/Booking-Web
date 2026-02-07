import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Table from '@/models/Table'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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
    const table = await Table.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    )

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Table updated successfully',
      table
    })
  } catch (error) {
    console.error('Table PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

    const table = await Table.findByIdAndDelete(params.id)

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Table deleted successfully'
    })
  } catch (error) {
    console.error('Table DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    )
  }
}
