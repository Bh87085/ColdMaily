// stores/mailStore.js
import { create } from 'zustand';

const useMailStore = create((set) => ({
  recentMails: [],
  upcomingMails: [],
  setRecentMails: (data) => set({ recentMails: data }),
  setUpcomingMails: (data) => set({ upcomingMails: data }),
}));

export default useMailStore;
