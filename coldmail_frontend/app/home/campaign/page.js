"use client";

import React, { useMemo, useState , useEffect, useRef} from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { list_all_campaigns, deleteCampaign } from "@/libapi/api"; 
import { FaPlus, FaSearch, FaFileImport, FaEllipsisV, FaPlay, FaPause, FaEdit, FaChartBar, FaCopy, FaTrash, FaEnvelope,  FaEye,  FaReply,  FaChevronLeft, FaChevronRight,  FaRocket} from "react-icons/fa";
import {
  Dialog, DialogContent,DialogHeader,DialogTitle,DialogFooter,DialogClose,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CampaignListPage() {
  // Mock campaigns data

  const router = useRouter();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState(null);
  const PAGE_SIZE = 8;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true);
  
        const data = await list_all_campaigns();
        
        // Debugging: Check the browser console to see exact API keys
        console.log("API Response:", data); 
  
        const formatted = data.map((c) => ({
          id: c.campaign_id,
          name: c.name,
          status: c.status,
          // Added '|| 0' to ensure numbers are never undefined/null
          recipients: c.total_recipients || 0, 
          sent: c.sent_count || 0,
          pending: c.pending_count || 0,
          openRate: c.open_rate || 0,
          replyRate: c.reply_rate || 0,
          // UNCOMMENTED and added fallback
          bounced: c.bounced_count || 0, 
          nextFollowUp: c.next_action || "-",
          throttle: c.throttle || 0,
          createdAt: c.created_at,
        }));
  
        setCampaigns(formatted);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
        setError("Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    }
  
    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;
  
    try {
      setIsDeleting(true);
  
      await deleteCampaign(selectedCampaign.id);
  
      setCampaigns((prev) =>
        prev.filter((c) => c.id !== selectedCampaign.id)
      );
  
      setDeleteDialogOpen(false);
      setSelectedCampaign(null);
  
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  

  const statusCounts = useMemo(() => {
    const counts = { all: campaigns.length, draft: 0, running: 0, completed: 0, failed: 0 };
    campaigns.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return counts;
  }, [campaigns]);

  const filtered = useMemo(() => {
    let list = campaigns.slice();
    if (statusFilter !== "all") list = list.filter((c) => c.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sortBy === "createdAt") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "openRate") return b.openRate - a.openRate;
      if (sortBy === "replyRate") return b.replyRate - a.replyRate;
      return 0;
    });
    return list;
  }, [campaigns, statusFilter, query, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900">Campaigns</h1>
                <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium">
                  {campaigns.length} Total
                </div>
              </div>
              <p className="text-gray-600">Manage your campaigns — schedule, monitor, and optimize for better results.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2">
                <FaFileImport className="text-sm" />
                Import CSV
              </button>
              <button 
              onClick={() => router.push("/campaign/create")}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2">
                <FaPlus className="text-sm" />
                New Campaign
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard 
            icon={<FaRocket className="text-blue-500" />}
            title="Total Campaigns" 
            value={campaigns.length}
            gradient="from-blue-50 to-blue-100"
          />
          <StatCard 
            icon={<FaPlay className="text-green-500" />}
            title="Running" 
            value={statusCounts.running}
            gradient="from-green-50 to-green-100"
          />
          <StatCard 
            icon={<FaEdit className="text-yellow-500" />}
            title="Draft" 
            value={statusCounts.draft}
            gradient="from-yellow-50 to-yellow-100"
          />
          <StatCard 
            icon={<FaEnvelope className="text-purple-500" />}
            title="Emails Sent" 
            value={campaigns.reduce((s, c) => s + c.sent, 0).toLocaleString()}
            gradient="from-purple-50 to-purple-100"
          />
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            {/* Search Bar */}
            <div className="relative w-full lg:w-96">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search campaigns..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "all", label: "All", count: statusCounts.all },
                { key: "running", label: "Running", count: statusCounts.running },
                { key: "draft", label: "Draft", count: statusCounts.draft },
                { key: "completed", label: "Completed", count: statusCounts.completed }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => { setStatusFilter(filter.key); setPage(1); }}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                    statusFilter === filter.key
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="createdAt">Sort: Newest</option>
              <option value="openRate">Sort: Open Rate</option>
              <option value="replyRate">Sort: Reply Rate</option>
            </select>
          </div>
        </motion.div>

        {/* Campaigns List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading campaigns...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              {error}
            </div>
          ) : filtered.length === 0 ? (

            <EmptyState />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Recipients</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Next Action</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {pageItems.map((campaign, index) => (
                      <CampaignRow 
                        key={campaign.id} 
                        campaign={campaign}
                        index={index}
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        onDeleteClick={(campaign) => {
                          setSelectedCampaign(campaign);
                          setDeleteDialogOpen(true);
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination 
                page={page}
                totalPages={totalPages}
                setPage={setPage}
                filtered={filtered}
                PAGE_SIZE={PAGE_SIZE}
              />
            </>
          )}
        </motion.div>

              {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              {selectedCampaign?.name}
            </span>
            ? This action cannot be undone.
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button
                variant="ghost"
                disabled={isDeleting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={handleDeleteCampaign}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    </div>
    
  );
}

/* ---------------------- Component Helpers ---------------------- */

function StatCard({ icon, title, value, gradient }) {
  return (
    <div className={`group relative p-6 bg-gradient-to-br ${gradient} rounded-2xl shadow-md hover:shadow-xl border border-gray-200/60 transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
        <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
    </div>
  );
}

function CampaignRow({ campaign, index, activeMenu, setActiveMenu, onDeleteClick }) {
  const router = useRouter();
  const isMenuOpen = activeMenu === campaign.id;
  const menuRef = useRef(null);

  // 🔥 Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, setActiveMenu]);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => router.push(`/campaign/${campaign.id}`)}
    >
      {/* Campaign Info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${statusColor(campaign.status)}`}>
            {campaign.name.split(" ").slice(0, 2).map(w => w[0]).join("")}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{campaign.name}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            {console.log("Row Data:", campaign.status)}
              <StatusBadge status={campaign.status} />
              <span>•</span>
              <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Recipients */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{campaign.recipients} recipients</div>
        <div className="text-xs text-gray-500 mt-1">
          <span className="text-green-600 font-medium">{campaign.sent} sent</span>
          <span className="mx-1">•</span>
          <span className="text-blue-600 font-medium">{campaign.pending} pending</span>
        </div>
      </td>

      {/* Performance */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <MetricBadge icon={<FaEye />} label="Opens" value={`${campaign.openRate}%`} color="blue" />
          <MetricBadge icon={<FaReply />} label="Replies" value={`${campaign.replyRate}%`} color="green" />
          <div className="text-xs text-gray-500">
            <span className="text-red-500 font-medium">{campaign.bounced}%</span> bounced
          </div>
        </div>
      </td>

      {/* Next Action */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{campaign.nextFollowUp}</div>
        <div className="text-xs text-gray-500 mt-1">Throttle: {campaign.throttle}</div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4"
      onClick={(e) => e.stopPropagation()}
      >
      
        
        <div className="flex items-center justify-end gap-2">
          {/* <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <FaChartBar className="text-sm" />
          </button>
          <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
            <FaEdit className="text-sm" />
          </button> */}
          <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                  e.stopPropagation();   // 🚀 STOP row navigation
                  setActiveMenu(isMenuOpen ? null : campaign.id);
                }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <FaEllipsisV className="text-sm" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                {/* <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors">
                  <FaCopy className="text-blue-500" />
                  Duplicate
                </button>
                <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors">
                  <FaPause className="text-yellow-500" />
                  Pause/Resume
                </button> */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(campaign);
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-600 flex items-center gap-3 transition-colors"
                  >
                    <FaTrash />
                    Delete
                  </button>
              </div>
            )}
          </div>

          
        </div>
      </td>
    </motion.tr>
  );
}


function StatusBadge({ status }) {
  const config = {
    running: { bg: "bg-green-100", text: "text-green-700", label: "Running" },
    draft:     { bg: "bg-blue-100",   text: "text-blue-700",   label: "Draft" },
    completed: { bg: "bg-gray-100", text: "text-gray-700", label: "Completed" },
    failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" }
  };
  const style = config[status] || config.completed;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

function MetricBadge({ icon, label, value, color }) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50"
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function statusColor(status) {
  switch (status) {
    case "running": return "bg-gradient-to-br from-green-500 to-green-600";
    case "draft": return "bg-gradient-to-br from-blue-500 to-blue-600";
    case "failed": return "bg-gradient-to-br from-red-500 to-red-600";
    case "completed": return "bg-gradient-to-br from-gray-600 to-gray-700";
    default: return "bg-gradient-to-br from-gray-400 to-gray-500";
  }
}

function EmptyState() {
  const router = useRouter();
  return (
    <div className="p-16 text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
        <FaRocket className="text-4xl text-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No campaigns found</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Create your campaign to start sending personalized cold emails with automated follow-ups.
      </p>
      <button 
      onClick={() => router.push("/campaign/create")}
      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 mx-auto">
        <FaPlus />
        Create Your Campaign
      </button>
    </div>
  );
}

function Pagination({ page, totalPages, setPage, filtered, PAGE_SIZE }) {
  return (
    <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{(page - 1) * PAGE_SIZE + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-gray-900">{filtered.length}</span> campaigns
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <FaChevronLeft className="text-xs" />
          Previous
        </button>
        <div className="text-sm font-medium text-gray-700">
          Page {page} of {totalPages}
        </div>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          Next
          <FaChevronRight className="text-xs" />
        </button>
      </div>
    </div>
  );
}
