"use client";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/utils/formatDateTime";

export default function MailTableCard({ title, data }) {
  const router = useRouter();

  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-sky-100 text-sky-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRowClick = (id) => {
    router.push(`/mails/${id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-full">
      <h2 className="text-xl font-semibold text-black mb-4">{title}</h2>
      <div className="grid grid-cols-4 font-semibold font-medium text-sm border-b pb-2 text-black border-gray-300 gap-15">
        <span>Subject</span>
        <span>Send To</span>
        <span>Status</span>
        <span>Time</span>
      </div>
      {data.length === 0 ? (
        <div className="text-gray-600 mt-4 text-sm">No data available.</div>
      ) : (
        data.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-4 text-sm py-2 border-b border-gray-200 gap-15 text-black cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleRowClick(item.mail_id)} // <- Assuming item.id is the mail ID
          >
            <span>{item.subject}</span>
            <span>{item.email}</span>
            <span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  item.status
                )}`}
              >
                {item.status}
              </span>
            </span>
            <span>{formatDateTime(item.time)}</span>
          </div>
        ))
      )}
    </div>
  );
}
