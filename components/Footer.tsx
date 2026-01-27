'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Mail, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-black to-gray-900 border-t border-purple-500/20 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Image src="/newlogo.png" alt="Logo" width={24} height={24} />
              </div>
              <span className="text-lg font-semibold text-white">Booking Web</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium table reservations with instant confirmation and seamless experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'About', 'Bookings', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                booking@web.com
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar className="w-4 h-4" />
                24/7 Support
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                Worldwide
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-4">Get the latest updates and offers</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30"
              />
              <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium transition-all">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Booking Web. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer