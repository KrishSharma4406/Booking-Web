'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function PrivacyPolicy() {
  const router = useRouter()

  const quickLinks = [
    { name: "What we collect", id: "collect" },
    { name: "How we use it", id: "use" },
    { name: "Your rights", id: "rights" },
    { name: "Contact us", id: "contact" }
  ]

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Back Button - more casual placement */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span className="text-sm">Back</span>
        </motion.button>

        {/* Header - more casual, less corporate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ lineHeight: '1.1' }}>
            Privacy Policy{' '}
            <span className="text-2xl md:text-3xl">🔒</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            We're serious about protecting your data. Here's everything you need to know.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 11, 2026
          </p>
        </motion.div>

        {/* Quick Links - sticky navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-gray-700/30"
        >
          <p className="text-sm text-gray-400 mb-3">Jump to section:</p>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link, i) => (
              <a
                key={i}
                href={`#${link.id}`}
                className="text-sm px-3 py-1.5 bg-gray-700/50 hover:bg-purple-600/30 rounded-lg transition-colors border border-gray-600/50 hover:border-purple-500/50"
              >
                {link.name}
              </a>
            ))}
          </div>
        </motion.div>

        {/* TL;DR Box - human touch */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-2xl p-6 mb-10 border-l-4 border-purple-500"
        >
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span>⚡</span> TL;DR
          </h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex gap-3">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>We only collect what we need to run the service</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>We'll never sell your data to third parties</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>You can delete your account anytime</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <span>All data is encrypted and secure</span>
            </li>
          </ul>
        </motion.div>

        {/* Main Content - more conversational */}
        <div className="space-y-8">
          
          {/* Section 1 */}
          <motion.section
            id="collect"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-700/30"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-start gap-3">
              <span className="text-3xl">📋</span>
              <span>What Information Do We Collect?</span>
            </h2>
            
            <div className="space-y-5 pl-11">
              <div>
                <h3 className="font-semibold text-purple-300 mb-2">Stuff You Give Us</h3>
                <p className="text-gray-300 leading-relaxed">
                  When you sign up or book a table, you share your name, email, phone number, and payment details. 
                  Pretty standard stuff—we need this to actually, you know, let you book tables.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-300 mb-2">Technical Info</h3>
                <p className="text-gray-300 leading-relaxed">
                  We automatically collect some technical data like your IP address, browser type, and which pages you visit. 
                  This helps us fix bugs and make the site better. Nothing creepy.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-300 mb-2">Cookies</h3>
                <p className="text-gray-300 leading-relaxed">
                  We use cookies to keep you logged in and remember your preferences. No tracking cookies from advertisers—we promise.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Section 2 */}
          <motion.section
            id="use"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-700/30"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-start gap-3">
              <span className="text-3xl">🎯</span>
              <span>How Do We Use Your Data?</span>
            </h2>
            
            <div className="space-y-4 pl-11">
              <div className="flex gap-3 items-start">
                <span className="text-blue-400 text-xl flex-shrink-0">→</span>
                <p className="text-gray-300">
                  <strong className="text-white">Run the service:</strong> Process bookings, send confirmations, manage your account
                </p>
              </div>
              
              <div className="flex gap-3 items-start">
                <span className="text-blue-400 text-xl flex-shrink-0">→</span>
                <p className="text-gray-300">
                  <strong className="text-white">Make it better:</strong> Analyze how people use the site to improve features and fix issues
                </p>
              </div>
              
              <div className="flex gap-3 items-start">
                <span className="text-blue-400 text-xl flex-shrink-0">→</span>
                <p className="text-gray-300">
                  <strong className="text-white">Keep you updated:</strong> Send booking reminders and important updates (you can turn these off)
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-blue-400 text-xl flex-shrink-0">→</span>
                <p className="text-gray-300">
                  <strong className="text-white">Stay safe:</strong> Prevent fraud and keep your account secure
                </p>
              </div>
            </div>
          </motion.section>

          {/* Section 3 - Sharing */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-700/30"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-start gap-3">
              <span className="text-3xl">🤝</span>
              <span>Do We Share Your Data?</span>
            </h2>
            
            <div className="space-y-5 pl-11">
              <p className="text-gray-300 leading-relaxed font-medium">
                We're not in the business of selling your data. Period. But we do share it in a few specific cases:
              </p>

              <div>
                <h3 className="font-semibold text-purple-300 mb-2">Service Providers</h3>
                <p className="text-gray-300 leading-relaxed">
                  We work with trusted partners for things like payment processing and email delivery. They only get the data they need 
                  to do their job, and they're contractually obligated to keep it safe.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-300 mb-2">Legal Stuff</h3>
                <p className="text-gray-300 leading-relaxed">
                  If the law requires it or if we need to protect someone's safety, we might have to share your information. 
                  We'll always be transparent about this when possible.
                </p>
              </div>

              <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-yellow-200 text-sm">
                  <strong>Important:</strong> We will NEVER sell your personal information to advertisers or data brokers. That's not our business model.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Section 4 - Security */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-700/30"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-start gap-3">
              <span className="text-3xl">🔐</span>
              <span>How Do We Keep Your Data Safe?</span>
            </h2>
            
            <div className="space-y-4 pl-11">
              <p className="text-gray-300 leading-relaxed">
                Security is a big deal to us. Here's what we do:
              </p>

              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-green-400">🔒</span>
                  <span className="text-gray-300">All data is encrypted in transit using SSL/TLS</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400">🔒</span>
                  <span className="text-gray-300">Passwords are hashed with industry-standard algorithms</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400">🔒</span>
                  <span className="text-gray-300">Regular security audits and updates</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400">🔒</span>
                  <span className="text-gray-300">Limited employee access—only who needs it</span>
                </li>
              </ul>

              <p className="text-sm text-gray-400 mt-4">
                No system is 100% secure, but we take every reasonable precaution to protect your data.
              </p>
            </div>
          </motion.section>

          {/* Section 5 - Your Rights */}
          <motion.section
            id="rights"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-purple-500/30"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-start gap-3">
              <span className="text-3xl">⚡</span>
              <span>Your Rights (The Important Stuff)</span>
            </h2>
            
            <div className="space-y-5 pl-11">
              <p className="text-gray-300 leading-relaxed font-medium">
                You're in control of your data. Here's what you can do:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800/40 p-4 rounded-xl">
                  <h3 className="font-semibold text-white mb-2">✏️ Access & Edit</h3>
                  <p className="text-sm text-gray-300">
                    View and update your information anytime in your settings
                  </p>
                </div>

                <div className="bg-gray-800/40 p-4 rounded-xl">
                  <h3 className="font-semibold text-white mb-2">🗑️ Delete</h3>
                  <p className="text-sm text-gray-300">
                    Delete your account and data whenever you want
                  </p>
                </div>

                <div className="bg-gray-800/40 p-4 rounded-xl">
                  <h3 className="font-semibold text-white mb-2">📦 Download</h3>
                  <p className="text-sm text-gray-300">
                    Export all your data in a portable format
                  </p>
                </div>

                <div className="bg-gray-800/40 p-4 rounded-xl">
                  <h3 className="font-semibold text-white mb-2">🔕 Opt Out</h3>
                  <p className="text-sm text-gray-300">
                    Unsubscribe from marketing emails anytime
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 6 - Misc */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-gray-700/30"
          >
            <h2 className="text-2xl font-bold mb-5">A Few More Things...</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <span>👶</span> Kids
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  This service isn't for anyone under 13. If we find out a child has signed up, we'll delete their account immediately.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <span>🌍</span> International Users
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Your data might be stored on servers in different countries. We ensure it's protected no matter where it lives.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <span>🔄</span> Changes to This Policy
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We might update this policy occasionally. If we make big changes, we'll let you know via email or a notification on the site.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Contact Section */}
          <motion.section
            id="contact"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-purple-500/40"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>💬</span> Questions?
            </h2>
            <p className="text-gray-300 mb-5 leading-relaxed">
              If anything here is unclear or you have concerns about your privacy, we're here to help. 
              Seriously—reach out anytime.
            </p>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <a href="mailto:privacy@example.com" className="hover:text-purple-400 transition-colors">
                  privacy@example.com
                </a>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-xl">📱</span>
                <span>+1 (555) 123-4567</span>
              </p>
            </div>
          </motion.section>

        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => router.push('/settings')}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
          >
            <span>⚙️</span>
            Manage Your Privacy Settings
          </button>
        </motion.div>

        <div className="h-16"></div>
      </div>
    </div>
  )
}
