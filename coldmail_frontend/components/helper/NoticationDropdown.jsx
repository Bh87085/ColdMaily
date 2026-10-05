"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/utils/formatDateTime";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/libapi/dashboard";

export default function NotificationsDropdown({ notifications = [], onClose }) {
  const dropdownRef = useRef();
  const router = useRouter();
  const [localNotifications, setLocalNotifications] = useState([]);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSingleMarkAsRead = async (id, isRead) => {
    if (isRead) return; // Skip if already read

    setLocalNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, is_read: true } : notif
      )
    );

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read if needed
    await handleSingleMarkAsRead(notif.id, notif.is_read);

    // Navigate if link exists
    if (notif.link) {
      router.push(notif.link); // ✅ Client-side navigation, no layout reload
    }
  };

  const handleMarkAllAsRead = async () => {
    setLocalNotifications((prev) =>
      prev.map((notif) => ({ ...notif, is_read: true }))
    );
    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <div
      className="absolute right-0 mt-2 w-100 bg-white text-black shadow-lg rounded-lg z-50"
      ref={dropdownRef}
    >
      {/* Header */}
      <div className="p-4 border-b bg-blue-100 rounded-t-lg flex justify-between items-center font-semibold">
        <span>Notifications</span>
        <button
          className="text-xs text-blue-600 cursor-pointer"
          onClick={handleMarkAllAsRead}
        >
          Mark all as read
        </button>
      </div>

      <ul className="max-h-80 overflow-y-auto divide-y">
        {localNotifications.length === 0 ? (
          <li className="p-4 text-gray-500 text-sm">No notifications</li>
        ) : (
          localNotifications.map((notif) => (
            <li
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-2 text-sm cursor-pointer transition-colors ${
                notif.is_read ? "bg-white" : "bg-blue-50"
              }`}
            >
              <span className="font-medium">{notif.message}</span>
              <div className="text-xs text-gray-500 text-right">
                {formatDateTime(notif.created_at)}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
