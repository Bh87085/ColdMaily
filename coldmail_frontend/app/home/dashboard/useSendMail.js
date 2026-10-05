"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendMailFormData } from "@/libapi/api";
import { toast } from "react-hot-toast";

// Exported map for dropdown use
export const categoryMap = {
  job_followup: "Job Application",
  freelancer_outreach: "Freelancer Outreach",
  referral_request: "Referral Request",
  sales_outreach: "Sales Outreach",
  b2b_partnership: "B2B Partnership Inquiry",
  service_offering: "Service Offering",
  portfolio_sharing: "Portfolio Sharing",
  cold_investor_email: "Email to Investor",
  funding_followup: "Startup Funding",
  angel_outreach: "Angel Investor Outreach",
  mentorship_request: "Mentorship Request",
  general_networking: "General Networking",
  podcast_invite: "Podcast Guest Invite",
  influencer_collab: "Influencer Collaboration",
  event_invite: "Event Invitation",
  feedback_request: "Feedback Request",
};

// // Exported strategy map
// export const strategyMap = {
//   standard: "Standard (2, 5, 8, 12...)",
//   every_1: "Every 1 day",
//   every_2: "Every 2 days",
//   every_3: "Every 3 days",
//   every_4: "Every 4 days",
//   every_5: "Every 5 days",
//   every_6: "Every 6 days",
//   every_7: "Every 7 days",
// };

export function useSendMail(onSuccessClose = null) {
  const [form, setForm] = useState({
    to_email: "",
    subject: "",
    body: "",
    no_of_follow_up: null,
    follow_up_strategy: "",
    mail_category: "",
    custom_mail_category: "",
    is_attachment: false,
  });

  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check limit for follow-ups
    if (name === "no_of_follow_up") {
      const numValue = parseInt(value || "0", 10);
      if (numValue > 10) {
        toast.error("Cannot exceed more than 10 follow-ups");
        return; // Stop update
      }
      setForm((prev) => ({ ...prev, [name]: numValue }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setAttachments((prev) => [...prev, ...files]);
    setForm((prev) => ({ ...prev, is_attachment: true }));
  };

  const handleRemoveFile = (indexToRemove) => {
    const updated = attachments.filter((_, i) => i !== indexToRemove);
    setAttachments(updated);
    setForm((prev) => ({ ...prev, is_attachment: updated.length > 0 }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      const count = parseInt(form.no_of_follow_up || "0", 10);
      // let delays = [];

      // if (form.follow_up_strategy === "standard") {
      //   const standardDelays = [2, 5, 8, 12, 16, 20, 24, 30];
      //   delays = standardDelays.slice(0, count);
      // } else if (form.follow_up_strategy.startsWith("every_")) {
      //   const interval = parseInt(form.follow_up_strategy.split("_")[1], 10);
      //   delays = Array.from({ length: count }, (_, i) => interval * (i + 1));
      // }

      const category =
        form.mail_category === "custom"
          ? form.custom_mail_category
          : categoryMap[form.mail_category] || "General";

      // const strategy = strategyMap[form.follow_up_strategy] || "None";

      const formData = new FormData();
      formData.append("to_email", form.to_email);
      formData.append("subject", form.subject);
      formData.append("body", form.body);
      formData.append("no_of_follow_up", String(count));
      formData.append("follow_up_strategy", form.follow_up_strategy);
      // formData.append("follow_up_delays", JSON.stringify(delays));
      formData.append("category", category);
      formData.append("is_attachment", form.is_attachment ? "true" : "false");

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      await sendMailFormData(formData);

      toast.success("Email sent successfully!");
      router.refresh();
      if (onSuccessClose) onSuccessClose();
    } catch (error) {
      console.error("Send mail failed:", error);
      toast.error("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    attachments,
    loading,
    uploadingFiles,
    handleChange,
    handleSend,
    handleFileChange,
    handleRemoveFile,
    formatFileSize,
  };
}
