"use client";

import Link from "next/link";
import { formatDateTime } from "@/utils/formatDateTime";

function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export default function MailCard({ mail }) {
  const displayTime = mail.sent_at || mail.scheduled_for || "";

  return (
    <Link href={`/mails/${mail.mail_id}`} passHref>
      <div className="w-full p-4 mb-2 border rounded-xl shadow-sm transition overflow-hidden cursor-pointer hover:shadow-md hover:bg-blue-100">
        
        {/* Top line: to_email + status */}
        <div className="flex justify-between items-center text-sm text-gray-600 truncate mb-1">
          <span>{mail.to_email}</span>
          <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs">
            {mail.status}
          </span>
        </div>

        {/* Subject - Body - Time (one line) */}
        <div className="flex items-center justify-between text-gray-800 text-sm w-full">
          <div className="truncate w-240">
            <span className="font-semibold">{mail.subject}</span>
            <span className="mx-1 text-gray-500">-</span>
            <span>{stripHtml(mail.body)}</span>
          </div>
          <div className="ml-4 flex-shrink-0 text-xs text-gray-500 whitespace-nowrap">
            {formatDateTime(displayTime)}
          </div>
        </div>
      </div>
    </Link>
  );
}
