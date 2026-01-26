'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { calculateBookingPrice, getAreaDisplayName, AREA_PRICING } from '@/lib/pricing'
import PaymentForm from '@/components/PaymentForm'
import { motion } from 'framer-motion'

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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-black to-teal-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-950 via-black to-teal-950 text-white overflow-hidden pt-16 md:pt-20">
      <ToastContainer position="top-right" theme="dark" />

      <div className="relative h-64 md:h-80 mb-8">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80')"}}>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/80 to-gray-900"></div>
        </div>
        <div className="relative z-10 h-full flex items-end pb-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              All Bookings
            </motion.h1>
            <motion.p 
              className="text-gray-300 mt-2 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Manage your restaurant reservations
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
        {userRole !== 'admin' && (
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-lg font-semibold"
            >
              {showForm ? 'Cancel' : 'New Booking'}
            </button>
          </div>
        )}

        {showForm && userRole !== 'admin' && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Create New Booking</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Guest Name *</label>
                <input
                  type="text"
                  required
                  value={formData.guestName}
                  onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Number of Guests *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({...formData, numberOfGuests: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-3 font-medium text-lg">Select Dining Area *</label>
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
                        className={`cursor-pointer rounded-lg border-2 overflow-hidden ${
                          formData.tableArea === area
                            ? 'border-purple-500'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="relative h-32">
                          <img src={areaImages[area]} alt={getAreaDisplayName(area)} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 bg-gray-800/80">
                          <div className="font-semibold text-sm">{getAreaDisplayName(area)}</div>
                          <div className="text-xs text-purple-400 mt-1">₹{price}/person</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Time *</label>
                <input
                  type="time"
                  required
                  value={formData.bookingTime}
                  onChange={(e) => setFormData({...formData, bookingTime: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">Select Table (Optional)</label>
                {loadingTables ? (
                  <div className="flex items-center justify-center p-4 bg-gray-700 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading available tables...</span>
                  </div>
                ) : availableTables.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <div
                      onClick={() => setFormData({...formData, tableNumber: ''})}
                      className={`cursor-pointer p-4 rounded-lg border-2 ${
                        formData.tableNumber === ''
                          ? 'border-blue-500 bg-blue-900/30 shadow-blue-500/20'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold">Any Table</div>
                        <div className="text-xs text-gray-400">Auto-assign</div>
                      </div>
                    </div>
                    {availableTables.map((table) => (
                      <div
                        key={table._id}
                        onClick={() => setFormData({...formData, tableNumber: table.tableNumber})}
                        className={`cursor-pointer p-4 rounded-lg border-2 ${
                          formData.tableNumber === table.tableNumber
                            ? 'border-green-500 bg-green-900/30 shadow-green-500/20'
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">
                            {table.location === 'outdoor' ? '' :
                             table.location === 'private-room' ? '' :
                             table.location === 'rooftop' ? '' : ''}
                          </div>
                          <div className="font-semibold">Table #{table.tableNumber}</div>
                          <div className="text-xs text-gray-400">{table.tableName}</div>
                          <div className="text-xs text-gray-500">
                            {table.capacity} seats • {table.location.split('-').join(' ')}
                          </div>
                          {table.features && table.features.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1 justify-center">
                              {table.features.slice(0, 2).map((f: string) => (
                                <span key={f} className="text-xs bg-gray-600 px-1 rounded">
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
                  <div className="p-4 bg-gray-700 rounded-lg text-center text-gray-400">
                    No tables available for the selected time. Try a different time or let us auto-assign a table.
                  </div>
                ) : (
                  <div className="p-4 bg-gray-700 rounded-lg text-center text-gray-400">
                    Select date, time, and number of guests to see available tables
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium">Special Requests</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Any dietary restrictions or special occasions?"
                />
              </div>

              <div className="md:col-span-2">
                <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-lg border border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold">Total Price</p>
                      <p className="text-sm text-gray-400">
                        {formData.numberOfGuests} guests * ₹{(AREA_PRICING as Record<string, number>)[formData.tableArea]}/person ({getAreaDisplayName(formData.tableArea)})
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-green-400">
                      ₹{calculateBookingPrice(formData.numberOfGuests, formData.tableArea).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 rounded-lg font-semibold"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        )}

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

        <div className="grid gap-4">
          {bookings.length === 0 ? (
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-12 text-center border border-gray-700">
              <p className="text-xl text-gray-400 mb-4">No bookings yet</p>
              <p className="text-gray-500">Create your first reservation to get started!</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-gray-600">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{booking.guestName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)} text-white`}>
                        {booking.status.toUpperCase()}
                      </span>
                      {booking.tableNumber && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
                          Table #{booking.tableNumber}
                        </span>
                      )}
                      {booking.paymentStatus === 'paid' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
                          ✓ PAID ₹{booking.paymentAmount}
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-gray-300">
                      <div>Email - {booking.guestEmail}</div>
                      <div>Contact - {booking.guestPhone}</div>
                      <div>Guests - {booking.numberOfGuests}</div>
                      <div>Date - {new Date(booking.bookingDate).toLocaleDateString()}</div>
                      <div>Time - {booking.bookingTime}</div>
                      {booking.tableArea && (
                        <div>Area - {getAreaDisplayName(booking.tableArea)}</div>
                      )}
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-3 p-3 bg-gray-700 rounded">
                        <span className="font-semibold">Special Requests: </span>
                        <span className="text-gray-300">{booking.specialRequests}</span>
                      </div>
                    )}

                    <div className="mt-3 text-sm text-gray-400">
                      Created: {new Date(booking.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
