'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Target, Users, Lightbulb, Award, ArrowRight } from 'lucide-react'

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To deliver exceptional booking experiences that transform how people reserve tables and create lasting memories."
    },
    {
      icon: Users,
      title: "Our Team",
      description: "A passionate group of developers and strategists dedicated to bringing seamless reservations to life."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We stay ahead with cutting-edge technologies to build future-proof booking solutions."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Quality is at the heart of everything we do, ensuring every reservation exceeds expectations."
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-950 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            About Booking Web
          </motion.h1>
          <motion.p
            className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            We are a modern booking platform focused on creating seamless reservation experiences
            that help diners and restaurants connect effortlessly.
          </motion.p>
        </motion.div>
          </motion.p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card p-8 md:p-12 rounded-3xl mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              Founded with a vision to revolutionize table reservations, Booking Web has grown from a simple idea 
              to a trusted platform for thousands of diners worldwide.
            </p>
            <p>
              We combine real-time availability tracking with instant confirmations to create a seamless booking 
              experience. Our platform features live approval workflows and comprehensive management tools for 
              both diners and restaurant administrators.
            </p>
            <p>
              Today, we work with restaurants across various cuisines, helping them manage their reservations 
              efficiently while providing diners with a hassle-free booking experience.
            </p>
          </div>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied diners who enjoy hassle-free table reservations every day.
          </p>
          <Link
            href="/SignUp"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 font-medium group hover:scale-105"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </main>
  )
}

export default About
