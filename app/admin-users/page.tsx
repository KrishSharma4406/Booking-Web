'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { IUser } from '@/types/models'
import { motion } from 'framer-motion'
import { Users, Shield, Trash2, ArrowLeft, Search, UserCheck, Database } from 'lucide-react'

export default function AdminUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const adminCount = users.filter(u => u.role === 'admin').length
  const userCount = users.filter(u => u.role === 'user').length

  return (
    <div className="relative min-h-screen bg-background text-foreground p-4 md:p-8 pt-20 md:pt-24">
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
                <Users className="w-8 h-8" />
                User Management
              </h1>
              <p className="text-muted">Manage all registered users and their roles</p>
            </div>
            <Link
              href="/admin-dashboard"
              className="px-6 py-3 bg-card border border-border text-foreground rounded-xl hover:bg-card/80 transition-all flex items-center gap-2 w-fit font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Admins</p>
                <p className="text-2xl font-bold text-foreground">{adminCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <UserCheck className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Regular Users</p>
                <p className="text-2xl font-bold text-foreground">{userCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Database className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Storage</p>
                <p className="text-lg font-bold text-foreground">MongoDB</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="glass-card p-4 rounded-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-foreground transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div 
          className="glass-card rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-muted mx-auto mb-4" />
              <p className="text-xl text-foreground mb-2">No users found</p>
              <p className="text-muted mb-6">
                {searchTerm ? 'Try adjusting your search criteria' : 'No users registered yet'}
              </p>
              {!searchTerm && (
                <Link
                  href="/SignUp"
                  className="inline-block px-6 py-3 bg-foreground text-background rounded-xl hover:opacity-90 transition-all font-semibold"
                >
                  Create First Account
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-card border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted">#</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user._id.toString()}
                      className="hover:bg-card/50 transition-colors group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      <td className="px-6 py-4 text-muted text-sm">#{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.name || '—'}</p>
                            <p className="text-xs text-muted">ID: {user._id.toString().slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-foreground">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' 
                            : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                        }`}>
                          {user.role === 'admin' && <Shield className="w-3 h-3" />}
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {session?.user?.email !== user.email ? (
                          <button
                            onClick={() => handleDeleteUser(user._id.toString(), user.name, user.email)}
                            className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 group-hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        ) : (
                          <span className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/30 rounded-lg text-sm font-semibold inline-flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            You
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Footer Info */}
        <motion.div 
          className="mt-6 glass-card p-4 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
            <div className="flex items-center gap-6">
              <span>Passwords: Hashed with bcrypt</span>
              <span>Secure: End-to-end encryption</span>
            </div>
            <div>
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
