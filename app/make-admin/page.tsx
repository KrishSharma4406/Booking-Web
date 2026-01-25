'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function MakeAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleMakeAdmin = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch('/api/admin/make-admin', {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(data.message)
        setTimeout(() => {
          router.push('/dashboard')
          window.location.reload()
        }, 2000)
      } else {
        setError(data.error || 'Failed to make admin')
      }
    } catch (err) {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="relative z-10 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/Login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="relative z-10 bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-3xl font-bold mb-2">Become Admin</h1>
          <p className="text-gray-400">
            This will make your account an admin account
          </p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300">
            <strong>Current User:</strong> {session?.user?.name}
          </p>
          <p className="text-sm text-gray-300">
            <strong>Email:</strong> {session?.user?.email}
          </p>
        </div>

        {message && (
          <div className="bg-green-900 border border-green-600 rounded-lg p-4 mb-4">
            <p className="text-green-200">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <button
          onClick={handleMakeAdmin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 px-6 py-3 rounded-lg font-semibold transition-all"
        >
          {loading ? 'Processing...' : 'Make Me Admin'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Note: This only works if no admin exists yet
        </p>
      </div>
    </div>
  )
}
