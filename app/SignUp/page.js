'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

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
  const router = useRouter()

  const handleSocialSignup = async (provider) => {
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error(`${provider} signup error:`, error)
      setError(`Failed to sign up with ${provider}. Please try again.`)
    }
  }

  const handleSubmit = async (e) => {
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        setIsLoading(false)
        return
      }

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError('Account created! Please wait for admin approval before logging in.')
        setTimeout(() => router.push('/Login'), 3000)
      } else {
        setError('Account created! Please wait for admin approval to access all features.')
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <main className="relative w-full h-screen flex flex-col items-center justify-center px-4">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{backgroundImage: "url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1920&q=80')"}}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/50 to-purple-900/50"></div>

      <div className="relative z-10 max-w-sm w-full text-gray-400 space-y-8">
        <div className="text-center">
          <div className="mt-5 space-y-2">
            <h3 className="text-gray-100 text-2xl font-bold sm:text-3xl bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Create your account
            </h3>
            <p className="text-gray-300">
              Join us today
            </p>
          </div>
        </div>
        {error && (
          <div className={`p-3 border rounded-md text-sm ${
            error.includes('created!')
              ? 'bg-green-100 border-green-400 text-green-700'
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="font-medium text-gray-300"> Name* </label>
              <input
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-2 px-3 py-2 text-white bg-slate-900 outline-none border-2 border-blue-800 focus:border-indigo-600 shadow-sm rounded-lg"
              />
            </div>
            <div>
              <label className="font-medium text-gray-300"> Email* </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-2 px-3 py-2 text-white bg-slate-900 outline-none border-2 border-blue-800 focus:border-indigo-600 shadow-sm rounded-lg"
              />
            </div>
            <div>
              <label className="font-medium text-gray-300"> Phone Number* </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder=" "
                className="w-full mt-2 px-3 py-2 text-white bg-slate-900 outline-none border-2 border-blue-800 focus:border-indigo-600 shadow-sm rounded-lg"
              />
            </div>
            <div>
              <label className="font-medium text-gray-300"> Password* </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full mt-2 px-3 py-2 pr-10 text-white bg-slate-900 outline-none border-2 border-blue-800 focus:border-indigo-600 shadow-sm rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-1 text-gray-400 hover:text-gray-200"
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
            <div>
              <label className="font-medium text-gray-300"> Confirm Password </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full mt-2 px-3 py-2 pr-10 text-white bg-slate-900 outline-none border-2 border-blue-800 focus:border-indigo-600 shadow-sm rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-1 text-gray-400 hover:text-gray-200"
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
              className="w-full mt-4 px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
        <div className="relative">
          <span className="block w-full h-px bg-gray-600"></span>
          <p className="inline-block w-fit text-sm bg-black px-2 absolute -top-2 inset-x-0 mx-auto">
            Or sign up with
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleSocialSignup('google')}
            className="p-3 border border-gray-600 rounded-lg hover:bg-gray-800 duration-150 active:bg-gray-700 transition-all hover:scale-110"
            title="Sign up with Google"
          >
            <Image
              src="http://pluspng.com/img-png/google-logo-png-open-2000.png"
              alt="Google"
              width={20}
              height={20}
              className="w-6 h-6"
              unoptimized
            />
            <p>Google</p>
          </button>
          <button
            onClick={() => handleSocialSignup('github')}
            className="align-center p-3 border border-gray-600 rounded-lg hover:bg-gray-800 duration-150 active:bg-gray-700 transition-all hover:scale-110"
            title="Sign up with GitHub"
          >
            <Image
              src="https://raw.githubusercontent.com/sidiDev/remote-assets/0d3b55a09c6bb8155ca19f43283dc6d88ff88bf5/github-icon.svg"
              alt="GitHub"
              width={20}
              height={20}
              className="w-6 h-6"
              unoptimized
            />
            <p>GitHub</p>
          </button>
        </div>
        <div className="text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link
              href="/Login"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default Signup
