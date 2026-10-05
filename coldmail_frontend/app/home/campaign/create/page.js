"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/helper/RichTextEditor";
import { Link2, Paperclip, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { createCampaign } from "@/libapi/api";
import {
  FaRocket,
  FaEnvelope,
  FaUpload,
  FaClock,
  FaCheckCircle,
  FaInfoCircle,
  FaChevronLeft,
  FaFileAlt,
  FaUsers,
  FaBolt,
  FaMagic,
} from "react-icons/fa";

export default function CreateCampaignPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "",
    subject: "",
    body: "",
    no_of_follow_up: 3,
    follow_up_strategy: "standard",
    is_attachment: false,
  });

  const [csvFile,          setCsvFile]          = useState(null);
  const [attachments,      setAttachments]      = useState([]);
  const [uploadingFiles,   setUploadingFiles]   = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [step,             setStep]             = useState(1);
  const [showFormatting,   setShowFormatting]   = useState(true);
  const richEditorRef = useRef(null);

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
  


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleCsvChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setCsvFile(file);
  };

  const handleCreate = async () => {
    if (!csvFile) {
      alert("CSV file is required");
      return;
    }

    setLoading(true);
    try {
      const count = parseInt(form.no_of_follow_up || "0", 10);
      // let delays = [];
  
      // if (form.follow_up_strategy === "standard") {
      //   const standardDelays = [2, 5, 8, 12, 16, 20];
      //   delays = standardDelays.slice(0, count);
      // } else if (form.follow_up_strategy.startsWith("every_")) {
      //   const interval = parseInt(form.follow_up_strategy.split("_")[1], 10);
      //   delays = Array.from({ length: count }, (_, i) => interval * (i + 1));
      // }

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("category", form.category || "default");
      fd.append("subject", form.subject);
      fd.append("body", form.body);
      fd.append("no_of_follow_up", String(form.no_of_follow_up));
      // fd.append("follow_up_delays", JSON.stringify(delays));
      fd.append("follow_up_strategy", form.follow_up_strategy);
      fd.append("is_attachment", attachments.length > 0 ? "true" : "false");
      attachments.forEach((file) => fd.append("attachments", file));
      fd.append("file", csvFile);

      const data = await createCampaign(fd);

      router.push(`/campaign/${data.campaign_id}`);

    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const strategyOptions = [
    { value: "standard", label: "Standard (2, 5, 8 days)", desc: "Recommended for most campaigns" },
    { value: "every_2", label: "Aggressive (Every 2 days)", desc: "Fast-paced follow-ups" },
    { value: "every_3", label: "Moderate (Every 3 days)", desc: "Balanced approach" },
    { value: "every_5", label: "Patient (Every 5 days)", desc: "Give more breathing room" },
  ];

  const categories = [
    { value: "sales", label: "Sales Outreach", icon: "💼", color: "blue" },
    { value: "jobs", label: "Job / Referral", icon: "👔", color: "green" },
    { value: "freelance", label: "Freelancer Outreach", icon: "💻", color: "purple" },
    { value: "networking", label: "Networking", icon: "🤝", color: "orange" },
    { value: "investor", label: "Investor Outreach", icon: "💰", color: "pink" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <FaChevronLeft className="text-sm" />
            <span className="font-medium">Back to Campaigns</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-extrabold text-gray-900" >Create New Campaign </h1>
                <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium">
                  AI-Powered
                </div>
              </div>
              <p className="text-gray-600 text-lg">
                Upload leads, craft your message, and let AI handle the follow-ups automatically.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDE - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Campaign Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card
                title="Campaign Details"
                icon={<FaFileAlt className="text-blue-500" />}
                description="Give your campaign a name and select the category"
              >
                <Input
                  label="Campaign Name"
                  name="name"
                  placeholder="e.g., SaaS Founders Outreach Q1 2025"
                  value={form.name}
                  onChange={handleChange}
                  icon={<FaRocket />}
                  required
                />

                <Select
                  label="Campaign Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  icon={<FaFileAlt />}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </Select>
              </Card>
            </motion.div>

            {/* Email Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card
                title="Email Content"
                icon={<FaEnvelope className="text-purple-500" />}
                description="Craft your message with personalization tags"
              >
                <Input
                  label="Subject Line"
                  name="subject"
                  placeholder="Quick intro, {{first_name}}"
                  value={form.subject}
                  onChange={handleChange}
                  icon={<FaEnvelope />}
                  required
                />
{/* 
                <Textarea
                  label="Email Body"
                  name="body"
                  rows={10}
                  placeholder="Hi {{first_name}},&#10;&#10;I came across {{company}} and was impressed by your work in [industry].&#10;&#10;I wanted to reach out because..."
                  value={form.body}
                  onChange={handleChange}
                  required
                /> */}

                {/* Email Body */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Body <span className="text-red-500">*</span>
                  </label>

                  {/* Editor + mini action bar (same concept as compose window) */}
                  <RichTextEditor
                    ref={richEditorRef}
                    value={form.body}
                    onChange={handleChange}
                    name="body"
                    placeholder={`Hi {{first_name}},\n\nI came across {{company}} and was impressed by your work.\n\nI wanted to reach out because...`}
                    minHeight="280px"
                    showToolbar={showFormatting}
                    footerSlot={
                      <div className="flex items-center gap-2 px-3 py-2">
                        <button
                          type="button"
                          title="Formatting options"
                          onMouseDown={(e) => { e.preventDefault(); setShowFormatting((v) => !v); }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                            showFormatting
                              ? "bg-[#d3e3fd] text-[#1a73e8]"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}>
                          Aa
                        </button>
                        <label htmlFor="campaign-attachment" title="Attach file"
                          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
                          <Paperclip className="h-4 w-4" />
                          <input type="file" id="campaign-attachment" className="hidden" onChange={handleFileChange} />
                        </label>
                        <button
                          type="button"
                          title="Insert link"
                          onMouseDown={(e) => { e.preventDefault(); richEditorRef.current?.openLink(); }}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
                          <Link2 className="h-4 w-4" />
                        </button>
                      </div>
                    }
                  >
                    {/* Attachment previews — above toolbar */}
                    {attachments.length > 0 && (
                      <div className="px-4 pt-1 pb-2 space-y-2">
                        {attachments.map((file, idx) => (
                          <div key={idx} className="p-2 border rounded bg-gray-100 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 truncate max-w-[80%]">
                              {uploadingFiles.includes(file.name) ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                  <span className="text-gray-500 truncate">{file.name}</span>
                                </>
                              ) : (
                                <a href={URL.createObjectURL(file)} download={file.name}
                                  className="text-blue-600 hover:underline truncate" title={file.name}
                                  target="_blank" rel="noopener noreferrer">
                                  {file.name} ({formatFileSize(file.size)})
                                </a>
                              )}
                            </div>
                            <button onClick={() => handleRemoveFile(idx)} className="text-gray-500 hover:text-red-600 p-1">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </RichTextEditor>
                </div>


                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                      Use personalization tags like <code className="px-1.5 py-0.5 bg-white rounded text-amber-900 font-mono">{'{{first_name}}'}</code> based on your CSV columns.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT SIDE - 1 column */}
          <div className="space-y-6">
            
            {/* CSV Upload */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card
                title="Upload Leads"
                icon={<FaUsers className="text-green-500" />}
                description="Upload your CSV file with lead information"
              >
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className={`block w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                      csvFile
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <div className="text-center">
                      {csvFile ? (
                        <>
                          <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-green-700 mb-1">
                            {csvFile.name}
                          </p>
                          <p className="text-xs text-green-600">File uploaded successfully</p>
                        </>
                      ) : (
                        <>
                          <FaUpload className="text-4xl text-gray-400 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            Click to upload CSV
                          </p>
                          <p className="text-xs text-gray-500">or drag and drop</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FaInfoCircle className="text-blue-500" />
                    CSV Column Requirements
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div>
                        <code className="text-gray-900 font-mono font-semibold">email</code>
                        <span className="text-red-600 ml-1">(required)</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 pl-3.5">
                      Other columns depend on your message personalization tags (e.g., first_name, company, role, etc.)
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Follow-up Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card
                title="Follow-up Settings"
                icon={<FaClock className="text-orange-500" />}
                description="Configure automated follow-up strategy"
              >
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Number of Follow-ups (Max 8)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, no_of_follow_up: num }))}
                        className={`py-3 rounded-xl font-semibold transition-all duration-300 ${
                          form.no_of_follow_up === num
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Follow-up Strategy
                  </label>
                  <div className="space-y-2">
                    {strategyOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, follow_up_strategy: option.value }))}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          form.follow_up_strategy === option.value
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                          </div>
                          {form.follow_up_strategy === option.value && (
                            <FaCheckCircle className="text-blue-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card>
                <button
                  onClick={handleCreate}
                  disabled={loading || !form.name || !form.subject || !form.body || !csvFile}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <FaBolt />
                      Create & Review Campaign
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-2">
                  <FaInfoCircle className="text-blue-500" />
                  You'll review everything before sending
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Enhanced UI Components ---------------- */

function Card({ title, icon, description, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl transition-shadow duration-300">
      {title && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {icon && <div className="text-xl">{icon}</div>}
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function Input({ label, icon, required, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
        />
      </div>
    </div>
  );
}

function Textarea({ label, required, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        {...props}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
      />
    </div>
  );
}

function Select({ label, icon, required, children, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <select
          {...props}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer`}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}