'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
// @ts-expect-error - CSS import
import 'react-toastify/dist/ReactToastify.css'
import { motion } from 'framer-motion'

interface Table {
  _id: string
  tableNumber: number
  tableName: string
  capacity: number
  location: string
  status: string
  features: string[]
  isActive: boolean
}

interface FormData {
  tableNumber: string | number
  tableName: string
  capacity: number
  location: string
  status: string
  features: string[]
  isActive: boolean
}

export default function AdminTablesPage() {
  const { status } = useSession()
  const router = useRouter()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState<FormData>({
    tableNumber: '',
    tableName: '',
    capacity: 2,
    location: 'indoor',
    status: 'available',
    features: [],
    isActive: true
  })

  const locations = ['indoor', 'outdoor', 'private-room', 'bar-area', 'patio', 'rooftop']
  const statuses = ['available', 'occupied', 'reserved', 'maintenance']
  const availableFeatures = [
    'window-view', 'near-kitchen', 'quiet-corner', 'romantic', 
    'family-friendly', 'accessible', 'vip'
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/Login')
    }
    if (status === 'authenticated') {
      fetchTables()
    }
  }, [status, router])

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables')
      const data = await res.json()
      if (res.ok) {
        setTables(data.tables || [])
      } else {
        toast.error(data.error || 'Failed to fetch tables')
      }
    } catch {
      toast.error('Error loading tables')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingTable ? `/api/tables/${editingTable._id}` : '/api/tables'
      const method = editingTable ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || `Table ${editingTable ? 'updated' : 'created'} successfully!`)
        setShowForm(false)
        setEditingTable(null)
        resetForm()
        fetchTables()
      } else {
        toast.error(data.error || `Failed to ${editingTable ? 'update' : 'create'} table`)
      }
    } catch {
      toast.error(`Error ${editingTable ? 'updating' : 'creating'} table`)
    }
  }

  const handleEdit = (table: Table) => {
    setEditingTable(table)
    setFormData({
      tableNumber: table.tableNumber,
      tableName: table.tableName,
      capacity: table.capacity,
      location: table.location,
      status: table.status,
      features: table.features || [],
      isActive: table.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return

    try {
      const res = await fetch(`/api/tables/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || 'Table deleted')
        fetchTables()
      } else {
        toast.error(data.error || 'Failed to delete table')
      }
    } catch {
      toast.error('Error deleting table')
    }
  }

  const resetForm = () => {
    setFormData({
      tableNumber: '',
      tableName: '',
      capacity: 2,
      location: 'indoor',
      status: 'available',
      features: [],
      isActive: true
    })
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
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
        <ToastContainer position="top-right" theme="dark" />
      
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Table Management</h1>
            <p className="text-gray-400">Manage restaurant tables and seating</p>
          </div>
          <motion.button
            onClick={() => {
              setShowForm(true)
              setEditingTable(null)
              resetForm()
            }}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Add New Table
          </motion.button>
        </motion.div>

        {/* Table Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Table Number *</label>
                    <input
                      type="number"
                      required
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({...formData, tableNumber: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Table Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.tableName}
                      onChange={(e) => setFormData({...formData, tableName: e.target.value})}
                      placeholder="e.g., Window Table 1"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Capacity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="20"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location *</label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>
                          {loc.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statuses.map(st => (
                        <option key={st} value={st}>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Active</label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2">Table is active</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Features</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableFeatures.map(feature => (
                      <label key={feature} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm">
                          {feature.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
                  >
                    {editingTable ? 'Update Table' : 'Create Table'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingTable(null)
                      resetForm()
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div
              key={table._id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">Table #{table.tableNumber}</h3>
                  <p className="text-gray-400">{table.tableName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  table.status === 'available' ? 'bg-green-900 text-green-300' :
                  table.status === 'occupied' ? 'bg-red-900 text-red-300' :
                  table.status === 'reserved' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {table.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="text-gray-400">Capacity:</span> {table.capacity} guests
                </p>
                <p className="text-sm">
                  <span className="text-gray-400">Location:</span> {table.location.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </p>
                {table.features && table.features.length > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-400">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {table.features.map((feature: string) => (
                        <span key={feature} className="bg-gray-700 px-2 py-1 rounded text-xs">
                          {feature.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(table)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(table._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {tables.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tables found. Add your first table!</p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
