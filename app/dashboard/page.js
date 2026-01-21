'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="relative max-w-6xl mx-auto z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {session?.user?.name || 'User'}!</h1>
          <p className="text-gray-400">Manage your reservations and account</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{stats.bookings}</div>
            <div className="text-blue-100">Total Bookings</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-orange-500 rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{stats.pending}</div>
            <div className="text-orange-100">Pending</div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-teal-500 rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{stats.confirmed}</div>
            <div className="text-teal-100">Confirmed</div>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-md rounded-lg p-6 mb-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/bookings"
              className="bg-gray-700 hover:bg-gray-600 rounded-lg p-6 text-center group"
            >
              <div className="font-semibold">View Bookings</div>
            </Link>

            {userData?.role !== 'admin' && (
              <Link
                href="/bookings"
                className="bg-gradient-to-br from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-lg p-6 text-center group"
              >
                <div className="font-semibold">New Booking</div>
              </Link>
            )}

            {userData?.role === 'admin' && (
              <Link
                href="/admin-dashboard"
                className="bg-gradient-to-br from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 rounded-lg p-6 text-center group"
              >
                <div className="font-semibold">Admin Panel</div>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-md rounded-lg p-6 border border-gray-700/50">
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
                  userData?.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
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
