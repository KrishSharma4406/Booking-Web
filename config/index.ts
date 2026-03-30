// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },

  // User endpoints
  USERS: {
    ME: `${API_BASE_URL}/users/me`,
    GET_ALL: `${API_BASE_URL}/users`,
    GET_ONE: (id: string | number) => `${API_BASE_URL}/users/${id}`,
    UPDATE: (id: string | number) => `${API_BASE_URL}/users/${id}`,
    DELETE: (id: string | number) => `${API_BASE_URL}/users/${id}`,
  },

  // Bookings endpoints
  BOOKINGS: {
    CREATE: `${API_BASE_URL}/bookings`,
    GET_ALL: `${API_BASE_URL}/bookings`,
    GET_ONE: (id: string | number) => `${API_BASE_URL}/bookings/${id}`,
    UPDATE: (id: string | number) => `${API_BASE_URL}/bookings/${id}`,
    DELETE: (id: string | number) => `${API_BASE_URL}/bookings/${id}`,
  },

  // Tables endpoints
  TABLES: {
    GET_ALL: `${API_BASE_URL}/tables`,
    GET_ONE: (id: string | number) => `${API_BASE_URL}/tables/${id}`,
    CREATE: `${API_BASE_URL}/tables`,
    UPDATE: (id: string | number) => `${API_BASE_URL}/tables/${id}`,
    DELETE: (id: string | number) => `${API_BASE_URL}/tables/${id}`,
  },

  // Reviews endpoints
  REVIEWS: {
    CREATE: `${API_BASE_URL}/reviews`,
    GET_ALL: `${API_BASE_URL}/reviews`,
    GET_ONE: (id: string | number) => `${API_BASE_URL}/reviews/${id}`,
    UPDATE: (id: string | number) => `${API_BASE_URL}/reviews/${id}`,
    DELETE: (id: string | number) => `${API_BASE_URL}/reviews/${id}`,
  },

  // Payment endpoints
  PAYMENT: {
    CREATE: `${API_BASE_URL}/payment`,
    VERIFY: `${API_BASE_URL}/payment/verify`,
  },

  // AI endpoints
  AI: {
    CHAT: `${API_BASE_URL}/ai/chat`,
    ANALYZE_REVIEW: `${API_BASE_URL}/ai/analyze-review`,
    TABLE_RECOMMENDATION: `${API_BASE_URL}/ai/table-recommendation`,
  },

  // Admin endpoints
  ADMIN: {
    MAKE_ADMIN: `${API_BASE_URL}/admin/make-admin`,
    ANALYTICS: `${API_BASE_URL}/admin/analytics`,
  },
};

// Application Constants
export const APP_CONFIG = {
  APP_NAME: 'Booking Web',
  APP_DESCRIPTION: 'A modern restaurant booking system',
  APP_VERSION: '0.1.0',
  SUPPORT_EMAIL: 'support@yourdomain.com',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  PHONE_REGEX: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Time Constants (in milliseconds)
export const TIME = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  OPERATION_SUCCESS: 'Operation completed successfully.',
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  SIGNUP_SUCCESS: 'Account created successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
};

// Theme Colors
export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',
  DANGER: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#0EA5E9',
  SUCCESS: '#10B981',
  LIGHT: '#F3F4F6',
  DARK: '#1F2937',
};
