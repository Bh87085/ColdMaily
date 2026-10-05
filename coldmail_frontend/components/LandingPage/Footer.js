"use client";

import { FaTwitter, FaLinkedin, FaEnvelope, FaArrowRight, FaHeart } from "react-icons/fa";
import { motion } from "framer-motion";

const Footer = () => {
  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "How it Works", href: "#how-it-works" },
      { name: "Use Cases", href: "#use-cases" },
      // { name: "Pricing", href: "#pricing" }
    ],
    support: [
      // { name: "Help Center", href: "/support" },
      { name: "Contact Us", href: "mailto:support@coldmaily.com" },
      { name: "FAQ", href: "#faq" },
      // { name: "Status", href: "/status" }
    ],
    legal: [
      { name: "Privacy Policy", href: "/legal/privacy-policy" },
      { name: "Terms of Service", href: "/legal/terms-of-service" },
      // { name: "Cookie Policy", href: "/legal/cookies" },
      // { name: "Security", href: "/security" }
    ]
  };

  const socialLinks = [
    // { 
    //   name: "Twitter", 
    //   href: "https://twitter.com/coldmaily", 
    //   icon: <FaTwitter />,
    //   color: "hover:text-blue-400"
    // },
    // { 
    //   name: "LinkedIn", 
    //   href: "https://linkedin.com/company/coldmaily", 
    //   icon: <FaLinkedin />,
    //   color: "hover:text-blue-600"
    // },
    { 
      name: "Email", 
      href: "mailto:support@coldmaily.com", 
      icon: <FaEnvelope />,
      color: "hover:text-green-400"
    }
  ];

  return (
    <footer className="relative bg-gray-950 text-gray-300 overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        
        {/* Newsletter Section */}
        {/* <motion.div
          className="border-b border-gray-800 px-6 md:px-12 py-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Stay Updated with Cold Email Tips
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Get the latest strategies, templates, and insights delivered to your inbox. Join 10,000+ professionals who are mastering cold outreach.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap">
                Subscribe
                <FaArrowRight className="text-sm" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </motion.div> */}

        {/* Main Footer Content */}
        <div className="px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Brand Section */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <img
                    src="/coldmaily_logo.jpeg"
                    className="w-9 h-6 mr-3"
                    alt="ColdMaily Logo"
                  />
                  <h3
                    className="font-bold text-2xl"
                    style={{
                      background: "linear-gradient(90deg, #f4f5f7, #458cca)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textFillColor: "transparent",
                    }}
                  >
                    ColdMaily
                  </h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                  Transform your cold outreach with AI-powered automated follow-ups.  
                  Higher response rates, less manual work, better results.
                </p>
              </div>

              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 hover:bg-gray-700 hover:-translate-y-1`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Product Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-white font-semibold mb-6">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h4 className="text-white font-semibold mb-6">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-gray-800 px-6 md:px-12 py-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>© {new Date().getFullYear()} ColdMaily. All rights reserved.</span>
              <span className="hidden md:block">•</span>
              <div className="flex items-center gap-1">
                <span>Made with</span>
                <FaHeart className="text-red-400 text-xs" />
                <span>for better outreach</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                {/* <span className="text-gray-400">All systems operational</span> */}
              </div>
              <a
                href="/#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                What's New
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;