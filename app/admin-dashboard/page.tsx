'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
// @ts-expect-error - CSS import
import 'react-toastify/dist/ReactToastify.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Calendar, Clock, CheckCircle, XCircle, User, Mail, Phone, MessageSquare, Hash, Award } from 'lucide-react'

interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface Booking {
  _id: string
  guestName: string
  guestEmail: string
  guestPhone: string
  numberOfGuests: number
  bookingDate: string
  bookingTime: string
  tableNumber?: number
  specialRequests?: string
  status: string
  user?: {
    name: string
  }
}

export default function AdminDashboard() {
  const { status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [tableNumber, setTableNumber] = useState<Record<string, number>>({})

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
      const [usersRes, bookingsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/bookings')
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData.bookings || [])
      }
    } catch {
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string, table?: number) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, tableNumber: table })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
        setTableNumber({})
        fetchData()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Error updating booking')
    }
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const completedBookings = bookings.filter(b => b.status === 'completed')

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-accent/5 text-foreground p-4 md:p-8 pt-20 md:pt-24">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="relative max-w-7xl mx-auto z-10">
        {/* Header with Stats */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div 
              className="glass-card p-4 border border-accent/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div className="text-2xl font-bold">{users.length}</div>
              </div>
              <div className="text-sm text-muted">Total Users</div>
            </motion.div>

            <motion.div 
              className="glass-card p-4 border border-amber-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold">{pendingBookings.length}</div>
              </div>
              <div className="text-sm text-muted">Pending</div>
            </motion.div>

            <motion.div 
              className="glass-card p-4 border border-green-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{confirmedBookings.length}</div>
              </div>
              <div className="text-sm text-muted">Confirmed</div>
            </motion.div>

            <motion.div 
              className="glass-card p-4 border border-blue-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">{bookings.length}</div>
              </div>
              <div className="text-sm text-muted">All Bookings</div>
            </motion.div>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-3 flex-wrap">
            <motion.button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 !text-white shadow-lg shadow-blue-500/30'
                  : 'glass-card border border-border hover:border-accent/40'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-4 h-4" />
              Users ({users.length})
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 !text-white shadow-lg shadow-blue-500/30'
                  : 'glass-card border border-border hover:border-accent/40'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Calendar className="w-4 h-4" />
              Bookings ({bookings.length})
            </motion.button>
          </div>
        </motion.div>

        {/* Users Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card p-6 border border-accent/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold">All Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-card/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Name</th>
                        <th className="px-4 py-3 text-left font-semibold">Email</th>
                        <th className="px-4 py-3 text-left font-semibold">Role</th>
                        <th className="px-4 py-3 text-left font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((user, idx) => (
                        <motion.tr 
                          key={user._id} 
                          className="hover:bg-card/30 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-accent" />
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                              user.role === 'admin' 
                                ? 'bg-accent/10 text-accent border border-accent/30' 
                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                            }`}>
                              {user.role === 'admin' && <Award className="w-3 h-3" />}
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted">
                            {new Date(user.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bookings Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'bookings' && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Pending Bookings */}
              <div className="glass-card p-6 border border-amber-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Clock className="w-6 h-6 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Pending Bookings ({pendingBookings.length})</h2>
                </div>
                {pendingBookings.length === 0 ? (
                  <p className="text-muted text-center py-8">No pending bookings</p>
                ) : (
                  <div className="space-y-4">
                    {pendingBookings.map((booking, idx) => (
                      <motion.div 
                        key={booking._id} 
                        className="bg-card/50 border border-border hover:border-amber-500/40 rounded-xl p-5 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex justify-between items-start flex-wrap gap-4">
                          <div className="flex-1 space-y-3">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                              <User className="w-5 h-5 text-accent" />
                              {booking.guestName}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted" />
                                <span className="text-muted">{booking.guestEmail}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted" />
                                <span className="text-muted">{booking.guestPhone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-muted" />
                                <span className="text-muted">{booking.numberOfGuests} guests</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted" />
                                <span className="text-muted">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted" />
                                <span className="text-muted">{booking.bookingTime}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-muted" />
                                <span className="text-muted">By: {booking.user?.name || 'Unknown'}</span>
                              </div>
                            </div>
                            {booking.specialRequests && (
                              <div className="flex items-start gap-2 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                                <MessageSquare className="w-4 h-4 text-accent mt-0.5" />
                                <div className="flex-1">
                                  <span className="font-semibold text-sm">Special Requests: </span>
                                  <span className="text-sm text-muted">{booking.specialRequests}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 w-full md:w-auto">
                            <div className="flex gap-2 items-center">
                              <div className="relative">
                                <Hash className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="number"
                                  placeholder="Table #"
                                  min="1"
                                  value={tableNumber[booking._id] || ''}
                                  onChange={(e) => setTableNumber({...tableNumber, [booking._id]: parseInt(e.target.value)})}
                                  className="pl-9 pr-3 py-2 bg-card border border-border focus:border-accent rounded-lg w-28 text-center outline-none transition-colors"
                                />
                              </div>
                              <motion.button
                                onClick={() => updateBookingStatus(booking._id, 'confirmed', tableNumber[booking._id])}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Confirm
                              </motion.button>
                            </div>
                            <motion.button
                              onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmed Bookings */}
              <div className="glass-card p-6 border border-green-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Confirmed Bookings ({confirmedBookings.length})</h2>
                </div>
                {confirmedBookings.length === 0 ? (
                  <p className="text-muted text-center py-8">No confirmed bookings</p>
                ) : (
                  <div className="space-y-4">
                    {confirmedBookings.map((booking, idx) => (
                      <motion.div 
                        key={booking._id} 
                        className="bg-card/50 border border-border hover:border-green-500/40 rounded-xl p-5 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex justify-between items-start flex-wrap gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-bold text-xl flex items-center gap-2">
                                <User className="w-5 h-5 text-accent" />
                                {booking.guestName}
                              </h3>
                              {booking.tableNumber && (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-accent/10 text-accent border border-accent/30 flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  Table {booking.tableNumber}
                                </span>
                              )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted" />
                                <span className="text-muted">{booking.guestEmail}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted" />
                                <span className="text-muted">{booking.guestPhone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-muted" />
                                <span className="text-muted">{booking.numberOfGuests} guests</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted" />
                                <span className="text-muted">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted" />
                                <span className="text-muted">{booking.bookingTime}</span>
                              </div>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
