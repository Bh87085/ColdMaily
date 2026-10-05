// store/useMailStore.js
import { create } from "zustand";
import { getMails, getUpcomingMails, getRecentMails } from "@/libapi/mail";

export const useMailStore = create((set, get) => ({
  mails: [],
  upcoming: [],
  recent: [],
  loading: false,
  
  fetchTabData: async (tab) => {
    const state = get();
    
    // If this tab already has data, do not refetch
    if (state[tab]?.length > 0) return;

    set({ loading: true });
    try {
      let data = [];
      if (tab === "mails") data = await getMails();
      if (tab === "upcoming") data = await getUpcomingMails();
      if (tab === "recent") data = await getRecentMails();

      set({ [tab]: data || [] });
    } catch (err) {
      console.error(`Failed to fetch ${tab}:`, err);
    } finally {
      set({ loading: false });
    }
  }
}));
