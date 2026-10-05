import { logout } from "@/libapi/dashboard";

export const handleLogout = async () => {
  try {
    // 🔁 Call backend to clear HTTP-only cookies
    await logout();

    // 🧹 Clear client-side storage
    localStorage.clear();
    sessionStorage.clear();

    // ❌ Clear non-HttpOnly cookies (frontend-set cookies, if any)
    document.cookie
      .split(";")
      .forEach(
        (c) =>
          (document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"))
      );

    // 🔀 Redirect to login page
    window.location.href = "/";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
