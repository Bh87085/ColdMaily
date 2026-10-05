"use client";

import { formatDateTime } from "@/utils/formatDateTime";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { updateFollowUp, stopFollowups } from "@/libapi/mail";

export default function MailDetail({ mail }) {
  const router = useRouter();
  const [followups, setFollowups] = useState(mail.followups || []);
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "sent":
        return "bg-green-50 text-green-700 border border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "scheduled":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "failed":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const handleEditClick = (index, message) => {
    setEditIndex(index);
    setEditText(message);
  };

  const handleSaveClick = async (fu, index) => {
    try {
      const res = await updateFollowUp(fu.followup_id, {
        follow_up_message: editText,
      });

      toast.success(res?.message || "Follow-up updated successfully");

      setFollowups((prev) =>
        prev.map((item, idx) =>
          idx === index ? { ...item, follow_up_message: editText } : item
        )
      );
      setEditIndex(null);
    } catch (error) {
      console.error("Failed to update follow-up message", error);
      toast.error(error?.message || "Failed to update follow-up");
    }
  };

  const handleStopFollowups = async () => {
    try {
      setLoading(true);
      await stopFollowups(mail.mail_id);
      toast.success("All scheduled follow-ups have been stopped.");
      setShowPopup(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to stop follow-ups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-1">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 mb-4 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Subject and Status */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold text-gray-900">{mail.subject}</h1>
        <span
          className={`text-sm px-3 py-1.5 rounded-full font-medium ${getStatusColor(
            mail.status
          )}`}
        >
          {mail.status}
        </span>
      </div>

      {/* To Email and Gmail Link */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-5 p-3 bg-gray-50 rounded-lg border">
        <div>
          <span className="font-semibold text-gray-800">To:</span>
          <span className="ml-2 text-gray-700">{mail.to_email}</span>
        </div>
        <div
          onClick={() => {
            if (mail?.message_id) {
              const gmailLink = `https://mail.google.com/mail/u/0/#all/${mail.message_id}`;
              window.open(gmailLink, "_blank");
            }
          }}
          className={`flex items-center gap-1 italic transition-colors cursor-pointer ${
            mail?.message_id
              ? "text-blue-600 hover:text-blue-800"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          View in Gmail <ExternalLink size={14} />
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <div className="mr-20">
          <span className="font-semibold text-gray-800">Mail Category:</span>{" "}
          <span className="text-blue-600 font-medium">
            {mail.mail_category || "N/A"}
          </span>
        </div>
        <div className="mr-20">
          <span className="font-semibold text-gray-800">
            Follow-up Strategy:
          </span>{" "}
          <span className="text-purple-600 font-medium">
            {mail.follow_up_strategy || "N/A"}
          </span>
        </div>
        <div className="mr-10">
          <span className="font-semibold text-gray-800">Follow-ups:</span>{" "}
          <span className="text-green-600 font-semibold">
            {mail.cur_follow_up} / {mail.no_of_follow_up}
          </span>
        </div>
        <div className="ml-auto">
          <span className="font-semibold text-gray-800">Sent:</span>{" "}
          <span className="text-orange-600 font-medium">
            {formatDateTime(mail.sent_at)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6 hover:shadow-md transition-shadow duration-200">
        <div className="text-md font-semibold mb-3 text-gray-800 border-b border-gray-100 pb-2">
          Message
        </div>
        <div
          className="text-sm text-gray-800 whitespace-pre-line leading-relaxed"
          dangerouslySetInnerHTML={{ __html: mail.body }}
        />

        {/* Attachments */}
        {mail.attachments && mail.attachments.length > 0 && (
          <div className="mt-5 flex flex-col gap-3">
            {mail.attachments.map((att, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg border border-gray-200 p-2 w-auto max-w-xs flex items-center justify-between"
              >
                <span className="truncate text-gray-800">{att.filename}</span>
                <span className="text-gray-700 text-xs ml-2">
                  {formatFileSize(att.size)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Follow-ups */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="text-md font-semibold text-gray-800 flex items-center gap-2">
            Follow-Ups
            {followups.length > 0 && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {followups.length}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowPopup(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xm font-medium transition-all duration-200"
          >
            Stop Follow-ups
          </button>
        </div>

        {followups.length === 0 ? (
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 text-center">
            No follow-ups scheduled
          </div>
        ) : (
          <ul className="space-y-3">
            {followups.map((fu, idx) => (
              <li
                key={fu.followup_id}
                className="border border-gray-200 bg-white rounded-lg shadow-sm p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    Follow-up
                  </span>

                  <div className="flex items-center gap-4">
                    {editIndex === idx ? (
                      <>
                        <button
                          onClick={() => handleSaveClick(fu, idx)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-medium cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditText(fu.follow_up_message);
                            setEditIndex(null);
                          }}
                          className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-medium cursor-pointer"
                        >
                          Discard
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-gray-500 font-medium">
                          {fu.sent_at && fu.sent_at !== "None"
                            ? `${formatDateTime(fu.sent_at)}`
                            : fu.scheduled_for
                            ? `${formatDateTime(fu.scheduled_for)}`
                            : "Not scheduled"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                            fu.status
                          )}`}
                        >
                          {fu.status}
                        </span>

                        {fu.status.toLowerCase() == "scheduled" && (
                          <button
                            onClick={() =>
                              handleEditClick(idx, fu.follow_up_message)
                            }
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {editIndex === idx ? (
                  <textarea
                    className="w-full text-sm text-gray-700 border rounded-lg p-2"
                    rows={3}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <div className="text-sm text-gray-700 whitespace-pre-line mb-3 bg-gray-50 p-3 rounded-lg border">
                    {fu.follow_up_message}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirmation Popup */}
      {showPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999]">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Stop All Follow-ups?
      </h3>
      <p className="text-sm text-gray-600 mb-5 leading-relaxed">
        This will stop all the scheduled follow-ups for this mail and cannot be reschedule.
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowPopup(false)}
          className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleStopFollowups}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-all duration-200 disabled:opacity-70"
        >
          {loading ? "Stopping..." : "Continue"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

function formatFileSize(sizeInBytes) {
  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
