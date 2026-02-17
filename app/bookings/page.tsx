// filepath: c:\Users\Krish Kumar\OneDrive\Desktop\Mega Project\mega\app\bookings\page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Users as UsersIcon,
  Mail,
  Phone,
  Table as TableIcon,
  Plus,
  X,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Star,
  MapPin,
  Trash2,
  Eye
} from 'lucide-react'
import Image from 'next/image'

// ...existing code...

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

const AREA_PRICING = {
  'indoor': 500,
  'outdoor': 750,
  'private-room': 1500,
  'rooftop': 1000,
  'bar-area': 600,
  'patio': 800
}

const calculateBookingPrice = (guests: number, area: string): number => {
  const basePrice = AREA_PRICING[area as keyof typeof AREA_PRICING] || 500
  const guestMultiplier = Math.ceil(guests / 2) * 100
  return basePrice + guestMultiplier
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
}

interface RazorpayInstance {
  open: () => void
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
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
  const [aiRecommendation, setAiRecommendation] = useState<{
    recommendation: string
    tableArea: string
    reasoning: string
  } | null>(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 2,
    bookingDate: '',
    bookingTime: '',
    tableNumber: undefined as number | undefined,
    tableArea: 'indoor',
    specialRequests: ''
  })
  const [orderId, setOrderId] = useState('')
  const [keyId, setKeyId] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

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
    } catch {
      toast.error('Error loading bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = calculateBookingPrice(formData.numberOfGuests, formData.tableArea)
    setTotalAmount(amount)

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
    } catch {
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
    } catch {
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

  const getAIRecommendation = useCallback(async () => {
    if (!formData.numberOfGuests) return
    
    setLoadingAI(true)
    try {
      const res = await fetch('/api/ai/table-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numberOfGuests: formData.numberOfGuests,
          preferences: formData.specialRequests,
          specialRequests: formData.specialRequests
        })
      })

      const data = await res.json()
      if (res.ok) {
        setAiRecommendation(data)
      }
    } catch (err) {
      console.error('AI recommendation error:', err)
    } finally {
      setLoadingAI(false)
    }
  }, [formData.numberOfGuests, formData.specialRequests])

  useEffect(() => {
    if (formData.bookingDate && formData.bookingTime && formData.numberOfGuests) {
      fetchAvailableTables()
      getAIRecommendation()
    }
  }, [formData.bookingDate, formData.bookingTime, formData.numberOfGuests, fetchAvailableTables, getAIRecommendation])

  const handlePayment = async () => {
    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded')
      return
    }

    const options = {
      key: keyId,
      amount: totalAmount * 100,
      currency: 'INR',
      name: 'Restaurant Booking',
      description: 'Table Reservation',
      order_id: orderId,
      handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              bookingData: formData
            })
          })

          const data = await verifyRes.json()

          if (verifyRes.ok) {
            toast.success('Payment successful! Booking confirmed.')
            setShowForm(false)
            setShowPayment(false)
            fetchBookings()
            setFormData({
              guestName: '',
              guestEmail: '',
              guestPhone: '',
              numberOfGuests: 2,
              bookingDate: '',
              bookingTime: '',
              tableNumber: undefined,
              tableArea: 'indoor',
              specialRequests: ''
            })
          } else {
            toast.error(data.error || 'Payment verification failed')
          }
        } catch {
          toast.error('Error verifying payment')
        }
      },
      prefill: {
        name: formData.guestName,
        email: formData.guestEmail,
        contact: formData.guestPhone
      },
      theme: {
        color: '#000000'
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
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

  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const completedCount = bookings.filter(b => b.status === 'completed').length

  return (
    <div className="relative min-h-screen bg-background text-foreground p-3 sm:p-4 md:p-6 lg:p-8 pt-16 sm:pt-18 md:pt-20 lg:pt-24">
      <ToastContainer position="top-right" theme="dark" />

      <div className="relative max-w-7xl mx-auto z-10">
        {/* Header */}
        <motion.div 
          className="mb-4 sm:mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-foreground flex items-center gap-2 sm:gap-3">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                My Bookings
              </h1>
              <p className="text-sm sm:text-base text-muted">View and manage your table reservations</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                href="/dashboard"
                className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-card border border-border text-foreground rounded-xl hover:bg-card/80 transition-all flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
              {userRole !== 'admin' && (
                <motion.button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-foreground text-background px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:opacity-90 text-sm sm:text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {showForm ? <><X className="w-4 h-4 sm:w-5 sm:h-5" /> Cancel</> : <><Plus className="w-4 h-4 sm:w-5 sm:h-5" /> New Booking</>}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="glass-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg sm:rounded-xl">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-lg sm:rounded-xl">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg sm:rounded-xl">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted">Confirmed</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{confirmedCount}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg sm:rounded-xl">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{completedCount}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
        {showForm && userRole !== 'admin' && (
          <motion.div 
            className="glass-card p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 rounded-xl sm:rounded-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
              <TableIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              Create New Booking
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="mb-2 font-medium text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <UsersIcon className="w-4 h-4" /> Guest Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.guestName}
                  onChange={(e) => setFormData({...formData, guestName: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-card rounded-lg sm:rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="mb-2 font-medium text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <Mail className="w-4 h-4" /> Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-card rounded-lg sm:rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="mb-2 font-medium text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <Phone className="w-4 h-4" /> Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-card rounded-lg sm:rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="mb-2 font-medium text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <UsersIcon className="w-4 h-4" /> Number of Guests *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.numberOfGuests}
                  onChange={(e) => setFormData({...formData, numberOfGuests: parseInt(e.target.value)})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-card rounded-lg sm:rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all text-sm sm:text-base"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-3 font-medium text-base sm:text-lg text-foreground">Select Dining Area *</label>
                
                {/* AI Recommendation Banner */}
                {loadingAI && (
                  <div className="mb-4 sm:mb-5 p-4 sm:p-5 bg-gradient-to-br from-purple-900/30 via-violet-900/20 to-blue-900/30 border border-purple-500/40 rounded-xl sm:rounded-2xl backdrop-blur-sm flex items-center gap-3 sm:gap-4 shadow-lg">
                    <div className="relative flex-shrink-0">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-purple-500"></div>
                      <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-md"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-purple-300 flex items-center gap-2 text-sm sm:text-base">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                        AI Analyzing Your Preferences
                      </p>
                      <p className="text-xs sm:text-sm text-purple-200/80 mt-1">Finding the perfect dining spot just for you...</p>
                    </div>
                  </div>
                )}
                
                {aiRecommendation && !loadingAI && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mb-4 sm:mb-5 relative overflow-hidden rounded-xl sm:rounded-2xl border border-purple-500/50 shadow-2xl shadow-purple-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-violet-600/20 to-blue-600/30 animate-pulse-slow"></div>
                    <div className="absolute inset-0 backdrop-blur-md bg-gray-900/50"></div>
                    
                    <div className="relative p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-white text-sm sm:text-base md:text-lg">AI Recommendation</h3>
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                          </div>
                          <p className="text-gray-200 leading-relaxed mb-3 sm:mb-4 text-xs sm:text-sm md:text-base break-words">{aiRecommendation.recommendation}</p>
                          
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 sm:py-2 rounded-lg backdrop-blur-sm">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-purple-300 flex-shrink-0" />
                              <span className="text-purple-200 font-medium truncate">{aiRecommendation.tableArea}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                  </motion.div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {Object.entries(AREA_PRICING).map(([area, price]) => {
                    const areaImages: Record<string, string> = {
                      'indoor': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
                      'outdoor': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
                      'private-room': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80',
                      'rooftop': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
                      'bar-area': 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&q=80',
                      'patio': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'
                    }
                    
                    const isRecommended = aiRecommendation?.tableArea.toLowerCase() === area.toLowerCase()
                    
                    return (
                      <motion.div
                        key={area}
                        onClick={() => setFormData({...formData, tableArea: area})}
                        className={`relative cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all ${
                          formData.tableArea === area 
                            ? 'border-foreground shadow-lg shadow-foreground/20' 
                            : 'border-border hover:border-foreground/50'
                        } ${isRecommended ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-background' : ''}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isRecommended && (
                          <div className="absolute top-2 right-2 z-10 bg-purple-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 shadow-lg">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                            AI Pick
                          </div>
                        )}
                        <div className="relative h-32 sm:h-40 md:h-48">
                          <Image
                            src={areaImages[area]}
                            alt={area}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                          <h3 className="text-white font-bold mb-1 capitalize text-sm sm:text-base md:text-lg">
                            {area.replace('-', ' ')}
                          </h3>
                          <p className="text-white/90 font-semibold text-xs sm:text-sm md:text-base">₹{price}/person</p>
                        </div>
                        {formData.tableArea === area && (
                          <div className="absolute top-2 left-2 bg-foreground text-background rounded-full p-1.5 sm:p-2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 font-medium text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <Calendar className="w-4 h-4" /> Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-card rounded-lg sm:rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="mb-2 font-medium text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <Clock className="w-4 h-4" /> Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.bookingTime}
                  onChange={(e) => setFormData({...formData, bookingTime: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-card rounded-lg sm:rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all text-sm sm:text-base"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium text-foreground text-sm sm:text-base">Select Table (Optional)</label>
                {loadingTables ? (
                  <div className="text-center py-8">
                    <motion.div 
                      className="inline-block rounded-full h-8 w-8 border-t-2 border-b-2 border-foreground"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="mt-2 text-muted text-sm">Loading available tables...</p>
                  </div>
                ) : availableTables.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableTables.map((table) => (
                      <motion.div
                        key={table._id}
                        onClick={() => setFormData({...formData, tableNumber: table.tableNumber})}
                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all ${
                          formData.tableNumber === table.tableNumber
                            ? 'border-foreground bg-foreground/10'
                            : 'border-border hover:border-foreground/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <TableIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="font-bold text-sm sm:text-base">Table {table.tableNumber}</span>
                          </div>
                          {formData.tableNumber === table.tableNumber && (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted">{table.tableName}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm">
                          <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Capacity: {table.capacity}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="capitalize">{table.location}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : formData.bookingDate && formData.bookingTime ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-xl sm:rounded-2xl">
                    <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-muted" />
                    <p className="text-muted text-sm sm:text-base">No tables available for the selected time</p>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-xl sm:rounded-2xl">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-muted" />
                    <p className="text-muted text-sm sm:text-base">Select date, time, and number of guests to see available tables</p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 font-medium text-foreground text-sm sm:text-base">Special Requests</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-card rounded-lg sm:rounded-xl border border-border focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground text-foreground transition-all resize-none text-sm sm:text-base"
                  rows={3}
                  placeholder="Any special requirements or dietary restrictions..."
                />
              </div>

              <div className="md:col-span-2">
                <motion.button
                  type="submit"
                  className="w-full bg-foreground text-background py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:opacity-90 transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Proceed to Payment (₹{calculateBookingPrice(formData.numberOfGuests, formData.tableArea)})
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Payment Section */}
        {showPayment && orderId && (
          <motion.div 
            className="glass-card p-4 sm:p-6 mb-6 sm:mb-8 rounded-xl sm:rounded-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Complete Payment</h2>
            <div className="mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-2 sm:mb-3 text-sm sm:text-base">
                <span className="text-muted">Booking Amount:</span>
                <span className="font-bold text-base sm:text-lg">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between items-center mb-2 sm:mb-3 text-sm sm:text-base">
                <span className="text-muted">Number of Guests:</span>
                <span className="font-semibold">{formData.numberOfGuests}</span>
              </div>
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-muted">Table Area:</span>
                <span className="font-semibold capitalize">{formData.tableArea.replace('-', ' ')}</span>
              </div>
            </div>
            <motion.button
              onClick={handlePayment}
              className="w-full bg-green-500 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-green-600 transition-all"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Pay Now with Razorpay
            </motion.button>
          </motion.div>
        )}

        {/* Bookings List */}
        <motion.div 
          className="grid gap-3 sm:gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {bookings.length === 0 ? (
            <div className="glass-card p-8 sm:p-12 rounded-xl sm:rounded-2xl text-center">
              <Calendar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-muted" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2">No Bookings Yet</h3>
              <p className="text-muted mb-6 text-sm sm:text-base">Create your first table reservation to get started</p>
              {userRole !== 'admin' && (
                <motion.button
                  onClick={() => setShowForm(true)}
                  className="bg-foreground text-background px-6 sm:px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Booking
                </motion.button>
              )}
            </div>
          ) : (
            bookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="text-lg sm:text-xl font-bold truncate">{booking.guestName}</h3>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        booking.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {booking.status}
                      </span>
                      {booking.paymentStatus && (
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                          booking.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'
                        }`}>
                          {booking.paymentStatus === 'paid' ? '✓ Paid' : 'Pending Payment'}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm sm:text-base">
                      <div className="flex items-center gap-2 text-muted">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{booking.bookingTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted">
                        <UsersIcon className="w-4 h-4 flex-shrink-0" />
                        <span>{booking.numberOfGuests} guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="capitalize truncate">{booking.tableArea.replace('-', ' ')}</span>
                      </div>
                      {booking.tableNumber && (
                        <div className="flex items-center gap-2 text-muted">
                          <TableIcon className="w-4 h-4 flex-shrink-0" />
                          <span>Table {booking.tableNumber}</span>
                        </div>
                      )}
                      {booking.paymentAmount && (
                        <div className="flex items-center gap-2 text-muted">
                          <span className="font-semibold">₹{booking.paymentAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col gap-2">
                    {booking.status === 'pending' && (
                      <motion.button
                        onClick={() => cancelBooking(booking._id)}
                        className="flex-1 lg:flex-none bg-red-500/20 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Cancel</span>
                      </motion.button>
                    )}
                    <Link
                      href={`/bookings/${booking._id}`}
                      className="flex-1 lg:flex-none bg-foreground/10 text-foreground px-4 py-2 rounded-lg hover:bg-foreground/20 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}