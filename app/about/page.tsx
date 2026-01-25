'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const About = () => {
  return (
    <div className="relative min-h-screen text-white">
      <div className="relative container mx-auto px-6 md:px-10 py-16 z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            About Booking Web
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your premier destination for seamless table reservations and exceptional dining experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Booking Web is a modern booking platform designed to connect diners with their favorite restaurants through an intuitive, real-time reservation system. We make it easy for you to secure your perfect dining spot.
            </p>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Our platform features live approval workflows, instant booking confirmations, and comprehensive management tools for both diners and restaurant administrators.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Whether you&apos;re planning a romantic dinner, family gathering, or business lunch, Booking Web ensures your reservation is handled professionally and efficiently.
            </p>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Image 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80" 
              alt="Restaurant dining experience" 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-slate-900/50 backdrop-blur-md rounded-lg p-8 border border-gray-800 hover:border-purple-500 transition-all hover:scale-105">
              <h3 className="text-xl font-bold mb-3">1. Sign Up</h3>
              <p className="text-gray-300">
                Sign up and create your personalized creator page. Share your story, showcase your work, and connect with your audience.
              </p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md rounded-lg p-8 border border-gray-800 hover:border-purple-500 transition-all hover:scale-105">
              <h3 className="text-xl font-bold mb-3">2. Get Approved</h3>
              <p className="text-gray-300">
                Wait for admin approval to ensure quality and security for all users on our platform.
              </p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md rounded-lg p-8 border border-gray-800 hover:border-purple-500 transition-all hover:scale-105">
              <h3 className="text-xl font-bold mb-3">3. Book Tables</h3>
              <p className="text-gray-300">
                Browse available time slots, select your preferred date and time, and reserve your table instantly.
              </p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-md rounded-lg p-8 border border-gray-800 hover:border-purple-500 transition-all hover:scale-105">
              <h3 className="text-xl font-bold mb-3">4. Enjoy Dining</h3>
              <p className="text-gray-300">
                Arrive at your reserved time and enjoy a wonderful dining experience with your guests.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Boooking Web?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 border-2 border-gray-800 rounded-lg hover:border-purple-500 transition hover:scale-105">
              <h3 className="font-bold mb-2">Real-Time Booking</h3>
              <p className="text-gray-400 text-sm">Instant confirmation with live availability updates</p>
            </div>
            <div className="text-center p-6 border-2 border-gray-800 rounded-lg hover:border-purple-500 transition hover:scale-105">
              <h3 className="font-bold mb-2">Secure Platform</h3>
              <p className="text-gray-400 text-sm">Your data is protected with industry-standard security</p>
            </div>
            <div className="text-center p-6 border-2 border-gray-800 rounded-lg hover:border-purple-500 transition hover:scale-105">
              <h3 className="font-bold mb-2">Easy Management</h3>
              <p className="text-gray-400 text-sm">Track and manage all your reservations in one place</p>
            </div>
            <div className="text-center p-6 border-2 border-gray-800 rounded-lg hover:border-purple-500 transition hover:scale-105">
              <h3 className="font-bold mb-2">24/7 Access</h3>
              <p className="text-gray-400 text-sm">Book anytime, anywhere, from any device</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-12 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Statistics</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-400 mb-2">500+</div>
              <p className="text-gray-300">Happy Diners</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-400 mb-2">5K+</div>
              <p className="text-gray-300">Bookings Completed</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-400 mb-2">95%</div>
              <p className="text-gray-300">Satisfaction Rate</p>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Perfect For Every Occasion</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {title: "Romantic Dinners", desc: "Book intimate tables for special moments with your loved one" },
              {title: "Family Gatherings", desc: "Reserve larger tables for family celebrations and reunions" },
              {title: "Special Events", desc: "Celebrate birthdays, anniversaries, and milestones" },
              {title: "Business Meals", desc: "Professional dining for meetings and client entertainment" },
              {title: "Group Dining", desc: "Accommodate parties of any size with advance booking" },
              {title: "Celebrations", desc: "Make your special occasions even more memorable" },
            ].map((item, index) => (
              <div key={index} className="bg-slate-900/50 backdrop-blur-md rounded-lg p-6 border border-gray-800 hover:border-purple-500 transition-all hover:scale-105">
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Reserve Your Table?</h2>
          <p className="text-xl mb-8 text-gray-100">
            Join thousands of diners who enjoy hassle-free table reservations with ReserveTable.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/SignUp">
              <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition text-lg">
                Sign Up Now
              </button>
            </Link>
            <Link href="/">
              <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-purple-600 transition text-lg">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
