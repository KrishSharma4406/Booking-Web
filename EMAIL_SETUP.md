# Email Configuration Guide

## Gmail SMTP Setup for Sending Emails

This application uses Gmail SMTP to send booking confirmation emails and password reset emails to users.

### Prerequisites
- A Gmail account
- 2-Factor Authentication enabled on your Google account

### Step-by-Step Setup

#### 1. Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on "2-Step Verification"
3. Follow the prompts to enable 2FA

#### 2. Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other" as the device and name it (e.g., "Booking App")
4. Click "Generate"
5. **Copy the 16-character password** (you'll need this)

#### 3. Configure Environment Variables
Create a `.env.local` file in the `mega` directory (or update your existing `.env` file):

```env
# Email Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM_NAME=Restaurant Booking System
```

**Important:**
- Replace `your-gmail-address@gmail.com` with your actual Gmail address
- Replace `your-16-char-app-password` with the app password from step 2
- Do NOT use your regular Gmail password - use the app-specific password!

#### 4. Test Email Configuration
After setting up the environment variables:
1. Restart your development server (`npm run dev`)
2. Create a test booking
3. Check the terminal/console for email logs:
   - ✅ Success: `Email sent successfully! Message ID: ...`
   - ❌ Error: Check the error message for troubleshooting

### Common Issues & Solutions

#### Error: "Invalid credentials" or "EAUTH"
- **Cause:** Wrong email or password
- **Solution:** 
  - Ensure you're using the app-specific password, not your regular Gmail password
  - Regenerate a new app password and try again

#### Error: "ESOCKET" or "ETIMEDOUT"
- **Cause:** Network/firewall blocking SMTP connection
- **Solution:**
  - Check your firewall settings
  - Try from a different network
  - Ensure port 587 is not blocked

#### Error: "Email not configured"
- **Cause:** Missing environment variables
- **Solution:** 
  - Verify `.env` or `.env.local` file exists
  - Check that EMAIL_USER and EMAIL_PASSWORD are set
  - Restart the server after adding variables

#### Emails not being received
- **Cause:** Emails might be in spam/junk folder
- **Solution:**
  - Check spam/junk folder
  - Add your sending email to contacts
  - Check Gmail "Sent" folder to confirm email was sent

### Email Features

The application sends emails for:
1. **Booking Confirmations** - When payment is successful
   - Includes booking details
   - Attached PDF receipt
   - Payment confirmation

2. **Password Reset** - When users request password reset
   - Secure reset link
   - Expires in 1 hour

### Troubleshooting Checklist

- [ ] 2-Factor Authentication is enabled on Gmail account
- [ ] App-specific password is generated and copied correctly
- [ ] `.env` file has EMAIL_USER and EMAIL_PASSWORD set
- [ ] Development server restarted after adding environment variables
- [ ] No firewall blocking port 587
- [ ] Check terminal logs for detailed error messages

### Alternative: Using Other Email Services

If you prefer not to use Gmail, you can modify the SMTP configuration in `lib/email.ts`:

```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-provider.com',  // e.g., smtp.sendgrid.net
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})
```

Popular alternatives:
- SendGrid
- Mailgun
- Amazon SES
- Outlook/Office 365

### Need Help?

If emails are still not working:
1. Check the server console/terminal for detailed error messages
2. Verify all environment variables are set correctly
3. Test your email credentials with a simple email client
4. Check your email provider's SMTP documentation
