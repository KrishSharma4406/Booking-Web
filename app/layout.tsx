import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionWrapper from "@/components/SessionProvider";
import { SmoothScroll } from "@/components/SmoothScroll";

export const metadata = {
  title: "Booking Web - Live Booking System",
  description: "Book your table with real-time availability and instant confirmation",
  icons: {
    icon: '/newlogo.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className="antialiased overflow-x-hidden bg-black text-white min-h-screen selection:bg-white/20"
      >
        <SmoothScroll />
        <SessionWrapper>
          <Navbar/>
          <div className="min-h-screen relative">
            {children}
          </div>
          <Footer/>
        </SessionWrapper>
      </body>
    </html>
  );
}
