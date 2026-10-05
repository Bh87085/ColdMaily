"use client";

import { useEffect, useState } from "react";
import MailTab from "./Components/MailTab";
import MailList from "./Components/MailList";
import { useMailStore } from "./useMailStore";

export default function MyMailsPage() {
  const [tab, setTab] = useState("mails");
  const { mails, upcoming, recent, fetchTabData, loading } = useMailStore();

  // Fetch data only for the active tab
  useEffect(() => {
    fetchTabData(tab);
  }, [tab, fetchTabData]);

  const tabMap = { mails, upcoming, recent };

  return (
    <div className="w-full px-4">
      <MailTab currentTab={tab} setCurrentTab={setTab} />
      <div className="mt-4">
        <MailList mails={tabMap[tab]} loading={loading} />
      </div>
    </div>
  );
}
