import React from "react";
import MailCard from "./MailCard";
import Skeleton from "@/components/helper/Skeleton";


export default function MailList({ mails = [], loading = false, currentTab }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-[70px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!mails.length) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No mails found for this tab.
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {mails.map((mail) => (
        <MailCard key={`${mail.mail_id}-${mail.body}`} mail={mail} />
      ))}
    </div>
  );
}
