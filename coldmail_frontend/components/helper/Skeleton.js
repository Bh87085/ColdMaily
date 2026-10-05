// components/Skeleton.js
export default function Skeleton({ className = "" }) {
    return (
      <div
        className={`relative overflow-hidden bg-gray-200 rounded-md ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
      </div>
    );
  }
  