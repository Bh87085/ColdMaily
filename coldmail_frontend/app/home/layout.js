"use client";
"use client";

import { getCurrentUser, getUserConsent, updateUserConsent } from "@/libapi/api";
import { Bell } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import NotificationsDropdown from "@/components/helper/NoticationDropdown";
import ProfileDropdown from "@/components/helper/ProfileDropdown";
import { getNotifications } from "@/libapi/dashboard";

const navItems = [
  { name: "Dashboard", path: "/home" },
  { name: "Mails", path: "/mails" },
  { name: "Campaign", path: "/campaign" },
  // { name: "Templates", path: "/templates" },
  // { name: "Scheduler", path: "/scheduler" },
];

export default function HomeLayout({ children }) {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showConsentPopup, setShowConsentPopup] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch user and consent status in parallel
        const [userData, consentData] = await Promise.all([
          getCurrentUser(),
          getUserConsent(),
        ]);

        setUser(userData);

        // Show popup if consent not confirmed
        if (!consentData.has_confirmed_consent) {
          setShowConsentPopup(true);
        }

        await fetchNotifications();
      } catch (error) {
        console.error("Initialization failed:", error);
        setUser(null);
      }
    };

    init();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      const unread = data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleDropdownClose = () => {
    setDropdownOpen(false);
    fetchNotifications();
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const handleConsentAgree = async () => {
    try {
      await updateUserConsent(true);
      setShowConsentPopup(false);
      if (user) setUser({ ...user, has_confirmed_consent: true });
    } catch (error) {
      console.error("Failed to update consent:", error);
    }
  };

  return (
    <>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <aside className="w-58 bg-[#0F172A] text-white fixed h-full px-4 py-4">
          <div className="flex items-center mb-8 ml-8 text-2xl font-bold">
            <img src="/coldmaily_logo.jpeg" className="w-9 h-6 mr-5 ml-2" />
            <span
              style={{
                background: "linear-gradient(90deg, #f4f5f7, #458cca)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ColdMaily
            </span>
          </div>

          <nav className="flex flex-col gap-2 pl-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className="hover:bg-white/10 px-4 py-2 rounded-md transition-colors text-base"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content area */}
        <div className="flex flex-col flex-1 ml-58">
          <header className="h-16 bg-[#0F172A] text-white flex items-center justify-end px-6 shadow-sm">
            <div className="flex items-center gap-6">
              {/* Notifications */}
              <div className="relative" ref={bellRef}>
                <Bell
                  className="w-5 h-5 cursor-pointer"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-[1px] rounded-full">
                    {unreadCount}
                  </span>
                )}
                {dropdownOpen && (
                  <NotificationsDropdown
                    notifications={notifications}
                    onClose={handleDropdownClose}
                  />
                )}
              </div>

              {/* Profile */}
              {user && <ProfileDropdown user={user} onLogout={handleLogout} />}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* ✅ Consent Popup */}
      {showConsentPopup && (
  <div className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-50 transition-all duration-300">
    <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-[90%] text-center border border-gray-100 animate-fadeIn">
      {/* Subtle gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <h2 className="text-2xl font-semibold mt-4 mb-4 text-gray-900">
        Responsible Emailing Policy
      </h2>

      <p className="text-gray-600 mb-8 text-sm leading-relaxed">
        ColdMaily is built for <span className="font-medium text-blue-600">ethical communication</span>.<br />
        Please confirm that you’ll only send emails to recipients who have
        <span className="font-medium text-gray-800"> consented </span> 
        to receive them.
      </p>

      <div className="flex justify-center">
        <button
          onClick={handleConsentAgree}
          className="px-6 py-2.5 rounded-lg text-white font-medium 
                     bg-gradient-to-r from-blue-600 to-indigo-600 
                     hover:from-blue-700 hover:to-indigo-700 
                     shadow-md hover:shadow-lg transition-all duration-200"
        >
          ✔ I Understand & Agree
        </button>
      </div>
    </div>
  </div>
)}


      {/* Toast */}
      <Toaster
        position="top-center"
        containerStyle={{
          top: "80%",
          transform: "translateY(-50%)",
        }}
      />
    </>
  );
}
