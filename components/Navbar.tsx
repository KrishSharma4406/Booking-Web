"use client"
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from './ThemeProvider'

const Navbar = () => {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
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
          scrolled ? "glass border-b border-border" : "bg-transparent"
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16 md:h-20'>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-foreground hover:opacity-90 transition-opacity z-50">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}>
                <Image src="/newlogo.png" alt="Booking Web Logo" width={32} height={32} className="object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight">Booking Web</span>
            </Link>

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              {/* Theme Toggle Button */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-full border border-border hover:bg-card transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </motion.button>
              {session ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2.5 border border-border rounded-full text-sm text-foreground hover:bg-card duration-300"
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
                        className="absolute right-0 mt-2 w-56 glass-card rounded-2xl border border-border overflow-hidden"
                      >
                        <div className="py-2">
                          <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-card transition-colors">
                            Dashboard
                          </Link>
                          <Link href="/bookings" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-card transition-colors">
                            My Bookings
                          </Link>
                          <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-card transition-colors">
                            Settings
                          </Link>
                          {userRole === 'admin' && (
                            <>
                              <div className="border-t border-border my-2"></div>
                              <div className="px-4 py-2 text-xs text-muted font-semibold uppercase tracking-wider">Admin</div>
                              <Link href="/admin-dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-foreground/80 hover:text-foreground hover:bg-card transition-colors">
                                Admin Dashboard
                              </Link>
                              <Link href="/admin-users" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-foreground/80 hover:text-foreground hover:bg-card transition-colors">
                                Manage Users
                              </Link>
                              <Link href="/admin-tables" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-3 text-sm text-foreground/80 hover:text-foreground hover:bg-card transition-colors">
                                Manage Tables
                              </Link>
                            </>
                          )}
                          <div className="border-t border-border my-2"></div>
                          <button onClick={() => { setIsDropdownOpen(false); signOut({ callbackUrl: '/' }) }} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:text-red-600 hover:bg-card transition-colors">
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
                      className="px-6 py-2.5 border border-border rounded-full text-sm text-foreground hover:bg-card transition-all duration-300"
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link href="/SignUp">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                      }`}
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2 z-50">
              {/* Mobile Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full border border-border hover:bg-card transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </motion.button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-muted hover:text-foreground transition-colors"
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
              className="fixed top-0 right-0 bottom-0 w-[280px] glass backdrop-blur-xl border-l border-border z-50 md:hidden"
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
                            className="block py-3 px-4 text-muted hover:text-foreground hover:bg-card rounded-lg transition-all duration-300"
                          >
                            {link.label}
                          </Link>
                        </motion.div>
                      ))}
                    </nav>

                    {userRole === 'admin' && (
                      <>
                        <div className="border-t border-border my-4"></div>
                        <div className="px-4 py-2 text-xs text-muted font-semibold uppercase tracking-wider">Admin</div>
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
                                className="block py-3 px-4 text-foreground/80 hover:text-foreground hover:bg-card rounded-lg transition-all duration-300"
                              >
                                {link.label}
                              </Link>
                            </motion.div>
                          ))}
                        </nav>
                      </>
                    )}

                    <div className="border-t border-border my-4"></div>
                    <motion.button
                      onClick={() => { handleLinkClick(); signOut({ callbackUrl: '/' }) }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="block w-full px-4 py-3 text-left text-red-500 hover:text-red-600 hover:bg-card rounded-lg transition-all duration-300"
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
                      <Link href="/Login" onClick={handleLinkClick} className="block w-full px-6 py-3 border border-border rounded-full text-center text-sm text-foreground hover:bg-card transition-all duration-300">
                        Login
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4"
                    >
                      <Link href="/SignUp" onClick={handleLinkClick} className={`block w-full px-6 py-3 rounded-full text-center text-sm font-medium transition-all duration-300 ${
                        theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                      }`}>
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