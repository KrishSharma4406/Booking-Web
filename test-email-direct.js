// Direct email test script
require('dotenv').config({ path: '.env.local' })
const nodemailer = require('nodemailer')

async function testEmail() {
  console.log('📧 Testing Email Configuration...\n')
  
  console.log('Environment Variables:')
  console.log('EMAIL_USER:', process.env.EMAIL_USER)
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set (hidden)' : 'Not set')
  console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME)
  console.log('\n---\n')

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  })

  try {
    console.log('🔌 Verifying SMTP connection...')
    await transporter.verify()
    console.log('SMTP connection successful!\n')

    console.log('Sending test email...')
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Test'}" <${process.env.EMAIL_USER}>`,
      to: 'krishkumar.bcse2024@huroorkee.ac.in',
      subject: 'Test Booking Confirmation - ' + new Date().toLocaleTimeString(),
      html: `
        <div style="font-family: Arial; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #667eea;">Booking Confirmed!</h1>
            <p>Dear Test User,</p>
            <p>Your booking has been confirmed and payment received.</p>
            
            <div style="background: #f0f8f0; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h2 style="color: #28a745; margin: 0;">Amount Paid: ₹2000</h2>
            </div>
            
            <h3>Booking Details:</h3>
            <ul>
              <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>Time:</strong> 19:00</li>
              <li><strong>Guests:</strong> 4</li>
              <li><strong>Table:</strong> #5 (Indoor)</li>
            </ul>
            
            <p><strong>Payment ID:</strong> test_${Date.now()}</p>
            
            <p style="margin-top: 30px;">We look forward to serving you!</p>
            <p>Best regards,<br>The Booking Team</p>
          </div>
        </div>
      `
    })

    console.log('Email sent successfully!')
    console.log('Message ID:', info.messageId)
    console.log('Sent to: krishkumar.bcse2024@huroorkee.ac.in')
    console.log('\nCheck your inbox (and spam folder)!')
    
  } catch (error) {
    console.error('\nEmail Error:', error.message)
    console.error('Code:', error.code)
    
    if (error.code === 'EAUTH') {
      console.log('\nAuthentication failed! Make sure you are using a Gmail App Password, not your regular password.')
      console.log('Steps: https://support.google.com/accounts/answer/185833')
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      console.log('\nConnection failed! Check your network or firewall settings.')
    }
  }
}

testEmail()
