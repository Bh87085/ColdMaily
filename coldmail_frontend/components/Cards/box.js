import React from "react";

const Box = ({ icon: Icon, title, description, extraClasses }) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg p-6 h-70 flex flex-col items-start justify-center text-left transition-all duration-300 hover:shadow-xl w-80 ${extraClasses}`}>
      {/* Icon with hover effect on the box */}
      <div className="relative w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 group-hover:bg-blue-500">
        {Icon && <Icon className="text-blue-500 w-10 h-10 transition-all duration-300 group-hover:text-white" />}
      </div>

      {/* Title - Aligned to the left */}
      <h3 className="text-lg font-bold text-gray-800 mt-4">{title}</h3>
      
      {/* Description - Aligned to the left */}
      <p className="text-sm text-gray-900 mt-3">{description}</p>
    </div>
  );
};

export default Box;
