import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

export const userQueries = {
  // Create a new user
  create: async (data: Prisma.UserCreateInput) => {
    return await prisma.user.create({ data })
  },

  // Find user by email
  findByEmail: async (email: string) => {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
  },

  // Find user by ID
  findById: async (id: string) => {
    return await prisma.user.findUnique({
      where: { id },
    })
  },

  // Find user by phone
  findByPhone: async (phone: string) => {
    return await prisma.user.findUnique({
      where: { phone },
    })
  },

  // Update user
  update: async (id: string, data: Prisma.UserUpdateInput) => {
    return await prisma.user.update({
      where: { id },
      data,
    })
  },

  // Update password
  updatePassword: async (id: string, hashedPassword: string) => {
    return await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })
  },

  // Set reset token
  setResetToken: async (email: string, token: string, expiry: Date) => {
    return await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    })
  },

  // Verify reset token
  findByResetToken: async (token: string) => {
    return await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() },
      },
    })
  },

  // Set OTP
  setOTP: async (phone: string, otpCode: string, expiry: Date) => {
    return await prisma.user.update({
      where: { phone },
      data: {
        otpCode,
        otpExpiry: expiry,
      },
    })
  },

  // Verify OTP
  verifyOTP: async (phone: string, otpCode: string) => {
    const user = await prisma.user.findFirst({
      where: {
        phone,
        otpCode,
        otpExpiry: { gte: new Date() },
      },
    })
    
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerified: true,
          otpCode: null,
          otpExpiry: null,
        },
      })
    }
    
    return user
  },

  // Get all users (admin only)
  findAll: async (options?: {
    skip?: number
    take?: number
    orderBy?: Prisma.UserOrderByWithRelationInput
  }) => {
    return await prisma.user.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        provider: true,
        phoneVerified: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    })
  },

  // Count users
  count: async () => {
    return await prisma.user.count()
  },

  // Make user admin
  makeAdmin: async (id: string) => {
    return await prisma.user.update({
      where: { id },
      data: { role: 'admin' },
    })
  },

  // Delete user
  delete: async (id: string) => {
    return await prisma.user.delete({
      where: { id },
    })
  },
}

// ============================================
// BOOKING QUERIES
// ============================================

export const bookingQueries = {
  // Create a new booking
  create: async (data: Prisma.BookingCreateInput) => {
    return await prisma.booking.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  },

  // Find booking by ID
  findById: async (id: string) => {
    return await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        confirmedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  },

  // Find bookings by user ID
  findByUserId: async (userId: string) => {
    return await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  },

  // Get all bookings with filters
  findAll: async (options?: {
    skip?: number
    take?: number
    status?: string
    dateFrom?: Date
    dateTo?: Date
    orderBy?: Prisma.BookingOrderByWithRelationInput
  }) => {
    const where: Prisma.BookingWhereInput = {}
    
    if (options?.status) {
      where.status = options.status
    }
    
    if (options?.dateFrom || options?.dateTo) {
      where.bookingDate = {}
      if (options.dateFrom) where.bookingDate.gte = options.dateFrom
      if (options.dateTo) where.bookingDate.lte = options.dateTo
    }

    return await prisma.booking.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    })
  },

  // Check table availability
  checkAvailability: async (date: Date, time: string, tableNumber?: number) => {
    const where: Prisma.BookingWhereInput = {
      bookingDate: date,
      bookingTime: time,
      status: { in: ['pending', 'confirmed'] },
    }
    
    if (tableNumber) {
      where.tableNumber = tableNumber
    }

    return await prisma.booking.findMany({ where })
  },

  // Update booking status
  updateStatus: async (id: string, status: string, confirmedById?: string) => {
    return await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(confirmedById && status === 'confirmed' && {
          confirmedById,
          confirmedAt: new Date(),
        }),
      },
    })
  },

  // Update payment status
  updatePayment: async (
    id: string,
    paymentStatus: string,
    paymentId?: string,
    paymentMethod?: string
  ) => {
    return await prisma.booking.update({
      where: { id },
      data: {
        paymentStatus,
        ...(paymentId && { paymentId }),
        ...(paymentMethod && { paymentMethod }),
        ...(paymentStatus === 'paid' && { status: 'confirmed' }),
      },
    })
  },

  // Cancel booking
  cancel: async (id: string, reason?: string) => {
    return await prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
        ...(reason && { cancelledReason: reason }),
      },
    })
  },

  // Delete booking
  delete: async (id: string) => {
    return await prisma.booking.delete({
      where: { id },
    })
  },

  // Get booking statistics
  getStats: async (dateFrom?: Date, dateTo?: Date) => {
    const where: Prisma.BookingWhereInput = {}
    
    if (dateFrom || dateTo) {
      where.bookingDate = {}
      if (dateFrom) where.bookingDate.gte = dateFrom
      if (dateTo) where.bookingDate.lte = dateTo
    }

    const [total, pending, confirmed, completed, cancelled, totalRevenue] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.count({ where: { ...where, status: 'pending' } }),
      prisma.booking.count({ where: { ...where, status: 'confirmed' } }),
      prisma.booking.count({ where: { ...where, status: 'completed' } }),
      prisma.booking.count({ where: { ...where, status: 'cancelled' } }),
      prisma.booking.aggregate({
        where: { ...where, paymentStatus: 'paid' },
        _sum: { paymentAmount: true },
      }),
    ])

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      revenue: totalRevenue._sum.paymentAmount || 0,
    }
  },

  // Get upcoming bookings
  getUpcoming: async (limit: number = 10) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return await prisma.booking.findMany({
      where: {
        bookingDate: { gte: today },
        status: { in: ['pending', 'confirmed'] },
      },
      take: limit,
      orderBy: [{ bookingDate: 'asc' }, { bookingTime: 'asc' }],
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    })
  },
}

// ============================================
// TABLE QUERIES
// ============================================

export const tableQueries = {
  // Create a new table
  create: async (data: Prisma.TableCreateInput) => {
    return await prisma.table.create({ data })
  },

  // Find table by ID
  findById: async (id: string) => {
    return await prisma.table.findUnique({
      where: { id },
    })
  },

  // Find table by table number
  findByNumber: async (tableNumber: number) => {
    return await prisma.table.findUnique({
      where: { tableNumber },
    })
  },

  // Get all tables
  findAll: async (options?: {
    skip?: number
    take?: number
    location?: string
    status?: string
    minCapacity?: number
    orderBy?: Prisma.TableOrderByWithRelationInput
  }) => {
    const where: Prisma.TableWhereInput = { isActive: true }
    
    if (options?.location) where.location = options.location
    if (options?.status) where.status = options.status
    if (options?.minCapacity) where.capacity = { gte: options.minCapacity }

    return await prisma.table.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { tableNumber: 'asc' },
    })
  },

  // Get available tables
  getAvailable: async (date: Date, time: string, guests: number) => {
    // Get all booked table numbers for the given date and time
    const bookedTables = await prisma.booking.findMany({
      where: {
        bookingDate: date,
        bookingTime: time,
        status: { in: ['pending', 'confirmed'] },
        tableNumber: { not: null },
      },
      select: { tableNumber: true },
    })

    const bookedTableNumbers = bookedTables
      .map((b) => b.tableNumber)
      .filter((n): n is number => n !== null)

    // Find tables that are not booked and have enough capacity
    return await prisma.table.findMany({
      where: {
        isActive: true,
        status: 'available',
        capacity: { gte: guests },
        tableNumber: { notIn: bookedTableNumbers },
      },
      orderBy: { tableNumber: 'asc' },
    })
  },

  // Update table
  update: async (id: string, data: Prisma.TableUpdateInput) => {
    return await prisma.table.update({
      where: { id },
      data,
    })
  },

  // Update table status
  updateStatus: async (id: string, status: string) => {
    return await prisma.table.update({
      where: { id },
      data: { status },
    })
  },

  // Delete table (soft delete)
  delete: async (id: string) => {
    return await prisma.table.update({
      where: { id },
      data: { isActive: false },
    })
  },

  // Hard delete table
  hardDelete: async (id: string) => {
    return await prisma.table.delete({
      where: { id },
    })
  },

  // Count tables
  count: async (location?: string) => {
    return await prisma.table.count({
      where: {
        isActive: true,
        ...(location && { location }),
      },
    })
  },
}

// ============================================
// REVIEW QUERIES
// ============================================

export const reviewQueries = {
  // Create a new review
  create: async (data: Prisma.ReviewCreateInput) => {
    return await prisma.review.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    })
  },

  // Find review by ID
  findById: async (id: string) => {
    return await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        booking: {
          select: { id: true, bookingDate: true, tableArea: true },
        },
      },
    })
  },

  // Get all reviews with filters
  findAll: async (options?: {
    skip?: number
    take?: number
    status?: string
    category?: string
    minRating?: number
    orderBy?: Prisma.ReviewOrderByWithRelationInput
  }) => {
    const where: Prisma.ReviewWhereInput = {}
    
    if (options?.status) where.status = options.status
    if (options?.category) where.category = options.category
    if (options?.minRating) where.rating = { gte: options.minRating }

    return await prisma.review.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    })
  },

  // Get approved reviews (public)
  getApproved: async (limit?: number) => {
    return await prisma.review.findMany({
      where: { status: 'approved' },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    })
  },

  // Get reviews by user
  findByUserId: async (userId: string) => {
    return await prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: { id: true, bookingDate: true, tableArea: true },
        },
      },
    })
  },

  // Update review status
  updateStatus: async (id: string, status: string) => {
    return await prisma.review.update({
      where: { id },
      data: { status },
    })
  },

  // Add admin reply
  addReply: async (id: string, reply: string) => {
    return await prisma.review.update({
      where: { id },
      data: {
        adminReply: reply,
        repliedAt: new Date(),
      },
    })
  },

  // Increment helpful count
  incrementHelpful: async (id: string) => {
    return await prisma.review.update({
      where: { id },
      data: {
        helpfulCount: { increment: 1 },
      },
    })
  },

  // Delete review
  delete: async (id: string) => {
    return await prisma.review.delete({
      where: { id },
    })
  },

  // Get average rating
  getAverageRating: async () => {
    const result = await prisma.review.aggregate({
      where: { status: 'approved' },
      _avg: { rating: true },
      _count: { rating: true },
    })

    return {
      average: result._avg.rating || 0,
      count: result._count.rating,
    }
  },

  // Get rating distribution
  getRatingDistribution: async () => {
    const reviews = await prisma.review.groupBy({
      by: ['rating'],
      where: { status: 'approved' },
      _count: { rating: true },
    })

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach((r) => {
      distribution[r.rating] = r._count.rating
    })

    return distribution
  },
}

// ============================================
// ANALYTICS QUERIES
// ============================================

export const analyticsQueries = {
  // Get dashboard overview
  getDashboardStats: async () => {
    const [
      totalUsers,
      totalBookings,
      totalTables,
      totalReviews,
      bookingStats,
      avgRating,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.table.count({ where: { isActive: true } }),
      prisma.review.count({ where: { status: 'approved' } }),
      bookingQueries.getStats(),
      reviewQueries.getAverageRating(),
    ])

    return {
      users: totalUsers,
      bookings: totalBookings,
      tables: totalTables,
      reviews: totalReviews,
      bookingStats,
      avgRating: avgRating.average,
    }
  },

  // Get revenue by period
  getRevenue: async (startDate: Date, endDate: Date) => {
    const result = await prisma.booking.aggregate({
      where: {
        paymentStatus: 'paid',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { paymentAmount: true },
      _count: true,
    })

    return {
      total: result._sum.paymentAmount || 0,
      count: result._count,
    }
  },

  // Get popular table areas
  getPopularAreas: async () => {
    const bookings = await prisma.booking.groupBy({
      by: ['tableArea'],
      where: {
        status: { in: ['confirmed', 'completed'] },
        tableArea: { not: null },
      },
      _count: { tableArea: true },
      orderBy: { _count: { tableArea: 'desc' } },
    })

    return bookings.map((b) => ({
      area: b.tableArea,
      count: b._count.tableArea,
    }))
  },
}

export default {
  user: userQueries,
  booking: bookingQueries,
  table: tableQueries,
  review: reviewQueries,
  analytics: analyticsQueries,
}