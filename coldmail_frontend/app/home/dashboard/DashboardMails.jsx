'use client';

import { useEffect, useRef, useState } from 'react';
import { getRecentMails, getUpcomingMails } from '@/libapi/dashboard.js';
import MailTableCard from './MailTableCard';
import Skeleton from "@/components/helper/Skeleton";
import useMailStore from './mailStore';

export default function DashboardMails() {
  const {
    recentMails,
    upcomingMails,
    setRecentMails,
    setUpcomingMails,
  } = useMailStore();

  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
  
    hasFetchedRef.current = true;
    setLoading(true);
  
    async function fetchData() {
      try {
        const [recent, upcoming] = await Promise.all([
          getRecentMails(),
          getUpcomingMails(),
        ]);
        setRecentMails(recent);
        setUpcomingMails(upcoming);
      } catch (error) {
        console.error('Failed to load mail data:', error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchData();
  }, []); // ✅ fixed: empty array ensures it's only called once on mount  

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="bg-white rounded-2xl shadow-md p-4 w-full">
          <Skeleton className="h-6 w-1/5 mb-6" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full mb-3" />
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 w-full">
          <Skeleton className="h-6 w-1/5 mb-4" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-full mb-3" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <MailTableCard title="Upcoming Scheduled Mails" data={upcomingMails} />
      <MailTableCard title="Recent Mails" data={recentMails} />
    </div>
  );
}
