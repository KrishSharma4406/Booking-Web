# Buy Me a Chai - Crowdfunding Platform

A Next.js-based crowdfunding platform for creators to receive support from their fans.

## Features

- 🔐 Authentication (Email/Password, GitHub, Google, Facebook OAuth)
- 👤 User Dashboard
- 📧 Password Reset via Email
- 🎨 Modern UI with Tailwind CSS
- 🌙 Dark Theme
- 📱 Responsive Design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd "c:\Users\Krish Kumar\OneDrive\Desktop\Mega Project\mega"
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Edit `.env.local` file
   - Set `NEXTAUTH_SECRET` to a random string (you can generate one at https://generate-secret.vercel.app/32)
   - Configure email settings for password reset (use Gmail App Password)
   - Optional: Add OAuth provider credentials (GitHub, Google, Facebook)

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Default Test Account

For testing, a default account is available:
- Email: `test@example.com`
- Password: `test123`

## Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── Login/         # Login page
│   ├── SignUp/        # Sign up page
│   ├── dashboard/     # User dashboard
│   ├── about/         # About page
│   └── ...
├── components/        # Reusable components
├── lib/              # Utility functions
├── public/           # Static assets
└── ...
```

## Technologies Used

- **Framework**: Next.js 14
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Email**: Nodemailer
- **Database**: In-memory (for demo - replace with real DB in production)

## Important Notes

⚠️ **This is a development setup**:
- The user database is currently in-memory and will reset on server restart
- For production, implement a proper database (MongoDB, PostgreSQL, etc.)
- Configure proper email service with valid SMTP credentials
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
