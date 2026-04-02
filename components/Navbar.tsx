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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          scrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm py-3" : "bg-transparent py-5"
        }`}
      >
        <div className='max-w-7xl mx-auto px-6 lg:px-12'>
          <div className='flex justify-between items-center h-12'>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-secondary hover:opacity-80 transition-opacity z-50">
              <span className="text-3xl font-serif font-semibold tracking-tight italic">Booking Web</span>
            </Link>

            {/* Desktop Center Nav Links (Added per Savor & Hearth) */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2 text-sm font-semibold tracking-widest uppercase text-muted">
              <Link href="/about" className="hover:text-primary transition-colors">Discover</Link>
              <Link href="/bookings" className="hover:text-primary transition-colors">Reservations</Link>
              <Link href="/reviews" className="hover:text-primary transition-colors">Journal</Link>
            </div>

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              {session ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-secondary hover:text-primary duration-300"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user?.image}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="rounded-full border border-border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-secondary font-serif">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="max-w-[120px] truncate uppercase tracking-widest">{session.user?.name?.split(' ')[0] || 'User'}</span>
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
                        className="absolute right-0 mt-4 w-56 bg-card rounded-md shadow-lg border border-border overflow-hidden"
                      >
                        <div className="py-2">
                          <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-6 py-3 text-xs uppercase tracking-widest text-muted hover:text-secondary hover:bg-background transition-colors">
                            Dashboard
                          </Link>
                          <Link href="/bookings" onClick={() => setIsDropdownOpen(false)} className="block px-6 py-3 text-xs uppercase tracking-widest text-muted hover:text-secondary hover:bg-background transition-colors">
                            My Bookings
                          </Link>
                          <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="block px-6 py-3 text-xs uppercase tracking-widest text-muted hover:text-secondary hover:bg-background transition-colors">
                            Settings
                          </Link>

                          {userRole === 'admin' && (
                            <>
                              <div className="border-t border-border my-2"></div>
                              <div className="px-6 py-2 text-[10px] text-primary font-bold uppercase tracking-widest">Admin Details</div>
                              <Link href="/admin-dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-6 py-3 text-xs uppercase tracking-widest text-secondary hover:bg-background transition-colors">
                                Host View
                              </Link>
                              <Link href="/admin-tables" onClick={() => setIsDropdownOpen(false)} className="block px-6 py-3 text-xs uppercase tracking-widest text-secondary hover:bg-background transition-colors">
                                Floor Plan
                              </Link>
                            </>
                          )}
                          <div className="border-t border-border my-2"></div>
                          <button onClick={() => { setIsDropdownOpen(false); signOut({ callbackUrl: '/' }) }} className="w-full text-left px-6 py-3 text-xs uppercase tracking-widest text-primary hover:bg-background transition-colors">
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/Login" className="text-sm font-semibold tracking-widest uppercase text-secondary hover:text-primary transition-colors">
                    Log In
                  </Link>
                  <Link href="/SignUp">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-3 rounded-md text-sm font-semibold tracking-wider uppercase transition-all duration-300 bg-primary text-primary-foreground hover:bg-accent"
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2 z-50">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-secondary hover:text-primary transition-colors"
                aria-label="Menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-7 h-7" fill="none" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-background border-l border-border z-50 md:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full pt-28 px-8">
                {session ? (
                  <>
                    <nav className="flex flex-col gap-6">
                      <div className="text-xs tracking-widest text-muted uppercase font-semibold border-b border-border pb-2">Navigation</div>
                      {[
                        { href: "/dashboard", label: "Dashboard" },
                        { href: "/bookings", label: "My Bookings" },
                        { href: "/reviews", label: "My Reviews" },
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
                            className="block font-serif text-xl text-secondary hover:text-primary transition-colors"
                          >
                            {link.label}
                          </Link>
                        </motion.div>
                      ))}
                    </nav>

                    {userRole === 'admin' && (
                      <div className="mt-8">
                        <div className="text-xs tracking-widest text-primary uppercase font-semibold border-b border-border pb-2 mb-6">Admin Area</div>
                        <nav className="flex flex-col gap-6">
                          {[
                            { href: "/admin-dashboard", label: "Dashboard" },
                            { href: "/admin-users", label: "Guests" },
                            { href: "/admin-tables", label: "Floor Plan" }
                          ].map((link, index) => (
                            <motion.div
                              key={link.href}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + index * 0.1 }}
                            >
                              <Link
                                href={link.href}
                                onClick={handleLinkClick}
                                className="block font-serif text-xl text-secondary hover:text-primary transition-colors"
                              >
                                {link.label}
                              </Link>
                            </motion.div>
                          ))}
                        </nav>
                      </div>
                    )}

                    <div className="mt-auto mb-10 pt-8 border-t border-border">
                      <motion.button
                        onClick={() => { handleLinkClick(); signOut({ callbackUrl: '/' }) }}
                        className="w-full py-4 bg-secondary text-white uppercase tracking-widest text-xs font-semibold rounded-md"
                      >
                        Sign Out
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-6 mt-10">
                    <Link href="/Login" onClick={handleLinkClick} className="block w-full py-4 text-center text-sm uppercase tracking-widest font-semibold text-secondary hover:text-primary border border-secondary hover:border-primary rounded-md transition-all">
                      Log In
                    </Link>
                    <Link href="/SignUp" onClick={handleLinkClick} className="block w-full py-4 text-center text-sm uppercase tracking-widest font-semibold bg-primary text-primary-foreground hover:bg-accent rounded-md transition-all">
                      Sign Up
                    </Link>
                  </div>
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