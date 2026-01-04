import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionWrapper from "@/components/SessionProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Booking Web - Live Booking System",
  description: "Book your table with real-time availability and instant confirmation",
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased overflow-x-hidden`}
      >
        <SessionWrapper>
          <Navbar/>
          <div className="min-h-[85vh] relative overflow-y-hidden">
          <div className="absolute top-0 left-0 right-0 bottom-0 z-[-2] bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
          {children}
          </div>
        </SessionWrapper>
        <Footer/>
      </body>
    </html>
  );
}
