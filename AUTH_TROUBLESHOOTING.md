# Authentication Troubleshooting Guide

## ✅ Issues Fixed

1. **OAuth Provider Environment Variables** - Fixed variable names:
   - Changed `GITHUB_ID` → `GITHUB_CLIENT_ID`
   - Changed `GITHUB_SECRET` → `GITHUB_CLIENT_SECRET`
   - Changed `GOOGLE_ID` → `GOOGLE_CLIENT_ID`
   - Changed `GOOGLE_SECRET` → `GOOGLE_CLIENT_SECRET`

2. **NextAuth URL Port** - Updated to match current server port (3002)

3. **OAuth SignIn Callback** - Fixed null reference errors

## 🧪 Test Your Authentication

Visit: **http://localhost:3002/auth-test**

This page will show:
- Current authentication status
- Session data
- Environment configuration
- Quick links to login/signup

## 🔍 Common Authentication Issues & Solutions

### Issue 1: "Sign in failed" Error

**Causes:**
- Wrong email or password
- User not found in database
- MongoDB not connected

**Solutions:**
1. Check MongoDB is running:
   ```powershell
   Get-Service -Name MongoDB
   ```
2. If stopped, start it:
   ```powershell
   net start MongoDB
   ```
3. Verify credentials are correct
4. Check server console for specific errors

### Issue 2: OAuth Login Not Working (Google/GitHub)

**Causes:**
- Callback URL not configured in OAuth provider
- Wrong client ID or secret
- NEXTAUTH_URL doesn't match

**Solutions for Google:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3002/api/auth/callback/google
   ```
4. Save changes

**Solutions for GitHub:**
1. Go to: https://github.com/settings/developers
2. Click your OAuth App
3. Update "Authorization callback URL":
   ```
   http://localhost:3002/api/auth/callback/github
   ```
4. Save

### Issue 3: Session Not Persisting

**Causes:**
- NEXTAUTH_SECRET not set
- Browser cookies disabled
- NEXTAUTH_URL mismatch

**Solutions:**
1. Verify `.env.local` has `NEXTAUTH_SECRET`
2. Clear browser cookies and cache
3. Make sure `NEXTAUTH_URL` matches your current port
4. Restart the dev server

### Issue 4: "Redirect URI Mismatch" Error

**Cause:**
Port changed (e.g., from 3001 to 3002)

**Solution:**
Update all callback URLs in:
- `.env.local` (NEXTAUTH_URL)
- Google Console
- GitHub OAuth App Settings

### Issue 5: Cannot Sign Up New Users

**Causes:**
- MongoDB not running
- Connection string incorrect
- User already exists

**Solutions:**
1. Check MongoDB connection in `.env.local`
2. For local MongoDB: `mongodb://localhost:27017/Bookingweb`
3. Verify database name is correct
4. Check if user already exists with that email

### Issue 6: "Error: User already exists"

**Solution:**
Use a different email or try logging in with existing credentials

### Issue 7: Password Reset Not Working

**Causes:**
- SendGrid API key invalid
- Email FROM address not verified
- Network issues

**Solutions:**
1. Verify SendGrid API key in `.env.local`
2. Verify sender email at: https://app.sendgrid.com/settings/sender_auth
3. Check server console for SendGrid errors

## 🔐 Security Checklist

✅ All passwords are hashed with bcrypt
✅ JWT tokens used for sessions
✅ Environment variables protected in .gitignore
✅ Admin routes require role verification
✅ Password reset tokens expire after 1 hour

## 📋 Current Configuration

**Server:** http://localhost:3002
**Database:** MongoDB (Local)
**Auth Strategy:** JWT
**Providers:** 
- ✅ Email/Password (Credentials)
- ✅ Google OAuth
- ✅ GitHub OAuth

## 🛠️ Quick Fixes

### Restart Everything
```powershell
# Stop all Node processes
taskkill /F /IM node.exe

# Restart MongoDB
net stop MongoDB
net start MongoDB

# Restart dev server
npm run dev
```

### Reset Database (if needed)
```powershell
# In MongoDB Compass:
# 1. Connect to mongodb://localhost:27017
# 2. Right-click database "Bookingweb"
# 3. Select "Drop Database"
# 4. Confirm
```

### Clear Browser Data
1. Open DevTools (F12)
2. Application tab → Storage → Clear site data
3. Refresh page (Ctrl+Shift+R)

## 📞 Still Having Issues?

1. Check server console for error messages
2. Check browser console (F12) for client errors
3. Visit `/auth-test` to diagnose
4. Verify all environment variables are set correctly
5. Make sure MongoDB is running

## 🎯 Next Steps After Authentication Works

1. Create your first user at `/SignUp`
2. Make yourself admin at `/make-admin`
3. Add tables at `/admin-tables`
4. Start booking at `/bookings`

---

**Note:** If you change the port (e.g., from 3002 to another), you MUST:
1. Update `NEXTAUTH_URL` in `.env.local`
2. Update OAuth callback URLs in Google/GitHub
3. Restart the server
