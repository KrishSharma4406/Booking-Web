# Booking Web

Modern restaurant table booking system with AI integration, built with Next.js 14.

## Features

- AI-powered chatbot, recommendations, sentiment analysis
- NextAuth authentication (Google, GitHub OAuth)
- Admin dashboard for users/tables/bookings
- Real-time booking availability
- Razorpay payments, Email & SMS notifications

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL, Prisma
- **Services**: SendGrid, Twilio, Razorpay, Anthropic

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- SendGrid account (optional)

### Installation

```bash
git clone <repo-url>
cd Booking-Web
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev
```

Visit `http://localhost:3001`

### Initial Setup
1. Register at `/SignUp`
2. Create admin at `/make-admin`
3. Add tables at `/admin-tables`
4. Users can book at `/bookings`

## Project Structure

```
app/              Pages, layouts, API routes
components/       Reusable React components
lib/              Utilities, database helpers
models/           Database models
config/           Constants and configurations
types/            TypeScript definitions
prisma/           Database schema
public/           Static assets
```

## API Endpoints

**Auth**: POST /api/auth/signup, /api/auth/[...nextauth], /api/auth/send-otp, /api/auth/reset-password

**Bookings**: 
- GET /api/bookings - List my bookings
- POST /api/bookings - Create booking
- PATCH /api/bookings/[id] - Update
- DELETE /api/bookings/[id] - Cancel

**Tables** (Admin):
- GET /api/tables - List
- POST /api/tables - Create
- PUT /api/tables/[id] - Update
- DELETE /api/tables/[id] - Delete

**Users** (Admin):
- GET /api/users - List all
- GET /api/users/me - Current user
- POST /api/users/approve - Approve/reject

**Admin**:
- POST /api/admin/make-admin - Create first admin
- GET /api/admin/analytics - Get analytics

## Key Features

**Table Management**
- Capacity (1-20 guests), Location types, Special features
- Status tracking (Available, Occupied, Reserved, Maintenance)
- Real-time availability checking

**Booking System**
- Smart table recommendations
- Admin confirmation workflow
- Email notifications
- Booking history

**Admin Dashboard**
- User management & approval
- Booking analytics
- Table management
- Revenue tracking

## Environment Variables

```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
SENDGRID_API_KEY=your-key
RAZORPAY_KEY_ID=your-key
TWILIO_ACCOUNT_SID=your-sid
ANTHROPIC_API_KEY=your-key
```

## Security

- Password hashing with bcrypt
- JWT sessions with HttpOnly cookies
- CSRF protection
- Server-side input validation
- Role-based access control
- Email verification tokens

## Customization

- **Branding**: Update logo in `/public` and colors in `tailwind.config.ts`
- **Email**: Customize templates in `lib/email.ts`
- **Booking Rules**: Adjust time slots in booking page

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open Pull Request

## License

MIT - Free for personal and commercial use