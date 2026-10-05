"use client";

import { useState } from "react";
import { FaChevronDown, FaQuestionCircle, FaCheckCircle, FaLightbulb } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { redirectToGoogleLogin } from "@/libapi/api";

const faqCategories = [
  {
    title: "Getting Started",
    icon: <FaLightbulb className="text-blue-500" />,
    faqs: [
      {
        question: "What is ColdMaily and how does it work?",
        answer: "ColdMaily is a cold email automation platform that helps you send personalized outreach emails and up to 4 automated follow-ups. Simply sign in with Google, compose your email, choose your follow-up strategy, and let ColdMaily handle the scheduling, sending, and stopping follow-ups when a reply is detected."
      },
      {
        question: "How do I connect my Gmail or Google Workspace account?",
        answer: "Just click Sign in with Google on ColdMaily. We use Google's secure OAuth authentication, so you never have to enter your email password. The connection is instant and safe — no technical setup required."
      },
      {
        question: "How long does it take to set up my first campaign?",
        answer: "Most users create their first campaign within 5-10 minutes. The process is: Connect Gmail → Write your email → Choose follow-up intervals → Send or schedule. That's it!"
      }
    ]
  },
  {
    title: "Features & Functionality",
    icon: <FaCheckCircle className="text-green-500" />,
    faqs: [
      {
        question: "How many follow-ups can I send for each campaign?",
        answer: "You can schedule up to 4 follow-ups in addition to your main email. Each follow-up can be fully customized with its own content, timing, and personalization tags."
      },
      {
        question: "What happens if someone replies before all follow-ups are sent?",
        answer: "Once a reply is detected, ColdMaily automatically stops all remaining follow-ups for that recipient — so you never risk sending unnecessary emails after the conversation has started. This keeps your outreach professional and respectful."
      },
      {
        question: "Can I send attachments with my cold emails?",
        answer: "Yes! You can attach files like PDFs, images, presentations, or documents when composing your email. Attachments are sent securely through your connected email account with the same deliverability as regular emails."
      },
      {
        question: "Can I edit or stop campaigns after they've started?",
        answer: "Absolutely. You have full control — edit content, reschedule timing, pause campaigns, or stop individual sequences anytime without disrupting other active campaigns."
      }
    ]
  },
  {
    title: "Security & Privacy",
    icon: <FaQuestionCircle className="text-purple-500" />,
    faqs: [
      {
        question: "Is my email account safe when I connect it to ColdMaily?",
        answer: "Absolutely. We use Google's verified OAuth authentication — the same security standard used by major apps. We never store your email password, and you can revoke access anytime from your Google account settings."
      },
      {
        question: "How do you protect my data?",
        answer: "All data is encrypted in transit (SSL/TLS) and at rest using enterprise-grade encryption. We follow strict privacy practices, store only essential data, and never share your information with third parties. Your email content and contacts remain completely private."
      },
      {
        question: "How do you make sure my emails don't end up in spam?",
        answer: "ColdMaily sends emails directly through your Gmail or Google Workspace account, following best practices for sending limits, personalization, and optimal spacing between follow-ups. This maintains your sender reputation and greatly reduces spam risk compared to bulk email tools."
      }
    ]
  }
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const switchCategory = (categoryIndex) => {
    setActiveCategory(categoryIndex);
    setActiveIndex(null); // Close any open FAQ when switching categories
  };

  return (
    <section className="relative py-24 bg-white overflow-hidden" id="faq">
      
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6 border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Got questions? We have answers
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Frequently Asked 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Questions</span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Everything you need to know about using ColdMaily to transform your outreach.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Category Sidebar */}
          <motion.div
            className="lg:w-1/3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="sticky top-24 space-y-4">
              {faqCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => switchCategory(index)}
                  className={`w-full p-4 rounded-2xl text-left transition-all duration-300 group ${
                    activeCategory === index
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-xl ${activeCategory === index ? 'text-white' : ''}`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{category.title}</h3>
                      <p className={`text-sm ${
                        activeCategory === index ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {category.faqs.length} questions
                      </p>
                    </div>
                  </div>
                </button>
              ))}
              
              {/* Contact Support */}
              <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">Still have questions?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <a
                  href="mailto:support@coldmaily.com?subject=Support%20Request%20%E2%80%94%20ColdMaily&body=Hi%20ColdMaily%20Team%2C%0A%0AI%20need%20help%20with%20...%0A%0AThanks%2C%0A[Your%20Name]"
                  className="w-full block text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Contact Support
                </a>

              </div>
            </div>
          </motion.div>

          {/* FAQ Content */}
          <div className="lg:w-2/3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {faqCategories[activeCategory].faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    className="group relative bg-white backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 hover:border-blue-300 transition-all duration-300 hover:shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <button
                      className="w-full flex justify-between items-start px-6 py-6 text-left focus:outline-none"
                      onClick={() => toggleFAQ(index)}
                    >
                      <span className="font-semibold text-gray-900 text-lg pr-4 leading-relaxed">
                        {faq.question}
                      </span>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-300 ${
                        activeIndex === index ? 'bg-blue-100 text-blue-600 rotate-180' : 'text-gray-500'
                      }`}>
                        <FaChevronDown className="text-sm" />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {activeIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 border-t border-gray-100">
                            <p className="text-gray-600 leading-relaxed pt-4">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who are already using ColdMaily to automate their outreach and get better results.
          </p>
          <button onClick={redirectToGoogleLogin} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 cursor-pointer">
            Send a Cold Email
          </button>
        </motion.div>

      </div>
    </section>
  );
}