// SMS/OTP Service Library
// Supports multiple SMS providers: Twilio, AWS SNS, or Console logging for development

/**
 * Generate a random 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP via SMS using configured provider
 */
export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  const provider: string = process.env.SMS_PROVIDER || 'console'

  try {
    switch (provider) {
      case 'twilio':
        return await sendViaTwilio(phone, otp)
      
      case 'aws-sns':
        return await sendViaAWSSNS(phone, otp)
      
      case 'console':
      default:
        // Development mode - log to console
        console.log(`OTP for ${phone}: ${otp}`)
        return true
    }
  } catch (error) {
    console.error('Failed to send OTP:', error)
    return false
  }
}

/**
 * Send OTP via Twilio
 */
async function sendViaTwilio(phone: string, otp: string): Promise<boolean> {
  try {
    const twilio = require('twilio')
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    await client.messages.create({
      body: `Your verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    })

    return true
  } catch (error) {
    console.error('Twilio error:', error)
    throw error
  }
}

/**
 * Send OTP via AWS SNS
 */
async function sendViaAWSSNS(phone: string, otp: string): Promise<boolean> {
  try {
    const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')
    
    const client = new SNSClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    })

    const command = new PublishCommand({
      Message: `Your verification code is: ${otp}. Valid for 10 minutes.`,
      PhoneNumber: phone,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    })

    await client.send(command)
    return true
  } catch (error) {
    console.error('AWS SNS error:', error)
    throw error
  }
}

/**
 * Validate phone number format (India only - +91)
 */
export function validatePhoneNumber(phone: string): boolean {
  const indiaPhoneRegex = /^\+91[6-9]\d{9}$/
  return indiaPhoneRegex.test(phone)
}

/**
 * Check if phone number is from India
 */
export function isIndianNumber(phone: string): boolean {
  return !!phone && phone.startsWith('+91')
}

/**
 * Format phone number for display (mask middle digits)
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone || phone.length < 8) return phone
  const start = phone.substring(0, 5)
  const end = phone.substring(phone.length - 3)
  return `${start}****${end}`
}
