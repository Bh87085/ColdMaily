"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const textArray = [
  "AI-Powered Auto Follow-ups",
  "Cold Emails That Work While You Sleep",
  "100% Personalized, 0% Manual Effort",
  "Smart Follow-ups, Sent at the Right Time",
  "Convert 10x More Clients with AI Outreach"
];

const AnimatedSubtext = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % textArray.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-12 flex items-center justify-center overflow-hidden text-lg sm:text-xl text-gray-300 font-medium w-full mb-8">
      <AnimatePresence mode="wait">
        <motion.h2
          key={textArray[index]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute"
        >
          {textArray[index]}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedSubtext;
