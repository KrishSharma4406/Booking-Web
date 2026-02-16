import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTableRecommendation } from '@/lib/ai'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { numberOfGuests, preferences, specialRequests } = await req.json()

    if (!numberOfGuests || numberOfGuests < 1) {
      return NextResponse.json({ error: 'Invalid number of guests' }, { status: 400 })
    }

    const recommendation = await getTableRecommendation(
      numberOfGuests,
      preferences,
      specialRequests
    )

    return NextResponse.json(recommendation, { status: 200 })
  } catch (error: unknown) {
    const err = error as Error
    console.error('AI Table Recommendation API Error:', error)
    return NextResponse.json({ 
      error: err.message || 'Failed to get table recommendation' 
    }, { status: 500 })
  }
}
