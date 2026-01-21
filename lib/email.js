import nodemailer from 'nodemailer'
import PDFDocument from 'pdfkit'

// Create transporter with explicit port configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000
})

// Send password reset email
export async function sendPasswordResetEmail(to, resetToken) {
  console.log('Attempting to send email to:', to)
  console.log('Email config:', {
    user: process.env.EMAIL_USER,
    hasPassword: !!process.env.EMAIL_PASSWORD,
    fromName: process.env.EMAIL_FROM_NAME
  })
  
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  console.log('🔗 Reset link:', resetLink)
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Booking App'}" <${process.env.EMAIL_USER}>`,
    to,
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
    console.log('Sending email via Nodemailer...')
    
    // Verify connection before sending
    await transporter.verify()
    console.log('✅ SMTP connection verified')
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully!', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email sending error:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    // Return more specific error message
    let errorMessage = error.message
    if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Email server connection failed. Please check your network or try again later.'
    } else if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your email credentials.'
    }
    
    return { success: false, error: errorMessage }
  }
}

export async function verifyEmailConfig() {
  try {
    if (!process.env.EMAIL_USER) {
      console.error('EMAIL_USER is not set')
      return false
    }
    if (!process.env.EMAIL_PASSWORD) {
      console.error('EMAIL_PASSWORD is not set')
      return false
    }
    console.log('Email configuration is valid')
    return true
  } catch (error) {
    console.error('Email configuration error:', error)
    return false
  }
}

// Generate PDF receipt
export function generateReceiptPDF(bookingData) {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF without specifying fonts (uses default embedded fonts)
      const doc = new PDFDocument({ 
        margin: 50,
        bufferPages: true,
        autoFirstPage: true
      })
      const chunks = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Header
      doc.fontSize(24).fillColor('#667eea').text('BOOKING RECEIPT', { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(10).fillColor('#666').text('Payment Confirmation & Booking Details', { align: 'center' })
      doc.moveDown(2)

      // Receipt Info
      doc.fontSize(10).fillColor('#000')
      doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
      doc.text(`Receipt #: ${bookingData.paymentId || 'N/A'}`, { align: 'right' })
      doc.moveDown(2)

      // Customer Details
      doc.fontSize(14).fillColor('#667eea').text('Customer Details', { underline: true })
      doc.moveDown(0.5)
      doc.fontSize(10).fillColor('#000')
      doc.text(`Name: ${bookingData.guestName}`)
      doc.text(`Email: ${bookingData.guestEmail}`)
      if (bookingData.guestPhone) {
        doc.text(`Phone: ${bookingData.guestPhone}`)
      }
      doc.moveDown(2)

      // Booking Details
      doc.fontSize(14).fillColor('#667eea').text('Booking Details', { underline: true })
      doc.moveDown(0.5)
      doc.fontSize(10).fillColor('#000')
      doc.text(`Date: ${new Date(bookingData.bookingDate).toLocaleDateString()}`)
      doc.text(`Time: ${bookingData.bookingTime}`)
      doc.text(`Number of Guests: ${bookingData.numberOfGuests}`)
      if (bookingData.tableNumber) {
        doc.text(`Table Number: ${bookingData.tableNumber}`)
      }
      doc.text(`Table Area: ${bookingData.tableArea || 'Indoor'}`)
      if (bookingData.specialRequests) {
        doc.text(`Special Requests: ${bookingData.specialRequests}`)
      }
      doc.moveDown(2)

      // Payment Details
      doc.fontSize(14).fillColor('#667eea').text('Payment Details', { underline: true })
      doc.moveDown(0.5)
      doc.fontSize(10).fillColor('#000')
      doc.text(`Payment ID: ${bookingData.paymentId}`)
      doc.text(`Payment Status: ${bookingData.paymentStatus}`)
      doc.text(`Payment Method: ${bookingData.paymentMethod}`)
      doc.moveDown(1)

      // Amount
      doc.fontSize(16).fillColor('#000')
      doc.text(`Total Amount Paid: ₹${bookingData.paymentAmount}`, { bold: true })
      doc.moveDown(2)

      // Footer
      doc.fontSize(8).fillColor('#666')
      doc.text('Thank you for your booking!', { align: 'center' })
      doc.text('This is a computer-generated receipt and does not require a signature.', { align: 'center' })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

// Send booking confirmation email with PDF receipt
export async function sendBookingConfirmation(bookingData) {
  try {
    console.log('Generating PDF receipt...')
    const pdfBuffer = await generateReceiptPDF(bookingData)
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes')

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Booking App'}" <${process.env.EMAIL_USER}>`,
      to: bookingData.guestEmail,
      subject: 'Booking Confirmation - Payment Successful',
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
              .detail-row {
                padding: 10px;
                border-bottom: 1px solid #eee;
              }
              .detail-label {
                font-weight: bold;
                color: #667eea;
              }
              .amount {
                font-size: 24px;
                color: #28a745;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
                padding: 15px;
                background: #f0f8f0;
                border-radius: 5px;
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
                <h1>Booking Confirmed!</h1>
                <p>Payment Successful</p>
              </div>
              <div class="content">
                <p>Dear ${bookingData.guestName},</p>
                <p>Thank you for your booking! Your payment has been successfully processed.</p>

                <div class="amount">
                  Amount Paid: ₹${bookingData.paymentAmount}
                </div>

                <h3 style="color: #667eea;">Booking Details:</h3>
                <div class="detail-row">
                  <span class="detail-label">Date:</span> ${new Date(bookingData.bookingDate).toLocaleDateString()}
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span> ${bookingData.bookingTime}
                </div>
                <div class="detail-row">
                  <span class="detail-label">Number of Guests:</span> ${bookingData.numberOfGuests}
                </div>
                ${bookingData.tableNumber ? `<div class="detail-row">
                  <span class="detail-label">Table Number:</span> ${bookingData.tableNumber}
                </div>` : ''}
                <div class="detail-row">
                  <span class="detail-label">Table Area:</span> ${bookingData.tableArea || 'Indoor'}
                </div>

                <p style="margin-top: 20px;">
                  <strong>Payment ID:</strong> ${bookingData.paymentId}
                </p>

                <p>Your receipt is attached to this email as a PDF for your records.</p>

                <p>We look forward to serving you!</p>
                <p>Best regards,<br>The Booking Team</p>
              </div>
              <div class="footer">
                <p>This is an automated confirmation email.</p>
                <p>If you have any questions, please contact our support team.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `booking-receipt-${bookingData.paymentId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    }

    console.log('Sending booking confirmation email to:', bookingData.guestEmail)
    console.log('Attachment:', `booking-receipt-${bookingData.paymentId}.pdf`)

    await transporter.verify()
    console.log('SMTP connection verified for booking email')

    const info = await transporter.sendMail(mailOptions)
    console.log('Booking confirmation email sent successfully! Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending booking confirmation email:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Stack:', error.stack)
    return { success: false, error: error.message }
  }
}
