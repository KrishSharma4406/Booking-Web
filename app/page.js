'use client'
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      <div className="relative flex justify-center flex-col gap-8 items-center text-white min-h-[70vh] px-5 md:px-10 py-16 md:py-24">

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">

          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-purple-200">Live booking system active</span>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h1 className="font-bold text-5xl md:text-7xl lg:text-8xl leading-tight">
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Booking Web
              </span>
            </h1>

            <div className="flex items-center justify-center gap-3 text-gray-400 text-sm">
              <span className="flex items-center gap-1">
                Instant confirmations
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Secure payments
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                No hidden fees
              </span>
            </div>
          </div>

          <p className="text-center text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Reserve your table in seconds. Real-time availability, instant confirmation,
            and a dining experience worth coming back for.
          </p>

          {/* Role-based button display */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            {status === 'loading' || loading ? (
              <div className="animate-pulse flex gap-4">
                <div className="h-14 w-40 bg-gray-700/50 rounded-2xl"></div>
                <div className="h-14 w-40 bg-gray-700/50 rounded-2xl"></div>
              </div>
            ) : status === 'authenticated' ? (
              <>
                {userRole === 'admin' ? (
                  <>
                    <button
                      onClick={() => router.push('/admin-dashboard')}
                      className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-2xl overflow-hidden transition-all duration-300  border-2 border-purple-400/20"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Admin Dashboard
                      </span>
                    </button>
                    <button
                      onClick={() => router.push('/admin-tables')}
                      className="group relative px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 border-2 border-gray-600/50"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Manage Tables
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/bookings')}
                      className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 border-2 border-purple-400/20"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Book a Table
                      </span>
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="group relative px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 border-2 border-gray-600/50 hover:border-purple-400/50"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        My Dashboard
                      </span>
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/Login">
                  <button className="group relative px-10 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:border-2 border-purple-400/20">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                    </span>
                  </button>
                </Link>
                <Link href="/about">
                  <button className="group relative px-10 py-3 bg-gray-800/40 backdrop-blur-sm border-2 border-gray-600/50 text-white font-bold text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:border-gray-400/50">
                    <span className="relative z-10 flex items-center gap-2">
                      How it works
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">500+</div>
              <div className="text-sm md:text-base text-gray-400 mt-2">Happy Diners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">24/7</div>
              <div className="text-sm md:text-base text-gray-400 mt-2">Live Booking</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">95%</div>
              <div className="text-sm md:text-base text-gray-400 mt-2">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-32">
        
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
      </div>

      <div className="text-white container mx-auto pb-32 pt-14 px-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Why Choose Our Booking System?
          </h2>
          <p className="text-gray-400 text-lg">Discover the features that make us stand out</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="group item space-y-4 flex flex-col items-center justify-start p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4">
              <img src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400&q=80" alt="Real-Time Booking" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl p-3 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="font-bold text-center text-2xl">Real-Time Booking</p>
            <p className="text-center text-gray-300 leading-relaxed">Instant confirmation with live table availability updates. Know your status immediately.</p>
          </div>

          <div className="group item space-y-4 flex flex-col items-center justify-start p-8 rounded-2xl bg-gradient-to-br from-green-900/20 to-teal-900/20 border border-green-500/20 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
            <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4">
              <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80" alt="Secure Payments" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-gradient-to-br from-green-600 to-teal-500 rounded-xl p-3 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <p className="font-bold text-center text-2xl">Secure Payments</p>
            <p className="text-center text-gray-300 leading-relaxed">Safe and secure payment processing with multiple payment options. Your data is protected.</p>
          </div>

          <div className="group item space-y-4 flex flex-col items-center justify-start p-8 rounded-2xl bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
            <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" alt="Easy Management" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-gradient-to-br from-orange-600 to-red-500 rounded-xl p-3 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="font-bold text-center text-2xl">Easy Management</p>
            <p className="text-center text-gray-300 leading-relaxed">Track all your reservations in one convenient dashboard. Manage bookings effortlessly.</p>
          </div>
        </div>
      </div>

      <div className="relative h-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-transparent"></div>
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
      </div>

      <div className="text-white container mx-auto pb-32 px-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-gray-400 text-lg">Simple steps to your perfect dining experience</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">

          <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-20"></div>

          <div className="text-center relative">
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-2xl shadow-blue-500/50 hover:scale-110 transition-transform duration-300 relative z-10">
              1
            </div>
            <h3 className="font-bold mb-3 text-xl">Sign Up</h3>
            <p className="text-sm text-gray-300 leading-relaxed">Create your account in seconds with our simple registration process</p>
          </div>

          <div className="text-center relative">
            <div className="bg-gradient-to-br from-green-600 to-green-400 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-2xl shadow-green-500/50 hover:scale-110 transition-transform duration-300 relative z-10">
              2
            </div>
            <h3 className="font-bold mb-3 text-xl">Browse Tables</h3>
            <p className="text-sm text-gray-300 leading-relaxed">View available tables and choose your perfect spot for dining</p>
          </div>

          <div className="text-center relative">
            <div className="bg-gradient-to-br from-purple-600 to-purple-400 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-2xl shadow-purple-500/50 hover:scale-110 transition-transform duration-300 relative z-10">
              3
            </div>
            <h3 className="font-bold mb-3 text-xl">Book Table</h3>
            <p className="text-sm text-gray-300 leading-relaxed">Select your preferred date, time, and party size instantly</p>
          </div>

          <div className="text-center relative">
            <div className="bg-gradient-to-br from-orange-600 to-orange-400 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-2xl shadow-orange-500/50 hover:scale-110 transition-transform duration-300 relative z-10">
              4
            </div>
            <h3 className="font-bold mb-3 text-xl">Enjoy</h3>
            <p className="text-sm text-gray-300 leading-relaxed">Arrive at your reserved table and savor an exceptional meal</p>
          </div>
        </div>
      </div>
    </>
  )
}