'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [availableTables, setAvailableTables] = useState([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 2,
    bookingDate: '',
    bookingTime: '',
    tableNumber: '',
    specialRequests: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/Login')
    }
    if (status === 'authenticated') {
      fetchBookings()
    }
  }, [status, router])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Booking created successfully!')
        setShowForm(false)
        setFormData({
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          numberOfGuests: 2,
          bookingDate: '',
          bookingTime: '',
          tableNumber: '',
          specialRequests: ''
        })
        fetchBookings()
      } else {
        toast.error(data.error || 'Failed to create booking')
      }
    } catch (error) {
      toast.error('Error creating booking')
    }
  }

  const cancelBooking = async (id) => {
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

  const fetchAvailableTables = async () => {
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
    } catch (error) {
      console.error('Error fetching tables:', error)
      setAvailableTables([])
    } finally {
      setLoadingTables(false)
    }
  }

  useEffect(() => {
    if (formData.bookingDate && formData.bookingTime && formData.numberOfGuests) {
      fetchAvailableTables()
    }
  }, [formData.bookingDate, formData.bookingTime, formData.numberOfGuests])

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-green-500',
      cancelled: 'bg-red-500',
      completed: 'bg-blue-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <ToastContainer position="top-right" theme="dark" />

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-3xl md:text-4xl font-bold">🍽️ My Bookings</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-lg font-semibold transition-all"
          >
            {showForm ? '✖ Cancel' : 'New Booking'}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
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
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        formData.tableNumber === ''
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">🎲</div>
                        <div className="font-semibold">Any Table</div>
                        <div className="text-xs text-gray-400">Auto-assign</div>
                      </div>
                    </div>
                    {availableTables.map((table) => (
                      <div
                        key={table._id}
                        onClick={() => setFormData({...formData, tableNumber: table.tableNumber})}
                        className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                          formData.tableNumber === table.tableNumber
                            ? 'border-green-500 bg-green-900/30'
                            : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">
                            {table.location === 'outdoor' ? '' :
                             table.location === 'private-room' ? '' :
                             table.location === 'rooftop' ? '🌆' : ''}
                          </div>
                          <div className="font-semibold">Table #{table.tableNumber}</div>
                          <div className="text-xs text-gray-400">{table.tableName}</div>
                          <div className="text-xs text-gray-500">
                            {table.capacity} seats • {table.location.split('-').join(' ')}
                          </div>
                          {table.features && table.features.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1 justify-center">
                              {table.features.slice(0, 2).map(f => (
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
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Any dietary restrictions or special occasions?"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 rounded-lg font-semibold transition-all"
                >
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {bookings.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-xl text-gray-400 mb-4">No bookings yet</p>
              <p className="text-gray-500">Create your first reservation to get started!</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all">
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
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-gray-300">
                      <div>📧 {booking.guestEmail}</div>
                      <div>📱 {booking.guestPhone}</div>
                      <div>👥 {booking.numberOfGuests} guests</div>
                      <div>📅 {new Date(booking.bookingDate).toLocaleDateString()}</div>
                      <div>🕐 {booking.bookingTime}</div>
                      <div>🆔 {booking._id.slice(-8)}</div>
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
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all"
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
