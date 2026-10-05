"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const stats = [
  { label: "Organizations", value: 500 },
  { label: "Mails Sent", value: 1500 },
  { label: "Follow-ups", value: 1200 },
  { label: "Response Rate", value: 85 }, // Use percentage for response rate
];

const StatsSection = () => {
  const [countValues, setCountValues] = useState(
    stats.map(() => ({ count: 0 }))
  );

  useEffect(() => {
    stats.forEach((stat, index) => {
      let start = 0;
      const end = stat.value;
      const duration = 2; // Duration of the count animation in seconds
      const stepTime = (duration * 1000) / end;

      const interval = setInterval(() => {
        if (start < end) {
          start++;
          setCountValues((prevValues) => {
            const updatedValues = [...prevValues];
            updatedValues[index].count = start;
            return updatedValues;
          });
        } else {
          clearInterval(interval);
        }
      }, stepTime);
    });
  }, []);

  return (
    <section className="w-full bg-gray-100 py-20 flex flex-col items-center justify-center">
      <div className="flex gap-8 justify-center">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="w-48 h-48 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center p-6 border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="text-4xl font-bold text-blue-600">
              {countValues[index].count}
              {stat.label === "Response Rate" && "%"}
            </div>
            <p className="text-lg text-gray-600 mt-4">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
