'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSocialSignup = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error(`${provider} signup error:`, error)
      setError(`Failed to sign up with ${provider}. Please try again.`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      // Trim and lowercase email for consistency
      const trimmedEmail = email.trim().toLowerCase()
      const trimmedPhone = phone.trim()
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: trimmedEmail, 
          password, 
          name: name.trim(), 
          phone: trimmedPhone || undefined 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      // Auto-login after successful signup
      const result = await signIn('credentials', {
        redirect: false,
        email: trimmedEmail,
        password,
      })

      if (result?.ok) {
        setError('Account created successfully! Redirecting to dashboard...')
        setTimeout(() => { window.location.href = '/dashboard' }, 1000)
      } else {
        setError('Account created! Logging you in...')
        setTimeout(() => { window.location.href = '/dashboard' }, 1500)
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <main className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(128,128,128,0.15) 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>

      <motion.div 
        className="relative z-10 max-w-md w-full glass-card p-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-2">
          <motion.div 
            className="mx-auto w-16 h-16 bg-card border border-border rounded-xl flex items-center justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </motion.div>
          <h3 className="text-3xl font-bold text-foreground">
            Create your account
          </h3>
          <p className="text-muted text-sm">
            Join us today
          </p>
        </div>
        {error && (
          <div className={`p-4 border rounded-xl text-sm flex items-start gap-3 ${
            error.includes('created!')
              ? 'bg-green-900/30 border-green-500/50 text-green-400'
              : 'bg-red-900/30 border-red-500/50 text-red-400'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
              {error.includes('created!') ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              )}
            </svg>
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name*</label>
              <input
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                className="w-full px-4 py-3 text-foreground bg-card outline-none border-2 border-border focus:border-foreground rounded-xl transition-all duration-200 placeholder:text-muted"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address*</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                className="w-full px-4 py-3 text-foreground bg-card outline-none border-2 border-border focus:border-foreground rounded-xl transition-all duration-200 placeholder:text-muted"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder=" "
                className="w-full px-4 py-3 text-foreground bg-card outline-none border-2 border-border focus:border-foreground rounded-xl transition-all duration-200 placeholder:text-muted"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password*</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder=" "
                  className="w-full px-4 py-3 pr-12 text-foreground bg-card outline-none border-2 border-border focus:border-foreground rounded-xl transition-all duration-200 placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm Password*</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder=" "
                  className="w-full px-4 py-3 pr-12 text-foreground bg-card outline-none border-2 border-border focus:border-foreground rounded-xl transition-all duration-200 placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 text-background font-semibold bg-foreground hover:opacity-90 active:opacity-80 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
        <div className="relative">
          <span className="block w-full h-px bg-border"></span>
          <p className="inline-block w-fit text-sm bg-background px-2 absolute -top-2 inset-x-0 mx-auto text-muted">
            Or continue with
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialSignup('google')}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-border rounded-xl hover:bg-card hover:border-foreground transition-all duration-200 text-foreground font-medium"
            title="Sign up with Google"
          >
            <Image
              src="http://pluspng.com/img-png/google-logo-png-open-2000.png"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
              unoptimized
            />
            <span>Google</span>
          </button>
          <button
            onClick={() => handleSocialSignup('github')}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-border rounded-xl hover:bg-card hover:border-foreground transition-all duration-200 text-foreground font-medium"
            title="Sign up with GitHub"
          >
            <Image
              src="https://raw.githubusercontent.com/sidiDev/remote-assets/0d3b55a09c6bb8155ca19f43283dc6d88ff88bf5/github-icon.svg"
              alt="GitHub"
              width={20}
              height={20}
              className="w-5 h-5"
              unoptimized
            />
            <span>GitHub</span>
          </button>
        </div>
        <div className="text-center">
          <p className="text-muted">
            Already have an account?{' '}
            <Link
              href="/Login"
              className="text-foreground hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}

export default Signup
