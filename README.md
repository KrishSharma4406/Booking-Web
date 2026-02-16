<div align="center">

# Booking Web

### Modern Restaurant Table Booking System with AI Integration

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

A full-stack restaurant booking platform with **AI-powered recommendations**, real-time table management, secure authentication, and an intuitive admin dashboard. Built with modern web technologies for performance, scalability, and exceptional user experience.

[Live Demo](#) • [AI Features Guide](AI_INTEGRATION_README.md) • [Report Bug](#) • [Request Feature](#)

</div>

---

## ✨ Features

### 🤖 **AI-Powered Intelligence** (NEW!)
- **Smart Chatbot Assistant** - 24/7 AI support for reservations and inquiries
- **Intelligent Table Recommendations** - ML-based dining area suggestions
- **Sentiment Analysis** - Automated review analysis and insights
- **Smart Booking Suggestions** - AI-optimized time slot recommendations
- **Personalized Experience** - Learns from guest preferences

### 🔐 **Authentication & Security**
- NextAuth.js integration with multiple providers (Credentials, Google, GitHub, Facebook)
- Secure password hashing with bcrypt
- Email verification and password reset via SendGrid
- JWT-based session management
- Role-based access control (Admin/User)
- User approval workflow
- **Online-only payment enforcement** (NEW!)

### 📊 **Admin Dashboard**
- Comprehensive analytics and statistics
- User management (approve, reject, delete)
- Table CRUD operations with real-time updates
- Booking management and confirmation system
- Dynamic role assignment

### 🪑 **Smart Table Management**
- Create tables with customizable properties:
  - Capacity (1-20 guests)
  - Location types (Indoor, Outdoor, Private Room, Bar Area, Terrace)
  - Features (Window View, Romantic, VIP, Wheelchair Accessible, etc.)
  - Status tracking (Available, Occupied, Reserved, Maintenance)
- Real-time availability checking
- Automatic or manual table assignment
- **AI-recommended table assignments** (NEW!)

### 📅 **Enhanced Booking System**
- Intelligent date and time selection
- Guest count-based filtering
- Instant availability verification
- **Real-time connectivity monitoring** (NEW!)
- **AI-powered table area recommendations** (NEW!)
- Booking status workflow (Pending → Confirmed → Completed/Cancelled)
- User booking history and management
- Email notifications for bookings

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Framer Motion animations for smooth interactions
- Glass morphism effects and gradient backgrounds
- Dark mode optimized interface
- Toast notifications for user feedback
- Loading states and error handling

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes, MongoDB, Mongoose ODM |
| **Authentication** | NextAuth.js, bcrypt, JWT |
| **Email Service** | SendGrid API |
| **UI Components** | React Toastify, Custom Components |
| **Development** | ESLint, PostCSS, TypeScript |

---

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account)
- **SendGrid** account (for email features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/booking-web.git
   cd booking-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/bookingweb
   # For MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookingweb
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3001
   NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
   
   # SendGrid Email Service
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=Booking Web
   
   # OAuth Providers (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_ID=your-github-client-id
   GITHUB_SECRET=your-github-client-secret
   ```

4. **Start MongoDB** (if using local installation)
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3001](http://localhost:3000)

### 🎯 Initial Setup

1. **Create an account** - Navigate to `/SignUp` and register
2. **Become admin** - Visit `/make-admin` (only works when no admin exists)
3. **Add tables** - Go to `/admin-tables` to create tables
4. **Start booking** - Users can now book tables at `/bookings`

---

## Project Structure

```
booking-web/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── [...nextauth]/    # NextAuth handler
│   │   │   ├── signup/           # User registration
│   │   │   ├── forgot-password/  # Password reset request
│   │   │   ├── reset-password/   # Password reset
│   │   │   ├── send-otp/         # OTP generation
│   │   │   └── verify-otp/       # OTP verification
│   │   ├── bookings/             # Booking management
│   │   ├── tables/               # Table management
│   │   ├── users/                # User management
│   │   ├── payment/              # Payment processing
│   │   └── admin/                # Admin operations
│   ├── admin-dashboard/          # Admin dashboard page
│   ├── admin-users/              # User management UI
│   ├── admin-tables/             # Table management UI
│   ├── bookings/                 # User bookings page
│   ├── dashboard/                # User dashboard
│   ├── settings/                 # User settings
│   ├── Login/                    # Login page
│   ├── SignUp/                   # Registration page
│   ├── Forgotpwd/                # Forgot password page
│   ├── reset-password/           # Reset password page
│   ├── make-admin/               # Admin creation page
│   ├── portal/                   # Role-based redirect
│   ├── about/                    # About page
│   ├── privacy-policy/           # Privacy policy
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   ├── Navbar.tsx                # Navigation bar
│   ├── Footer.tsx                # Footer component
│   ├── SessionProvider.tsx       # Auth session provider
│   ├── PaymentForm.tsx           # Payment form
│   └── SmoothScroll.tsx          # Smooth scroll wrapper
├── lib/                          # Utility functions
│   ├── mongodb.ts                # MongoDB connection
│   ├── email.ts                  # SendGrid email service
│   ├── users.ts                  # User utilities
│   ├── pricing.ts                # Pricing calculations
│   ├── sms.ts                    # SMS service
│   ├── socket.ts                 # Socket.IO setup
│   └── useTimezone.ts            # Timezone utilities
├── models/                       # Mongoose schemas
│   ├── User.ts                   # User model
│   ├── Booking.ts                # Booking model
│   └── Table.ts                  # Table model
├── types/                        # TypeScript definitions
│   ├── models.ts                 # Model types
│   └── next-auth.d.ts            # NextAuth types
├── public/                       # Static assets
│   └── newlogo.png               # Application logo
├── .env.local                    # Environment variables (create this)
├── next.config.mjs               # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## API Reference

### Authentication

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/signup` | POST | Register new user | No |
| `/api/auth/[...nextauth]` | POST | Sign in | No |
| `/api/auth/forgot-password` | POST | Request password reset | No |
| `/api/auth/reset-password` | POST | Reset password with token | No |
| `/api/auth/send-otp` | POST | Send OTP for verification | No |
| `/api/auth/verify-otp` | POST | Verify OTP code | No |

### Bookings

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/bookings` | GET | List user bookings | Yes |
| `/api/bookings` | POST | Create new booking | Yes |
| `/api/bookings/[id]` | PATCH | Update booking | Yes |
| `/api/bookings/[id]` | DELETE | Cancel booking | Yes |

### Tables

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/tables` | GET | List all tables | No |
| `/api/tables` | POST | Create table | Admin |
| `/api/tables/[id]` | PUT | Update table | Admin |
| `/api/tables/[id]` | DELETE | Delete table | Admin |

### Users

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/users` | GET | List all users | Admin |
| `/api/users/me` | GET | Get current user | Yes |
| `/api/users/approve` | POST | Approve/reject user | Admin |

### Admin

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/admin/make-admin` | POST | Create first admin | No* |

*Only works when no admin exists

---

## Key Features Explained

### Table Management System
Admins have full control over table configurations:

- **Capacity Management**: Support for 1-20 guests per table
- **Location Categories**: 
  - Indoor seating
  - Outdoor patio
  - Private dining rooms
  - Bar area
  - Terrace
- **Special Features**:
  - Window views
  - Romantic ambiance
  - VIP sections
  - Wheelchair accessibility
  - Quiet zones
- **Status Tracking**: Available, Occupied, Reserved, Under Maintenance

### Intelligent Booking Flow

1. **Selection**: User selects date, time, and guest count
2. **Availability**: System filters tables by capacity and availability
3. **Choice**: User can select specific table or let system auto-assign
4. **Confirmation**: Booking enters pending status
5. **Admin Review**: Admin confirms or adjusts booking
6. **Notification**: User receives email confirmation
7. **Completion**: Booking marked as completed after service

### Admin Dashboard Analytics

- Total users, bookings, and tables
- Real-time booking status overview
- Recent activity feed
- Quick action buttons
- User approval queue
- Revenue tracking (if payment integration enabled)

---

## Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Secure JWT tokens with HttpOnly cookies
- **CSRF Protection**: Built-in NextAuth CSRF protection
- **Input Validation**: Server-side validation on all endpoints
- **Rate Limiting**: Prevents brute force attacks (recommended to implement)
- **Role Verification**: Middleware checks for admin routes
- **Email Verification**: Token-based email confirmation
- **Secure Headers**: Recommended security headers in production

---

## Configuration

### Customization Options

**Branding**
- Update logo in `/public/newlogo.png`
- Modify colors in `tailwind.config.js`
- Edit site name in `layout.tsx`

**Email Templates**
- Customize email content in `lib/email.ts`
- Update SendGrid templates

**Booking Rules**
- Adjust time slots in booking page
- Modify capacity limits in table creation
- Set booking advance notice period

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

