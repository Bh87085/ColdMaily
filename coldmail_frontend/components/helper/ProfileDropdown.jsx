"use client";

import { useState, useRef, useEffect } from "react";
import { UserCircle } from "lucide-react";
import Image from "next/image";
import LogoutConfirmDialog from "@/components/helper/LogoutConfirmDialog";

export default function ProfileDropdown({ user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-8 h-8 flex items-center justify-center rounded-full overflow-hidden"
        >
          {user?.picture ? (
            <Image
              src={user.picture}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full cursor-pointer"
            />
          ) : (
            <UserCircle className="w-8 h-8 cursor-pointer" />
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-xl shadow-lg border z-50">
            <div className="p-4 border-b">
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
            <button
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100 rounded-b-xl cursor-pointer"
              onClick={() => {
                setDropdownOpen(false); // Close dropdown
                setShowLogoutModal(true); // Open modal
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* ✅ Modal rendered outside dropdown */}
      <LogoutConfirmDialog
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
      />
    </>
  );
}
