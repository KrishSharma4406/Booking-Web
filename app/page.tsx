'use client'
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Utensils, CalendarHeart, Clock } from "lucide-react";
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
    <div className="bg-background text-secondary min-h-screen">
      {/* Hero Section Split Layout */}
      <section className="relative min-h-[90vh] flex flex-col-reverse md:flex-row items-center pt-24 pb-12 overflow-hidden">
        
        {/* Left Content Area */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 z-10 pt-10 md:pt-0">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 max-w-lg"
          >
            <div>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-6xl lg:text-7xl leading-tight text-secondary font-bold">
                Premium Dining, <span className="italic">Perfected</span>
              </h1>
              <div className="h-1 w-16 bg-primary rounded-full mt-6"></div>
            </div>

            <p className="text-secondary text-base md:text-lg leading-relaxed opacity-90">
              Book your perfect table at the finest restaurants. Experience seamless reservations, exclusive dining experiences, and unforgettable memories.
            </p>

            {/* Status Dot */}
            <div className="flex items-center gap-3 pt-2">
               <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              <span className="text-secondary font-medium text-sm uppercase tracking-wide opacity-80">Live & Accepting Reservations</span>
            </div>

            {/* CTA Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              {status === 'loading' || loading ? (
                <div className="animate-pulse flex gap-4">
                  <div className="h-12 w-48 bg-border rounded-lg"></div>
                </div>
              ) : status === 'authenticated' ? (
                <>
                  {userRole === 'admin' ? (
                    <motion.button
                      onClick={() => router.push('/admin-dashboard')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 bg-primary text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                      Host Dashboard
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => router.push('/bookings')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 bg-primary text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                    >
                      Find a Table
                    </motion.button>
                  )}
                </>
              ) : (
                <>
                  <Link href="/SignUp" className="w-full sm:w-auto">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-8 py-4 bg-primary text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                    >
                      Reserve Now
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  <Link href="/about" className="w-full sm:w-auto">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-8 py-4 border-2 border-secondary text-secondary font-semibold text-base rounded-lg hover:bg-secondary hover:text-white transition-all"
                    >
                      Learn More
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Image Area */}
        <motion.div 
          className="w-full md:w-1/2 h-[50vh] md:h-[90vh] relative p-4 md:p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80"
              alt="Fine Dining Experience"
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>
      </section>

      {/* Decorative Divider */}
      <div className="flex justify-center py-16">
        <div className="h-1 w-20 bg-primary rounded-full"></div>
      </div>

      {/* The Experience Section */}
      <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Why Choose Us</p>
          <h2 className="font-serif text-4xl md:text-5xl text-secondary font-bold mb-6">
            Experience Exceptional Dining
          </h2>
          <p className="text-secondary text-base opacity-85 leading-relaxed">
            From seamless reservations to curated experiences, we transform how you book and enjoy fine dining.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Utensils className="w-8 h-8 text-primary" />,
              title: "Curated Selection",
              description: "Handpicked restaurants featuring world-class chefs and seasonal menus.",
              image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&q=80"
            },
            {
              icon: <Clock className="w-8 h-8 text-primary" />,
              title: "Instant Booking",
              description: "Real-time availability and instant confirmations without the waiting game.",
              image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80"
            },
            {
              icon: <CalendarHeart className="w-8 h-8 text-primary" />,
              title: "Complete Control",
              description: "Manage, modify, or cancel reservations with full transparency and ease.",
              image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
            >
              <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-6 shadow-lg">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="space-y-4">
                <div className="bg-primary bg-opacity-10 w-14 h-14 rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-2xl text-secondary font-bold">{feature.title}</h3>
                <p className="text-secondary opacity-80 leading-relaxed text-base">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="flex justify-center py-10">
        <div className="h-16 w-px bg-border"></div>
      </div>

      <Footer />
    </div>
  )
}