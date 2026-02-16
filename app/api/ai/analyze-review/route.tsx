import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyzeReviewSentiment } from '@/lib/ai'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reviewText } = await req.json()

    if (!reviewText || typeof reviewText !== 'string') {
      return NextResponse.json({ error: 'Invalid review text' }, { status: 400 })
    }

    const analysis = await analyzeReviewSentiment(reviewText)

    return NextResponse.json(analysis, { status: 200 })
  } catch (error: unknown) {
    const err = error as Error
    console.error('AI Review Analysis API Error:', error)
    return NextResponse.json({ 
      error: err.message || 'Failed to analyze review' 
    }, { status: 500 })
  }
}
