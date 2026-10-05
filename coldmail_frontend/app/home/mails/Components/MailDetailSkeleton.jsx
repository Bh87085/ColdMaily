"use client";

export default function MailDetailSkeleton() {
  return (
    <div className="w-full px-4 py-1 animate-pulse space-y-6">
      {/* Back button placeholder */}
      <div className="h-5 w-32 bg-gray-200 rounded" />

      {/* Subject and Status */}
      <div className="flex justify-between items-center">
        <div className="h-6 w-2/3 bg-gray-200 rounded" />
        <div className="h-6 w-20 bg-gray-300 rounded-full" />
      </div>

      {/* To Email & Gmail Link */}
      <div className="flex justify-between items-center text-sm p-3 bg-gray-100 rounded-lg border">
        <div className="h-4 w-1/3 bg-gray-300 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>

      {/* Meta Info Bar */}
      <div className="flex flex-wrap gap-6 bg-white p-4 border rounded-lg shadow-sm">
        <div className="h-4 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-52 bg-gray-200 rounded" />
        <div className="h-4 w-36 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded ml-auto" />
      </div>

      {/* Body */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="h-4 w-24 bg-gray-300 mb-4 rounded" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 w-full bg-gray-200 rounded" />
          ))}
        </div>
      </div>

      {/* Follow-Ups */}
      <div className="space-y-4">
        <div className="h-4 w-32 bg-gray-300 rounded" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-gray-300 rounded" />
              <div className="flex gap-4">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
                <div className="h-5 w-14 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-16 bg-gray-100 rounded-md border" />
          </div>
        ))}
      </div>
    </div>
  );
}
