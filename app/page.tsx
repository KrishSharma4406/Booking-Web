'use client'
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Shield, Users, Clock, CheckCircle } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (status === 'authenticated') {
        try {
          const res = await fetch('/api/users/me');
          if (res.ok) {
            const data = await res.json();
            setUserRole(data.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
      setLoading(false);
    };

    if (status !== 'loading') {
      checkUserRole();
    }
  }, [status]);

  // Auto-redirect based on role
  const handleGetStarted = () => {
    if (status === 'authenticated' && userRole) {
      if (userRole === 'admin') {
        router.push('/admin-dashboard');
      } else {
        router.push('/bookings');
      }
    } else {
      router.push('/Login');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-950 overflow-hidden flex flex-col items-center justify-center text-center px-4 pt-16">
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20 animate-pulse" style={{animationDuration: '4s'}} />
        
        {/* Grain Texture */}
        <div className="absolute inset-0 pointer-events-none z-20 opacity-20 grain-texture" />
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-10" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-12">
          {/* Badge */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 px-5 py-2.5 rounded-xl text-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-gray-200 font-medium">Live booking system active</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-bold text-5xl md:text-7xl lg:text-8xl leading-tight tracking-tight">
              <span className="block bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">Your Table,</span>
              <span className="block bg-gradient-to-r text-blue-400 bg-clip-text">Reserved Instantly</span>
            </h1>

            <motion.div 
              className="flex items-center justify-center gap-3 text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Instant confirmations
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Secure payments
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                No hidden fees
              </span>
            </motion.div>
          </motion.div>

          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Reserve your table in seconds. Real-time availability, instant confirmation,
            and a dining experience worth coming back for.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            {status === 'loading' || loading ? (
              <div className="animate-pulse flex gap-4">
                <div className="h-14 w-40 bg-white/10 rounded-full"></div>
                <div className="h-14 w-40 bg-white/10 rounded-full"></div>
              </div>
            ) : status === 'authenticated' ? (
              <>
                {userRole === 'admin' ? (
                  <>
                    <motion.button
                      onClick={() => router.push('/admin-dashboard')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full transition-all duration-300"
                    >
                      Admin Dashboard
                    </motion.button>
                    <motion.button
                      onClick={() => router.push('/admin-tables')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-4 bg-white/5 backdrop-blur-sm border border-purple-500/30 text-white font-bold rounded-full transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50"
                    >
                      Manage Tables
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      onClick={() => router.push('/bookings')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full transition-all duration-300"
                    >
                      Book a Table
                    </motion.button>
                    <motion.button
                      onClick={() => router.push('/dashboard')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-4 bg-white/5 backdrop-blur-sm border border-purple-500/30 text-white font-bold rounded-full transition-all duration-300 hover:bg-white/10 "
                    >
                      My Dashboard
                    </motion.button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/Login">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full transition-all duration-300 hover:shadow-2xl "
                  >
                    <span className="flex items-center gap-2">
                      Get Started
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </Link>
                <Link href="/about">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-white/5 backdrop-blur-sm border border-purple-500/30 text-white font-bold rounded-full transition-all duration-300 hover:bg-white/10 "
                  >
                    How it works
                  </motion.button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">500+</div>
              <div className="text-sm md:text-base text-gray-400 mt-2 uppercase tracking-widest text-xs">Happy Diners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">24/7</div>
              <div className="text-sm md:text-base text-gray-400 mt-2 uppercase tracking-widest text-xs">Live Booking</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white">95%</div>
              <div className="text-sm md:text-base text-gray-400 mt-2 uppercase tracking-widest text-xs">Satisfaction</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Separator */}
      <div className="relative h-px bg-white/10"></div>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-black to-gray-900 text-white py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4 uppercase tracking-tighter">
              Why Choose Us?
            </h2>
            <p className="text-gray-400 text-lg font-light">Discover the features that make us stand out</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <Clock className="w-10 h-10" />,
                title: "Real-Time Booking",
                description: "Instant confirmation with live table availability updates. Know your status immediately.",
                gradient: "from-purple-500 to-blue-500"
              },
              {
                icon: <Shield className="w-10 h-10" />,
                title: "Secure Payments",
                description: "Safe and secure payment processing with multiple payment options. Your data is protected.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Users className="w-10 h-10" />,
                title: "Easy Management",
                description: "Track all your reservations in one convenient dashboard. Manage bookings effortlessly.",
                gradient: "from-purple-500 to-pink-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group glass-card p-8 rounded-2xl hover:scale-105 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <div className={`bg-gradient-to-br ${feature.gradient} rounded-xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-2xl mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="relative h-px bg-white/10"></div>

      {/* Process Section */}
      <section className="bg-gradient-to-b from-gray-900 to-black text-white py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4 uppercase tracking-tighter">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg font-light">Simple steps to your perfect dining experience</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>

            {[
              { number: "01", title: "Sign Up", description: "Create your account in seconds with our simple registration process" },
              { number: "02", title: "Browse Tables", description: "View available tables and choose your perfect spot for dining" },
              { number: "03", title: "Book Table", description: "Select your preferred date, time, and party size instantly" },
              { number: "04", title: "Enjoy", description: "Arrive at your reserved table and savor an exceptional meal" }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <motion.div 
                  className="bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold relative z-10"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {step.number}
                </motion.div>
                <h3 className="font-bold mb-3 text-xl uppercase tracking-wide">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}