// lib/mails.js
import { fetcher, postStopfollowup, putFetcher, postFetcher } from "./api";

// 🔄 Fetch all inbox-related data at once
export async function getAllMails() {
  const [mails, upcoming, recent] = await Promise.all([
    fetcher("/mails"),
    fetcher("/mails/scheduled-followups"),
    fetcher("/mails/sent-followups"),
  ]);

  return {
    mails,
    upcoming,
    recent,
  };
}

// 📩 Get all mails (inbox)
export async function getMails() {
  return await fetcher("/mails");
}

// 📅 Get scheduled follow-up mails
export async function getUpcomingMails() {
  return await fetcher("/mails/scheduled-followups");
}

// ⏳ Get sent follow-up mails
export async function getRecentMails() {
  return await fetcher("/mails/sent-followups");
}

export async function getMailDetail(mail_id){
  return fetcher(`/mails/${mail_id}`)
}

export async function updateFollowUp(followup_id, payload) {
  return putFetcher(`/mails/followup/${followup_id}`, payload);
}

export async function stopFollowups(mail_id){
  return postFetcher(`/mails/stop-followups/${mail_id}`)
}

