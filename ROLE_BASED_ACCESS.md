# Role-Based Access System - User Guide

## 🎯 How It Works

Your booking system now automatically detects user roles and shows appropriate pages!

## 👤 User Roles

### 1. **Regular User** (Default)
When a user signs up, they are a regular user who can:
- ✅ Book tables
- ✅ View their bookings
- ✅ Manage their reservations
- ✅ Access user dashboard
- ⏳ Must be approved by admin to book tables

### 2. **Admin User**
Admins have full access and can:
- ✅ Manage all users (approve/reject)
- ✅ Manage all bookings (confirm/cancel)
- ✅ Create and manage tables
- ✅ View admin dashboard with statistics
- ✅ Access all admin panels

---

## 📍 Page Navigation

### Home Page (/)
**Smart Auto-Detection:**
- **Not Logged In:** Shows "Book Now" and "Learn More" buttons
- **Logged In as User:** Shows "📅 Book Table" and "📊 My Dashboard" buttons
- **Logged In as Admin:** Shows "👑 Admin Dashboard" and "🍽️ Manage Tables" buttons

### Portal Page (/portal)
**Auto-Redirect Page:**
- Checks if user is logged in
- Fetches user role from database
- **Admin:** Redirects to `/admin-dashboard`
- **Regular User (Approved):** Redirects to `/bookings`
- **Regular User (Not Approved):** Redirects to `/dashboard`
- **Not Logged In:** Redirects to `/Login`

Use this for: Simple "Go to My Portal" links

---

## 🗺️ Page Access Map

### For All Users:
| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with role-based buttons |
| About | `/about` | About the booking system |
| Login | `/Login` | Sign in page |
| Sign Up | `/SignUp` | Registration page |
| Forgot Password | `/Forgotpwd` | Request password reset |
| Reset Password | `/reset-password` | Reset password with token |

### For Regular Users (After Login):
| Page | URL | Access | Description |
|------|-----|--------|-------------|
| Dashboard | `/dashboard` | ✅ All Users | Personal dashboard with stats |
| Bookings | `/bookings` | ✅ Approved Users | Book tables and view bookings |
| Portal | `/portal` | ✅ All Users | Auto-redirects to appropriate page |

### For Admin Users Only:
| Page | URL | Access | Description |
|------|-----|--------|-------------|
| Admin Dashboard | `/admin-dashboard` | 👑 Admin Only | Overview of all users & bookings |
| Manage Users | `/admin-users` | 👑 Admin Only | Approve/reject users |
| Manage Tables | `/admin-tables` | 👑 Admin Only | Create/edit/delete tables |
| Make Admin | `/make-admin` | 🔐 First User | Make yourself admin (one-time) |

---

## 🎨 Navigation Menu

### Navbar (Top Right)

**When Logged Out:**
- Login button
- Sign Up button

**When Logged In (Regular User):**
- My Bookings link
- User dropdown with:
  - Dashboard
  - My Bookings
  - Sign Out

**When Logged In (Admin):**
- My Bookings link
- Admin link
- User dropdown with:
  - Dashboard
  - My Bookings
  - **Admin Section:**
    - 👑 Admin Dashboard
    - 👥 Manage Users
    - 🍽️ Manage Tables
  - Sign Out

---

## 🚀 User Journey

### New User Journey:
1. Visit home page → Click "Book Now"
2. Sign up at `/SignUp`
3. Login at `/Login`
4. Lands on `/dashboard` (pending approval message shown)
5. Admin approves user
6. User can now book tables at `/bookings`

### New Admin Journey:
1. Be the first user to sign up
2. Visit `/make-admin` page
3. Click "Make Me Admin" button
4. Refresh and access admin features
5. Start managing users and tables

### Existing User Journey:
1. Visit home page
2. Click "Book Table" or "My Dashboard"
3. View and manage bookings

### Existing Admin Journey:
1. Visit home page
2. Click "Admin Dashboard" or "Manage Tables"
3. Manage system (users, bookings, tables)

---

## 🔐 Access Control Features

### Automatic Protection:
- ✅ Admin pages check for admin role
- ✅ Booking pages check for user approval
- ✅ All pages require authentication
- ✅ Automatic redirects for unauthorized access

### Role Detection:
- ✅ Home page detects role and shows appropriate buttons
- ✅ Navbar shows role-specific menu items
- ✅ Portal page auto-redirects based on role
- ✅ API routes verify roles server-side

---

## 💡 Usage Tips

### For Regular Users:
1. **Quick Booking:** Click "Book Table" from home page
2. **Check Status:** Go to dashboard to see approval status
3. **View Reservations:** My Bookings shows all your reservations

### For Admins:
1. **Quick Access:** Click "Admin Dashboard" from home page
2. **User Management:** Approve new users from admin-users page
3. **Table Setup:** Add tables before users can book
4. **Booking Management:** Confirm or cancel bookings

---

## 🎯 Quick Links Reference

### Regular User Quick Links:
```
Home → Book Table → /bookings
Home → My Dashboard → /dashboard
Navbar → User Menu → Dashboard
Navbar → My Bookings → /bookings
```

### Admin Quick Links:
```
Home → Admin Dashboard → /admin-dashboard
Home → Manage Tables → /admin-tables
Navbar → Admin → /admin-dashboard
Navbar → User Menu → Admin Dashboard
Navbar → User Menu → Manage Users
Navbar → User Menu → Manage Tables
```

---

## 🔄 Auto-Redirect Logic

The `/portal` page automatically routes users:

```
User visits /portal
    ↓
Check authentication
    ↓
    ├─ Not Logged In → /Login
    ├─ Admin → /admin-dashboard
    ├─ User (Approved) → /bookings
    └─ User (Pending) → /dashboard
```

---

## ✨ Benefits

1. **Smart Navigation:** Users see only relevant options
2. **Automatic Routing:** No manual page selection needed
3. **Secure Access:** Role-based protection on all pages
4. **Better UX:** Personalized experience for each user type
5. **Easy Management:** Admins have dedicated tools

---

## 🛠️ How to Become Admin

### First User Method:
1. Sign up as first user
2. Go to: `/make-admin`
3. Click "Make Me Admin"
4. Refresh page - you're now admin!

### Subsequent Admins:
- Only existing admins can promote other users
- Currently requires database access
- Future: Add "Promote to Admin" in admin panel

---

**Note:** Always use role-appropriate URLs. The system will redirect unauthorized access, but using correct links provides better user experience.
