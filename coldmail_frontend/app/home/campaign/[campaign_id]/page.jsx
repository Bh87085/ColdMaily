"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaChevronLeft,
  FaPlay,
  FaPause,
  FaStop,
  FaEdit,
  FaEllipsisH,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaEnvelope,
  FaUsers,
  FaBolt,
  FaEye,
  FaReply,
  FaTimes,
  FaChartLine,
} from "react-icons/fa";

import { getCampaignDetail, launchCampaign } from "@/libapi/api";

export default function CampaignDetailPage() {
  const { campaign_id } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCampaign = async () => {
    try {
      setError(null);
      const res = await getCampaignDetail(campaign_id);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load campaign");
    }
  };
  
  useEffect(() => {
    if (!campaign_id) return;
  
    setLoading(true);
    fetchCampaign().finally(() => setLoading(false));
  }, [campaign_id]);
  

  const handleLaunch = async () => {
    if (actionLoading) return; // ⛔ hard guard
    
    try {
      setActionLoading(true);
      await launchCampaign(campaign_id);
  
      // ✅ refetch same page data
      await fetchCampaign();
    } catch (err) {
      alert(err.message || "Failed to launch campaign");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-2xl text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Campaign</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { state, permissions, campaign, email, runtime, validation, meta } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Back Navigation */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors font-medium"
        >
          <FaChevronLeft className="text-sm" />
          Back to Campaigns
        </motion.button>

        {/* Header Section */}
        <CampaignHeader
          name={campaign.name}
          state={state}
          permissions={permissions}
          meta={meta}
          campaign={campaign}
          onLaunch={handleLaunch}
          actionLoading={actionLoading}
        />

        {/* Validation Panel (Draft Only) */}
        {state === "draft" && validation && (
          <ValidationPanel validation={validation} />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <CampaignMetrics campaign={campaign} runtime={runtime} state={state} />
            <EmailPreview email={email} />
          </div>

          {/* Right Column - Sidebar (1/3) */}
          <div className="space-y-6">
            <CampaignOverview campaign={campaign} meta={meta} />
            {state !== "draft" && runtime && (
              <RuntimeInfo runtime={runtime} campaign={campaign} state={state} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== HEADER COMPONENT ===================== */

function CampaignHeader({ name, state, permissions, meta, campaign, onLaunch, actionLoading}) {
  const [showMenu, setShowMenu] = useState(false);

  const stateConfig = {
    draft: { bg: "bg-gray-100", text: "text-gray-700", icon: <FaEdit /> },
    running: { bg: "bg-green-100", text: "text-green-700", icon: <FaPlay /> },
    paused: { bg: "bg-yellow-100", text: "text-yellow-700", icon: <FaPause /> },
    completed: { bg: "bg-blue-100", text: "text-blue-700", icon: <FaCheckCircle /> },
    stopped: { bg: "bg-red-100", text: "text-red-700", icon: <FaStop /> },
  };

  const config = stateConfig[state] || stateConfig.draft;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Left: Campaign Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
              {config.icon}
              {state.charAt(0).toUpperCase() + state.slice(1)}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            {/* <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              {campaign.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <FaUsers className="text-gray-400" />
              {campaign.recipients_count} recipients
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <FaBolt className="text-gray-400" />
              {campaign.no_of_follow_up} follow-ups
            </span> */}
            {meta?.created_at && (
              <>
                {/* <span>•</span> */}
                <span className="flex items-center gap-1.5">
                  <FaClock className="text-gray-400" />
                  Created at {new Date(meta.created_at).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <ActionButtons permissions={permissions} state={state} onLaunch={onLaunch} actionLoading={actionLoading}/>
      </div>
    </motion.div>
  );
}

/* ===================== ACTION BUTTONS ===================== */

function ActionButtons({ permissions, state, onLaunch, actionLoading }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {permissions?.can_pause && state === "running" && (
        <button className="px-4 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all font-medium flex items-center gap-2">
          <FaPause className="text-sm" />
          Pause
        </button>
      )}

      {permissions?.can_resume && state === "paused" && (
        <button className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium flex items-center gap-2">
          <FaPlay className="text-sm" />
          Resume
        </button>
      )}

      {permissions?.can_launch && state === "draft" && (
        <button
          onClick={onLaunch}
          disabled={actionLoading}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600
                    text-white rounded-lg transition-all font-semibold
                    flex items-center gap-2 shadow-lg
                    disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {actionLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Launching…
            </>
          ) : (
            <>
              <FaPlay className="text-sm" />
              Launch Campaign
            </>
          )}
        </button>
      )}


      {/* {permissions?.can_edit && (
        <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium flex items-center gap-2">
          <FaEdit className="text-sm" />
          Edit
        </button>
      )} */}

      {permissions?.can_stop && (
        <button className="px-4 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-medium flex items-center gap-2">
          <FaStop className="text-sm" />
          Stop
        </button>
      )}

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
        >
          <FaEllipsisH />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
            {/* <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
              View Analytics
            </button>
            <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
              Duplicate
            </button> */}
            <button className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 transition-colors">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== VALIDATION PANEL ===================== */

function ValidationPanel({ validation }) {
  if (!validation?.issues || validation.issues.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-6"
    >
      <div className="flex items-start gap-4">
        <FaExclamationTriangle className="text-2xl text-amber-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-amber-900 mb-2">
            Campaign Not Ready
          </h3>
          <p className="text-sm text-amber-800 mb-4">
            Please resolve the following issues before launching:
          </p>
          <ul className="space-y-2">
            {validation.issues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

/* ===================== CAMPAIGN METRICS ===================== */

function CampaignMetrics({ campaign, runtime, state }) {
  const metrics = [
    {
      label: "Total Recipients",
      value: campaign.recipients_count || 0,
      icon: <FaUsers className="text-blue-500" />,
      color: "blue",
    },
    {
      label: "Emails Sent",
      value: runtime?.sent_count || 0,
      icon: <FaEnvelope className="text-green-500" />,
      color: "green",
    },
    {
      label: "Open Rate",
      value: runtime?.opened_count ? `${runtime.opened_count}%` : "0%",
      icon: <FaEye className="text-purple-500" />,
      color: "purple",
    },
    {
      label: "Reply Rate",
      value: runtime?.replied_count ? `${runtime.replied_count}%` : "0%",
      icon: <FaReply className="text-orange-500" />,
      color: "orange",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md border border-gray-200/60 p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 bg-${metric.color}-50 rounded-lg`}>
                {metric.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ===================== EMAIL PREVIEW ===================== */

function EmailPreview({ email }) {
  const [activeTab, setActiveTab] = useState("preview");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden"
    >
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaEnvelope className="text-blue-500" />
            Email Content
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "preview"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab("template")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "template"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Template
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Subject Line {activeTab === "template" ? "(Template)" : "(Preview)"}
          </label>
          <p className="text-base font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
          {activeTab === "preview" ? email.subject_text_preview : email.subject_template}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Email Body {activeTab === "template" ? "(Template)" : "(Preview)"}
          </label>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
              {activeTab === "preview" ? email.body_text_preview : email.body_template}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ===================== CAMPAIGN OVERVIEW SIDEBAR ===================== */

function CampaignOverview({ campaign, meta }) {
  const details = [
    { label: "Recipients", value: campaign.recipients_count, icon: <FaUsers /> },
    { label: "Follow-ups", value: campaign.no_of_follow_up, icon: <FaBolt /> },
    { label: "Interval", value: campaign.follow_up_strategy, icon: <FaChartLine /> },
    { label: "Category", value: campaign.category, icon: <FaEnvelope /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">Campaign Details</h3>
      
      <div className="space-y-4">
        {details.map((detail, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <div className="text-gray-400">{detail.icon}</div>
              <span className="text-sm font-medium text-gray-600">{detail.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{detail.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ===================== RUNTIME INFO SIDEBAR ===================== */

function RuntimeInfo({ runtime, campaign, state }) {
  if (!runtime) return null;

  const progress = campaign.recipients_count > 0 ? ((runtime.sent_count / campaign.recipients_count) * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaClock className="text-blue-500" />
        Campaign Progress
      </h3>

      <div className="space-y-4">
        {runtime.started_at && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Started
            </p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(runtime.started_at).toLocaleString()}
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Progress
            </p>
            <p className="text-sm font-bold text-gray-900">{progress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {runtime.sent_count} of {campaign.recipients_count} emails sent
          </p>
        </div>

        {runtime.eta && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Estimated Completion
            </p>
            <p className="text-sm font-medium text-gray-900">{runtime.eta}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}