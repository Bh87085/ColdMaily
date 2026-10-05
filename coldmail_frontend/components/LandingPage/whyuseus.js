// components/LandingPage/featuresection.js
import React from "react";
import { FaClock, FaReply, FaTasks } from "react-icons/fa";
import { LuTarget } from "react-icons/lu";
import { motion } from "framer-motion";
import { redirectToGoogleLogin } from "@/libapi/api";

const FadeInSection = ({ children, direction = "up", delay = 0, className = "" }) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? -40 : direction === "right" ? 40 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.6, delay },
    },
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

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const WhyUseUs = () => {
  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50" id="why-us">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <FadeInSection direction="up" delay={0.2}>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-medium mb-6 border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Why Choose ColdMaily?
            </div>
          </FadeInSection>

          <FadeInSection direction="up" delay={0.4}>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Turn Cold Emails into{" "}
              <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Hot Leads
              </span>
            </h2>
          </FadeInSection>

          <FadeInSection direction="up" delay={0.6}>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Cold emailing is proven to reach clients and win deals. ColdMaily handles follow-ups and timing automatically,
              so every email feels personal and gets results.
            </p>
          </FadeInSection>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <FadeInSection direction="left" delay={0.8} className="order-2 lg:order-1">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/40 shadow-2xl">
                <img
                  className="w-full h-80 object-cover rounded-2xl shadow-xl"
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2015&q=80"
                  alt="ColdMaily Dashboard"
                />
                {/* Floating Badges */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl shadow-lg rotate-3 hover:rotate-0 transition-transform">
                  <div className="text-sm font-bold">+127% Reply Rate</div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg -rotate-3 hover:rotate-0 transition-transform">
                  <div className="text-sm font-bold">AI-Powered</div>
                </div>
                <div className="absolute top-1/2 -right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl shadow-lg">
                  <div className="text-xs font-semibold">Live</div>
                </div>
              </div>
            </div>
          </FadeInSection>

            {/* Right Side - Features Grid */}
            <FadeInSection direction="right" delay={1.0} className="order-1 lg:order-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Feature Cards */}
                <motion.div 
                  className="group col-span-full sm:col-span-1"
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  custom={0}
                  viewport={{ once: true }}
                >
                  <div className="relative p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-blue-300 transition-all duration-300 group-hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <FaClock className="text-xl text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                        Save Hours Weekly
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        Automate follow-ups so you never have to manually chase leads again. Set it once and let AI handle the rest.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="group"
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  custom={1}
                  viewport={{ once: true }}
                >
                  <div className="relative p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-purple-300 transition-all duration-300 group-hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <FaReply className="text-xl text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                        Higher Reply Rates
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        Smart timing and personalization boost open rates and responses significantly.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="group"
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  custom={2}
                  viewport={{ once: true }}
                >
                  <div className="relative p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-green-300 transition-all duration-300 group-hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <FaTasks className="text-xl text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                        Complete Organization
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        Track every email status from sent to replied in one clean, intuitive dashboard.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="group"
                  variants={featureVariants}
                  initial="hidden"
                  whileInView="visible"
                  custom={3}
                  viewport={{ once: true }}
                >
                  <div className="relative p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 hover:border-orange-300 transition-all duration-300 group-hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <LuTarget className="text-xl text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-700 transition-colors">
                        Smart Follow-ups
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        Follow-ups stop automatically when prospects reply, so you focus only on warm leads.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom CTA */}
              <motion.div 
                className="mt-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-gray-700">Personalization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <span className="font-semibold text-gray-700">Automation</span>
                  </div>
                </div>
                
                <button 
                  onClick={redirectToGoogleLogin}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Your Free Trial
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </motion.div>
            </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default WhyUseUs;
