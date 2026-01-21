'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [tableNumber, setTableNumber] = useState({})

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
    } catch (error) {
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, status, table) => {
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
    } catch (error) {
      toast.error('Error updating booking')
    }
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="relative max-w-7xl mx-auto z-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Admin Dashboard</h1>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Bookings ({bookings.length})
            </button>
          </div>
        </div>

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-gray-800/30 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-4 text-blue-400">
                All Users ({users.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-gray-700">
                        <td className="px-4 py-3">{user.name}</td>
                        <td className="px-4 py-3 text-gray-300">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="bg-gray-800/30 backdrop-blur-md rounded-lg p-6 border border-yellow-600/50">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">
                Pending Bookings ({pendingBookings.length})
              </h2>
              {pendingBookings.length === 0 ? (
                <p className="text-gray-400">No pending bookings</p>
              ) : (
                <div className="space-y-3">
                  {pendingBookings.map(booking => (
                    <div key={booking._id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">{booking.guestName}</h3>
                          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
                            <div>{booking.guestEmail}</div>
                            <div>{booking.guestPhone}</div>
                            <div>{booking.numberOfGuests} guests</div>
                            <div>{new Date(booking.bookingDate).toLocaleDateString()}</div>
                            <div>{booking.bookingTime}</div>
                            <div>Booked by: {booking.user?.name || 'Unknown'}</div>
                          </div>
                          {booking.specialRequests && (
                            <div className="mt-2 p-2 bg-gray-600 rounded text-sm">
                              <span className="font-semibold">Special: </span>
                              {booking.specialRequests}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 w-full md:w-auto">
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              placeholder="Table #"
                              min="1"
                              value={tableNumber[booking._id] || ''}
                              onChange={(e) => setTableNumber({...tableNumber, [booking._id]: parseInt(e.target.value)})}
                              className="px-3 py-2 bg-gray-600 rounded w-24 text-center"
                            />
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'confirmed', tableNumber[booking._id])}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
                            >
                              ✓ Confirm
                            </button>
                          </div>
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold"
                          >
                            ✗ Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmed Bookings */}
            <div className="bg-gray-800/30 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-4 text-green-400">
                ✓ Confirmed Bookings ({confirmedBookings.length})
              </h2>
              <div className="space-y-3">
                {confirmedBookings.map(booking => (
                  <div key={booking._id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{booking.guestName}</h3>
                          {booking.tableNumber && (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-600">
                              Table #{booking.tableNumber}
                            </span>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
                          <div>{booking.guestEmail}</div>
                          <div>{booking.guestPhone}</div>
                          <div>{booking.numberOfGuests} guests</div>
                          <div>{new Date(booking.bookingDate).toLocaleDateString()}</div>
                          <div>{booking.bookingTime}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'completed')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
                      >
                        Mark Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
