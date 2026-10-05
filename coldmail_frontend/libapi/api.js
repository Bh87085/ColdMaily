// lib/api.js
import toast from "react-hot-toast";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let isRefreshing = false;
let refreshPromise = null;

// 🔁 Refresh token only once even if multiple calls hit 401

async function refreshAccessToken() {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = fetch(`${API_BASE_URL}/refresh/token`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        isRefreshing = false;

        if (!res.ok) {
          // 🧠 Show toast
          toast.error("Session expired. Redirecting to login.", { duration: 5000 });

          // ⏳ Small delay to let user see the message
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // 🔁 Redirect
          window.location.href = "/";
          throw new Error("Session expired. Redirecting to login.");
        }

        return res.json();
      })
      .catch((err) => {
        isRefreshing = false;
        throw err;
      });
  }

  return refreshPromise;
}

// 📦 Centralized error formatting
async function formatError(res) {
  const errorData = await res.json().catch(() => ({}));
  const error = new Error(errorData.detail || "Request failed");
  error.status = res.status;
  return error;
}

// 🌐 Wrapper that auto-handles access token refresh
async function requestWithAutoRefresh(url, options) {
  let res = await fetch(url, options);

  if (res.status === 401) {
    await refreshAccessToken(); // 🔄 Refresh
    res = await fetch(url, options); // ♻️ Retry
  }

  if (!res.ok) throw await formatError(res);
  return res.json();
}

// ✅ GET
export async function fetcher(endpoint, options = {}) {
  return requestWithAutoRefresh(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
  });
}

// ✅ POST
export async function postFetcher(endpoint, payload) {
  const options = {
    method: "POST",
    credentials: "include",
    headers: {},
  };

  if (payload !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(payload);
  }

  return requestWithAutoRefresh(`${API_BASE_URL}${endpoint}`, options);
}

// Delete
export async function DeleteFetcher(endpoint, payload) {
  const options = {
    method: "DELETE",
    credentials: "include",
    headers: {},
  };

  if (payload !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(payload);
  }

  return requestWithAutoRefresh(`${API_BASE_URL}${endpoint}`, options);
}

// ✅ Multipart FormData POST (e.g., email attachments)
export async function sendMailFormData(formData) {
  const url = `${API_BASE_URL}/send-mail`;
  const options = {
    method: "POST",
    body: formData,
    credentials: "include", // ✅ sends cookies
    // ❌ DO NOT set headers for multipart/form-data
  };

  return requestWithAutoRefresh(url, options);
}

// ✅ PUT
export async function putFetcher(endpoint, payload) {
  const options = {
    method: "PUT",
    credentials: "include",
    headers: {},
  };

  if (payload !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(payload);
  }

  return requestWithAutoRefresh(`${API_BASE_URL}${endpoint}`, options);
}

// Google OAuth helpers
export function getGoogleLoginUrl() {
  return `${API_BASE_URL}/google/login`;
}

export function redirectToGoogleLogin() {
  window.location.href = getGoogleLoginUrl();
}

// Authenticated user info
export async function getCurrentUser() {
  return fetcher("/auth/me");
}

export async function unsubscribeUser(token) {
  return putFetcher(`/unsubscribe/${token}`);
}

export async function getUserConsent() {
  return fetcher("/user/consent");
}

export async function updateUserConsent(hasConsented) {
  return putFetcher(`/user/consent?consent=${hasConsented}`);
}

// Campaign API
export async function createCampaign(formData) {
  const url = `${API_BASE_URL}/campaign/create`;
  const options = {
    method: "POST",
    body: formData,
    credentials: "include", // ✅ sends cookies
    // ❌ DO NOT set headers for multipart/form-data
  };

  return requestWithAutoRefresh(url, options);
}

export async function getCampaignDetail(campaignID){
  return fetcher(`/campaign/${campaignID}`);
}

export async function launchCampaign(campaignID){
  return postFetcher(`/campaign/${campaignID}/launch`);
}

export async function deleteCampaign(campaignID){
  return DeleteFetcher(`/campaign/${campaignID}`);
}

export async function list_all_campaigns(){
  return fetcher(`/campaign`);
}
