"use client"
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

const Navbar = () => {
  const { data: session } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState('user')
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass border-b border-white/10" : "bg-transparent"
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16 md:h-20'>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity z-50">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <Image src="/newlogo.png" alt="Booking Web Logo" width={32} height={32} className="object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight">Booking Web</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {session && (
                <>
                  <Link href="/bookings" className="text-sm text-white/80 hover:text-white transition-colors duration-300 font-normal">
                    Bookings
                  </Link>
                  {userRole === 'admin' && (
                    <Link href="/admin-dashboard" className="text-sm text-white/80 hover:text-white transition-colors duration-300 font-normal">
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              {session ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2.5 border border-purple-500/40 rounded-full text-sm text-white hover:bg-gradient-to-r duration-300"
                  >
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span className="max-w-[120px] truncate">{session.user?.name || session.user?.email?.split('@')[0] || 'User'}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 glass-card rounded-2xl border border-white/10 overflow-hidden"
                      >
                        <div className="py-2">
                          <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors">
                            Dashboard
                          </Link>
                          <Link href="/bookings" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors">
                            My Bookings
                          </Link>
                          <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors">
                            Settings
                          </Link>
                          {userRole === 'admin' && (
                            <>
                              <div className="border-t border-white/10 my-2"></div>
                              <div className="px-4 py-2 text-xs text-white/40 font-semibold uppercase tracking-wider">Admin</div>
                              <Link href="/admin-dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-purple-400 hover:text-purple-300 hover:bg-white/5 transition-colors">
                                Admin Dashboard
                              </Link>
                              <Link href="/admin-users" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-purple-400 hover:text-purple-300 hover:bg-white/5 transition-colors">
                                Manage Users
                              </Link>
                              <Link href="/admin-tables" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-purple-400 hover:text-purple-300 hover:bg-white/5 transition-colors">
                                Manage Tables
                              </Link>
                            </>
                          )}
                          <div className="border-t border-white/10 my-2"></div>
                          <button onClick={() => { setIsDropdownOpen(false); signOut({ callbackUrl: '/' }) }} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors">
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/Login">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2.5 border border-white/30 rounded-full text-sm text-white hover:bg-white hover:text-black transition-all duration-300"
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link href="/SignUp">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium transition-all duration-300"
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white/70 hover:text-white transition-colors z-50"
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen ? "true" : "false"}
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] glass backdrop-blur-xl border-l border-white/10 z-50 md:hidden"
            >
              <div className="flex flex-col h-full pt-24 px-6">
                {/* Navigation Links */}
                {session ? (
                  <>
                    <nav className="flex flex-col gap-2">
                      {[
                        { href: "/dashboard", label: "Dashboard" },
                        { href: "/bookings", label: "My Bookings" },
                        { href: "/settings", label: "Settings" }
                      ].map((link, index) => (
                        <motion.div
                          key={link.href}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            href={link.href}
                            onClick={handleLinkClick}
                            className="block py-3 px-4 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                          >
                            {link.label}
                          </Link>
                        </motion.div>
                      ))}
                    </nav>

                    {userRole === 'admin' && (
                      <>
                        <div className="border-t border-white/10 my-4"></div>
                        <div className="px-4 py-2 text-xs text-white/40 font-semibold uppercase tracking-wider">Admin</div>
                        <nav className="flex flex-col gap-2">
                          {[
                            { href: "/admin-dashboard", label: "Admin Dashboard" },
                            { href: "/admin-users", label: "Manage Users" },
                            { href: "/admin-tables", label: "Manage Tables" }
                          ].map((link, index) => (
                            <motion.div
                              key={link.href}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                            >
                              <Link
                                href={link.href}
                                onClick={handleLinkClick}
                                className="block py-3 px-4 text-purple-400 hover:text-purple-300 hover:bg-white/5 rounded-lg transition-all duration-300"
                              >
                                {link.label}
                              </Link>
                            </motion.div>
                          ))}
                        </nav>
                      </>
                    )}

                    <div className="border-t border-white/10 my-4"></div>
                    <motion.button
                      onClick={() => { handleLinkClick(); signOut({ callbackUrl: '/' }) }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="block w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-all duration-300"
                    >
                      Sign Out
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4"
                    >
                      <Link href="/Login" onClick={handleLinkClick} className="block w-full px-6 py-3 border border-white/30 rounded-full text-center text-sm text-white hover:bg-white hover:text-black transition-all duration-300">
                        Login
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4"
                    >
                      <Link href="/SignUp" onClick={handleLinkClick} className="block w-full px-6 py-3 bg-white text-black rounded-full text-center text-sm font-medium transition-all duration-300">
                        Sign Up
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar