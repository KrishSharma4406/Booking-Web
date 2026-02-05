'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Mail, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-background border-t border-border pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <Image src="/newlogo.png" alt="Logo" width={24} height={24} />
              </div>
              <span className="text-lg font-semibold text-foreground">Booking Web</span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Premium table reservations with instant confirmation and seamless experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'About', 'Bookings', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-muted hover:text-foreground transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 uppercase tracking-wider text-sm">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted text-sm">
                <Mail className="w-4 h-4" />
                booking@web.com
              </li>
              <li className="flex items-center gap-2 text-muted text-sm">
                <Calendar className="w-4 h-4" />
                24/7 Support
              </li>
              <li className="flex items-center gap-2 text-muted text-sm">
                <MapPin className="w-4 h-4" />
                Worldwide
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-foreground font-semibold mb-4 uppercase tracking-wider text-sm">Stay Updated</h3>
            <p className="text-muted text-sm mb-4">Get the latest updates and offers</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-border"
              />
              <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium transition-all">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-sm">
            © {new Date().getFullYear()} Booking Web. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy-policy" className="text-muted hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/about" className="text-muted hover:text-foreground transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer