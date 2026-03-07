import { type NextAuthOptions, type User as NextAuthUser, type Account, type Profile } from 'next-auth'
import type { Provider } from 'next-auth/providers/index'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { findUserByEmail, createUser } from '@/lib/users'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'

const providers: Provider[] = [
  CredentialsProvider({
    id: 'credentials',
    name: 'Credentials',
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      try {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password')
        }

        // Ensure database connection is established
        await connectDB()

        const user = await findUserByEmail(credentials.email)

        if (!user) {
          throw new Error('Invalid email or password')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          phone: user.phone,
          role: user.role,
        }
      } catch (error) {
        console.error('Authorization error:', error)
        throw error
      }
    }
  }),
  CredentialsProvider({
    id: 'phone',
    name: 'Phone',
    credentials: {
      phone: { label: "Phone", type: "text" },
      otp: { label: "OTP", type: "text" }
    },
    async authorize(credentials) {
      if (!credentials?.phone || !credentials?.otp) {
        throw new Error('Please enter phone number and OTP')
      }

      await connectDB()

      const user = await User.findOne({ phone: credentials.phone })

      if (!user) {
        throw new Error('No user found with this phone number')
      }

      // Check if OTP exists
      if (!user.otpCode) {
        throw new Error('No OTP found. Please request a new one.')
      }

      // Check if OTP has expired
      if (user.otpExpiry && new Date() > user.otpExpiry) {
        user.otpCode = undefined
        user.otpExpiry = undefined
        await user.save()
        throw new Error('OTP has expired. Please request a new one.')
      }

      // Verify OTP
      if (user.otpCode !== credentials.otp) {
        throw new Error('Invalid OTP code')
      }

      // Mark phone as verified and clear OTP
      user.phoneVerified = true
      user.otpCode = undefined
      user.otpExpiry = undefined
      await user.save()

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name || user.phone,
        phone: user.phone,
        role: user.role,
      }
    }
  }),
]

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )
}
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  )
}

if (process.env.FACEBOOK_ID && process.env.FACEBOOK_SECRET &&
    process.env.FACEBOOK_ID !== 'your-facebook-app-id-here') {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: '/Login',
    error: '/Login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      // Default redirect to dashboard after sign in
      return `${baseUrl}/dashboard`
    },
    async signIn({ user, account, profile }: { user: NextAuthUser; account: Account | null; profile?: Profile }) {
      // For OAuth providers, sync with database
      if (account?.provider !== 'credentials' && account?.provider !== 'phone' && account) {
        try {
          console.log('OAuth signIn callback - provider:', account.provider, 'email:', user.email)
          
          // Ensure database connection
          await connectDB()
          console.log('Database connected successfully')
          
          const existingUser = await findUserByEmail(user.email ?? '')
          const provider = account.provider

          if (!existingUser) {
            console.log('Creating new OAuth user:', user.email, 'provider:', provider)
            
            // Get name from profile or user object
            const profileName = (profile && 'name' in profile) ? (profile as { name?: string }).name : undefined
            
            // Create new user for OAuth login
            const newUser = await createUser(
              user.email ?? '',
              '', // Empty password, will be replaced with random hash
              user.name || profileName || user.email || '',
              provider
            )
            
            console.log('✅ OAuth user created successfully in DB:', newUser.id)
            
            // Update user object with database ID
            user.id = newUser.id
          } else {
            console.log('✅ OAuth user already exists in DB:', existingUser.id)
            
            // Update user object with database ID
            user.id = existingUser.id
            
            // Update provider if changed
            if (existingUser.provider !== provider) {
              console.log('Updating user provider from', existingUser.provider, 'to', provider)
              await User.findOneAndUpdate(
                { email: user.email?.toLowerCase() },
                { provider }
              )
            }
          }
        } catch (error) {
          console.error('❌ Error in signIn callback:', error)
          if (error instanceof Error) {
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
          }
          // If user already exists error, that's fine - allow sign-in
          if (error instanceof Error && error.message === 'User already exists') {
            console.log('User already exists, allowing sign-in')
            return true
          }
          // For other errors, log but still allow OAuth sign-in
          // The OAuth authentication itself succeeded
          console.error('⚠️ Failed to sync OAuth user to database, but allowing sign-in')
          return true
        }
      }
      return true
    },
    async jwt({ token, user, account }: { token: JWT; user?: NextAuthUser; account?: Account | null }) {
      if (user) {
        // Type assertion for user with additional fields
        type ExtendedUser = NextAuthUser & { phone?: string; role?: string }
        const extendedUser = user as ExtendedUser
        
        // For OAuth providers, fetch complete user data from database
        if (account?.provider !== 'credentials' && account?.provider !== 'phone') {
          try {
            // Ensure database connection
            await connectDB()
            
            const dbUser = await findUserByEmail(user.email ?? '')
            if (dbUser) {
              token.id = dbUser.id
              token.name = dbUser.name
              token.email = dbUser.email?.toLowerCase()
              token.phone = dbUser.phone
              token.role = dbUser.role
              token.provider = account?.provider || 'credentials'
            } else {
              // Fallback to user object from OAuth
              console.log('User not found in database during JWT callback, using OAuth data')
              token.id = user.id
              token.name = user.name
              token.email = user.email?.toLowerCase()
              token.phone = extendedUser.phone
              token.role = 'user' // Default role
              token.provider = account?.provider || 'credentials'
            }
          } catch (error) {
            console.error('Error fetching user in JWT callback:', error)
            // Fallback to basic user data
            token.id = user.id
            token.name = user.name
            token.email = user.email?.toLowerCase()
            token.phone = extendedUser.phone
            token.role = 'user'
            token.provider = account?.provider || 'credentials'
          }
        } else {
          // For credentials/phone login, use data from user object
          token.id = user.id
          token.name = user.name
          token.email = user.email?.toLowerCase()
          token.phone = extendedUser.phone
          token.role = extendedUser.role || 'user'
          token.provider = account?.provider || 'credentials'
        }
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email?.toLowerCase() || token.email
        session.user.phone = token.phone as string
        session.user.role = token.role as string
        session.user.provider = token.provider
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
