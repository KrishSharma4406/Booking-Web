'use client'
import React, { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import {
  Target,
  Users,
  Lightbulb,
  Award,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Heart,
  ChefHat,
  CalendarCheck,
  Zap,
  Sparkles,
  Globe,
  Star,
  Quote,
} from 'lucide-react'
import Footer from '@/components/Footer'

/* ── counter ─────────────────────────────────────────────── */
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = React.useState(0)
  React.useEffect(() => {
    if (!inView) return
    let cur = 0
    const step = Math.ceil(value / 100)
    const id = setInterval(() => {
      cur += step
      if (cur >= value) { cur = value; clearInterval(id) }
      setN(cur)
    }, 16)
    return () => clearInterval(id)
  }, [inView, value])
  return <span ref={ref} className="tabular-nums">{n.toLocaleString()}{suffix}</span>
}

/* ── helpers ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
}

/* ═══════════════════════════════════════════════════════════ */
const About = () => {
  const team = [
    {
      name: 'Krish Sharma',
      role: 'Founder & Lead Developer',
      avatar: '/krish-avatar.jpg',
      bio: 'Full-stack engineer with a passion for building products that solve real-world problems.',
    },
  ]

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      desc: 'Every feature we build starts with a real problem faced by diners or restaurants.',
      gradient: 'from-rose-500 to-orange-400',
    },
    {
      icon: Lightbulb,
      title: 'Innovation First',
      desc: 'We use modern technology to replace outdated reservation workflows.',
      gradient: 'from-amber-400 to-yellow-500',
    },
    {
      icon: Users,
      title: 'People-Centered',
      desc: 'Designed around the needs of both guests and restaurant administrators.',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Award,
      title: 'Quality Always',
      desc: 'From code to UX — we sweat the details so our users don\'t have to.',
      gradient: 'from-emerald-400 to-teal-500',
    },
  ]

  const milestones = [
    { year: '2023', text: 'Project started as a college idea to fix broken restaurant booking flows.', icon: Sparkles, color: 'bg-rose-500' },
    { year: '2024', text: 'Real-time bookings, admin approvals, and Razorpay payments went live.', icon: Zap, color: 'bg-purple-500' },
    { year: '2025', text: 'Email confirmations with PDF receipts, SMS alerts, and multi-table support added.', icon: Globe, color: 'bg-blue-500' },
    { year: '2026', text: 'Continuing to grow — AI recommendations and loyalty rewards on the roadmap.', icon: ChefHat, color: 'bg-emerald-500' },
  ]

  const testimonials = [
    {
      name: 'Priya S.',
      role: 'Food Blogger',
      text: 'The smoothest reservation experience I have ever had. Confirmed in seconds!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      stars: 5,
    },
    {
      name: 'Rahul M.',
      role: 'Restaurant Owner',
      text: 'Managing 200+ bookings a week used to be chaos. Now it practically runs itself.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      stars: 5,
    },
    {
      name: 'Anita K.',
      role: 'Regular Diner',
      text: 'Love the instant email confirmations with PDF receipts. Very professional.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
      stars: 5,
    },
  ]

  return (
    <>
      <main className="min-h-screen bg-background">

        {/* ═══  PAGE HEADER  ═══════════════════════════════ */}
        <section className="relative pt-32 sm:pt-36 pb-16 sm:pb-20 px-4 sm:px-6 text-center overflow-hidden">
          {/* soft glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 grid-bg pointer-events-none opacity-[0.06]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-purple-400 mb-4">
              About Us
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-5">
              The Story Behind{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Booking Web
              </span>
            </h1>
            <p className="text-muted text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              We started with one question — why is reserving a restaurant table still so painful?
              Here's who we are, what we believe, and where we're headed.
            </p>
          </motion.div>
        </section>

        {/* ═══  WHO WE ARE — text + image  ═════════════════ */}
        <section className="px-4 sm:px-6 pb-20 sm:pb-28">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-8 md:gap-14 items-center"
            >
              {/* image */}
              <div className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-border">
                <Image
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                  alt="Restaurant ambiance"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* text */}
              <div className="space-y-5">
                <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-purple-400">
                  Who We Are
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  A Modern Booking Platform Built for Real Restaurants
                </h2>
                <div className="space-y-4 text-muted text-sm sm:text-base leading-relaxed">
                  <p>
                    Booking Web is a full-featured reservation platform that connects diners with
                    restaurants through real-time table availability, instant confirmations, and
                    secure online payments.
                  </p>
                  <p>
                    We handle everything from the moment a guest picks a date to the confirmation
                    email with a PDF receipt — so restaurant staff can focus on hospitality, not
                    phone calls.
                  </p>
                  <p>
                    With a dedicated admin dashboard for approvals, table management, and user
                    oversight, it's built to scale from a single café to a multi-location chain.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══  QUICK STATS  ══════════════════════════════ */}
        <section className="px-4 sm:px-6 pb-20 sm:pb-28">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-2xl grid grid-cols-2 md:grid-cols-4 overflow-hidden"
            >
              {[
                { label: 'Happy Diners', value: 12000, suffix: '+', icon: Heart },
                { label: 'Restaurants', value: 350, suffix: '+', icon: ChefHat },
                { label: 'Reservations', value: 98000, suffix: '+', icon: CalendarCheck },
                { label: 'Uptime', value: 99, suffix: '.9%', icon: Zap },
              ].map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="px-4 sm:px-6 py-7 sm:py-9 text-center border-b md:border-b-0 md:border-r last:border-0 border-border"
                  >
                    <Icon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                      <Counter value={s.value} suffix={s.suffix} />
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-muted">{s.label}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        <div className="h-px bg-border mx-4 sm:mx-6" />

        {/* ═══  OUR VALUES  ═══════════════════════════════ */}
        <section className="px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-purple-400 mb-3">Our Values</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                What Drives Us
              </h2>
              <p className="text-muted max-w-lg mx-auto text-sm sm:text-base">
                The principles behind every line of code and every design decision.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {values.map((v, i) => {
                const Icon = v.icon
                return (
                  <motion.div
                    key={v.title}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="glass-card p-6 sm:p-7 rounded-2xl group"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5">{v.title}</h3>
                    <p className="text-muted text-sm leading-relaxed">{v.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <div className="h-px bg-border mx-4 sm:mx-6" />

        {/* ═══  OUR JOURNEY (timeline)  ═══════════════════ */}
        <section className="px-4 sm:px-6 py-20 sm:py-28 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[140px] pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-purple-400 mb-3">Our Journey</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                Milestones Along the Way
              </h2>
            </motion.div>

            <div className="relative">
              <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />

              {milestones.map((m, i) => {
                const Icon = m.icon
                const isLeft = i % 2 === 0
                return (
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`relative mb-10 md:mb-16 flex flex-col md:flex-row ${
                      isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                    } items-start md:items-center gap-6 pl-14 md:pl-0`}
                  >
                    <div className={`absolute left-5 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full ${m.color} flex items-center justify-center z-10 shadow-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className={`md:w-[44%] glass-card rounded-xl p-5 ${isLeft ? 'md:text-right md:mr-auto' : 'md:text-left md:ml-auto'}`}>
                      <span className="text-xs font-bold tracking-widest uppercase text-purple-400">{m.year}</span>
                      <p className="text-muted text-sm leading-relaxed mt-1">{m.text}</p>
                    </div>
                    <div className="hidden md:block md:w-[44%]" />
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <div className="h-px bg-border mx-4 sm:mx-6" />

        {/* ═══  MEET THE TEAM  ════════════════════════════ */}
        <section className="px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-purple-400 mb-3">The Team</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                Meet the Creator
              </h2>
              <p className="text-muted max-w-md mx-auto text-sm sm:text-base">
                The person behind the code, design, and vision of Booking Web.
              </p>
            </motion.div>

            <div className="flex justify-center">
              {team.map((member) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="glass-card rounded-2xl p-8 sm:p-10 text-center max-w-sm w-full group"
                >
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-5 rounded-full overflow-hidden border-2 border-purple-500/30 group-hover:border-purple-500/60 transition-colors">
                    <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">{member.name}</h3>
                  <p className="text-purple-400 text-sm font-medium mt-1">{member.role}</p>
                  <p className="text-muted text-sm leading-relaxed mt-3">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="h-px bg-border mx-4 sm:mx-6" />

        {/* ═══  TESTIMONIALS  ═════════════════════════════ */}
        <section className="px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-purple-400 mb-3">Testimonials</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                What People Say
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="glass-card rounded-2xl p-6 sm:p-7 relative"
                >
                  <Quote className="absolute top-4 right-4 w-7 h-7 text-purple-400/10" />
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-border">
                      <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-foreground font-semibold text-sm">{t.name}</p>
                      <p className="text-muted text-xs">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="h-px bg-border mx-4 sm:mx-6" />

        {/* ═══  CONTACT / GET IN TOUCH  ═══════════════════ */}
        <section className="px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-purple-400 mb-3">Contact</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                Get in Touch
              </h2>
              <p className="text-muted max-w-md mx-auto text-sm sm:text-base">
                Have a question, partnership idea, or feedback? We'd love to hear from you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { icon: Mail, label: 'Email', value: 'booking@web.com' },
                { icon: MapPin, label: 'Location', value: 'India — Worldwide' },
                { icon: Phone, label: 'Support', value: '24 / 7 Available' },
              ].map((c) => {
                const Icon = c.icon
                return (
                  <div key={c.label} className="glass-card rounded-xl p-5 sm:p-6 text-center">
                    <Icon className="w-5 h-5 text-purple-400 mx-auto mb-3" />
                    <p className="text-foreground font-semibold text-sm">{c.label}</p>
                    <p className="text-muted text-sm mt-1">{c.value}</p>
                  </div>
                )
              })}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default About
