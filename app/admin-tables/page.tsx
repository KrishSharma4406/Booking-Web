'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Table as TableIcon,
  Plus,
  Edit,
  Trash2,
  X,
  MapPin,
  Users,
  CheckCircle,
  Circle,
  ArrowLeft,
  Settings,
  Eye
} from 'lucide-react'

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  const availableCount = tables.filter(t => t.status === 'available').length
  const occupiedCount = tables.filter(t => t.status === 'occupied').length
  const reservedCount = tables.filter(t => t.status === 'reserved').length

  return (
    <div className="relative min-h-screen bg-background text-foreground p-4 md:p-8 pt-20 md:pt-24">
      <div className="relative max-w-7xl mx-auto z-10">
        <ToastContainer position="top-right" theme="dark" />
      
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
                <TableIcon className="w-8 h-8" />
                Table Management
              </h1>
              <p className="text-muted">Manage restaurant tables and seating arrangements</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin-dashboard"
                className="px-6 py-3 bg-card border border-border text-foreground rounded-xl hover:bg-card/80 transition-all flex items-center gap-2 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
              <motion.button
                onClick={() => {
                  setShowForm(true)
                  setEditingTable(null)
                  resetForm()
                }}
                className="bg-foreground text-background px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 hover:opacity-90"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5" />
                Add Table
              </motion.button>
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
                <TableIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Tables</p>
                <p className="text-2xl font-bold text-foreground">{tables.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Available</p>
                <p className="text-2xl font-bold text-foreground">{availableCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Circle className="w-6 h-6 text-red-500 fill-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Occupied</p>
                <p className="text-2xl font-bold text-foreground">{occupiedCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <Eye className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted">Reserved</p>
                <p className="text-2xl font-bold text-foreground">{reservedCount}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Table Form Modal */}
        <AnimatePresence>
        {showForm && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  {editingTable ? 'Edit Table' : 'Add New Table'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingTable(null)
                    resetForm()
                  }}
                  className="p-2 hover:bg-card rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Table Number *</label>
                    <input
                      type="number"
                      required
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({...formData, tableNumber: e.target.value})}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Table Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.tableName}
                      onChange={(e) => setFormData({...formData, tableName: e.target.value})}
                      placeholder="e.g., Window Table 1"
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Capacity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="20"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Location *</label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
                    >
                      {locations.map(loc => (
                        <option key={loc} value={loc}>
                          {loc.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
                    >
                      {statuses.map(st => (
                        <option key={st} value={st}>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Active Status</label>
                    <label className="flex items-center gap-3 cursor-pointer bg-card border border-border rounded-xl px-4 py-3">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-5 h-5 text-foreground rounded focus:ring-2 focus:ring-foreground"
                      />
                      <span className="text-foreground">Table is active</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 text-foreground">Features</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableFeatures.map(feature => (
                      <label key={feature} className="flex items-center gap-2 cursor-pointer bg-card border border-border rounded-lg px-3 py-2 hover:bg-card/80 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="w-4 h-4 text-foreground rounded focus:ring-2 focus:ring-foreground"
                        />
                        <span className="text-sm text-foreground">
                          {feature.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-foreground text-background py-3 rounded-xl font-semibold transition-all hover:opacity-90"
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
                    className="flex-1 bg-card border border-border text-foreground py-3 rounded-xl font-semibold transition-all hover:bg-card/80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Tables Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {tables.map((table, index) => (
            <motion.div
              key={table._id}
              className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-all group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                    <TableIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Table #{table.tableNumber}</h3>
                    <p className="text-muted text-sm">{table.tableName}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  table.status === 'available' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                  table.status === 'occupied' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                  table.status === 'reserved' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                  'bg-gray-500/20 text-gray-500 border-gray-500/30'
                }`}>
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted" />
                  <span className="text-muted">Capacity:</span>
                  <span className="text-foreground font-semibold">{table.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted" />
                  <span className="text-muted">Location:</span>
                  <span className="text-foreground font-semibold">
                    {table.location.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>
                {table.features && table.features.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {table.features.map((feature: string) => (
                        <span key={feature} className="bg-card border border-border px-2 py-1 rounded-lg text-xs text-foreground">
                          {feature.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => handleEdit(table)}
                  className="flex-1 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/30 px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(table._id)}
                  className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {tables.length === 0 && !loading && (
          <motion.div 
            className="glass-card rounded-2xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TableIcon className="w-10 h-10 text-muted" />
            </div>
            <p className="text-xl text-foreground font-semibold mb-2">No tables found</p>
            <p className="text-muted mb-6">Get started by adding your first table</p>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingTable(null)
                resetForm()
              }}
              className="bg-foreground text-background px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Table
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
