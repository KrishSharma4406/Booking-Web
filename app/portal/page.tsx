'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function RoleBasedRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (status === 'loading') return

      if (status === 'unauthenticated') {
        router.push('/Login')
        return
      }

      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/users/me')
          if (res.ok) {
            const data = await res.json()

            if (data.role === 'admin') {
              router.push('/admin-dashboard')
            } else {
              router.push('/bookings')
            }
          }
        } catch (error) {
          console.error('Error checking user role:', error)
          router.push('/dashboard')
        } finally {
          setChecking(false)
        }
      }
    }

    checkAndRedirect()
  }, [status, router])

  if (checking || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-black to-cyan-950 flex flex-col items-center justify-center text-white pt-16 md:pt-20">
        <motion.div 
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 mb-4"></div>
          <p className="text-xl">Checking your account...</p>
          <p className="text-gray-400 mt-2">Please wait while we redirect you</p>
        </motion.div>
      </div>
    )
  }

  return null
}
