"use client";

export default function ActionButtons({ permissions }) {
  
  return (
    console.log("Permissions:", permissions),
    <div className="flex items-center gap-2">
      {permissions.can_launch && (
        <button className="px-4 py-2 rounded-lg bg-green-600 text-black font-medium hover:bg-green-700 transition">
          Start
        </button>
      )}

      {permissions.can_pause && (
        <button className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition">
          Pause
        </button>
      )}

      {permissions.can_resume && (
        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
          Resume
        </button>
      )}

      {permissions.can_delete && (
        <button className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition">
          Delete
        </button>
      )}

      {permissions.can_stop && (
        <button className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition">
          Stop
        </button>
      )}      
    </div>
  );
}
