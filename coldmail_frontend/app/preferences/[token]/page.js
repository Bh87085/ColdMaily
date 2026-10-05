'use client';
import { useState } from "react";
import { unsubscribeUser } from "@/libapi/api";
import * as React from "react";

export default function UnsubscribePage({ params: paramsPromise }) {
  const params = React.use(paramsPromise);
  const token = params.token;

  const [status, setStatus] = useState("pending"); // pending, success, error

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeUser(token);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f9fafb", // light gray background
        color: "#111827", // dark gray text (neutral for light bg)
        padding: "2rem",
        fontFamily: "Inter, Arial, sans-serif",
        position: "relative",
        zIndex: 10,
      }}
    >

      <h1 style={{ fontSize: "1.8rem", marginTop: "1rem", color: "#111111" }}>
          This email is sent via <span style={{ color: "#2563eb" }}>ColdMaily</span>
        </h1>

      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "2rem 3rem",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "700px",
          marginTop: "6rem",
        }}
      >

        {status === "pending" && (
          <>
            <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>
              Are you sure you want to unsubscribe from this user?
            </p>
            <button
              onClick={handleUnsubscribe}
              style={{
                padding: "0.7rem 1.4rem",
                backgroundColor: "#ef4444", // red-500
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
                transition: "background-color 0.2s ease-in-out, transform 0.1s ease-in-out",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Yes, unsubscribe me
            </button>
          </>
        )}

        {status === "success" && (
          <p style={{ color: "#16a34a", fontSize: "1.1rem" }}>
            ✅ You have been unsubscribed successfully.
          </p>
        )}

        {status === "error" && (
          <p style={{ color: "#dc2626", fontSize: "1.1rem" }}>
            ❌ Something went wrong. Please try again later.
          </p>
        )}
      </div>
    </div>
  );
}
