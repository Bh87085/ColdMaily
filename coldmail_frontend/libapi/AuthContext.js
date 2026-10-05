"use client";

import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        // Call test API
        const testRes = await fetch("/api/test", {
          credentials: "include",
        });
        const testData = await testRes.json();
        console.log("✅ /api/test response:", testData);

        // Call verify API
        const res = await fetch("/auth/verify", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user); // backend should return { user: {...} }
          console.log("✅ Auth verified:", data.user);
        } else {
          setUser(null);
          console.warn("⚠️ /auth/verify failed:", res.status);
        }
      } catch (err) {
        console.error("❌ Error during verify:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, []);

  const logout = () => {
    setUser(null);
    // Optional: call /auth/logout to clear cookie
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook to use AuthContext in components
export function useAuth() {
  return useContext(AuthContext);
}
