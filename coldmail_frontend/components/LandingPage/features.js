"use client";

import { 
  FaEnvelopeOpenText, 
  FaUserEdit, 
  FaChartBar, 
  FaRobot, 
  FaLock, 
  FaTasks,
  FaCheckCircle,
  FaArrowRight 
} from "react-icons/fa";
import { motion } from "framer-motion";
import { redirectToGoogleLogin } from "@/libapi/api";

const features = [
  {
    icon: <FaEnvelopeOpenText className="text-2xl text-white" />,
    title: "Automated Follow-ups",
    description: "Schedule up to 10 intelligent follow-ups that send automatically until you get a reply. Never lose a lead again.",
    color: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50/50 to-blue-100/30",
    hoverColor: "hover:border-blue-300",
    benefits: ["Smart timing", "Auto-stop on reply", "Zero manual work"]
  },
  {
    icon: <FaUserEdit className="text-2xl text-white" />,
    title: "AI Personalization",
    description: "Customize each email and follow-ups with dynamic AI-generated content that feels genuinely personal at scale.",
    color: "from-green-500 to-green-600", 
    bgGradient: "from-green-50/50 to-green-100/30",
    hoverColor: "hover:border-green-300",
    benefits: ["Dynamic content", "Personal touch", "Scalable approach"]
  },
  {
    icon: <FaChartBar className="text-2xl text-white" />,
    title: "Real-time Analytics",
    description: "Monitor emails, clicks, follow-up progress, and replies from one beautiful dashboard with actionable insights.",
    color: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-50/50 to-purple-100/30", 
    hoverColor: "hover:border-purple-300",
    benefits: ["Live tracking", "Performance metrics", "Data insights"]
  },
  {
    icon: <FaRobot className="text-2xl text-white" />,
    title: "Multiple Scheduling",
    description: "Choose optimal intervals (2/4/7 days, every 1 day or 2 days) powered by our smart system to maximize reply rates.",
    color: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-50/50 to-orange-100/30",
    hoverColor: "hover:border-yellow-300", 
    benefits: ["ML optimization", "Perfect timing", "Higher response rates"]
  },
  {
    icon: <FaLock className="text-2xl text-white" />,
    title: "Enterprise Security",
    description: "Connect Gmail or Google Workspace securly, Verified by Google. Your data stays protected with end-to-end encryption.",
    color: "from-red-500 to-pink-500",
    bgGradient: "from-red-50/50 to-pink-100/30",
    hoverColor: "hover:border-red-300",
    benefits: ["Encryped Data", "OAuth 2.0", "Data protection"]
  },
  {
    icon: <FaTasks className="text-2xl text-white" />,
    title: "Smart Campaign Management",
    description: "Edit, reschedule, or pause campaigns anytime without breaking the sequence. Full control, maximum flexibility.",
    color: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-50/50 to-purple-100/30",
    hoverColor: "hover:border-indigo-300",
    benefits: ["Live editing", "Flexible control", "No disruption"]
  }
];

export default function KeyFeatures() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden" id="features">
      
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-56 h-56 bg-purple-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-48 h-48 bg-green-200 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header Section */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6 border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Everything you need
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Powerful Features for 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Modern Outreach</span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Everything you need to run successful cold email campaigns — powered by AI, built for results.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`group relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/60 ${feature.hoverColor} transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                  {feature.description}
                </p>
                
                {/* Benefits List */}
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-3">
                      <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                      <span className="text-gray-700 text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Highlight Section */}
        <motion.div
          className="relative p-8 md:p-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl text-white overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 border border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              The Complete Cold Email Solution
            </h3>
            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
              From AI-powered personalization to real-time analytics — ColdMaily gives you everything you need to turn cold prospects into warm leads.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={redirectToGoogleLogin} className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 cursor-pointer">
                Start For Free Now
                <FaArrowRight className="text-sm" />
              </button>
              {/* <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center gap-2">
                View Demo
                <FaArrowRight className="text-sm" />
              </button> */}
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {[
            { number: "85%", label: "Higher Response Rate" },
            { number: "10x", label: "More Follow-ups" },
            { number: "1 min", label: "Setup Time" },
            { number: "24/7", label: "Automation" }
          ].map((stat, index) => (
            <div key={index} className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}