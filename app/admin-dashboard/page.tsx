'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Calendar, Clock, CheckCircle, XCircle, User, Mail, Phone,
  MessageSquare, Hash, Award, TrendingUp, DollarSign, Star, BarChart3,
  PieChart as PieChartIcon, Activity, ArrowUpRight,
  ThumbsUp, ThumbsDown, Reply, Trash2, Filter, MapPin, CreditCard,
  UserCheck, AlertCircle, RefreshCcw,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar,
} from 'recharts'

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
interface UserData {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
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
  specialRequests?: string
  status: string
  paymentStatus?: string
  paymentAmount?: number
  user?: { name: string }
}

interface ReviewData {
  _id: string
  name: string
  email: string
  rating: number
  title: string
  comment: string
  category: string
  status: string
  adminReply?: string
  repliedAt?: string
  helpfulCount: number
  createdAt: string
  user?: { name: string; email: string; image?: string }
}

interface Analytics {
  overview: {
    totalUsers: number
    totalBookings: number
    totalTables: number
    totalReviews: number
    totalRevenue: number
    avgOrderValue: number
    cancellationRate: number
    completionRate: number
    todayBookings: number
    todayRevenue: number
    thisWeekBookings: number
  }
  bookingsByStatus: Record<string, number>
  monthlyRevenue: { month: string; revenue: number; bookings: number }[]
  dailyBookings: { date: string; bookings: number; revenue: number }[]
  bookingsByHour: { _id: string; count: number }[]
  guestDistribution: { _id: string; count: number }[]
  areaPopularity: { _id: string; count: number }[]
  paymentMethods: { _id: string; count: number; total: number }[]
  newUsers: { month: string; users: number }[]
  reviews: {
    stats: { averageRating: number; totalReviews: number }
    ratingDistribution: { rating: string; count: number }[]
    byCategory: { _id: string; count: number; avgRating: number }[]
    byStatus: { _id: string; count: number }[]
    recent: ReviewData[]
  }
  topCustomers: {
    _id: string
    totalBookings: number
    totalSpent: number
    user: { name: string; email: string }
  }[]
}

// ──────────────────────────────────────────────────────────────
// Colors
// ──────────────────────────────────────────────────────────────
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#22c55e',
  cancelled: '#ef4444',
  completed: '#3b82f6',
}
const RATING_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']

// ──────────────────────────────────────────────────────────────
// Custom tooltip
// ──────────────────────────────────────────────────────────────
interface TooltipPayload {
  name: string
  value: number
  color: string
}
interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}
const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-xl">
      <p className="text-sm font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('revenue')
            ? `₹${p.value.toLocaleString()}`
            : p.value}
        </p>
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { status } = useSession()
  const router = useRouter()

  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'reviews' | 'users' | 'customers'>('overview')
  const [tableNumber, setTableNumber] = useState<Record<string, number>>({})
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [reviewFilter, setReviewFilter] = useState<string>('all')

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, usersRes, bookingsRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/users'),
        fetch('/api/bookings'),
        fetch('/api/reviews'),
      ])

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
      if (usersRes.ok) { const d = await usersRes.json(); setUsers(d.users || []) }
      if (bookingsRes.ok) { const d = await bookingsRes.json(); setBookings(d.bookings || []) }
      if (reviewsRes.ok) { const d = await reviewsRes.json(); setReviews(d.reviews || []) }
    } catch {
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/Login')
    if (status === 'authenticated') fetchData()
  }, [status, router, fetchData])

  // ── Auto-refresh every 30 seconds for real-time updates ──
  useEffect(() => {
    if (status !== 'authenticated') return
    const interval = setInterval(() => {
      fetchData()
    }, 30000)
    return () => clearInterval(interval)
  }, [status, fetchData])

  // ── Actions ───────────────────────────────────────────────
  const updateBookingStatus = async (bookingId: string, newStatus: string, table?: number) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, tableNumber: table }),
      })
      const data = await res.json()
      if (res.ok) { toast.success(data.message); setTableNumber({}); fetchData() }
      else toast.error(data.error)
    } catch { toast.error('Error updating booking') }
  }

  const updateReviewStatus = async (reviewId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) { toast.success('Review status updated'); fetchData() }
      else toast.error('Failed to update review')
    } catch { toast.error('Error updating review') }
  }

  const replyToReview = async (reviewId: string) => {
    const reply = replyText[reviewId]
    if (!reply?.trim()) return toast.error('Please enter a reply')
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: reply }),
      })
      if (res.ok) {
        toast.success('Reply sent')
        setReplyText((prev) => ({ ...prev, [reviewId]: '' }))
        fetchData()
      } else toast.error('Failed to send reply')
    } catch { toast.error('Error sending reply') }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review permanently?')) return
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Review deleted'); fetchData() }
      else toast.error('Failed to delete review')
    } catch { toast.error('Error deleting review') }
  }

  // ── Derived data ──────────────────────────────────────────
  const pendingBookings = bookings.filter((b) => b.status === 'pending')
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed')

  const filteredReviews =
    reviewFilter === 'all' ? reviews : reviews.filter((r) => r.status === reviewFilter)

  const statusPieData = analytics
    ? Object.entries(analytics.bookingsByStatus).map(([name, value]) => ({ name, value }))
    : []

  // ── Loading ───────────────────────────────────────────────
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  const ov = analytics?.overview

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-accent/5 text-foreground p-4 md:p-8 pt-20 md:pt-24">
      <ToastContainer position="top-right" theme="dark" />

      <div className="relative max-w-[1400px] mx-auto z-10">
        {/* ─── Header ──────────────────────────────────────── */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <motion.button
              onClick={() => { setLoading(true); fetchData() }}
              className="flex items-center gap-2 px-4 py-2 glass-card border border-border hover:border-accent/40 rounded-xl text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCcw className="w-4 h-4" /> Refresh
            </motion.button>
          </div>

          {/* ─── Top KPI Cards ─────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
            {[
              { icon: DollarSign, label: 'Total Revenue', value: `₹${(ov?.totalRevenue || 0).toLocaleString()}`, color: 'text-green-500', border: 'border-green-500/20', bg: 'bg-green-500/10' },
              { icon: Calendar, label: 'Total Bookings', value: ov?.totalBookings || 0, color: 'text-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/10' },
              { icon: Users, label: 'Total Users', value: ov?.totalUsers || 0, color: 'text-accent', border: 'border-accent/20', bg: 'bg-accent/10' },
              { icon: Star, label: 'Avg Rating', value: analytics?.reviews?.stats?.averageRating || 'N/A', color: 'text-yellow-500', border: 'border-yellow-500/20', bg: 'bg-yellow-500/10' },
              { icon: Activity, label: 'Today Bookings', value: ov?.todayBookings || 0, color: 'text-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/10' },
              { icon: TrendingUp, label: 'Today Revenue', value: `₹${(ov?.todayRevenue || 0).toLocaleString()}`, color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
            ].map((card, i) => (
              <motion.div
                key={i}
                className={`glass-card p-3 md:p-4 border ${card.border}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 md:p-2 rounded-lg ${card.bg}`}>
                    <card.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${card.color}`} />
                  </div>
                </div>
                <div className="text-xl md:text-2xl font-bold truncate">{card.value}</div>
                <div className="text-xs text-muted mt-1">{card.label}</div>
              </motion.div>
            ))}
          </div>

          {/* ─── Secondary KPIs ────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
            {[
              { label: 'Pending', value: analytics?.bookingsByStatus?.pending || 0, icon: Clock, color: 'text-amber-500', border: 'border-amber-500/20' },
              { label: 'Confirmed', value: analytics?.bookingsByStatus?.confirmed || 0, icon: CheckCircle, color: 'text-green-500', border: 'border-green-500/20' },
              { label: 'Completed', value: analytics?.bookingsByStatus?.completed || 0, icon: UserCheck, color: 'text-blue-500', border: 'border-blue-500/20' },
              { label: 'Cancellation Rate', value: `${ov?.cancellationRate || 0}%`, icon: XCircle, color: 'text-red-500', border: 'border-red-500/20' },
              { label: 'Avg Order', value: `₹${ov?.avgOrderValue || 0}`, icon: CreditCard, color: 'text-violet-500', border: 'border-violet-500/20' },
            ].map((card, i) => (
              <motion.div
                key={i}
                className={`glass-card p-3 border ${card.border} flex items-center gap-3`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <card.icon className={`w-4 h-4 md:w-5 md:h-5 ${card.color}`} />
                <div>
                  <div className="text-base md:text-lg font-bold truncate">{card.value}</div>
                  <div className="text-xs text-muted">{card.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ─── Tab Navigation ────────────────────────────── */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {([
              { key: 'overview', icon: BarChart3, label: 'Analytics' },
              { key: 'bookings', icon: Calendar, label: `Bookings (${bookings.length})` },
              { key: 'reviews', icon: Star, label: `Reviews (${reviews.length})` },
              { key: 'users', icon: Users, label: `Users (${users.length})` },
              { key: 'customers', icon: Award, label: 'Top Customers' },
            ] as const).map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-xs md:text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 !text-white shadow-lg shadow-indigo-500/30'
                    : 'glass-card border border-border hover:border-accent/40'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB                                        */}
        {/* ════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && analytics && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Row 1: Revenue + Booking Status Pie */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Monthly Revenue Chart */}
                <div className="lg:col-span-2 glass-card p-6 border border-accent/10">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" /> Monthly Revenue &amp; Bookings
                  </h3>
                  <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                    <AreaChart data={analytics.monthlyRevenue}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#888' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#22c55e" fill="url(#bookGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Booking Status Pie */}
                <div className="glass-card p-4 md:p-6 border border-accent/10">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 md:w-5 md:h-5 text-violet-500" /> Booking Status
                  </h3>
                  <ResponsiveContainer width="100%" height={200} className="md:h-[250px]">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {statusPieData.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#888'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {statusPieData.map((s) => (
                      <div key={s.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.name] }} />
                        <span className="capitalize">{s.name}</span>
                        <span className="font-bold">({s.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Daily Bookings + Guest Distribution */}
              <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
                <div className="glass-card p-4 md:p-6 border border-accent/10">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-500" /> Daily Bookings (Last 30 Days)
                  </h3>
                  <ResponsiveContainer width="100%" height={220} className="md:h-[260px]">
                    <BarChart data={analytics.dailyBookings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="bookings" name="Bookings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card p-4 md:p-6 border border-accent/10">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-500" /> Guest Size Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={220} className="md:h-[260px]">
                    <BarChart data={analytics.guestDistribution.map((g) => ({ size: g._id + ' guests', count: g.count }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="size" tick={{ fontSize: 12, fill: '#888' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Row 3: Area Popularity + Peak Hours + New Users */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="glass-card p-4 md:p-6 border border-accent/10">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-pink-500" /> Area Popularity
                  </h3>
                  {analytics.areaPopularity.length === 0 ? (
                    <p className="text-muted text-center py-16">No area data yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analytics.areaPopularity.map((a) => ({ name: a._id, value: a.count }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                          {analytics.areaPopularity.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="glass-card p-4 md:p-6 border border-accent/10">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-500" /> Peak Booking Hours
                  </h3>
                  <div className="space-y-2 max-h-[220px] md:max-h-[250px] overflow-y-auto pr-2">
                    {analytics.bookingsByHour.length === 0 ? (
                      <p className="text-muted text-center py-16">No booking time data</p>
                    ) : (
                      analytics.bookingsByHour.slice(0, 10).map((h, i) => {
                        const maxCount = analytics.bookingsByHour[0]?.count || 1
                        const pct = (h.count / maxCount) * 100
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-sm w-16 text-muted shrink-0">{h._id}</span>
                            <div className="flex-1 bg-card/50 rounded-full h-6 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: i * 0.05, duration: 0.5 }}
                              />
                            </div>
                            <span className="text-sm font-bold w-8 text-right">{h.count}</span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="glass-card p-4 md:p-6 border border-accent/10">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-green-500" /> User Growth
                  </h3>
                  <ResponsiveContainer width="100%" height={220} className="md:h-[250px]">
                    <AreaChart data={analytics.newUsers}>
                      <defs>
                        <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="users" name="New Users" stroke="#22c55e" fill="url(#userGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Row 4: Review Analytics */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Rating Overview */}
                <div className="glass-card p-4 md:p-6 border border-yellow-500/20">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" /> Rating Overview
                  </h3>
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-yellow-500">
                      {analytics.reviews.stats.averageRating || 'N/A'}
                    </div>
                    <div className="flex justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-5 h-5 ${
                            s <= Math.round(analytics.reviews.stats.averageRating)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted mt-1">
                      Based on {analytics.reviews.stats.totalReviews} reviews
                    </p>
                  </div>
                  <div className="space-y-2">
                    {analytics.reviews.ratingDistribution.map((r, i) => {
                      const total = analytics.reviews.stats.totalReviews || 1
                      const pct = (r.count / total) * 100
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs w-14 text-muted">{r.rating}</span>
                          <div className="flex-1 bg-card/50 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: RATING_COLORS[i] }}
                            />
                          </div>
                          <span className="text-xs font-bold w-6 text-right">{r.count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Reviews by Category */}
                <div className="glass-card p-4 md:p-6 border border-accent/10">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" /> Reviews By Category
                  </h3>
                  {analytics.reviews.byCategory.length === 0 ? (
                    <p className="text-muted text-center py-16">No review categories yet</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="20%"
                        outerRadius="90%"
                        data={analytics.reviews.byCategory.map((c, i) => ({
                          name: c._id,
                          value: c.count,
                          avgRating: Math.round(c.avgRating * 10) / 10,
                          fill: CHART_COLORS[i % CHART_COLORS.length],
                        }))}
                      >
                        <RadialBar dataKey="value" background />
                        <Tooltip />
                        <Legend
                          iconSize={10}
                          formatter={(value) => <span className="text-xs capitalize">{String(value)}</span>}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="glass-card p-4 md:p-6 border border-accent/10">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-cyan-500" /> Payment Breakdown
                  </h3>
                  {analytics.paymentMethods.length === 0 ? (
                    <p className="text-muted text-center py-16">No payment data yet</p>
                  ) : (
                    <div className="space-y-4">
                      {analytics.paymentMethods.map((pm, i) => (
                        <div key={i} className="p-3 bg-card/50 border border-border rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold capitalize">{pm._id || 'Unknown'}</span>
                            <span className="text-sm text-muted">{pm.count} txns</span>
                          </div>
                          <div className="text-lg font-bold text-green-500">₹{pm.total.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════ */}
          {/* BOOKINGS TAB                                        */}
          {/* ════════════════════════════════════════════════════ */}
          {activeTab === 'bookings' && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Pending Bookings */}
              <div className="glass-card p-4 md:p-6 border border-amber-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold">Pending Bookings ({pendingBookings.length})</h2>
                </div>
                {pendingBookings.length === 0 ? (
                  <p className="text-muted text-center py-8">No pending bookings</p>
                ) : (
                  <div className="space-y-4">
                    {pendingBookings.map((booking, idx) => (
                      <motion.div
                        key={booking._id}
                        className="bg-card/50 border border-border hover:border-amber-500/40 rounded-xl p-5 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex-1 space-y-3">
                            <h3 className="font-bold text-lg md:text-xl flex items-center gap-2 flex-wrap">
                              <User className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                              <span className="break-all">{booking.guestName}</span>
                              {booking.paymentAmount != null && (
                                <span className="text-xs md:text-sm px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/30">
                                  ₹{booking.paymentAmount}
                                </span>
                              )}
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-2 md:gap-3">
                              <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted" /><span className="text-muted">{booking.guestEmail}</span></div>
                              <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted" /><span className="text-muted">{booking.guestPhone}</span></div>
                              <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-muted" /><span className="text-muted">{booking.numberOfGuests} guests</span></div>
                              <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-muted" /><span className="text-muted">{new Date(booking.bookingDate).toLocaleDateString()}</span></div>
                              <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-muted" /><span className="text-muted">{booking.bookingTime}</span></div>
                              <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-muted" /><span className="text-muted">By: {booking.user?.name || 'Unknown'}</span></div>
                            </div>
                            {booking.specialRequests && (
                              <div className="flex items-start gap-2 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                                <MessageSquare className="w-4 h-4 text-accent mt-0.5" />
                                <div className="flex-1">
                                  <span className="font-semibold text-sm">Special Requests: </span>
                                  <span className="text-sm text-muted">{booking.specialRequests}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 w-full">
                            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                              <div className="relative flex-1 sm:flex-initial">
                                <Hash className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="number"
                                  placeholder="Table #"
                                  min="1"
                                  value={tableNumber[booking._id] || ''}
                                  onChange={(e) => setTableNumber({ ...tableNumber, [booking._id]: parseInt(e.target.value) })}
                                  className="w-full sm:w-28 pl-9 pr-3 py-2 bg-card border border-border focus:border-accent rounded-lg text-center outline-none transition-colors"
                                />
                              </div>
                              <motion.button
                                onClick={() => updateBookingStatus(booking._id, 'confirmed', tableNumber[booking._id])}
                                className="flex-1 sm:flex-initial px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <CheckCircle className="w-4 h-4" /> Confirm
                              </motion.button>
                            </div>
                            <motion.button
                              onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <XCircle className="w-4 h-4" /> Cancel
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmed Bookings */}
              <div className="glass-card p-4 md:p-6 border border-green-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold">Confirmed Bookings ({confirmedBookings.length})</h2>
                </div>
                {confirmedBookings.length === 0 ? (
                  <p className="text-muted text-center py-8">No confirmed bookings</p>
                ) : (
                  <div className="space-y-4">
                    {confirmedBookings.map((booking, idx) => (
                      <motion.div
                        key={booking._id}
                        className="bg-card/50 border border-border hover:border-green-500/40 rounded-xl p-5 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="flex justify-between items-start flex-wrap gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-bold text-xl flex items-center gap-2">
                                <User className="w-5 h-5 text-accent" />
                                {booking.guestName}
                              </h3>
                              {booking.tableNumber && (
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-accent/10 text-accent border border-accent/30 flex items-center gap-1">
                                  <Hash className="w-3 h-3" /> Table {booking.tableNumber}
                                </span>
                              )}
                              {booking.paymentAmount != null && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-500 border border-green-500/30">
                                  ₹{booking.paymentAmount}
                                </span>
                              )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted" /><span className="text-muted">{booking.guestEmail}</span></div>
                              <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted" /><span className="text-muted">{booking.guestPhone}</span></div>
                              <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-muted" /><span className="text-muted">{booking.numberOfGuests} guests</span></div>
                              <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-muted" /><span className="text-muted">{new Date(booking.bookingDate).toLocaleDateString()}</span></div>
                              <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-muted" /><span className="text-muted">{booking.bookingTime}</span></div>
                            </div>
                          </div>
                          <motion.button
                            onClick={() => updateBookingStatus(booking._id, 'completed')}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <CheckCircle className="w-4 h-4" /> Complete
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* All Bookings Table */}
              <div className="glass-card p-4 md:p-6 border border-accent/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold">All Bookings ({bookings.length})</h2>
                </div>
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full text-xs md:text-sm min-w-[640px]">
                    <thead className="bg-card/50 border-b border-border">
                      <tr>
                        <th className="px-3 py-3 text-left font-semibold">Guest</th>
                        <th className="px-3 py-3 text-left font-semibold">Date</th>
                        <th className="px-3 py-3 text-left font-semibold">Time</th>
                        <th className="px-3 py-3 text-left font-semibold">Guests</th>
                        <th className="px-3 py-3 text-left font-semibold">Table</th>
                        <th className="px-3 py-3 text-left font-semibold">Amount</th>
                        <th className="px-3 py-3 text-left font-semibold">Payment</th>
                        <th className="px-3 py-3 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bookings.map((b) => (
                        <tr key={b._id} className="hover:bg-card/30 transition-colors">
                          <td className="px-3 py-2.5 font-medium">{b.guestName}</td>
                          <td className="px-3 py-2.5 text-muted">{new Date(b.bookingDate).toLocaleDateString()}</td>
                          <td className="px-3 py-2.5 text-muted">{b.bookingTime}</td>
                          <td className="px-3 py-2.5 text-muted">{b.numberOfGuests}</td>
                          <td className="px-3 py-2.5 text-muted">{b.tableNumber || '—'}</td>
                          <td className="px-3 py-2.5 font-semibold">₹{b.paymentAmount || 0}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              b.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500' :
                              b.paymentStatus === 'failed' ? 'bg-red-500/10 text-red-500' :
                              'bg-amber-500/10 text-amber-500'
                            }`}>
                              {b.paymentStatus || 'pending'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize" style={{
                              backgroundColor: `${STATUS_COLORS[b.status]}20`,
                              color: STATUS_COLORS[b.status],
                            }}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════ */}
          {/* REVIEWS TAB                                         */}
          {/* ════════════════════════════════════════════════════ */}
          {activeTab === 'reviews' && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Filter bar */}
              <div className="glass-card p-3 md:p-4 border border-accent/10 flex items-center gap-2 md:gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted" />
                  <span className="text-xs md:text-sm font-semibold">Filter:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'approved', 'rejected'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setReviewFilter(f)}
                      className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                        reviewFilter === f
                          ? 'bg-accent text-white'
                          : 'bg-card/50 border border-border hover:border-accent/40'
                      }`}
                    >
                      <span className="capitalize">{f}</span>
                      {f !== 'all' && (
                        <span className="ml-1 opacity-75">
                          ({reviews.filter((r) => r.status === f).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              {filteredReviews.length === 0 ? (
                <div className="glass-card p-8 md:p-12 border border-accent/10 text-center">
                  <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-muted mx-auto mb-4" />
                  <p className="text-base md:text-lg text-muted">No reviews found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review, idx) => (
                    <motion.div
                      key={review._id}
                      className={`glass-card p-4 md:p-6 border transition-all ${
                        review.status === 'pending' ? 'border-amber-500/30' :
                        review.status === 'approved' ? 'border-green-500/20' :
                        'border-red-500/20'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                              <User className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg">{review.user?.name || review.name}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  review.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' :
                                  review.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/30' :
                                  'bg-red-500/10 text-red-500 border border-red-500/30'
                                }`}>
                                  {review.status}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs bg-accent/10 text-accent border border-accent/30 capitalize">
                                  {review.category}
                                </span>
                              </div>
                              <p className="text-sm text-muted">{review.user?.email || review.email}</p>
                            </div>
                          </div>

                          {/* Stars + Title */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-4 h-4 ${
                                      s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-bold">{review.rating}/5</span>
                            </div>
                            <h4 className="font-semibold text-base">{review.title}</h4>
                          </div>

                          {/* Comment */}
                          <p className="text-muted leading-relaxed">{review.comment}</p>

                          {/* Admin Reply */}
                          {review.adminReply && (
                            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Reply className="w-4 h-4 text-accent" />
                                <span className="text-sm font-semibold text-accent">Admin Reply</span>
                                {review.repliedAt && (
                                  <span className="text-xs text-muted">
                                    {new Date(review.repliedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted">{review.adminReply}</p>
                            </div>
                          )}

                          {/* Date + helpful */}
                          <div className="flex items-center gap-4 text-xs text-muted">
                            <span>{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" /> {review.helpfulCount} helpful
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2 w-full">
                          {review.status === 'pending' && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <motion.button
                                onClick={() => updateReviewStatus(review._id, 'approved')}
                                className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <ThumbsUp className="w-3.5 h-3.5 md:w-4 md:h-4" /> Approve
                              </motion.button>
                              <motion.button
                                onClick={() => updateReviewStatus(review._id, 'rejected')}
                                className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <ThumbsDown className="w-3.5 h-3.5 md:w-4 md:h-4" /> Reject
                              </motion.button>
                            </div>
                          )}

                          {/* Reply Input */}
                          {!review.adminReply && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={replyText[review._id] || ''}
                                onChange={(e) => setReplyText({ ...replyText, [review._id]: e.target.value })}
                                className="flex-1 px-3 py-2 bg-card border border-border focus:border-accent rounded-lg text-xs md:text-sm outline-none transition-colors"
                              />
                              <motion.button
                                onClick={() => replyToReview(review._id)}
                                className="px-3 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Reply className="w-3.5 h-3.5 md:w-4 md:h-4" /> Reply
                              </motion.button>
                            </div>
                          )}

                          <motion.button
                            onClick={() => deleteReview(review._id)}
                            className="w-full px-3 py-2 bg-card border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> Delete
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════ */}
          {/* USERS TAB                                           */}
          {/* ════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="glass-card p-4 md:p-6 border border-accent/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold">All Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full min-w-[540px]">
                    <thead className="bg-card/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Name</th>
                        <th className="px-4 py-3 text-left font-semibold">Email</th>
                        <th className="px-4 py-3 text-left font-semibold">Role</th>
                        <th className="px-4 py-3 text-left font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((user, idx) => (
                        <motion.tr
                          key={user._id}
                          className="hover:bg-card/30 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-accent" />
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                              user.role === 'admin'
                                ? 'bg-accent/10 text-accent border border-accent/30'
                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                            }`}>
                              {user.role === 'admin' && <Award className="w-3 h-3" />}
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted">
                            {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════════════════════════════════════════════ */}
          {/* TOP CUSTOMERS TAB                                   */}
          {/* ════════════════════════════════════════════════════ */}
          {activeTab === 'customers' && analytics && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="glass-card p-4 md:p-6 border border-accent/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Award className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold">Top Customers</h2>
                </div>
                {analytics.topCustomers.length === 0 ? (
                  <p className="text-muted text-center py-8">No customer data yet</p>
                ) : (
                  <div className="space-y-4">
                    {analytics.topCustomers.map((customer, idx) => (
                      <motion.div
                        key={customer._id}
                        className="bg-card/50 border border-border rounded-xl p-5 flex items-center gap-4 hover:border-accent/40 transition-all flex-wrap"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        {/* Rank */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-lg ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                          idx === 1 ? 'bg-slate-300/20 text-slate-400' :
                          idx === 2 ? 'bg-amber-700/20 text-amber-600' :
                          'bg-card text-muted'
                        }`}>
                          {idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{customer.user.name}</h3>
                          <p className="text-sm text-muted truncate">{customer.user.email}</p>
                        </div>

                        <div className="flex gap-6 items-center flex-wrap">
                          <div className="text-center">
                            <div className="text-xl font-bold">{customer.totalBookings}</div>
                            <div className="text-xs text-muted">Bookings</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-500">₹{customer.totalSpent.toLocaleString()}</div>
                            <div className="text-xs text-muted">Total Spent</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-accent">₹{Math.round(customer.totalSpent / (customer.totalBookings || 1)).toLocaleString()}</div>
                            <div className="text-xs text-muted">Avg/Booking</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Leaderboard Bar Chart */}
              {analytics.topCustomers.length > 0 && (
                <div className="glass-card p-4 md:p-6 border border-accent/10">
                  <h3 className="text-base md:text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" /> Customer Spending Leaderboard
                  </h3>
                  <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                    <BarChart data={analytics.topCustomers.map((c) => ({ name: c.user.name.split(' ')[0], spent: c.totalSpent, bookings: c.totalBookings }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="spent" name="Revenue (₹)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="bookings" name="Bookings" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
