"use client";
import { motion } from "framer-motion";
import { FaBuilding, FaUserTie, FaBullhorn, FaRocket } from "react-icons/fa";
import { redirectToGoogleLogin } from "@/libapi/api";

const useCases = [
  {
    title: "Sales Teams & B2B Companies",
    description: "Convert leads into customers effortlessly with AI-driven follow-ups and smart outreach strategies.",
    icon: <FaBuilding className="text-3xl text-blue-500" />,
    gradient: "from-blue-50/50 to-blue-100/30",
    hoverColor: "hover:border-blue-300",
    textColor: "group-hover:text-blue-700",
    stats: "85% higher response rate"
  },
  {
    title: "Job Seekers & Professionals",
    description: "Ensure recruiters notice your applications with automated, personalized follow-ups that stand out.",
    icon: <FaUserTie className="text-3xl text-green-500" />,
    gradient: "from-green-50/50 to-green-100/30",
    hoverColor: "hover:border-green-300",
    textColor: "group-hover:text-green-700",
    stats: "3x more interviews"
  },
  {
    title: "Marketing Agencies & Service Providers",
    description: "Scale your outreach, nurture leads, and boost conversions with AI-driven cold email campaigns.",
    icon: <FaBullhorn className="text-3xl text-purple-500" />,
    gradient: "from-purple-50/50 to-purple-100/30",
    hoverColor: "hover:border-purple-300",
    textColor: "group-hover:text-purple-700",
    stats: "60% more qualified leads"
  },
  {
    title: "Startup Founders & Entrepreneurs",
    description: "Get investors, partners, and clients to notice you with AI-optimized cold email sequences.",
    icon: <FaRocket className="text-3xl text-orange-500" />,
    gradient: "from-orange-50/50 to-orange-100/30",
    hoverColor: "hover:border-orange-300",
    textColor: "group-hover:text-orange-700",
    stats: "40% faster funding"
  },
];

const ScrollUseCases = () => {
  return (
    <section className="relative w-full py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden" id="use-cases">
      
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-48 h-48 bg-purple-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-200 rounded-full blur-3xl"></div>
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
            Perfect for every professional
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Empower Your Growth with 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Smarter Cold Outreach</span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Whether you're closing deals, landing jobs, or building partnerships — ColdMaily adapts to your goals.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              className={`group relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 ${useCase.hoverColor} transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  {useCase.icon}
                </div>
                
                {/* Content */}
                <h3 className={`text-lg font-bold text-gray-900 mb-3 ${useCase.textColor} transition-colors leading-tight`}>
                  {useCase.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {useCase.description}
                </p>
                
                {/* Stats Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  {useCase.stats}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-gray-600 mb-6">Ready to transform your outreach strategy?</p>
          <button onClick={redirectToGoogleLogin} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer">
            Start Now
          </button>
        </motion.div>
        
      </div>
    </section>
  );
};

export default ScrollUseCases;