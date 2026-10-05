import { fetcher, postFetcher } from "@/libapi/api";

export async function getMailCount() {
  return fetcher("/dashboard/mail-count");
}

export async function getRecentMails() {
    return fetcher("/dashboard/recent-mails");
}

export async function getUpcomingMails() {
    return fetcher("/dashboard/upcoming-mails");
}

export async function getNotifications() {
    return fetcher("/notifications");
}

export async function markNotificationAsRead(id) {
    return fetcher(`/notifications/${id}/read`, { method: "PUT",});
  }

export async function markAllNotificationsAsRead() {
    return fetcher(`/notifications/mark-all-read`, {method: "PUT",});
  }

export async function logout() {
  return postFetcher('/logout');
}


  
  