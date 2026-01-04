# Quick Setup Guide 🚀

Follow these steps to get your booking system up and running:

## Step 1: Install Dependencies ✅

```bash
npm install
```

## Step 2: Set Up Environment Variables 🔧

Create a `.env.local` file in the root directory with the following:

```env
# MongoDB Connection (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reservetable?retryWrites=true&w=majority

# NextAuth Configuration (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-generate-a-random-string-here

# Optional: Email Configuration
EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
EMAIL_FROM=noreply@reservetable.com
```

### How to get MONGODB_URI:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

### How to generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 3: Create Admin User 👑

Run the admin creation script:

```bash
node scripts/createAdmin.js
```

This will create an admin account with:
- **Email**: admin@reservetable.com
- **Password**: admin123456

⚠️ **IMPORTANT**: Change this password after first login!

## Step 4: Start Development Server 🏃

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Test the System ✨

### As Admin:
1. Login with admin credentials
2. Go to Admin Dashboard
3. Approve pending users
4. Manage bookings

### As User:
1. Sign up for a new account
2. Wait for admin approval
3. Once approved, create a booking
4. View your bookings in the dashboard

## Common Issues & Solutions 🔧

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Check your MONGODB_URI in `.env.local`
- Verify your IP is whitelisted in MongoDB Atlas
- Check database username and password

### Issue: "NextAuth configuration error"
**Solution**:
- Ensure NEXTAUTH_URL matches your development URL
- Generate a new NEXTAUTH_SECRET using the command above
- Restart the dev server after changing env variables

### Issue: "Admin user already exists"
**Solution**:
- Use the existing admin credentials
- Or delete the admin from database and run the script again

### Issue: "Module not found" errors
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment 🌐

### Vercel Deployment:
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables (from `.env.local`)
5. Deploy!

### Environment Variables for Production:
- Update `NEXTAUTH_URL` to your production domain
- Keep `NEXTAUTH_SECRET` secure
- Use production MongoDB database

## Database Structure 📊

The system uses two main collections:

### Users Collection:
- Stores user accounts
- Tracks approval status
- Manages roles (user/admin)

### Bookings Collection:
- Table reservations
- Guest information
- Booking status tracking

## Features Overview 🎯

1. **User Registration** → Sign up and wait for approval
2. **Admin Approval** → Admins approve/reject users
3. **Table Booking** → Create reservations
4. **Booking Management** → Track and manage bookings
5. **Real-time Updates** → Live status changes

## Next Steps 🚀

1. ✅ Change admin password
2. ✅ Customize the UI (colors, branding)
3. ✅ Add your restaurant information
4. ✅ Test the complete booking flow
5. ✅ Deploy to production

## Need Help? 💬

Check the main README.md for detailed documentation!

---

Happy Booking! 🍽️✨
