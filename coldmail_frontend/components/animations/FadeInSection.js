"use client";
import { motion } from "framer-motion";

const FadeInSection = ({ children, className, direction = "up", delay = 0 }) => {
  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
      x: direction === "left" ? -30 : direction === "right" ? 30 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0, 
      transition: { duration: 0.8, delay, ease: "easeOut" } 
    }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={variants} 
      className={className} // ✅ Pass custom styles
    >
      {children}
    </motion.div>
  );
};

export default FadeInSection;
