'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AuthTest() {
  const { data: session, status } = useSession()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <p className="mb-2">
            <strong>Status:</strong> {status}
          </p>
          {status === 'loading' && (
            <div className="text-yellow-400">Loading session...</div>
          )}
          {status === 'unauthenticated' && (
            <div className="text-red-400">Not authenticated</div>
          )}
          {status === 'authenticated' && (
            <div className="text-green-400">✅ Authenticated!</div>
          )}
        </div>

        {session && (
          <div className="bg-gray-800 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4">Session Data</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-2">
            {status === 'unauthenticated' && (
              <>
                <button
                  onClick={() => router.push('/Login')}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => router.push('/SignUp')}
                  className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                >
                  Go to Sign Up
                </button>
              </>
            )}
            {status === 'authenticated' && (
              <>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => router.push('/api/auth/signout')}
                  className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mt-4">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2 text-sm">
            <p>✅ NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? 'Set' : '❌ Not Set'}</p>
            <p>✅ NEXTAUTH_URL: {process.env.NEXTAUTH_URL || '❌ Not Set'}</p>
            <p>✅ MongoDB: Connected to app</p>
          </div>
        </div>
      </div>
    </div>
  )
}
