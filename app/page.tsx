'use client'
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Users, Clock, CheckCircle } from "lucide-react";
import Footer from "@/components/Footer";

export default function Home() {
  const { status } = useSession();
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

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-16 md:pt-20">
        
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
            <div className="inline-flex items-center gap-2 bg-card/50 border border-border px-5 py-2.5 rounded-xl text-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-foreground font-medium">Live booking system active</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight tracking-tight text-foreground">
              <span className="block">Your Table,</span>
              <span className="block">Reserved Instantly</span>
            </h1>

            <motion.div 
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-muted text-xs sm:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Instant confirmations
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Secure payments
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                No hidden fees
              </span>
            </motion.div>
          </motion.div>

          <motion.p 
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted max-w-3xl mx-auto leading-relaxed font-light px-2"
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
                <div className="h-14 w-40 bg-card rounded-full"></div>
                <div className="h-14 w-40 bg-card rounded-full"></div>
              </div>
            ) : status === 'authenticated' ? (
              <>
                {userRole === 'admin' ? (
                  <>
                    <motion.button
                      onClick={() => router.push('/admin-dashboard')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-foreground text-background font-bold rounded-full transition-all duration-300 text-sm sm:text-base"
                    >
                      Admin Dashboard
                    </motion.button>
                    <motion.button
                      onClick={() => router.push('/admin-tables')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-card backdrop-blur-sm border border-border text-foreground font-bold rounded-full transition-all duration-300 hover:bg-card text-sm sm:text-base"
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
                      className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-foreground text-background font-bold rounded-full transition-all duration-300 text-sm sm:text-base"
                    >
                      Book a Table
                    </motion.button>
                    <motion.button
                      onClick={() => router.push('/dashboard')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-card backdrop-blur-sm border border-border text-foreground font-bold rounded-full transition-all duration-300 hover:bg-card text-sm sm:text-base"
                    >
                      My Dashboard
                    </motion.button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/Login" className="w-full sm:w-auto">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-8 sm:px-10 py-3 sm:py-4 bg-foreground text-background font-bold rounded-full transition-all duration-300 hover:shadow-2xl text-sm sm:text-base"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Get Started
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </span>
                  </motion.button>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-8 sm:px-10 py-3 sm:py-4 bg-card backdrop-blur-sm border border-border text-foreground font-bold rounded-full transition-all duration-300 hover:bg-card text-sm sm:text-base"
                  >
                    How it works
                  </motion.button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-4 sm:gap-8 pt-12 sm:pt-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">500+</div>
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-muted mt-1 sm:mt-2 uppercase tracking-widest">Happy Diners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">24/7</div>
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-muted mt-1 sm:mt-2 uppercase tracking-widest">Live Booking</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">95%</div>
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-muted mt-1 sm:mt-2 uppercase tracking-widest">Satisfaction</div>
            </div>
          </motion.div>

          {/* Hero Image Gallery */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-12 sm:pt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <motion.div 
              className="relative h-32 sm:h-40 md:h-48 rounded-xl sm:rounded-2xl overflow-hidden border border-border"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80"
                alt="Restaurant Interior"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div 
              className="relative h-32 sm:h-40 md:h-48 rounded-xl sm:rounded-2xl overflow-hidden border border-border"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80"
                alt="Fine Dining"
                fill
                className="object-cover"
              />
            </motion.div>
            <motion.div 
              className="relative h-32 sm:h-40 md:h-48 rounded-xl sm:rounded-2xl overflow-hidden border border-border col-span-2 md:col-span-1"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80"
                alt="Elegant Table Setting"
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Separator */}
      <div className="relative h-px bg-border"></div>

      {/* Features Section */}
      <section className="bg-background text-foreground py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 uppercase tracking-tighter text-foreground">
              Why Choose Us?
            </h2>
            <p className="text-muted text-base sm:text-lg font-light">Discover the features that make us stand out</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {[
              {
                icon: <Clock className="w-10 h-10" />,
                title: "Real-Time Booking",
                description: "Instant confirmation with live table availability updates. Know your status immediately.",
                gradient: "from-purple-500 to-blue-500",
                image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=80"
              },
              {
                icon: <Shield className="w-10 h-10" />,
                title: "Secure Payments",
                description: "Safe and secure payment processing with multiple payment options. Your data is protected.",
                gradient: "from-blue-500 to-cyan-500",
                image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80"
              },
              {
                icon: <Users className="w-10 h-10" />,
                title: "Easy Management",
                description: "Track all your reservations in one convenient dashboard. Manage bookings effortlessly.",
                gradient: "from-purple-500 to-pink-500",
                image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&q=80"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group glass-card rounded-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-8">
                  <div className={`bg-card rounded-xl p-4 w-fit mb-6 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-2xl mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="relative h-px bg-border"></div>

      {/* Process Section */}
      <section className="bg-background text-foreground py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4 uppercase tracking-tighter text-foreground">
              How It Works
            </h2>
            <p className="text-muted text-lg font-light">Simple steps to your perfect dining experience</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-border opacity-30"></div>

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
                  className="bg-card text-foreground rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold relative z-10 border border-border"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  {step.number}
                </motion.div>
                <h3 className="font-bold mb-3 text-xl uppercase tracking-wide text-foreground">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer - Only on Landing Page */}
      <Footer />
    </>
  )
}