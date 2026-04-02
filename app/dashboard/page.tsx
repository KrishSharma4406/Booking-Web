'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { IUser, IBooking } from '@/types/models'
import { Calendar, Clock, CheckCircle, User, Mail, Shield, CalendarCheck, Plus, LayoutDashboard, Star } from 'lucide-react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<IUser | null>(null)
  const [stats, setStats] = useState({ bookings: 0, pending: 0, confirmed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication status
    if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting to login')
      router.push('/Login')
      return
    }

    // Fetch data when authenticated
    if (status === 'authenticated') {
      console.log('User authenticated, fetching data')
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching user and bookings data...')
      
      const [userRes, bookingsRes] = await Promise.all([
        fetch('/api/users/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/bookings', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      ])

      // Handle user data
      if (userRes.ok) {
        const user = await userRes.json()
        console.log('✅ User data fetched successfully:', user)
        setUserData(user)
      } else {
        const errorText = await userRes.text()
        console.error('❌ Failed to fetch user data:', userRes.status, errorText)
        setError(`Failed to load user data: ${userRes.status}`)
      }

      // Handle bookings data
      if (bookingsRes.ok) {
        const data = await bookingsRes.json()
        const bookings = data.bookings || []
        console.log('✅ Bookings data fetched successfully:', bookings)
        setStats({
          bookings: bookings.length,
          pending: bookings.filter((b: IBooking) => b.status === 'pending').length,
          confirmed: bookings.filter((b: IBooking) => b.status === 'confirmed').length
        })
      } else {
        const errorText = await bookingsRes.text()
        console.error('❌ Failed to fetch bookings:', bookingsRes.status, errorText)
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-background text-secondary p-4 sm:p-6 md:p-8 pt-20 sm:pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-md border-2 border-red-200 text-center">
            <h2 className="text-2xl font-bold text-secondary mb-2">Error Loading Dashboard</h2>
            <p className="text-secondary opacity-70 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setLoading(true)
                fetchData()
              }}
              className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-secondary p-4 sm:p-6 md:p-8 pt-20 sm:pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8 md:mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-3">
            Welcome back, {session?.user?.name || 'User'}!
          </h1>
          <p className="text-secondary text-base opacity-80">
            Here's your reservation overview and quick actions
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 md:mb-12">
          {/* Total Bookings */}
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-secondary text-sm opacity-70 mb-2">Total Bookings</p>
                <motion.div 
                  className="text-4xl font-bold text-secondary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {stats.bookings}
                </motion.div>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-secondary text-xs opacity-60">You have {stats.bookings} total reservations</p>
          </motion.div>

          {/* Pending Bookings */}
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-secondary text-sm opacity-70 mb-2">Pending</p>
                <motion.div 
                  className="text-4xl font-bold text-secondary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {stats.pending}
                </motion.div>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-secondary text-xs opacity-60">Awaiting confirmation</p>
          </motion.div>

          {/* Confirmed Bookings */}
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-md border border-border hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-secondary text-sm opacity-70 mb-2">Confirmed</p>
                <motion.div 
                  className="text-4xl font-bold text-secondary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {stats.confirmed}
                </motion.div>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
            <p className="text-secondary text-xs opacity-60">Ready to enjoy</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-border mb-8 md:mb-12"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -3 }}
            >
              <Link
                href="/bookings"
                className="block bg-gradient-to-br from-white to-background border-2 border-border rounded-lg p-6 text-center hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-lg bg-primary bg-opacity-10">
                    <CalendarCheck className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="font-semibold text-secondary mb-1">View Bookings</div>
                <p className="text-secondary text-sm opacity-70">Manage your reservations</p>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ y: -3 }}
            >
              <Link
                href="/reviews"
                className="block bg-gradient-to-br from-white to-background border-2 border-border rounded-lg p-6 text-center hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-lg bg-primary bg-opacity-10">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="font-semibold text-secondary mb-1">Write Review</div>
                <p className="text-secondary text-sm opacity-70">Share your experience</p>
              </Link>
            </motion.div>

            {userData?.role !== 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ y: -3 }}
              >
                <Link
                  href="/bookings"
                  className="block bg-primary text-white rounded-lg p-6 text-center hover:shadow-lg transition-all"
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-lg bg-white bg-opacity-20">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="font-semibold mb-1">New Booking</div>
                  <p className="text-white text-sm opacity-90">Reserve a table</p>
                </Link>
              </motion.div>
            )}

            {userData?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ y: -3 }}
              >
                <Link
                  href="/admin-dashboard"
                  className="block bg-primary text-white rounded-lg p-6 text-center hover:shadow-lg transition-all"
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-lg bg-white bg-opacity-20">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="font-semibold mb-1">Admin Panel</div>
                  <p className="text-white text-sm opacity-90">Manage system</p>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Account Information */}
        <motion.div 
          className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-border"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">Account Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border">
                <div className="p-2 rounded-lg bg-primary bg-opacity-10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-secondary text-sm opacity-60 mb-1">Full Name</div>
                  <div className="font-semibold text-secondary">{userData?.name || session?.user?.name || 'N/A'}</div>
                </div>
              </div>
            </motion.div>
            
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border">
                <div className="p-2 rounded-lg bg-primary bg-opacity-10">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-secondary text-sm opacity-60 mb-1">Email Address</div>
                  <div className="font-semibold text-secondary truncate">{userData?.email || session?.user?.email || 'N/A'}</div>
                </div>
              </div>
            </motion.div>
            
            {/* Role */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border">
                <div className="p-2 rounded-lg bg-primary bg-opacity-10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-secondary text-sm opacity-60 mb-1">Account Role</div>
                  <div>
                    <motion.span 
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 ${
                        (userData?.role || session?.user?.role) === 'admin' 
                          ? 'bg-primary text-white' 
                          : 'bg-primary bg-opacity-10 text-secondary'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {(userData?.role || session?.user?.role) === 'admin' && <Shield className="w-4 h-4" />}
                      {userData?.role || session?.user?.role || 'user'}
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Member Since */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border">
                <div className="p-2 rounded-lg bg-primary bg-opacity-10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-secondary text-sm opacity-60 mb-1">Member Since</div>
                  <div className="font-semibold text-secondary">
                    {userData?.createdAt ? (
                      new Date(userData.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    ) : (
                      <span className="opacity-60">Loading...</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
