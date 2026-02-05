'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ToastContainer, toast } from 'react-toastify'
// @ts-expect-error - CSS import
import 'react-toastify/dist/ReactToastify.css'
import { calculateBookingPrice, getAreaDisplayName, AREA_PRICING } from '@/lib/pricing'
import PaymentForm from '@/components/PaymentForm'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Users as UsersIcon, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  CreditCard, 
  Plus, 
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Table as TableIcon,
  ArrowLeft
} from 'lucide-react'

interface Table {
  _id: string
  tableNumber: number
  tableName: string
  capacity: number
  location: string
  features?: string[]
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
  tableArea: string
  specialRequests?: string
  status: string
  paymentStatus?: string
  paymentAmount?: number
  createdAt: string
}

export default function BookingsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [userRole, setUserRole] = useState('user')
  const [availableTables, setAvailableTables] = useState<Table[]>([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 2,
    bookingDate: '',
    bookingTime: '',
    tableNumber: '' as string | number,
    tableArea: 'indoor',
    specialRequests: ''
  })
  const [orderId, setOrderId] = useState('')
  const [keyId, setKeyId] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/Login')
    }
    if (status === 'authenticated') {
      fetchUserRole()
      fetchBookings()
    }
  }, [status, router])

  const fetchUserRole = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setUserRole(data.role)
      }
    } catch (err) {
      console.error('Error fetching user role:', err)
    }
  }

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (res.ok) {
        setBookings(data.bookings || [])
      } else {
        toast.error(data.error || 'Failed to fetch bookings')
      }
    } catch {
      toast.error('Error loading bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate price
    const amount = calculateBookingPrice(formData.numberOfGuests, formData.tableArea)
    setTotalAmount(amount)

    // Create payment order
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          numberOfGuests: formData.numberOfGuests,
          tableArea: formData.tableArea,
          bookingDate: formData.bookingDate,
          bookingTime: formData.bookingTime
        })
      })

      const data = await res.json()

      if (res.ok) {
        setOrderId(data.orderId)
        setKeyId(data.keyId)
        setShowPayment(true)
      } else {
        toast.error(data.error || 'Failed to initialize payment')
      }
    } catch {
      toast.error('Error initializing payment')
    }
  }

  const cancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Booking cancelled')
        fetchBookings()
      } else {
        toast.error(data.error || 'Failed to cancel booking')
      }
    } catch {
      toast.error('Error cancelling booking')
    }
  }

  const fetchAvailableTables = useCallback(async () => {
    if (!formData.bookingDate || !formData.bookingTime || !formData.numberOfGuests) {
      setAvailableTables([])
      return
    }

    setLoadingTables(true)
    try {
      const params = new URLSearchParams({
        available: 'true',
        date: formData.bookingDate,
        time: formData.bookingTime,
        guests: formData.numberOfGuests.toString()
      })

      const res = await fetch(`/api/tables?${params}`)
      const data = await res.json()

      if (res.ok) {
        setAvailableTables(data.tables || [])
        if (data.tables.length === 0) {
          toast.info('No tables available for the selected time')
        }
      } else {
        toast.error('Failed to fetch available tables')
        setAvailableTables([])
      }
    } catch (err) {
      console.error('Error fetching tables:', err)
      setAvailableTables([])
    } finally {
      setLoadingTables(false)
    }
  }, [formData.bookingDate, formData.bookingTime, formData.numberOfGuests])

  useEffect(() => {
    if (formData.bookingDate && formData.bookingTime && formData.numberOfGuests) {
      fetchAvailableTables()
    }
  }, [formData.bookingDate, formData.bookingTime, formData.numberOfGuests, fetchAvailableTables])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-green-500',
      cancelled: 'bg-red-500',
      completed: 'bg-blue-500'
    }
    return colors[status] || 'bg-gray-500'
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

  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const completedCount = bookings.filter(b => b.status === 'completed').length

  return (
    <div className="relative min-h-screen bg-background text-foreground p-4 md:p-8 pt-20 md:pt-24">
      <ToastContainer position="top-right" theme="dark" />

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-foreground flex items-center gap-3">
                <Calendar className="w-8 h-8" />
                My Bookings
              </h1>
              <p className="text-muted">View and manage your table reservations</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-card border border-border text-foreground rounded-xl hover:bg-card/80 transition-all flex items-center gap-2 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
              {userRole !== 'admin' && (
                <motion.button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-foreground text-background px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 hover:opacity-90"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {showForm ? <><X className="w-5 h-5" /> Cancel</> : <><Plus className="w-5 h-5" /> New Booking</>}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Total</p>
                <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Confirmed</p>
                <p className="text-2xl font-bold text-foreground">{confirmedCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Completed</p>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
        {showForm && userRole !== 'admin' && (
          <motion.div 
            className="glass-card p-6 mb-8 rounded-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TableIcon className="w-6 h-6" />
              Create New Booking
            </h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-foreground flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" /> Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.guestName}
                  onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                  className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
                  className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
                  className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" /> Number of Guests *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({...formData, numberOfGuests: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-3 font-medium text-lg text-foreground">Select Dining Area *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(AREA_PRICING).map(([area, price], index) => {
                    const areaImages: Record<string, string> = {
                      'indoor': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
                      'outdoor': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
                      'private-room': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80',
                      'rooftop': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
                      'bar-area': 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&q=80',
                      'patio': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'
                    }
                    return (
                      <motion.div
                        key={area}
                        onClick={() => setFormData({...formData, tableArea: area})}
                        className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                          formData.tableArea === area
                            ? 'border-foreground'
                            : 'border-border hover:border-foreground/50'
                        }`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="relative h-32">
                          <Image src={areaImages[area]} alt={getAreaDisplayName(area)} className="w-full h-full object-cover" fill sizes="400px" />
                        </div>
                        <div className="p-3 bg-card">
                          <div className="font-semibold text-sm text-foreground">{getAreaDisplayName(area)}</div>
                          <div className="text-xs text-muted mt-1">₹{price}/person</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
                  className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.bookingTime}
                  onChange={(e) => setFormData({...formData, bookingTime: e.target.value})}
                  className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium text-foreground">Select Table (Optional)</label>
                {loadingTables ? (
                  <div className="flex items-center justify-center p-4 bg-card rounded-xl">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-foreground"></div>
                    <span className="ml-2 text-foreground">Loading available tables...</span>
                  </div>
                ) : availableTables.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div
                      onClick={() => setFormData({...formData, tableNumber: ''})}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        formData.tableNumber === ''
                          ? 'border-foreground bg-foreground/10'
                          : 'border-border bg-card hover:border-foreground/50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-foreground">Any Table</div>
                        <div className="text-xs text-muted">Auto-assign</div>
                      </div>
                    </div>
                    {availableTables.map((table) => (
                      <div
                        key={table._id}
                        onClick={() => setFormData({...formData, tableNumber: table.tableNumber})}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                          formData.tableNumber === table.tableNumber
                            ? 'border-foreground bg-foreground/10'
                            : 'border-border bg-card hover:border-foreground/50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">
                            {table.location === 'outdoor' ? '' :
                             table.location === 'private-room' ? '' :
                             table.location === 'rooftop' ? '' : ''}
                          </div>
                          <div className="font-semibold text-foreground">Table #{table.tableNumber}</div>
                          <div className="text-xs text-muted">{table.tableName}</div>
                          <div className="text-xs text-muted">
                            {table.capacity} seats • {table.location.split('-').join(' ')}
                          </div>
                          {table.features && table.features.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1 justify-center">
                              {table.features.slice(0, 2).map((f: string) => (
                                <span key={f} className="text-xs bg-card border border-border px-1 rounded">
                                  {f === 'window-view' ? '' :
                                   f === 'romantic' ? '' :
                                   f === 'vip' ? '' :
                                   f === 'accessible' ? '' : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : formData.bookingDate && formData.bookingTime ? (
                  <div className="p-4 bg-card rounded-xl text-center text-muted">
                    No tables available for the selected time. Try a different time or let us auto-assign a table.
                  </div>
                ) : (
                  <div className="p-4 bg-card rounded-xl text-center text-muted">
                    Select date, time, and number of guests to see available tables
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Special Requests
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all"
                  placeholder="Any dietary restrictions or special occasions?"
                />
              </div>

              <div className="md:col-span-2">
                <div className="glass-card p-6 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <CreditCard className="w-5 h-5" /> Total Price
                      </p>
                      <p className="text-sm text-muted mt-1">
                        {formData.numberOfGuests} guests × ₹{(AREA_PRICING as Record<string, number>)[formData.tableArea]}/person ({getAreaDisplayName(formData.tableArea)})
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-green-500">
                      ₹{calculateBookingPrice(formData.numberOfGuests, formData.tableArea).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceed to Payment
                </button>
              </div>
            </form>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Payment Section */}
        {showPayment && orderId && (
          <div className="mb-8">
            <PaymentForm
              formData={formData}
              orderId={orderId}
              keyId={keyId}
              totalAmount={totalAmount}
              onSuccess={() => {
                setShowPayment(false)
                setShowForm(false)
                setOrderId('')
                setFormData({
                  guestName: '',
                  guestEmail: '',
                  guestPhone: '',
                  numberOfGuests: 2,
                  bookingDate: '',
                  bookingTime: '',
                  tableNumber: '',
                  tableArea: 'indoor',
                  specialRequests: ''
                })
                fetchBookings()
              }}
              onCancel={() => {
                setShowPayment(false)
                setOrderId('')
              }}
            />
          </div>
        )}

        <motion.div 
          className="grid gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {bookings.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-muted" />
              </div>
              <p className="text-xl text-foreground font-semibold mb-2">No bookings yet</p>
              <p className="text-muted mb-6">Create your first reservation to get started!</p>
              {userRole !== 'admin' && !showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-foreground text-background px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Make Your First Booking
                </button>
              )}
            </div>
          ) : (
            bookings.map((booking, index) => (
              <motion.div 
                key={booking._id} 
                className="glass-card p-6 rounded-2xl hover:scale-[1.01] transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <h3 className="text-xl font-bold text-foreground">{booking.guestName}</h3>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 border ${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                        booking.status === 'cancelled' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                        'bg-blue-500/20 text-blue-500 border-blue-500/30'
                      }`}>
                        {booking.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                        {booking.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                        {booking.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                        {booking.status.toUpperCase()}
                      </span>
                      {booking.tableNumber && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-500 border border-purple-500/30 inline-flex items-center gap-1">
                          <TableIcon className="w-3 h-3" />
                          Table #{booking.tableNumber}
                        </span>
                      )}
                      {booking.paymentStatus === 'paid' && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-500 border border-green-500/30 inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          PAID ₹{booking.paymentAmount}
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Mail className="w-4 h-4 text-muted" />
                        <span className="text-muted">Email:</span> {booking.guestEmail}
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="w-4 h-4 text-muted" />
                        <span className="text-muted">Phone:</span> {booking.guestPhone}
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <UsersIcon className="w-4 h-4 text-muted" />
                        <span className="text-muted">Guests:</span> {booking.numberOfGuests}
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Calendar className="w-4 h-4 text-muted" />
                        <span className="text-muted">Date:</span> {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Clock className="w-4 h-4 text-muted" />
                        <span className="text-muted">Time:</span> {booking.bookingTime}
                      </div>
                      {booking.tableArea && (
                        <div className="flex items-center gap-2 text-foreground">
                          <MapPin className="w-4 h-4 text-muted" />
                          <span className="text-muted">Area:</span> {getAreaDisplayName(booking.tableArea)}
                        </div>
                      )}
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-4 p-4 bg-card border border-border rounded-xl">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-muted mt-0.5" />
                          <div>
                            <span className="font-semibold text-foreground text-sm">Special Requests:</span>
                            <p className="text-muted text-sm mt-1">{booking.specialRequests}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 text-xs text-muted flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Created: {new Date(booking.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 rounded-xl font-semibold transition-all flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}
