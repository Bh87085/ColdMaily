import React from "react";
import { motion } from "framer-motion";
import { redirectToGoogleLogin } from "@/libapi/api";

// Mock components - replace with your actual components
const FadeInSection = ({ children, direction = "up", delay = 0, className = "" }) => {
  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? -40 : direction === "right" ? 40 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: { duration: 0.6, delay }
    }
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

const AnimatedSubtext = () => {
  return (
    <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl leading-relaxed">
      Transform your cold outreach with AI-powered automation that turns prospects into paying customers
    </p>
  );
};

const ModernSaaSHomepage = () => {
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white min-h-screen" id="homesection">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse" style={{animationDelay: '4s'}}></div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-45 pb-32">
          {/* Trust Badge */}
          {/* <FadeInSection direction="up" delay={0.2}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-200">Trusted by 1000+ businesses</span>
            </div>
          </FadeInSection> */}

          {/* Main Headline */}
          <FadeInSection direction="up" delay={0.4}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 max-w-5xl leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Revolutionize
              </span>{" "}
              Cold Emails with{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  AI Automation
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C45 2 155 2 198 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>
          </FadeInSection>

          {/* Animated Subtext */}
          <FadeInSection direction="up" delay={0.6}>
            <div className="mb-12">
              <AnimatedSubtext />
            </div>
          </FadeInSection>

          {/* CTA Section */}
          <FadeInSection direction="up" delay={0.8}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <button
              onClick={redirectToGoogleLogin}
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-semibold rounded-2xl shadow-2xl shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/40 overflow-hidden"
            >
              {/* Overlay div behind the text and allows clicks */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"></div>

              <span className="relative z-10 flex items-center gap-3">
                Start Cold Mailing
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

              
              {/* <button className="px-10 py-5 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white text-lg font-semibold rounded-2xl transition-all duration-300 flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </button> */}
            </div>
          </FadeInSection>

          {/* Stats Row */}
          <FadeInSection direction="up" delay={1.0}>
            <div className="flex items-center justify-center gap-8 mb-16 flex-wrap">
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-bold text-green-400 group-hover:scale-110 transition-transform">3x</div>
                <div className="text-sm text-gray-400">Higher Reply Rate</div>
              </div>
              <div className="w-px h-12 bg-gray-600 hidden sm:block"></div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-bold text-blue-400 group-hover:scale-110 transition-transform">85%</div>
                <div className="text-sm text-gray-400">Time Saved</div>
              </div>
              <div className="w-px h-12 bg-gray-600 hidden sm:block"></div>
              <div className="text-center group cursor-pointer">
                <div className="text-3xl font-bold text-purple-400 group-hover:scale-110 transition-transform">500+</div>
                <div className="text-sm text-gray-400">Emails/Day</div>
              </div>
            </div>
          </FadeInSection>

          {/* Social Proof */}
          {/* <FadeInSection direction="up" delay={1.2}>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              <div className="text-sm text-gray-400">Integrated with:</div>
              <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Gmail
              </div>
              <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.04 9.66c.09-.79.14-1.61.14-2.45C23.18 3.23 19.95 0 16 0S8.82 3.23 8.82 7.21c0 .84.05 1.66.14 2.45H.82v7.13c0 4.97 4.03 9 9 9h4.36c4.97 0 9-4.03 9-9V9.66h-0.14zM16 2.18c2.81 0 5.09 2.28 5.09 5.09 0 .7-.15 1.37-.42 1.98H10.91c-.27-.61-.42-1.28-.42-1.98C10.49 4.46 12.77 2.18 16 2.18z"/>
                </svg>
                Outlook
              </div>
              <div className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                  <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
                </svg>
                SMTP
              </div>
            </div>
          </FadeInSection> */}
        </div>
      </section>

    </div>
  );
};

export default ModernSaaSHomepage;