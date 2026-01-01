'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || [])
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching users:', error)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">👥 Registered Users</h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 User Storage Information</h2>
          <div className="space-y-2 text-gray-300">
            <p>📍 <strong>Location:</strong> lib/users.js (In-memory storage)</p>
            <p>🔐 <strong>Passwords:</strong> Hashed with bcrypt (10 salt rounds)</p>
            <p>⚠️ <strong>Important:</strong> Data is stored in RAM and will be lost when server restarts</p>
            <p>💾 <strong>For Production:</strong> Use a real database (PostgreSQL, MongoDB, MySQL)</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔑 Test Account</h2>
          <div className="bg-gray-700 p-4 rounded">
            <p className="font-mono">Email: <span className="text-green-400">test@example.com</span></p>
            <p className="font-mono">Password: <span className="text-green-400">test123</span></p>
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
                      <th className="px-6 py-3 text-left">ID</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-700">
                        <td className="px-6 py-4 text-gray-400">#{index + 1}</td>
                        <td className="px-6 py-4 font-mono text-blue-400">{user.email}</td>
                        <td className="px-6 py-4">{user.name || '—'}</td>
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

        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
          <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Development Note:</h3>
          <p className="text-yellow-200 text-sm">
            This is a development/testing page. Users are stored in-memory and will be lost on server restart. 
            To create a permanent account, sign up at <Link href="/SignUp" className="underline">/SignUp</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
