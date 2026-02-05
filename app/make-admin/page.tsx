'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="relative z-10 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        ></motion.div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/Login')
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-24 md:pt-28">
      <motion.div 
        className="relative z-10 glass-card p-8 max-w-md w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Become Admin</h1>
          <p className="text-muted">
            This will make your account an admin account
          </p>
        </motion.div>

        <motion.div 
          className="bg-card border border-border rounded-xl p-4 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="text-sm text-foreground">
            <strong>Current User:</strong> {session?.user?.name}
          </p>
          <p className="text-sm text-foreground">
            <strong>Email:</strong> {session?.user?.email}
          </p>
        </motion.div>

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

        <motion.button
          onClick={handleMakeAdmin}
          disabled={loading}
          className="w-full bg-foreground text-background hover:opacity-90 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {loading ? 'Processing...' : 'Make Me Admin'}
        </motion.button>

        <motion.p 
          className="text-xs text-muted text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          Note: This only works if no admin exists yet
        </motion.p>
      </motion.div>
    </div>
  )
}
