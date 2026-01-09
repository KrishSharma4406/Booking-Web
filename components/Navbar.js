"use client"
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"

const Navbar = () => {
  const { data: session, status } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState('user')
  const dropdownRef = useRef(null)

  useEffect(() => {
    const checkUserRole = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch('/api/users/me')
          if (res.ok) {
            const data = await res.json()
            setUserRole(data.role)
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        }
      }
    }
    checkUserRole()
  }, [session])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className='bg-slate-950 text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/newlogo.png" alt="Logo" width={40} height={40} className="object-contain rounded-full" />
            <span className="text-lg sm:text-xl md:text-2xl font-bold">Booking Web</span>
          </Link>

          {/* Desktop Menu */}
          <ul className='hidden md:flex gap-3 lg:gap-5 text-sm lg:text-base items-center'>
            {session ? (
              <>
                <li className="hidden lg:block">
                  <Link href="/bookings" className="hover:text-blue-400 transition-colors">
                    My Bookings
                  </Link>
                </li>
                {userRole === 'admin' && (
                  <li className="hidden lg:block">
                    <Link href="/admin-dashboard" className="hover:text-purple-400 transition-colors">
                      Admin
                    </Link>
                  </li>
                )}
                <li className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1 sm:gap-2 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs sm:text-sm px-2 sm:px-3 lg:px-4 py-2 lg:py-2.5 transition-all"
                  >
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={24}
                      height={24}
                      className="rounded-full w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7"
                    />
                  )}
                  <span className="hidden sm:inline max-w-[100px] lg:max-w-none truncate">{session.user?.name || session.user?.email?.split('@')[0] || 'User'}</span>
                  <svg
                    className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-slate-900 rounded-lg shadow-lg border border-gray-700 z-50">
                    <ul className="py-2">
                      <li>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/bookings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          My Bookings
                        </Link>
                      </li>
                    {userRole === 'admin' && (
                      <>
                        <li className="border-t border-gray-700 mt-2 pt-2">
                          <div className="px-4 py-1 text-xs text-gray-500 font-semibold uppercase">Admin</div>
                        </li>
                          <li>
                            <Link
                              href="/admin-dashboard"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-purple-400 hover:bg-slate-800 hover:text-purple-300 transition-colors"
                            >
                              Admin Dashboard
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/admin-users"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-purple-400 hover:bg-slate-800 hover:text-purple-300 transition-colors"
                            >
                              Manage Users
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/admin-tables"
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-purple-400 hover:bg-slate-800 hover:text-purple-300 transition-colors"
                            >
                              Manage Tables
                            </Link>
                          </li>
                      </>
                    )}
                      <li className="border-t border-gray-700 mt-2 pt-2">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false)
                            signOut({ callbackUrl: '/' })
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
                        >
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            </>
            ) : (
              <>
                <li>
                  <Link href="/Login">
                    <button className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl font-medium rounded-lg text-xs sm:text-sm px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 transition-all">
                      Login
                    </button>
                  </Link>
                </li>
                <li>
                  <Link href="/SignUp">
                    <button className="text-white bg-gradient-to-br from-green-600 to-teal-500 hover:bg-gradient-to-bl font-medium rounded-lg text-xs sm:text-sm px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 transition-all">
                      Sign Up
                    </button>
                  </Link>
                </li>
              </>
            )}
          </ul>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {!isMobileMenuOpen ? (
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            ) : (
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/bookings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  My Bookings
                </Link>
                {userRole === 'admin' && (
                  <>
                    <div className="px-3 py-2 text-xs text-gray-500 font-semibold uppercase">Admin</div>
                    <Link
                      href="/admin-dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-purple-400 hover:text-purple-300 hover:bg-slate-800 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/admin-users"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-purple-400 hover:text-purple-300 hover:bg-slate-800 transition-colors"
                    >
                      Manage Users
                    </Link>
                    <Link
                      href="/admin-tables"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-purple-400 hover:text-purple-300 hover:bg-slate-800 transition-colors"
                    >
                      Manage Tables
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/Login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl text-center"
                >
                  Login
                </Link>
                <Link
                  href="/SignUp"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-br from-green-600 to-teal-500 hover:bg-gradient-to-bl text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar