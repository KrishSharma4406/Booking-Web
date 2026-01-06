import NextAuth from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { findUserByEmail, createUser } from '@/lib/users'

const providers = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Please enter email and password')
      }

      const user = await findUserByEmail(credentials.email)

      if (!user) {
        throw new Error('No user found with this email')
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      )

      if (!isPasswordValid) {
        throw new Error('Invalid password')
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
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

export const authOptions = {
  providers,
  pages: {
    signIn: '/Login',
    error: '/Login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, sync with database
      if (account?.provider !== 'credentials') {
        try {
          const existingUser = await findUserByEmail(user.email)

          if (!existingUser) {
            // Create new user for OAuth login
            await createUser(
              user.email,
              '', // No password for OAuth users
              user.name || profile?.name || user.email,
              account.provider
            )
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.provider = account?.provider || 'credentials'
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.provider = token.provider
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

