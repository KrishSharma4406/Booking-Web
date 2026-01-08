# Payment Integration Setup Guide

## Overview
The booking system now includes integrated payment processing with **Razorpay**. Payments are required before confirming table bookings, with dynamic pricing based on dining area and number of guests.

## Features Implemented

### 1. **Dynamic Pricing**
- Pricing varies by dining area (in INR):
  - **Indoor Dining**: ₹500 per person
  - **Outdoor Dining**: ₹600 per person
  - **Private Room**: ₹1000 per person
  - **Bar Area**: ₹400 per person
  - **Patio**: ₹700 per person
  - **Rooftop**: ₹900 per person

- Total cost = Number of Guests × Price per Person (based on selected area)

### 2. **Payment Flow**
1. User fills out booking form (guest details, date, time, number of guests, dining area)
2. System calculates total price based on area and guests
3. User clicks "Proceed to Payment"
4. Razorpay payment modal appears
5. User enters payment details (Card/UPI/Net Banking/Wallet)
6. Payment is processed
7. **Only after successful payment**, the table is booked
8. System verifies table availability before final booking

### 3. **Table Availability Check**
- System checks if the selected table is available for the chosen date/time
- Prevents double-booking
- Verifies table capacity matches number of guests
- **Payment is only accepted if table is available**

## Setup Instructions

### 1. Get Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Create an account or log in
3. Navigate to **Settings** → **API Keys**
4. Generate Test/Live API Keys
5. Copy your **Key ID** (starts with `rzp_test_` or `rzp_live_`)
6. Copy your **Key Secret**

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
```

**Important**: Never commit your actual Razorpay keys to version control!

### 3. Test Payment

For testing, use Razorpay's test cards:

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- Use any future expiry date (e.g., 12/34)
- Use any CVV (e.g., 123)
- Use any name

You can also test with:
- **UPI**: success@razorpay
- **Net Banking**: Select any test bank
- **Wallets**: Use test mode

### 4. Database Schema Updates

The following fields were added to the Booking model:
- `tableArea`: Dining area selection
- `paymentAmount`: Total payment amount
- `paymentId`: Stripe payment intent ID
- `paymentStatus`: Payment status (pending, paid, failed, refunded)
- `paymentMethod`: Payment method used

The Table model was updated with:
- `pricePerPerson`: Base price per person for the table

## How It Works

### Frontend (Booking Page)
1. User selects dining area from dropdown
2. Real-time price calculation shows total cost in INR
3. On form submit, Razorpay order is created via `/api/payment`
4. Razorpay checkout modal opens with payment options
5. After successful payment, booking is created via `/api/bookings`

### Backend API Routes

#### `/api/payment` (POST)
- Creates Razorpay order
- Returns order ID and key ID for frontend
- Stores booking metadata in order notes

#### `/api/bookings` (POST)
- **Requires**: `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, and `paymentAmount`
- Verifies payment signature using HMAC SHA256
- Fetches payment details from Razorpay API
- Checks table availability
- Creates booking only if payment is verified and table is available
- Automatically sets booking status to "confirmed" for paid bookings

## Pricing Configuration

Edit pricing in `lib/pricing.js`:

```javascript
export const AREA_PRICING = {
  'indoor': 500,
  'outdoor': 600,
  'private-room': 1000,
  'bar-area': 400,
  'patio': 700,
  'rooftop': 900,
}
```

## Security Features

✅ Payment signature verification using HMAC SHA256  
✅ Table availability check prevents double-booking  
✅ Server-side payment validation using Razorpay API  
✅ Order ID and payment ID stored for reconciliation  
✅ Only verified payments create bookings  

## UI Features

- Real-time price display in INR based on area and guests
- Area selection with pricing shown in dropdown
- Secure Razorpay checkout with multiple payment options
- Payment status badges on booking cards
- Payment amount displayed on confirmed bookings

## Going to Production

When ready for production:

1. Switch to Razorpay live mode keys (starts with `rzp_live_`)
2. Complete KYC verification on Razorpay
3. Activate your account
4. Set up webhooks for payment events (optional)
5. Update pricing as needed
6. Test thoroughly with small amounts first

## Troubleshooting

**Razorpay checkout not opening:**
- Check that Razorpay keys are correctly set in `.env.local`
- Verify the Razorpay script is loading (check browser console)
- Restart Next.js development server

**"Table not available" error:**
- Ensure tables exist in database with matching area
- Check table capacity is sufficient for number of guests
- Verify no existing bookings for that time slot

**Payment succeeded but booking not created:**
- Check server console for errors
- Verify MongoDB connection
- Check that payment signature verification is passing
- Ensure all payment parameters are being passed correctly

**Payment signature verification failed:**
- Verify `RAZORPAY_KEY_SECRET` is correct
- Check that order ID and payment ID are being passed correctly
- Ensure signature is not being modified during transmission

## Support

For Razorpay-specific issues, visit [Razorpay Documentation](https://razorpay.com/docs/)  
For application issues, check the console logs and API responses.
