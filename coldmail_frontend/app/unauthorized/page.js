"use client";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
      <h1 className="text-4xl font-bold text-black mb-4">Unauthorized Access</h1>
      <p className="text-gray-700 text-lg mb-6">
        You don't have permission to view this page. Please login to continue.
      </p>
      <a
        href="/"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Go to Home
      </a>
    </div>
  );
}
