'use client'
import Image from "next/image";
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
      <div className="relative flex justify-center flex-col gap-6 items-center text-white min-h-[60vh] px-5 md:px-10 py-20">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80')"}}></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-block">
            <div className="font-extrabold flex md:text-7xl justify-center items-center text-4xl gap-3 mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              <span>Booking Web</span>
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full"></div>
          </div>

          <p className="text-center text-2xl md:text-3xl font-semibold text-gray-100 max-w-3xl mx-auto">
            Experience fine dining with seamless table reservations
          </p>
          <p className="text-center text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Book your perfect dining experience in real-time. Our live booking system ensures you never miss a spot at your favorite restaurant.
          </p>

          {/* Role-based button display */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            {status === 'loading' || loading ? (
              <div className="animate-pulse flex gap-4">
                <div className="h-14 w-40 bg-gray-700 rounded-xl"></div>
                <div className="h-14 w-40 bg-gray-700 rounded-xl"></div>
              </div>
            ) : status === 'authenticated' ? (
              <>
                {userRole === 'admin' ? (
                  <>
                    <button
                      onClick={() => router.push('/admin-dashboard')}
                      className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Admin Dashboard
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    <button
                      onClick={() => router.push('/admin-tables')}
                      className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 to-red-500 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Manage Tables
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push('/bookings')}
                      className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Book Table Now
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-teal-500 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Dashboard
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/Login">
                  <button className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50">
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Book Now
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </Link>
                <Link href="/about">
                  <button className="group relative px-10 py-4 bg-transparent border-2 border-white/30 text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:border-white/60 backdrop-blur-sm">
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Learn More
                    </span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent"></div>
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
              <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80" alt="Real-Time Booking" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
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
              <img src="https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&q=80" alt="Instant Approval" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent"></div>
              <div className="absolute bottom-4 left-4 bg-gradient-to-br from-green-600 to-teal-500 rounded-xl p-3 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="font-bold text-center text-2xl">Instant Approval</p>
            <p className="text-center text-gray-300 leading-relaxed">Get approved by our team and start booking immediately. Fast and hassle-free process.</p>
          </div>

          <div className="group item space-y-4 flex flex-col items-center justify-start p-8 rounded-2xl bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
            <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4">
              <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80" alt="Easy Management" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
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
            <h3 className="font-bold mb-3 text-xl">Get Approved</h3>
            <p className="text-sm text-gray-300 leading-relaxed">Quick admin verification to ensure quality service for all guests</p>
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