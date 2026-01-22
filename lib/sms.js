// SMS/OTP Service Library
// Supports multiple SMS providers: Twilio, AWS SNS, or Console logging for development

/**
 * Generate a random 6-digit OTP code
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP via SMS using configured provider
 * @param {string} phone - Phone number with country code (e.g., +1234567890)
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<boolean>} - Success status
 */
export async function sendOTP(phone, otp) {
  const provider = process.env.SMS_PROVIDER || 'console'

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
 * Requires: npm install twilio
 * Environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */
async function sendViaTwilio(phone, otp) {
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
 * Requires: npm install @aws-sdk/client-sns
 * Environment variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 */
async function sendViaAWSSNS(phone, otp) {
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
 * Validate phone number format (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether phone number is valid
 */
export function validatePhoneNumber(phone) {
  // Basic validation: should start with + and contain 10-15 digits
  const phoneRegex = /^\+[1-9]\d{9,14}$/
  return phoneRegex.test(phone)
}

/**
 * Format phone number for display (mask middle digits)
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone (e.g., +1234****890)
 */
export function formatPhoneForDisplay(phone) {
  if (!phone || phone.length < 8) return phone
  const start = phone.substring(0, 5)
  const end = phone.substring(phone.length - 3)
  return `${start}****${end}`
}
