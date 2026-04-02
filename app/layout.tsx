import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ThemeProvider } from "@/components/ThemeProvider";
import AIChatbot from "@/components/AIChatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Booking Web - Live Booking System",
  description: "Book your table with real-time availability and instant confirmation",
  icons: {
    icon: '/newlogo.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans bg-background text-foreground antialiased overflow-x-hidden min-h-screen transition-colors duration-300`}
      >
        <SmoothScroll />
        <ThemeProvider>
          <SessionWrapper>
            <Navbar/>
            <div className="min-h-screen relative">
              {children}
            </div>
            <AIChatbot />
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
