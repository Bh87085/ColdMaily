"use client";

import { useEffect, useState } from "react";

export function ActionCard({
  title,
  icon: Icon, // add icon prop
  onClick,
  bgColor = "bg-white",
  textColor = "text-black",
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer ${bgColor} ${textColor} h-[120px] w-[260px] rounded-2xl shadow-md p-6 flex flex-col items-center justify-center text-lg font-semibold transition hover:shadow-lg`}
      style={{ minHeight: "120px", minWidth: "220px" }}
    >
      {/* Icon (if provided) */}
      {Icon && <Icon className="w-10 h-10 mb-2" />}

      {/* Title below icon */}
      <span className="text-center">{title}</span>
    </div>
  );
}

export function StatCard({
  icon: Icon,
  value,
  label,
  bgColor = "bg-white",
  textColor = "text-black",
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = Math.max(0, value - 100);
    let step = 1;
    let current = start;

    const interval = setInterval(() => {
      current += step;
      if (current >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(current);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div
      className={`${bgColor} ${textColor} h-[120px] w-[260px] rounded-2xl  shadow-md p-6 flex items-center justify-center transition hover:shadow-lg`}
      style={{ minHeight: "120px", minWidth: "220px" }}
    >
      {/* Icon and Stats Centered Horizontally */}
      <div className="flex items-center gap-4">
        {/* Icon on the left */}
        {Icon && <Icon className="w-10 h-10" />}

        {/* Number + Label on the right */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold">{count}</span>
          <span className="text-sm mt-2 font-bold">{label}</span>
        </div>
      </div>
    </div>
  );
}
