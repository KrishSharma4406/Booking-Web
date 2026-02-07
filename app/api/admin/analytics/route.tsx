import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongodb'
import Booking from '@/models/Booking'
import User from '@/models/User'
import Table from '@/models/Table'
import Review from '@/models/Review'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: session.user.email })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // --- Core Counts ---
    const [totalUsers, totalBookings, totalTables, totalReviews] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments(),
      Table.countDocuments(),
      Review.countDocuments(),
    ])

    // --- Booking Status Breakdown ---
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])
    const statusMap: Record<string, number> = {}
    bookingsByStatus.forEach((s) => { statusMap[s._id] = s.count })

    // --- Revenue Analytics ---
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paymentAmount' },
          avgOrderValue: { $avg: '$paymentAmount' },
          count: { $sum: 1 },
        },
      },
    ])
    const revenue = revenueData[0] || { totalRevenue: 0, avgOrderValue: 0, count: 0 }

    // --- Monthly Revenue (last 12 months) ---
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$paymentAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyRevenueFormatted = monthlyRevenue.map((m) => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      revenue: m.revenue,
      bookings: m.bookings,
    }))

    // --- Daily Bookings (last 30 days) ---
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$paymentAmount', 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ])

    const dailyBookingsFormatted = dailyBookings.map((d) => ({
      date: `${d._id.day}/${d._id.month}`,
      bookings: d.count,
      revenue: d.revenue,
    }))

    // --- Bookings by Hour (peak hours analysis) ---
    const bookingsByHour = await Booking.aggregate([
      {
        $group: {
          _id: '$bookingTime',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    // --- Guest Size Distribution ---
    const guestDistribution = await Booking.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$numberOfGuests', 2] }, then: '1-2' },
                { case: { $lte: ['$numberOfGuests', 4] }, then: '3-4' },
                { case: { $lte: ['$numberOfGuests', 6] }, then: '5-6' },
                { case: { $lte: ['$numberOfGuests', 10] }, then: '7-10' },
              ],
              default: '10+',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // --- Table Area Popularity ---
    const areaPopularity = await Booking.aggregate([
      { $match: { tableArea: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$tableArea',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    // --- Payment Method Breakdown ---
    const paymentMethods = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$paymentAmount' },
        },
      },
    ])

    // --- New Users by Month ---
    const newUsersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    const newUsersFormatted = newUsersByMonth.map((m) => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      users: m.count,
    }))

    // --- Review Analytics ---
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ])

    const reviewStatsData = reviewStats[0] || {
      averageRating: 0,
      totalReviews: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
    }

    const ratingDistribution = [
      { rating: '5 Stars', count: reviewStatsData.fiveStars },
      { rating: '4 Stars', count: reviewStatsData.fourStars },
      { rating: '3 Stars', count: reviewStatsData.threeStars },
      { rating: '2 Stars', count: reviewStatsData.twoStars },
      { rating: '1 Star', count: reviewStatsData.oneStar },
    ]

    // --- Reviews by Category ---
    const reviewsByCategory = await Review.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ])

    // --- Reviews by Status ---
    const reviewsByStatus = await Review.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    // --- Recent Reviews ---
    const recentReviews = await Review.find()
      .populate('user', 'name email image')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // --- Top Customers (most bookings) ---
    const topCustomers = await Booking.aggregate([
      {
        $group: {
          _id: '$user',
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$paymentAmount', 0] } },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          totalBookings: 1,
          totalSpent: 1,
          'user.name': 1,
          'user.email': 1,
        },
      },
    ])

    // --- Cancellation Rate ---
    const cancelledCount = statusMap['cancelled'] || 0
    const cancellationRate = totalBookings > 0 ? ((cancelledCount / totalBookings) * 100).toFixed(1) : '0'

    // --- Completion Rate ---
    const completedCount = statusMap['completed'] || 0
    const completionRate = totalBookings > 0 ? ((completedCount / totalBookings) * 100).toFixed(1) : '0'

    // --- Today's stats ---
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [todayBookings, todayRevenue] = await Promise.all([
      Booking.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Booking.aggregate([
        { $match: { createdAt: { $gte: todayStart, $lte: todayEnd }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$paymentAmount' } } },
      ]),
    ])

    // --- This Week stats ---
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const thisWeekBookings = await Booking.countDocuments({ createdAt: { $gte: weekStart } })

    return NextResponse.json({
      overview: {
        totalUsers,
        totalBookings,
        totalTables,
        totalReviews,
        totalRevenue: revenue.totalRevenue,
        avgOrderValue: Math.round(revenue.avgOrderValue || 0),
        cancellationRate: parseFloat(cancellationRate),
        completionRate: parseFloat(completionRate),
        todayBookings,
        todayRevenue: todayRevenue[0]?.total || 0,
        thisWeekBookings,
      },
      bookingsByStatus: statusMap,
      monthlyRevenue: monthlyRevenueFormatted,
      dailyBookings: dailyBookingsFormatted,
      bookingsByHour,
      guestDistribution,
      areaPopularity,
      paymentMethods,
      newUsers: newUsersFormatted,
      reviews: {
        stats: {
          averageRating: Math.round((reviewStatsData.averageRating || 0) * 10) / 10,
          totalReviews: reviewStatsData.totalReviews,
        },
        ratingDistribution,
        byCategory: reviewsByCategory,
        byStatus: reviewsByStatus,
        recent: recentReviews,
      },
      topCustomers,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
