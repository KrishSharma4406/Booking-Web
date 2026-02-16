// Quick test script to verify OpenAI API connection
// Run with: node test-openai.js

require('dotenv').config({ path: '.env.local' })
const OpenAI = require('openai').default

async function testOpenAI() {
  console.log('🧪 Testing OpenAI API Connection...\n')
  
  const apiKey = process.env.OPENAI_API_KEY
  console.log('API Key exists:', !!apiKey)
  console.log('API Key length:', apiKey?.length || 0)
  console.log('API Key prefix:', apiKey?.substring(0, 20) + '...\n')
  
  if (!apiKey || apiKey.includes('your-openai-api-key')) {
    console.error('❌ ERROR: OpenAI API key not configured!')
    console.error('Please set OPENAI_API_KEY in .env.local file')
    process.exit(1)
  }
  
  try {
    const openai = new OpenAI({ apiKey })
    
    console.log('📡 Sending test request to OpenAI...')
    const startTime = Date.now()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Hello! OpenAI is working!" in a friendly way.' }
      ],
      max_tokens: 50,
    })
    
    const endTime = Date.now()
    const response = completion.choices[0]?.message?.content
    
    console.log('✅ SUCCESS! OpenAI API is working!\n')
    console.log('Response time:', endTime - startTime, 'ms')
    console.log('Model used:', completion.model)
    console.log('Tokens used:', completion.usage?.total_tokens)
    console.log('\nAI Response:')
    console.log('─────────────────────────────────')
    console.log(response)
    console.log('─────────────────────────────────\n')
    console.log('✅ Your chatbot should now work with real AI responses!')
    
  } catch (error) {
    console.error('\n❌ ERROR connecting to OpenAI:\n')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error status:', error.status)
    console.error('Error code:', error.code)
    
    if (error.status === 401) {
      console.error('\n🔑 Authentication failed!')
      console.error('Your API key appears to be invalid or expired.')
      console.error('Please check: https://platform.openai.com/api-keys')
    } else if (error.status === 429) {
      console.error('\n⏱️ Rate limit exceeded!')
      console.error('Too many requests. Please wait a moment and try again.')
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🌐 Network error!')
      console.error('Cannot reach OpenAI servers. Check your internet connection.')
    }
    
    process.exit(1)
  }
}

testOpenAI()
