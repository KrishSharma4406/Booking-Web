# Email Configuration Troubleshooting Guide

## Current Issue
The password reset email is failing with connection timeout errors to Gmail's SMTP server.

## Error Messages
```
Error: connect ETIMEDOUT 172.217.194.109:465
Error: Unexpected socket close
```

## Solution Steps

### 1. Check Your Network
The SMTP ports (465, 587) might be blocked by your:
- **Firewall** - Temporarily disable Windows Firewall to test
- **Antivirus** - Some antivirus software blocks SMTP ports
- **Corporate/School Network** - Many networks block SMTP ports
- **VPN** - If using VPN, try disconnecting

### 2. Verify Gmail App Password

**IMPORTANT:** You cannot use your regular Gmail password!

#### Steps to Create Gmail App Password:
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on **Security** in the left menu
3. Enable **2-Step Verification** (if not already enabled)
4. After 2-Step Verification is enabled, go back to **Security**
5. Scroll down to "Signing in to Google"
6. Click on **App passwords**
7. Click **Select app** → Choose **Mail**
8. Click **Select device** → Choose **Other** → Type "Booking App"
9. Click **Generate**
10. Copy the 16-character password (remove spaces)

#### Update .env.local:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  (16-character app password from Google)
EMAIL_FROM_NAME=Booking Web
NEXTAUTH_URL=http://localhost:3001
```

### 3. Alternative: Test with Different Port

The code has been updated to use port **587 with STARTTLS** instead of port 465. This is more likely to work through firewalls.

Current configuration:
```javascript
{
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use STARTTLS
}
```

### 4. Quick Network Test

Test if you can reach Gmail's SMTP server:

**Windows PowerShell:**
```powershell
Test-NetConnection -ComputerName smtp.gmail.com -Port 587
```

Expected output:
```
TcpTestSucceeded : True
```

If it shows `False`, your network is blocking the port.

### 5. Alternative Email Providers

If Gmail doesn't work, you can try:

#### Option A: SendGrid (Free tier: 100 emails/day)
```javascript
// In lib/email.js
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
})
```

#### Option B: Mailtrap (Development only)
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
})
```

#### Option C: Office 365 / Outlook
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})
```

### 6. Testing Email Configuration

Add this test script to test your email setup:

Create `scripts/test-email.js`:
```javascript
import { sendPasswordResetEmail } from '../lib/email.js'

async function testEmail() {
  console.log('Testing email configuration...')
  
  const result = await sendPasswordResetEmail(
    'your-email@example.com',
    'test-token-123'
  )
  
  if (result.success) {
    console.log('✅ Email sent successfully!')
    console.log('Message ID:', result.messageId)
  } else {
    console.error('❌ Email failed to send')
    console.error('Error:', result.error)
  }
}

testEmail()
```

Run with:
```bash
node scripts/test-email.js
```

### 7. Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| `ETIMEDOUT` | Port blocked by firewall/network | Try port 587, check firewall, try different network |
| `EAUTH` | Wrong credentials | Regenerate Gmail App Password |
| `ESOCKET` | Connection closed unexpectedly | Check network stability, try different port |
| `Invalid login` | Using regular password instead of app password | Use Gmail App Password, not account password |

### 8. Production Recommendations

For production deployment:

1. **Use a dedicated email service:**
   - SendGrid (100 emails/day free)
   - AWS SES (62,000 emails/month free)
   - Mailgun (5,000 emails/month free)
   - Resend.com (3,000 emails/month free)

2. **Benefits:**
   - Better deliverability
   - No port blocking issues
   - Email analytics
   - Better spam score
   - Webhooks for tracking

### 9. Quick Fix for Development

If you just want to test the password reset flow without actually sending emails, you can temporarily mock the email sending:

```javascript
// In lib/email.js - TEMPORARY FOR TESTING ONLY
export async function sendPasswordResetEmail(to, resetToken) {
  console.log('📧 [DEV MODE] Email would be sent to:', to)
  console.log('🔗 Reset link:', `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`)
  console.log('⚠️  Copy this link to test password reset')
  
  // Return success without actually sending
  return { success: true, messageId: 'dev-mode-' + Date.now() }
}
```

This way you can copy the reset link from the console and test the password reset functionality.

---

## Current Code Changes

The email configuration has been updated to:
- Use port **587** instead of 465
- Use **STARTTLS** (more firewall-friendly)
- Added connection verification before sending
- Improved error messages
- Added timeout settings (10 seconds)

## Next Steps

1. ✅ Create Gmail App Password (not regular password)
2. ✅ Update .env.local with the app password
3. ✅ Test network connection to smtp.gmail.com:587
4. ✅ Try sending a password reset email
5. ✅ If still failing, try the dev mode mock or alternative provider
