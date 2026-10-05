"use client";

import { FaGoogle, FaRegPaperPlane, FaChartLine, FaArrowRight, FaCog, FaRocket } from "react-icons/fa";
import { motion } from "framer-motion";
import { redirectToGoogleLogin } from "@/libapi/api";

const steps = [
  {
    number: "01",
    icon: <FaGoogle className="text-2xl text-white" />,
    title: "Sign in with Google",
    description: "Securely connect your Gmail or Google Workspace account — Just sign in and you’re ready.",
    features: ["One-click authentication", "Enterprise security", "No separate setup"],
    color: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50/50 to-blue-100/30"
  },
  {
    number: "02", 
    icon: <FaCog className="text-2xl text-white" />,
    title: "Compose & Configure",
    description: "Write your main email and let we handle the rest. Choose No. of follow-ups and strategy and watch the magic happen.",
    features: [
      "Smart category selection", 
      "Flexible multiple scheduling (2/4/7 days, every 1 day or 2 days)",
      "Up to 10 follow-ups",
      "AI-powered personalization follow-ups",
    ],
    color: "from-green-500 to-green-600",
    bgGradient: "from-green-50/50 to-green-100/30"
  },
  {
    number: "03",
    icon: <FaRocket className="text-2xl text-white" />,
    title: "Send & Track Success",
    description: "Send your cold mail and watch results in real-time. Our system automatically stops follow-ups when replies are detected.",
    features: ["Real-time tracking dashboard", "Auto-stop on replies", "Performance analytics"],
    color: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-50/50 to-purple-100/30"
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 bg-white overflow-hidden" id="how-it-works">
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >

          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            How ColdMaily 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Works</span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            From sign-in to success — get started in minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
                
                {/* Content Side */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      {step.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-300">
                      {step.number}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color}`}></div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Side */}
                <div className="flex-1 flex justify-center">
                  <div className={`relative p-8 bg-gradient-to-br ${step.bgGradient} rounded-3xl shadow-xl max-w-md w-full`}>
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-3xl"></div>
                    <div className="relative z-10">
                      {/* Step Visualization */}
                      <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                        {step.icon}
                      </div>
                      
                      {/* Mock Interface Elements */}
                      <div className="space-y-3 mb-6">
                        <div className="h-3 bg-gray-200 rounded-full"></div>
                        <div className="h-3 bg-gray-200 rounded-full w-4/5"></div>
                        <div className="h-3 bg-gray-200 rounded-full w-3/5"></div>
                      </div>
                      
                      {/* Action Button */}
                      <div className={`w-full py-3 bg-gradient-to-r ${step.color} rounded-lg flex items-center justify-center gap-2 text-white font-medium shadow-lg`}>
                        <span className="text-sm">{step.title}</span>
                        <FaArrowRight className="text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="flex justify-center mt-16">
                  <div className="w-px h-16 bg-gradient-to-b from-gray-300 to-transparent"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20 p-8 bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to 10x Your Cold Email Results?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who've transformed their outreach with AI-powered follow-ups.
          </p>
          <button onClick={redirectToGoogleLogin} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 mx-auto cursor-pointer">
            Get Started for Free
            <FaArrowRight className="text-sm" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}