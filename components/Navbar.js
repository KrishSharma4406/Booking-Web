"use client"
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"

const Navbar = () => {
  const { data: session, status } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
    <nav className='bg-slate-950 text-white flex justify-around items-center p-4 px-8'>
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl font-bold">Booking Web</span>
      </Link>

      <ul className='flex gap-3 md:gap-5 text-sm md:text-base flex-wrap items-center'>
        {session ? (
          <>
            <li>
              <Link href="/bookings" className="hover:text-blue-400 transition-colors">
                My Bookings
              </Link>
            </li>
            {userRole === 'admin' && (
              <li>
                <Link href="/admin-dashboard" className="hover:text-purple-400 transition-colors">
                  Admin
                </Link>
              </li>
            )}
            <li className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5"
              >
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                )}
                <span>{session.user?.name || session.user?.email?.split('@')[0] || 'User'}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-lg shadow-lg border border-gray-700 z-50">
                  <ul className="py-2">
                    <li>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-800 hover:text-white"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/bookings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-800 hover:text-white"
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
                            className="block px-4 py-2 text-sm text-purple-400 hover:bg-slate-800 hover:text-purple-300"
                          >
                            Admin Dashboard
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin-users"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-purple-400 hover:bg-slate-800 hover:text-purple-300"
                          >
                            👥 Manage Users
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/admin-tables"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-purple-400 hover:bg-slate-800 hover:text-purple-300"
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
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300"
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
                <button className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5">
                  Login
                </button>
              </Link>
            </li>
            <li>
              <Link href="/SignUp">
                <button className="text-white bg-gradient-to-br from-green-600 to-teal-500 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5">
                  Sign Up
                </button>
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navbar