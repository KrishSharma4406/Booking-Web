# ReserveTable - Restaurant Booking System 🍽️

A modern, full-featured restaurant table booking system built with Next.js, MongoDB, and NextAuth.

## Features ✨

- **User Authentication**: Secure signup/login with NextAuth (Email & OAuth)
- **Admin Approval System**: User approval workflow
- **Table Management**: Create and manage restaurant tables with features
- **Smart Booking**: Real-time table availability checking
- **Admin Dashboard**: Comprehensive admin panel for users, bookings, and tables
- **User Dashboard**: View and manage personal bookings
- **Email Notifications**: SendGrid integration for password reset emails
- **Role-based Access**: Admin and user role management
- **MongoDB Storage**: Persistent data storage with MongoDB (local or Atlas)

## Tech Stack 🛠️

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js (Credentials + OAuth)
- **Email Service**: SendGrid
- **Notifications**: React Toastify
- **Styling**: Tailwind CSS with custom gradients

## Getting Started 🚀

### Prerequisites

- Node.js 18+ installed
- MongoDB (local installation or MongoDB Atlas account)
- SendGrid account (for email features)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mega
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Update the values with your credentials:

```env
# MongoDB (choose one)
MONGODB_URI=mongodb://localhost:27017/bookingweb  # Local
# OR
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/  # Atlas

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here  # Generate: openssl rand -base64 32

# SendGrid Email
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=your-verified-email@example.com
EMAIL_FROM_NAME=ReserveTable

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Start MongoDB (if using local):
```bash
net start MongoDB  # Windows
# or
brew services start mongodb-community  # Mac
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3001](http://localhost:3001) in your browser

### First Time Setup

1. **Create an account** at `/SignUp`
2. **Become admin** by visiting `/make-admin` (works only if no admin exists)
3. **Add tables** at `/admin-tables`
4. **Start booking** at `/bookings`

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── bookings/          # Booking management
│   │   ├── tables/            # Table management
│   │   ├── users/             # User management
│   │   └── admin/             # Admin operations
│   ├── admin-dashboard/       # Admin dashboard page
│   ├── admin-users/           # User management page
│   ├── admin-tables/          # Table management page
│   ├── bookings/              # User bookings page
│   ├── dashboard/             # User dashboard
│   ├── Login/                 # Login page
│   ├── SignUp/                # Registration page
│   ├── Forgotpwd/            # Password reset request
│   ├── reset-password/        # Password reset form
│   └── make-admin/           # First admin setup
├── components/                # Reusable components
│   ├── Navbar.js
│   ├── Footer.js
│   └── SessionProvider.js
├── lib/                       # Utility functions
│   ├── mongodb.js            # MongoDB connection
│   ├── email.js              # SendGrid email service
│   ├── users.js              # User utilities
│   └── socket.js             # Socket.IO setup
├── models/                    # Mongoose models
│   ├── User.js
│   ├── Booking.js
│   └── Table.js
└── public/                    # Static assets
```

## Key Features Explained

### Table Management
- Admins can create tables with properties:
  - Table number and name
  - Capacity (1-20 guests)
  - Location (indoor, outdoor, private-room, etc.)
  - Features (window-view, romantic, VIP, etc.)
  - Status tracking (available, occupied, reserved, maintenance)

### Smart Booking System
- Users select date, time, and number of guests
- System automatically shows available tables
- Option to select specific table or auto-assign
- Real-time availability checking
- Booking status tracking (pending, confirmed, cancelled, completed)

### Admin Features
- User approval/rejection workflow
- Booking management and confirmation
- Table CRUD operations
- Dashboard with statistics
- User role management

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/signup` | POST | User registration |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password |
| `/api/bookings` | GET, POST | List/create bookings |
| `/api/bookings/[id]` | PATCH, DELETE | Update/cancel booking |
| `/api/tables` | GET, POST | List/create tables |
| `/api/tables/[id]` | PUT, DELETE | Update/delete table |
| `/api/users` | GET | List users (admin) |
| `/api/users/approve` | POST | Approve user (admin) |
| `/api/admin/make-admin` | POST | Create first admin |

## Environment Variables

See `.env.example` for all required environment variables.

## Security Notes ⚠️

- **Never commit `.env.local`** - Contains sensitive credentials
- All passwords are hashed using bcrypt
- API routes have authentication middleware
- Admin routes require admin role verification
- Email tokens expire after 1 hour

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Configure environment variables
- Ensure MongoDB connection string is accessible
- Set up SendGrid for email functionality

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and MongoDB
- Set up OAuth providers with real credentials
- Use strong, unique `NEXTAUTH_SECRET` in production

## Environment Variables

Required variables in `.env.local`:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

Optional OAuth providers:
```env
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
GOOGLE_ID=your-google-id
GOOGLE_SECRET=your-google-secret
FACEBOOK_ID=your-facebook-id
FACEBOOK_SECRET=your-facebook-secret
```

## License

MIT
