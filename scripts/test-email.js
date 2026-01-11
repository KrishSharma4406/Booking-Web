// Test email configuration
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get directory name for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') })

console.log('='.repeat(50))
console.log('EMAIL CONFIGURATION TEST')
console.log('='.repeat(50))

console.log('\n📧 Environment Variables:')
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing')
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Missing')
console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || '(not set)')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '(not set)')

console.log('\n🔍 Values:')
console.log('EMAIL_USER:', process.env.EMAIL_USER)
console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME)
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? `${process.env.EMAIL_PASSWORD.slice(0, 4)}${'*'.repeat(12)}` : 'NOT SET')

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log('\n❌ ERROR: Email credentials are not set properly')
  console.log('\nPlease update your .env.local file with:')
  console.log('EMAIL_USER=your-gmail@gmail.com')
  console.log('EMAIL_PASSWORD=your-16-char-app-password')
  console.log('\nIMPORTANT: Use Gmail App Password, not your regular password!')
  console.log('See EMAIL_TROUBLESHOOTING.md for detailed instructions.')
  process.exit(1)
}

console.log('\n' + '='.repeat(50))
console.log('Now testing SMTP connection...')
console.log('='.repeat(50))

// Dynamic import to test actual email sending
import('../lib/email.js').then(async (emailLib) => {
  try {
    const testEmail = process.env.EMAIL_USER // send to yourself
    console.log(`\n📨 Sending test email to: ${testEmail}`)
    
    const result = await emailLib.sendPasswordResetEmail(testEmail, 'test-token-123456')
    
    console.log('\n' + '='.repeat(50))
    if (result.success) {
      console.log('✅ SUCCESS! Email sent successfully!')
      console.log('Message ID:', result.messageId)
      console.log('\n📬 Check your inbox:', testEmail)
    } else {
      console.log('❌ FAILED! Email could not be sent')
      console.log('Error:', result.error)
      console.log('\n💡 Common solutions:')
      console.log('1. Make sure you are using a Gmail App Password, not your regular password')
      console.log('2. Enable 2-Step Verification on your Google account')
      console.log('3. Generate a new App Password from https://myaccount.google.com/security')
      console.log('4. Copy the 16-character password (remove spaces) to .env.local')
      console.log('\nSee EMAIL_TROUBLESHOOTING.md for detailed instructions.')
    }
    console.log('='.repeat(50))
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error('Stack:', error.stack)
  }
}).catch(err => {
  console.error('Failed to load email module:', err)
})
