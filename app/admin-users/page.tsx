'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { IUser } from '@/types/models'
import { motion } from 'framer-motion'

export default function AdminUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)

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

  const handleDeleteUser = async (userId: string, userName: string, userEmail: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${userName}" (${userEmail})?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('User deleted successfully!')
        fetchUsers() // Refresh the list
      } else {
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('An error occurred while deleting the user')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-black to-red-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-950 via-black to-red-950 text-white p-4 md:p-8 pt-20 md:pt-24">
      <div className="relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">All Users</h1>
          <Link
            href="/admin-dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            ← Back to Admin
          </Link>
        </motion.div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Storage</h2>
          <div className="space-y-2 text-gray-300">
            <div>
            <strong>Database:</strong> MongoDB (Cloud Storage)
            </div>
            <div>
            <strong>Passwords:</strong> Hashed with bcrypt
            </div>
            <div>
            <strong>Persistent:</strong> Data stored permanently in database
            </div>
            <div>
            <strong>Total Users:</strong> {users.length}
            </div>
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
                      <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user, index) => (
                      <tr key={user._id.toString()} className="hover:bg-gray-700">
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
                        <td className="px-6 py-4">
                          {session?.user?.email !== user.email ? (
                            <button
                              onClick={() => handleDeleteUser(user._id.toString(), user.name, user.email)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          ) : (
                            <span className="text-gray-500 text-sm">You</span>
                          )}
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
