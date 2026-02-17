'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your restaurant AI assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      console.log('Sending message to AI...')
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(data.timestamp),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        console.error('API error:', data.error)
        toast.error(data.error || 'Failed to get AI response')
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or contact support.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to connect to AI assistant')
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Connection error. Please check your internet and try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-foreground hover:bg-foreground/90 text-background rounded-full p-4 sm:p-5 shadow-2xl transition-all duration-300 hover:scale-105 border border-border/20"
          aria-label="Open AI Chatbot"
        >
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background"></span>
          </span>
        </button>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-card text-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border/50">
          Ask me anything
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[calc(100vh-2rem)] sm:max-h-[36rem] h-[600px] sm:h-[36rem] backdrop-blur-md bg-card/95 rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-slideIn">
      
      {/* Header */}
      <div className="relative bg-background/50 p-5 flex justify-between items-center border-b border-border backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-background animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-bold text-foreground text-lg">AI Assistant</h3>
            <p className="text-xs text-muted">Always here to help</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted hover:text-foreground hover:bg-card rounded-lg p-2 transition-all duration-200"
          aria-label="Close chatbot"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/30 backdrop-blur-sm custom-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-fadeIn`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm transition-all ${
                message.role === 'user'
                  ? 'bg-foreground text-background ml-auto'
                  : 'bg-card/90 text-foreground border border-border/50'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-muted">AI</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-60 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-card/90 border border-border/50 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 bg-foreground rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-foreground/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2.5 h-2.5 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-muted">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative p-5 border-t border-border bg-background/50 backdrop-blur-md">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full bg-card text-foreground rounded-xl px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50 border border-border placeholder-muted transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-foreground hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed text-background rounded-xl px-5 py-3 transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
            aria-label="Send message"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
