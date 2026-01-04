import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Send password reset email
export async function sendPasswordResetEmail(to, resetToken) {
  console.log('Attempting to send email to:', to)
  console.log('Email config:', {
    from: process.env.EMAIL_FROM,
    hasApiKey: !!process.env.SENDGRID_API_KEY,
    fromName: process.env.EMAIL_FROM_NAME
  })
  
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  console.log('🔗 Reset link:', resetLink)
  
  const msg = {
    to,
    from: {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME || 'Booking App'
    },
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password for your Booking account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              <p><strong>Or copy and paste this link into your browser:</strong></p>
              <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${resetLink}
              </p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>Best regards,<br>The Booking Team</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    console.log('Sending email via SendGrid...')
    const response = await sgMail.send(msg)
    console.log('Email sent successfully!', response[0].statusCode)
    return { success: true, statusCode: response[0].statusCode }
  } catch (error) {
    console.error('Email sending error:', error)
    if (error.response) {
      console.error('SendGrid error details:', error.response.body)
    }
    return { success: false, error: error.message }
  }
}

export async function verifyEmailConfig() {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY is not set')
      return false
    }
    if (!process.env.EMAIL_FROM) {
      console.error('EMAIL_FROM is not set')
      return false
    }
    console.log('SendGrid email configuration is valid')
    return true
  } catch (error) {
    console.error('Email configuration error:', error)
    return false
  }
}
