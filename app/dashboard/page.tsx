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
        console.log('User data fetched:', user)
        setUserData(user)
      } else {
        console.error('Failed to fetch user data:', await userRes.text())
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json()
        const bookings = data.bookings || []
        setStats({
          bookings: bookings.length,
          pending: bookings.filter((b: IBooking) => b.status === 'pending').length,
          confirmed: bookings.filter((b: IBooking) => b.status === 'confirmed').length
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-accent/5 text-foreground p-4 sm:p-6 md:p-8 pt-20 sm:pt-20 md:pt-24">
      <div className="relative max-w-7xl mx-auto z-10">
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome back, {session?.user?.name || 'User'}!
          </motion.h1>
          <motion.p 
            className="text-muted text-base sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Here is your reservation overview and quick actions
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div 
            className="glass-card p-4 sm:p-6 border border-accent/20 hover:border-accent/40 transition-all"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-accent/10 border border-accent/20">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
            </div>
            <motion.div 
              className="text-3xl sm:text-4xl font-bold mb-1 text-foreground"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 200 }}
            >
              {stats.bookings}
            </motion.div>
            <div className="text-muted text-sm sm:text-base">Total Bookings</div>
          </motion.div>

          <motion.div 
            className="glass-card p-4 sm:p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>
            </div>
            <motion.div 
              className="text-3xl sm:text-4xl font-bold mb-1 text-foreground"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6, type: "spring", stiffness: 200 }}
            >
              {stats.pending}
            </motion.div>
            <div className="text-muted text-sm sm:text-base">Pending</div>
          </motion.div>

          <motion.div 
            className="glass-card p-4 sm:p-6 border border-green-500/20 hover:border-green-500/40 transition-all"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
            </div>
            <motion.div 
              className="text-3xl sm:text-4xl font-bold mb-1 text-foreground"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7, type: "spring", stiffness: 200 }}
            >
              {stats.confirmed}
            </motion.div>
            <div className="text-muted text-sm sm:text-base">Confirmed</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="glass-card p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-accent/10"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.div
            className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="p-2 rounded-lg bg-accent/10">
              <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Quick Actions</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/bookings"
                className="block bg-gradient-to-br from-card to-card/50 border-2 border-border hover:border-accent rounded-xl p-6 text-center group transition-all hover:bg-gray-950 hover:scale-105"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <CalendarCheck className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <div className="font-semibold text-foreground">View Bookings</div>
                <p className="text-sm text-muted mt-1">Manage reservations</p>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.95 }}
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/reviews"
                className="block glass-card hover:bg-card/70 rounded-xl p-6 text-center group transition-all border border-border hover:border-yellow-500/40"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <div className="font-semibold text-foreground">Write Review</div>
                <p className="text-sm text-muted mt-1">Share your experience</p>
              </Link>
            </motion.div>

            {userData?.role !== 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/bookings"
                  className="block bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white rounded-xl p-6 text-center group transition-all "
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-xl bg-white/20">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="font-semibold">New Booking</div>
                  <p className="text-sm text-white/80 mt-1">Reserve a table</p>
                </Link>
              </motion.div>
            )}

            {userData?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/admin-dashboard"
                  className="block bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white rounded-xl p-6 text-center group transition-all hover:scale-105 hover:bg-gray-800">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-xl bg-white/20">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="font-semibold">Admin Panel</div>
                  <p className="text-sm text-white/80 mt-1">Manage system</p>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Account Information */}
        <motion.div 
          className="glass-card p-8 border border-accent/10"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <div className="p-2 rounded-lg bg-accent/10">
              <User className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Account Information</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              className="group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border hover:border-accent/40 transition-all">
                <div className="p-2 rounded-lg bg-accent/10">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="text-muted text-sm mb-1">Full Name</div>
                  <div className="font-semibold text-foreground">{userData?.name || session?.user?.name || 'N/A'}</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border hover:border-accent/40 transition-all">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="text-muted text-sm mb-1">Email Address</div>
                  <div className="font-semibold text-foreground truncate">{userData?.email || session?.user?.email || 'N/A'}</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border hover:border-accent/40 transition-all">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="text-muted text-sm mb-1">Account Role</div>
                  <div>
                    <motion.span 
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 ${
                        (userData?.role || session?.user?.role) === 'admin' 
                          ? 'bg-gradient-to-r from-accent to-accent/80 text-white' 
                          : 'bg-accent/10 text-accent border border-accent/30'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {(userData?.role || session?.user?.role) === 'admin' && <Shield className="w-4 h-4" />}
                      {userData?.role || session?.user?.role || 'user'}
                    </motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="group"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border hover:border-accent/40 transition-all">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="text-muted text-sm mb-1">Member Since</div>
                  <div className="font-semibold text-foreground">
                    {userData?.createdAt ? (
                      new Date(userData.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    ) : (
                      <span className="text-muted">Loading...</span>
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
