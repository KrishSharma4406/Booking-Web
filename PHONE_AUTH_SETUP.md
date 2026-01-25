# Phone Authentication Setup Guide

This guide explains how to set up and use the phone authentication feature with OTP verification.

## Features

- **Phone Number Login**: Users can log in using their phone number with OTP verification
- **Email & Password Login**: Traditional email/password authentication still works
- **OTP Verification**: 6-digit OTP codes with 10-minute expiration
- **Multiple SMS Providers**: Support for Twilio, AWS SNS, or console logging (dev mode)

## How It Works

### User Registration
1. Users can optionally provide their phone number during signup (with country code, e.g., +1234567890)
2. Phone numbers are stored in the database and validated for uniqueness
3. Users can still sign up with just email and password

### Phone Login Flow
1. User enters their phone number (must include country code)
2. System sends a 6-digit OTP code via SMS
3. User enters the OTP code within 10 minutes
4. Upon successful verification:
   - Phone number is marked as verified
   - User is logged in
   - OTP is cleared from the database

## Configuration

### Development Mode (Default)
By default, the system uses console logging for OTP codes. Check your server console for the OTP.

### Production Setup

#### Option 1: Twilio
1. Install Twilio SDK:
   ```bash
   npm install twilio
   ```

2. Add environment variables to `.env.local`:
   ```env
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

#### Option 2: AWS SNS
1. Install AWS SDK:
   ```bash
   npm install @aws-sdk/client-sns
   ```

2. Add environment variables to `.env.local`:
   ```env
   SMS_PROVIDER=aws-sns
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   ```

## User Guide

### For New Users (Signup)
1. Navigate to the signup page
2. Fill in your name, email, and password
3. Optionally add your phone number with country code (e.g., +1234567890)
4. Click "Sign up"

### For Existing Users (Login)

#### Email Login
1. Click the "Email" tab on the login page
2. Enter your email and password
3. Click "Sign in"

#### Phone Login
1. Click the "Phone" tab on the login page
2. Enter your phone number with country code (e.g., +1234567890)
3. Click "Send OTP"
4. Check your phone for the 6-digit code (or check console in dev mode)
5. Enter the OTP code
6. Click "Verify & Sign in"

## API Endpoints

### Send OTP
- **Endpoint**: `POST /api/auth/send-otp`
- **Body**: `{ "phone": "+1234567890" }`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "expiresIn": 600
  }
  ```

### Verify OTP
- **Endpoint**: `POST /api/auth/verify-otp`
- **Body**: `{ "phone": "+1234567890", "otp": "123456" }`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Phone number verified successfully",
    "user": {
      "id": "...",
      "email": "...",
      "name": "...",
      "phone": "...",
      "role": "user"
    }
  }
  ```

## Security Features

- **OTP Expiration**: OTPs expire after 10 minutes
- **Phone Verification**: Phone numbers are marked as verified after successful OTP validation
- **Unique Phone Numbers**: Each phone number can only be registered once
- **Secure Storage**: OTPs are stored temporarily and cleared after verification
- **Rate Limiting**: Consider adding rate limiting to prevent OTP spam (recommended for production)

## Troubleshooting

### OTP not received
- **Development mode**: Check your server console for the OTP code
  - Look for console logs like: `📱 OTP GENERATED FOR: +1234567890`
  - The OTP will also be displayed in the UI (yellow box) in development mode
- **Production mode**: Verify SMS provider credentials in `.env.local`
- **Phone format**: Ensure phone number includes country code (e.g., +1234567890)

### "No account found" error
- User must sign up first with their phone number
- Phone number must match exactly (including country code)
- Go to `/SignUp` and create an account with your phone number

### OTP expired
- Request a new OTP by clicking "Resend OTP"
- OTPs are valid for 10 minutes only

### Phone number already registered
- Each phone number can only be used once
- Use a different phone number or contact support

### Development Mode Testing

**IMPORTANT**: In development mode, OTP is NOT sent via SMS. Instead:

1. **Check Server Console**: After clicking "Send OTP", look at your terminal/console where `npm run dev` is running
2. **Look for the OTP**: You'll see output like:
   ```
   =================================
   📱 OTP GENERATED FOR: +1234567890
   🔑 OTP CODE: 123456
   ⏰ EXPIRES AT: 1/24/2026, 2:30:45 PM
   =================================
   ```
3. **UI Display**: In development, the OTP will also appear in a yellow box on the login page
4. **Copy & Enter**: Copy the 6-digit code and enter it in the OTP field

### Setting Up Real SMS (Production)

If you want to test with real SMS:

1. **Choose a provider** (Twilio or AWS SNS)
2. **Add credentials** to `.env.local`
3. **Set SMS_PROVIDER**:
   ```env
   SMS_PROVIDER=twilio  # or aws-sns
   ```
4. **Restart the dev server**: Stop (`Ctrl+C`) and restart (`npm run dev`)

### Common Issues

**Issue**: "OTP not generated" or no console output
- **Solution**: Make sure the phone number has a registered account
- **Solution**: Check MongoDB connection is working
- **Solution**: Restart the dev server

**Issue**: Can't find OTP in console
- **Solution**: Scroll up in the terminal where `npm run dev` is running
- **Solution**: Look for the large bordered output with 🔑 emoji

**Issue**: OTP field not accepting numbers
- **Solution**: The field only accepts 6-digit numbers (automatically filtered)
- **Solution**: Make sure you're not pasting extra characters

**Issue**: "Failed to send OTP" error
- **Solution**: Check that you have a user account with that phone number
- **Solution**: Verify MongoDB is connected
- **Solution**: Check server console for detailed error messages

## Database Schema

The User model includes these phone-related fields:

```javascript
{
  phone: String,           // Phone number with country code
  phoneVerified: Boolean,  // Whether phone is verified
  otpCode: String,        // Temporary OTP code
  otpExpiry: Date         // OTP expiration timestamp
}
```

## Files Modified/Created

1. **models/User.js** - Added phone, phoneVerified, otpCode, otpExpiry fields
2. **lib/sms.js** - SMS/OTP utility functions
3. **app/api/auth/send-otp/route.js** - OTP sending endpoint
4. **app/api/auth/verify-otp/route.js** - OTP verification endpoint
5. **app/api/auth/[...nextauth]/route.js** - Added phone credentials provider
6. **app/Login/page.js** - Added phone login UI with tab switching
7. **app/SignUp/page.js** - Added optional phone number field
8. **app/api/auth/signup/route.js** - Handle phone during signup
9. **lib/users.js** - Updated to handle phone numbers

## Next Steps

1. **Add Rate Limiting**: Implement rate limiting for OTP requests
2. **SMS Cost Management**: Monitor and manage SMS costs in production
3. **Multi-factor Authentication**: Consider using phone as 2FA option
4. **Phone Number Recovery**: Allow users to update their phone number
5. **Testing**: Test with real phone numbers before going to production
