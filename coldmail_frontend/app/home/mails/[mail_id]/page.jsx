"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MailDetail from "../Components/MailDetail";
import { getMailDetail } from "@/libapi/mail";
import MailDetailSkeleton from "../Components/MailDetailSkeleton";

export default function MailDetailPage() {
  const params = useParams(); // 👈 Correct usage in App Router
  const mail_id = params?.mail_id;

  const [mail, setMail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mail_id) return;

    getMailDetail(mail_id)
      .then(setMail)
      .catch((err) => console.error("Error loading mail:", err))
      .finally(() => setLoading(false));
  }, [mail_id]);

  if (loading) return <MailDetailSkeleton />;

  if (!mail) {
    return <div className="p-6 text-red-500">Mail not found.</div>;
  }

  return (
    <div className="p-6">
      <MailDetail mail={mail} />
    </div>
  );
}
