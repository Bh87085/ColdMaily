"use client";

import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaArrowRight } from "react-icons/fa";
import { redirectToGoogleLogin } from "@/libapi/api";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Why Us", href: "#why-us" },
    { name: "Use Cases", href: "#use-cases" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "FAQ", href: "#faq" }, 
    { name: "Privacy Policy", href: "/legal/privacy-policy" },
  ];

  const handleScrollToTop = () => {
    const scrollEl = document.scrollingElement || document.documentElement;
    scrollEl.scrollTo({ top: 0, behavior: "smooth" });
  };
  

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-800/50' 
        : 'bg-gray-900/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, "", "/"); // reset URL to root
                const scrollEl = document.scrollingElement || document.documentElement;
                scrollEl.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center space-x-3 group cursor-pointer focus:outline-none"
            >
              <div className="relative">
                <img
                  src="/coldmaily_logo.jpeg"
                  alt="ColdMaily Logo"
                  className="w-8 h-8 rounded-sm transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3"></div>
              </div>
              <span 
                className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-200 group-hover:via-purple-200 group-hover:to-white"
              >
                ColdMaily
              </span>
            </button>
          </div>



          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="relative text-gray-300 hover:text-white transition-all duration-300 font-medium group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <button 
              onClick={redirectToGoogleLogin}
              className="text-gray-300 hover:text-white font-medium transition-all duration-300"
            >
              Sign In
            </button>
            <button 
              onClick={redirectToGoogleLogin}
              className="group px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              Get Started Free
              <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 ${
        isMobileMenuOpen 
          ? 'max-h-screen opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-4 py-6 bg-gray-900/98 backdrop-blur-lg border-t border-gray-800/50">
          <nav className="space-y-4 mb-6">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300 font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>
          
          <div className="space-y-3 pt-4 border-t border-gray-800">
            <button 
              onClick={() => {
                redirectToGoogleLogin();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300 text-left font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={() => {
                redirectToGoogleLogin();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-center"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;