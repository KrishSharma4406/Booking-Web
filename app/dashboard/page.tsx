'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [stats, setStats] = useState({ bookings: 0, pending: 0, confirmed: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/Login')
    }
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [userRes, bookingsRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/bookings')
      ])

      if (userRes.ok) {
        const user = await userRes.json()
        setUserData(user)
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json()
        const bookings = data.bookings || []
        setStats({
          bookings: bookings.length,
          pending: bookings.filter(b => b.status === 'pending').length,
          confirmed: bookings.filter(b => b.status === 'confirmed').length
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-black to-cyan-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-950 via-black to-cyan-950 text-white p-4 md:p-8 pt-20 md:pt-24">
      <div className="relative max-w-6xl mx-auto z-10">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">Welcome, {session?.user?.name || 'User'}!</h1>
          <p className="text-gray-300">Manage your reservations and account</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 border border-cyan-500/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="text-3xl font-bold mb-1">{stats.bookings}</div>
            <div className="text-white/90">Total Bookings</div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl p-6 border border-amber-500/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="text-3xl font-bold mb-1">{stats.pending}</div>
            <div className="text-white/90">Pending</div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-6 border border-emerald-500/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="text-3xl font-bold mb-1">{stats.confirmed}</div>
            <div className="text-white/90">Confirmed</div>
          </motion.div>
        </div>

        <div className="glass-card rounded-xl p-6 mb-8 border border-cyan-500/20">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/bookings"
              className="bg-white/5 border border-cyan-500/30 hover:bg-white/10 rounded-xl p-6 text-center group transition-all"
            >
              <motion.div 
                className="font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Bookings
              </motion.div>
            </Link>

            {userData?.role !== 'admin' && (
              <Link
                href="/bookings"
                className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl p-6 text-center group transition-all"
              >
                <motion.div 
                  className="font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  New Booking
                </motion.div>
              </Link>
            )}

            {userData?.role === 'admin' && (
              <Link
                href="/admin-dashboard"
                className="bg-gradient-to-br from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 rounded-xl p-6 text-center group transition-all"
              >
                <div className="font-semibold">Admin Panel</div>
              </Link>
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border border-purple-500/20">
          <h2 className="text-2xl font-bold mb-4">Account Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm mb-1">Name</div>
              <div className="font-semibold">{userData?.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Email</div>
              <div className="font-semibold">{userData?.email || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Role</div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  userData?.role === 'admin' ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                }`}>
                  {userData?.role || 'user'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Member Since</div>
              <div className="font-semibold">
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
