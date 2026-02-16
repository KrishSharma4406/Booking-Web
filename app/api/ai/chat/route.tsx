import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { chatWithAI, ChatMessage } from '@/lib/ai'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // Optional: Allow unauthenticated users for better UX
    // Remove these lines if you want to require authentication
    const session = await getServerSession(authOptions)
    console.log('Chat request - Session exists:', !!session)

    // Comment out this check to allow non-logged-in users to use chatbot
    // if (!session) {
    //   return NextResponse.json({ error: 'Please log in to use the chatbot' }, { status: 401 })
    // }

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    console.log('Processing chat with', messages.length, 'messages')
    const response = await chatWithAI(messages as ChatMessage[])
    console.log('Chat response generated:', response.substring(0, 50))

    return NextResponse.json({ 
      message: response,
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error: unknown) {
    const err = error as Error
    console.error('AI Chat API Error:', error)
    console.error('Error stack:', err.stack)
    return NextResponse.json({ 
      error: err.message || 'Failed to process AI chat request' 
    }, { status: 500 })
  }
}
