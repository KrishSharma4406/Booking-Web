'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/Login')
    }
    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status, router])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Users</h1>
          <Link
            href="/admin-dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            ← Back to Admin
          </Link>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Storage</h2>
          <div className="space-y-2 text-gray-300">
            <strong>Database:</strong> MongoDB (Cloud Storage)
            <strong>Passwords:</strong> Hashed with bcrypt
            <strong>Persistent:</strong> Data stored permanently in database
            <strong>Total Users:</strong> {users.length}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4">Loading users...</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
              <h2 className="text-xl font-semibold">
                Total Users: <span className="text-blue-400">{users.length}</span>
              </h2>
            </div>
            
            {users.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-lg">No users registered yet</p>
                <Link 
                  href="/SignUp"
                  className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                >
                  Create First Account
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left">#</th>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-left">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user, index) => (
                      <tr key={user._id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 text-gray-400">#{index + 1}</td>
                        <td className="px-6 py-4">{user.name || '—'}</td>
                        <td className="px-6 py-4 font-mono text-blue-400">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
