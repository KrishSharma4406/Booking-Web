import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * AI Chatbot for restaurant customer support
 * Handles queries about menu, bookings, table availability, etc.
 */
export async function chatWithAI(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  
  // Detailed API key check
  console.log('=== OpenAI API Check ===')
  console.log('API Key exists:', !!apiKey)
  console.log('API Key length:', apiKey?.length || 0)
  console.log('API Key prefix:', apiKey?.substring(0, 10) || 'none')
  
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your-openai-api-key')) {
    console.error('❌ OpenAI API key not configured or invalid')
    console.error('Please set OPENAI_API_KEY in your .env.local file')
    return getFallbackResponse(messages[messages.length - 1]?.content || '') + '\n\n⚠️ _Note: Using fallback responses. Configure OpenAI API key for AI-powered answers._'
  }

  try {
    const systemPrompt = `You are a versatile, helpful AI assistant for a premium restaurant booking system. You should answer ALL types of questions professionally.

PRIMARY EXPERTISE - Restaurant & Dining:
INDOOR: Climate-controlled, elegant decor, professional atmosphere. Perfect for business meetings, formal dinners, and professional gatherings.

OUTDOOR: Fresh air, garden views, natural lighting. Ideal for casual dining, lunch meetings, family gatherings, and relaxed experiences.

POOLSIDE: Scenic water views, tranquil ambiance, unique setting. Great for leisure dining, special occasions, and memorable experiences.

ROOFTOP: Premium seating, panoramic views, romantic lighting. Perfect for romantic dinners, celebrations, anniversaries, and special evenings.

DINING RECOMMENDATIONS:
- Romantic dinner/Date night → ROOFTOP (intimate, views, special)
- Business dinner/Professional → INDOOR (quiet, formal, AC)
- Birthday/Anniversary → ROOFTOP or POOLSIDE (memorable)
- Family dinner/Groups → INDOOR or OUTDOOR (spacious)
- Casual lunch → OUTDOOR (fresh air, relaxed)
- Large parties (6+) → INDOOR or OUTDOOR (space)

GENERAL KNOWLEDGE - Answer questions about:
- Business etiquette and professional advice
- General knowledge and facts
- Technology and travel tips
- Weather and seasonal recommendations
- Event planning and celebrations
- Food and dietary suggestions
- Time management and productivity
- Any other general topics

RESPONSE GUIDELINES:
- Be friendly, warm, and conversational
- Provide accurate, helpful information
- Use clear explanations with specific reasoning
- Keep responses concise (2-4 sentences for simple questions, more for complex ones)
- Do NOT use emojis - maintain professional text-only responses
- If you don't know something definitively, acknowledge it honestly
- For restaurant queries, always connect back to booking options
- For general queries, provide helpful information and relate to dining when possible

Remember: You're here to help with ANYTHING the user asks while maintaining focus on providing excellent restaurant service.`

    console.log('🚀 Calling OpenAI API with', messages.length, 'messages...')
    
    const startTime = Date.now()
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 500,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    })
    
    const endTime = Date.now()
    const response = completion.choices[0]?.message?.content
    
    console.log('✅ OpenAI response received in', endTime - startTime, 'ms')
    console.log('Response preview:', response?.substring(0, 100))
    console.log('Tokens used:', completion.usage?.total_tokens || 'unknown')
    
    if (!response) {
      console.error('❌ Empty response from OpenAI')
      throw new Error('Empty response from OpenAI API')
    }
    
    return response
  } catch (error: any) {
    console.error('❌ OpenAI API Error:', error)
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error status:', error.status)
    console.error('Error code:', error.code)
    
    // Provide specific error feedback
    if (error.status === 401) {
      console.error('🔑 Authentication failed - API key may be invalid')
      return 'I apologize, but I\'m having authentication issues. Please contact support.\n\n⚠️ _API key authentication failed._'
    }
    
    if (error.status === 429) {
      console.error('⏱️ Rate limit exceeded')
      return 'I apologize, but I\'m experiencing high demand right now. Please try again in a moment.\n\n⚠️ _Rate limit reached._'
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('🌐 Network connection issue')
      return getFallbackResponse(messages[messages.length - 1]?.content || '') + '\n\n⚠️ _Network issue. Using fallback response._'
    }

    // Generic fallback with error indication
    console.error('Using fallback response due to error')
    return getFallbackResponse(messages[messages.length - 1]?.content || '') + '\n\n⚠️ _AI temporarily unavailable. Using fallback response._'
  }
}

/**
 * Comprehensive fallback responses when AI is unavailable
 * Handles restaurant queries AND general questions
 */
function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()

  // === RESTAURANT-SPECIFIC QUERIES ===
  
  // Dinner recommendations with purpose
  if (lowerMessage.includes('dinner') && (lowerMessage.includes('best') || lowerMessage.includes('recommend') || lowerMessage.includes('purpose'))) {
    if (lowerMessage.includes('romantic') || lowerMessage.includes('date')) {
      return "For a romantic dinner, I highly recommend our **Rooftop** area! It offers stunning panoramic views, ambient lighting, and an intimate atmosphere perfect for special moments. The elevated setting creates a memorable dining experience that's ideal for dates and proposals."
    }
    if (lowerMessage.includes('business') || lowerMessage.includes('professional') || lowerMessage.includes('meeting')) {
      return "For a business dinner, our **Indoor** area is ideal. It provides a professional, quiet atmosphere with climate control and elegant decor - perfect for important conversations, negotiations, and networking. The sophisticated setting impresses clients."
    }
    if (lowerMessage.includes('family') || lowerMessage.includes('group')) {
      return "For a family dinner, I recommend our **Indoor** or **Outdoor** areas. They're spacious, comfortable, and accommodate larger groups easily. The relaxed atmosphere is perfect for family gatherings and celebrations."
    }
    return "For dinner, I recommend our **Rooftop** area for the best experience! The stunning views, sophisticated ambiance, and premium setting make it perfect for evening dining. It's ideal for special occasions, romantic dinners, or celebrations. Alternatively, our **Indoor** area offers elegant dining with a cozy, refined atmosphere."
  }

  // Lunch recommendations
  if (lowerMessage.includes('lunch') && (lowerMessage.includes('best') || lowerMessage.includes('recommend'))) {
    return "For lunch, our **Outdoor** area is perfect! Enjoy your meal in fresh air with natural light and beautiful garden views. It's refreshing and energizing - ideal for a midday break. The casual yet elegant atmosphere is great for business lunches or catching up with friends."
  }

  // Celebrations
  if (lowerMessage.includes('celebration') || lowerMessage.includes('birthday') || lowerMessage.includes('anniversary') || lowerMessage.includes('party')) {
    return "For a special celebration, our **Rooftop** area is the ultimate choice! The breathtaking views and premium ambiance create unforgettable memories. For a more relaxed celebration with a unique touch, our **Poolside** area offers beautiful scenery and a tranquil dining experience."
  }

  // Romantic occasions
  if (lowerMessage.includes('romantic') || lowerMessage.includes('date night') || lowerMessage.includes('propose') || lowerMessage.includes('proposal')) {
    return "For a romantic experience, our **Rooftop** area is absolutely perfect! Enjoy stunning views, intimate seating arrangements, and ambient lighting that sets the mood for a special evening. It's our most popular choice for couples, anniversaries, and proposals. The atmosphere is simply magical!"
  }

  // Table booking queries
  if (lowerMessage.includes('table') || lowerMessage.includes('book') || lowerMessage.includes('reservation') || lowerMessage.includes('reserve')) {
    return "I'd be happy to help you with table reservations! We offer 4 unique dining areas:\n\n**Indoor** - Cozy, elegant & climate-controlled\n**Outdoor** - Fresh air & beautiful garden views\n**Poolside** - Relaxing water views & tranquil ambiance\n**Rooftop** - Premium views & romantic atmosphere\n\nYou can book directly on our Bookings page. What type of experience are you looking for?"
  }
  
  // Menu and food
  if (lowerMessage.includes('menu') || lowerMessage.includes('food') || lowerMessage.includes('dish') || lowerMessage.includes('cuisine')) {
    return "Our restaurant offers a diverse, premium menu featuring fresh, locally-sourced ingredients and international cuisine. We cater to various dietary preferences including vegetarian options and special requests. For detailed menu information and today's specials, please contact our staff or visit us. What kind of cuisine interests you?"
  }
  
  // Cancellation and modifications
  if (lowerMessage.includes('cancel') || lowerMessage.includes('modify') || lowerMessage.includes('change booking')) {
    return "To modify or cancel your booking, please visit the **Bookings** page where you can view and manage all your reservations. You can change the date, time, or number of guests. For urgent changes, feel free to contact our support team directly for immediate assistance."
  }
  
  // Hours and timing
  if (lowerMessage.includes('hour') || lowerMessage.includes('time') || lowerMessage.includes('open') || lowerMessage.includes('close')) {
    return "We're open daily for both lunch and dinner service! Lunch: 11:30 AM - 3:30 PM, Dinner: 6:00 PM - 11:00 PM. For specific availability and to see all available time slots, please check our Bookings page. We also offer special weekend brunch!"
  }
  
  // Dining areas
  if (lowerMessage.includes('area') || lowerMessage.includes('seating') || lowerMessage.includes('where')) {
    return "We offer 4 distinct dining areas, each with unique ambiance:\n\n**Indoor** - Climate-controlled, elegant, perfect for formal dining\n**Outdoor** - Garden atmosphere, fresh air, great for casual meals\n**Poolside** - Scenic water views, relaxing and unique\n**Rooftop** - Premium views, romantic lighting, unforgettable experience\n\nEach area has different pricing based on the experience. What atmosphere appeals to you?"
  }

  // === GENERAL KNOWLEDGE QUERIES ===
  
  // Weather and seasonal
  if (lowerMessage.includes('weather') || lowerMessage.includes('season') || lowerMessage.includes('temperature')) {
    return "For weather-related dining, I recommend: On sunny days, our **Outdoor** or **Poolside** areas are perfect! On cooler or rainy days, our climate-controlled **Indoor** area ensures comfort. The **Rooftop** is magical on clear evenings with pleasant weather. Would you like to make a reservation based on today's forecast?"
  }

  // Technology questions
  if (lowerMessage.includes('how to') || lowerMessage.includes('technology') || lowerMessage.includes('app') || lowerMessage.includes('website')) {
    return "I can help you navigate our booking system! To make a reservation: 1) Go to the Bookings page, 2) Select your preferred date and time, 3) Choose number of guests, 4) Pick your dining area, 5) Confirm your booking. You can also manage existing reservations from your account. Need help with a specific step?"
  }

  // Pricing and payment
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('payment') || lowerMessage.includes('expensive')) {
    return "Our pricing varies by dining area to reflect the unique experience each offers. **Indoor** and **Outdoor** are our standard options, while **Poolside** and **Rooftop** are premium experiences with higher pricing. We accept all major payment methods. Exact pricing is displayed when booking. Would you like to see available options?"
  }

  // Special requests
  if (lowerMessage.includes('wheelchair') || lowerMessage.includes('accessible') || lowerMessage.includes('disability') || lowerMessage.includes('special needs')) {
    return "We're fully committed to accessibility! All our dining areas are wheelchair accessible with ramps and spacious seating. We accommodate special needs including dietary restrictions, allergies, and mobility requirements. Please mention any special requirements when booking, and our team will ensure everything is prepared for you."
  }

  // Group size questions
  if (lowerMessage.includes('how many') || lowerMessage.includes('large group') || lowerMessage.includes('people')) {
    return "We welcome groups of all sizes! For 1-4 guests, all areas work perfectly. For 5-8 guests, **Indoor** and **Outdoor** are spacious. For 9+ guests, we recommend **Indoor** or **Outdoor** with advance booking for optimal seating arrangements. Very large parties (15+) can be accommodated with prior notice. How many will be joining you?"
  }

  // Parking and location
  if (lowerMessage.includes('parking') || lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('directions')) {
    return "We offer complimentary valet parking for all guests! We're conveniently located with easy access from major roads. Detailed directions and our exact address are available on our website's Contact page. Public transportation and ride-sharing services are also readily available. Need specific directions?"
  }

  // Thank you / appreciation
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('appreciate')) {
    return "You're very welcome! I'm always here to help make your dining experience exceptional. If you have any other questions about bookings, dining areas, or special occasions, feel free to ask anytime. Looking forward to serving you!"
  }

  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good evening')) {
    return "Hello! Welcome to our restaurant booking system. I'm here to help you with:\n- Table reservations & recommendations\n- Dining area selection (Indoor, Outdoor, Poolside, Rooftop)\n- Occasion-specific suggestions\n- Special requests & inquiries\n- General questions\n\nWhat can I assist you with today?"
  }

  // Help requests
  if (lowerMessage.includes('help') || lowerMessage.includes('assist') || lowerMessage.includes('support')) {
    return "I'm here to help! I can assist you with:\n\n- Making reservations\n- Choosing the perfect dining area\n- Recommendations for any occasion\n- Modifying or canceling bookings\n- Answering any questions you have\n\nWhat would you like help with specifically?"
  }

  // Complaint or issue
  if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('complaint') || lowerMessage.includes('wrong')) {
    return "I'm sorry you're experiencing an issue! I'm here to help resolve it. Please provide details about the problem - whether it's with a booking, service, or anything else - and I'll do my best to assist. For urgent matters, you can also contact our support team directly on the Contact page."
  }

  // General questions about anything
  if (lowerMessage.includes('what') || lowerMessage.includes('why') || lowerMessage.includes('how') || lowerMessage.includes('when') || lowerMessage.includes('where') || lowerMessage.includes('?')) {
    return "Great question! While I specialize in helping with restaurant reservations and dining experiences, I'm happy to assist with your query. Our restaurant features 4 unique dining areas - **Indoor**, **Outdoor**, **Poolside**, and **Rooftop** - each perfect for different occasions. Could you provide more details about what you'd like to know, or would you like help making a reservation?"
  }

  // Default comprehensive response
  return "Thank you for reaching out! I'm your AI assistant ready to help with:\n\n- Table bookings and recommendations\n- Dining area selection (Indoor, Outdoor, Poolside, Rooftop)\n- Occasion planning (romantic, business, celebrations)\n- Any questions you have\n\nEach dining area offers a unique experience. What would you like to know more about?"
}

/**
 * AI-powered table recommendation system
 * Recommends the best table based on guest count, preferences, and availability
 */
export async function getTableRecommendation(
  numberOfGuests: number,
  preferences?: string,
  specialRequests?: string
): Promise<{
  recommendation: string
  tableArea: string
  reasoning: string
}> {
  try {
    const prompt = `As a restaurant AI, recommend the best table setup for:
- Number of guests: ${numberOfGuests}
- Preferences: ${preferences || 'none specified'}
- Special requests: ${specialRequests || 'none'}

Available areas: indoor, outdoor, poolside, rooftop
Provide: recommended area, specific reasoning (max 2 sentences)

Format your response as JSON:
{
  "tableArea": "indoor|outdoor|poolside|rooftop",
  "reasoning": "brief explanation"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a restaurant table recommendation expert. Respond only in valid JSON format.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 150,
    })

    const response = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(response)

    return {
      recommendation: `Recommended for ${numberOfGuests} guests`,
      tableArea: parsed.tableArea || 'indoor',
      reasoning: parsed.reasoning || 'Best available option for your party size.',
    }
  } catch (error) {
    console.error('AI Table Recommendation Error:', error)
    // Fallback to simple logic
    if (numberOfGuests <= 2) return { recommendation: 'Intimate seating', tableArea: 'indoor', reasoning: 'Perfect for a cozy dining experience.' }
    if (numberOfGuests <= 4) return { recommendation: 'Standard table', tableArea: 'outdoor', reasoning: 'Ideal for small groups to enjoy the ambiance.' }
    if (numberOfGuests <= 8) return { recommendation: 'Group seating', tableArea: 'poolside', reasoning: 'Great for gatherings with a view.' }
    return { recommendation: 'Large party', tableArea: 'rooftop', reasoning: 'Spacious area perfect for celebrations.' }
  }
}

/**
 * AI-powered review sentiment analysis
 * Analyzes customer reviews to determine sentiment and extract insights
 */
export async function analyzeReviewSentiment(reviewText: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
  summary: string
  keywords: string[]
}> {
  try {
    const prompt = `Analyze this restaurant review sentiment:
"${reviewText}"

Provide JSON response:
{
  "sentiment": "positive|neutral|negative",
  "score": 0-10,
  "summary": "one sentence summary",
  "keywords": ["key1", "key2", "key3"]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a sentiment analysis expert. Respond only in valid JSON format.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const response = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(response)

    return {
      sentiment: parsed.sentiment || 'neutral',
      score: parsed.score || 5,
      summary: parsed.summary || 'Review analyzed.',
      keywords: parsed.keywords || [],
    }
  } catch (error) {
    console.error('AI Sentiment Analysis Error:', error)
    return {
      sentiment: 'neutral',
      score: 5,
      summary: 'Unable to analyze sentiment.',
      keywords: [],
    }
  }
}

/**
 * AI-powered booking time suggestions
 * Suggests optimal booking times based on restaurant capacity and demand
 */
export async function suggestBookingTimes(
  date: string,
  numberOfGuests: number,
  existingBookings: number[]
): Promise<string[]> {
  try {
    const prompt = `Restaurant has existing bookings at hours: ${existingBookings.join(', ')}
Guest party size: ${numberOfGuests}
Date: ${date}

Suggest 3 best alternative time slots (hours 11-23) avoiding congestion.
Respond as JSON: {"times": ["HH:00", "HH:00", "HH:00"]}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a restaurant scheduling optimizer. Respond only in valid JSON format.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 100,
    })

    const response = completion.choices[0]?.message?.content || '{"times": []}'
    const parsed = JSON.parse(response)

    return parsed.times || ['18:00', '19:00', '20:00']
  } catch (error) {
    console.error('AI Booking Suggestion Error:', error)
    return ['18:00', '19:00', '20:00'] // Fallback popular times
  }
}

const aiUtils = {
  chatWithAI,
  getTableRecommendation,
  analyzeReviewSentiment,
  suggestBookingTimes,
}

export default aiUtils
