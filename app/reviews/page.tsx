'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, MessageSquare, Send, ChevronDown, ArrowLeft,
  ThumbsUp, Reply, Clock, CheckCircle, XCircle, AlertCircle,
  Utensils, Users, Palette, DollarSign, Award,
} from 'lucide-react'
import Link from 'next/link'

interface Booking {
  _id: string
  guestName: string
  bookingDate: string
  bookingTime: string
  status: string
}

interface Review {
  _id: string
  rating: number
  title: string
  comment: string
  category: string
  status: string
  adminReply?: string
  repliedAt?: string
  helpfulCount: number
  createdAt: string
  booking?: {
    bookingDate: string
    bookingTime: string
    guestName: string
  }
}

const CATEGORIES = [
  { value: 'overall', label: 'Overall Experience', icon: Award },
  { value: 'food', label: 'Food Quality', icon: Utensils },
  { value: 'service', label: 'Service', icon: Users },
  { value: 'ambiance', label: 'Ambiance', icon: Palette },
  { value: 'value', label: 'Value for Money', icon: DollarSign },
]

export default function ReviewsPage() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reviews, setReviews] = useState<Review[]>([])
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    category: 'overall',
    booking: '',
  })

  // Auto-open form with pre-selected booking from URL query
  useEffect(() => {
    const bookingId = searchParams.get('booking')
    if (bookingId) {
      setFormData(prev => ({ ...prev, booking: bookingId }))
      setShowForm(true)
    }
  }, [searchParams])

  const fetchData = useCallback(async () => {
    try {
      const [reviewsRes, bookingsRes] = await Promise.all([
        fetch('/api/reviews'),
        fetch('/api/bookings'),
      ])

      if (reviewsRes.ok) {
        const d = await reviewsRes.json()
        setReviews(d.reviews || [])
      }

      if (bookingsRes.ok) {
        const d = await bookingsRes.json()
        const completed = (d.bookings || []).filter((b: Booking) => b.status === 'completed')
        setCompletedBookings(completed)
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.rating === 0) return toast.error('Please select a rating')
    if (!formData.title.trim()) return toast.error('Please enter a title')
    if (!formData.comment.trim()) return toast.error('Please write a review')

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
          category: formData.category,
          booking: formData.booking || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Review submitted successfully!')
        setFormData({ rating: 0, title: '', comment: '', category: 'overall', booking: '' })
        setShowForm(false)
        setHoveredStar(0)
        fetchData()
      } else {
        toast.error(data.error || 'Failed to submit review')
      }
    } catch {
      toast.error('Error submitting review')
    } finally {
      setSubmitting(false)
    }
  }

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string; border: string; label: string }> = {
    pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Pending Review' },
    approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'Published' },
    rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Not Published' },
  }

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

  const activeRating = hoveredStar || formData.rating

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-accent/5 text-foreground p-4 md:p-8 pt-20 md:pt-24">
      <ToastContainer position="top-right" theme="dark" />

      <div className="relative max-w-4xl mx-auto z-10">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-card transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted" />
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
              My Reviews
            </h1>
          </div>
          <p className="text-muted ml-12">Share your dining experience and help others</p>
        </motion.div>

        {/* Write Review Button */}
        {!showForm && (
          <motion.button
            onClick={() => setShowForm(true)}
            className="w-full mb-8 glass-card p-6 border-2 border-dashed border-accent/30 hover:border-accent/60 rounded-2xl flex items-center justify-center gap-3 group transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Star className="w-6 h-6 text-accent" />
            </div>
            <div className="text-left">
              <div className="font-bold text-lg">Write a Review</div>
              <div className="text-sm text-muted">Tell us about your experience</div>
            </div>
          </motion.button>
        )}

        {/* Review Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="glass-card p-6 md:p-8 border border-accent/20 rounded-2xl mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" /> Write a Review
                </h2>
                <button
                  onClick={() => { setShowForm(false); setHoveredStar(0) }}
                  className="p-2 rounded-lg hover:bg-card transition-colors text-muted hover:text-foreground"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Your Rating *</label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1"
                        >
                          <Star
                            className={`w-8 h-8 transition-all ${
                              star <= activeRating
                                ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]'
                                : 'text-muted'
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>
                    <span className="text-lg font-bold ml-2">
                      {activeRating > 0 && (
                        <span className={
                          activeRating >= 4 ? 'text-green-500' :
                          activeRating >= 3 ? 'text-yellow-500' :
                          'text-red-500'
                        }>
                          {activeRating === 5 ? 'Excellent!' :
                           activeRating === 4 ? 'Great!' :
                           activeRating === 3 ? 'Good' :
                           activeRating === 2 ? 'Fair' :
                           'Poor'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        className={`p-3 rounded-xl text-sm font-medium flex flex-col items-center gap-1.5 transition-all border ${
                          formData.category === cat.value
                            ? 'bg-accent/10 border-accent text-accent'
                            : 'bg-card/50 border-border hover:border-accent/40 text-muted'
                        }`}
                      >
                        <cat.icon className="w-5 h-5" />
                        <span className="text-xs text-center">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Linked Booking (optional) */}
                {completedBookings.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Link to a Booking (optional)</label>
                    <div className="relative">
                      <select
                        value={formData.booking}
                        onChange={(e) => setFormData({ ...formData, booking: e.target.value })}
                        className="w-full px-4 py-3 bg-card border border-border focus:border-accent rounded-xl outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">No booking linked</option>
                        {completedBookings.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.guestName} — {new Date(b.bookingDate).toLocaleDateString()} at {b.bookingTime}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Review Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Summarize your experience in a few words"
                    maxLength={100}
                    className="w-full px-4 py-3 bg-card border border-border focus:border-accent rounded-xl outline-none transition-colors"
                  />
                  <div className="text-xs text-muted mt-1 text-right">{formData.title.length}/100</div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Your Review *</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Share details of your experience — what you loved, what we can improve..."
                    maxLength={1000}
                    rows={5}
                    className="w-full px-4 py-3 bg-card border border-border focus:border-accent rounded-xl outline-none transition-colors resize-none"
                  />
                  <div className="text-xs text-muted mt-1 text-right">{formData.comment.length}/1000</div>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setHoveredStar(0) }}
                    className="px-6 py-3 glass-card border border-border hover:border-accent/40 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-accent" />
            Your Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl border border-accent/10">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-muted" />
              </div>
              <p className="text-xl font-semibold mb-2">No reviews yet</p>
              <p className="text-muted mb-6">Share your experience to help other diners!</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
                >
                  <Star className="w-5 h-5" />
                  Write Your First Review
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, idx) => {
                const sc = statusConfig[review.status] || statusConfig.pending
                const StatusIcon = sc.icon
                return (
                  <motion.div
                    key={review._id}
                    className={`glass-card p-6 rounded-2xl border ${sc.border} transition-all`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {/* Status + Category + Date */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${sc.bg} ${sc.color} border ${sc.border}`}>
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs bg-accent/10 text-accent border border-accent/30 capitalize">
                        {review.category}
                      </span>
                      {review.booking && (
                        <span className="px-2.5 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500 border border-blue-500/30">
                          {new Date(review.booking.bookingDate).toLocaleDateString()} at {review.booking.bookingTime}
                        </span>
                      )}
                      <span className="text-xs text-muted ml-auto">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Stars + Title */}
                    <div className="flex items-center gap-2 mb-2">
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
                      <span className="font-bold">{review.rating}/5</span>
                    </div>

                    <h3 className="font-bold text-lg mb-2">{review.title}</h3>
                    <p className="text-muted leading-relaxed mb-3">{review.comment}</p>

                    {/* Admin Reply */}
                    {review.adminReply && (
                      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Reply className="w-4 h-4 text-accent" />
                          <span className="text-sm font-semibold text-accent">Response from Management</span>
                          {review.repliedAt && (
                            <span className="text-xs text-muted">
                              {new Date(review.repliedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted leading-relaxed">{review.adminReply}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {review.helpfulCount} found helpful
                      </span>
                      {review.status === 'pending' && (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-500" /> Under review by admin
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
