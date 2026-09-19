"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users2,
  RefreshCw,
  Loader2,
  Plus,
  Download,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  IndianRupee,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ExternalLink,
  Kanban,
  Table as TableIcon,
  Trash2,
  Flame,
  FileSpreadsheet,
  Check,
  Send,
} from "lucide-react";
import { StatTile } from "@/components/admin/Charts";
import { getServicePricing, STANDARD_SERVICES_LIST } from "@/lib/servicePricingUtils";

export type CRMStage = "pending" | "contacted" | "qualified" | "proposal" | "won" | "lost";

export interface LeadItem {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  status: CRMStage | string;
  dealValue: number;
  priority: "urgent" | "high" | "medium" | "low";
  source: string;
  notes: string;
  message?: string;
  createdAt: string;
  updatedAt?: string | null;
}

const STAGES: { id: CRMStage; label: string; color: string; bg: string; border: string }[] = [
  { id: "pending", label: "New Lead", color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30" },
  { id: "contacted", label: "Contacted", color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  { id: "qualified", label: "Audit / Qualified", color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30" },
  { id: "proposal", label: "Proposal Sent", color: "text-rose-400", bg: "bg-rose-500/15", border: "border-rose-500/30" },
  { id: "won", label: "Won / Converted", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  { id: "lost", label: "Lost / Inactive", color: "text-zinc-400", bg: "bg-zinc-500/15", border: "border-zinc-500/30" },
];

const SERVICES_LIST = STANDARD_SERVICES_LIST;

const SOURCES_LIST = [
  "Website Inbound Form",
  "Meta Ads (Instagram / FB)",
  "Google Search & Ads",
  "WhatsApp Direct",
  "Referral / Word of Mouth",
  "Lead Magnet Download",
  "Cold Call / Networking",
  "Direct Outreach",
];

export default function LeadsCRMPage() {
  const router = useRouter();
  const kanbanScrollRef = React.useRef<HTMLDivElement>(null);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");

  // Modal / Drawer states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [savingLead, setSavingLead] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    service: SERVICES_LIST[0],
    dealValue: String(getServicePricing(SERVICES_LIST[0]).price),
    priority: "high" as const,
    source: SOURCES_LIST[0],
    status: "pending" as CRMStage,
    notes: "",
  });

  // Fetch report and leads
  const loadLeads = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/leads/report");
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      const data = await res.json();
      if (res.ok && data.recentLeads) {
        setLeads(data.recentLeads);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Update lead status or fields
  const handleUpdateLead = async (id: string, updates: Partial<LeadItem>) => {
    setUpdatingStatusId(id);
    try {
      const res = await fetch("/api/admin/submissions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
        );
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead((prev) => (prev ? { ...prev, ...updates } : null));
        }
      }
    } catch (err) {
      console.error("Failed to update lead:", err);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Create new manual lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLead(true);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          service: newLead.service,
          dealValue: Number(newLead.dealValue) || 0,
          priority: newLead.priority,
          source: newLead.source,
          status: newLead.status,
          notes: newLead.notes,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewLead({
          name: "",
          email: "",
          phone: "",
          service: SERVICES_LIST[0],
          dealValue: "50000",
          priority: "high",
          source: SOURCES_LIST[0],
          status: "pending",
          notes: "",
        });
        await loadLeads();
      }
    } catch (err) {
      console.error("Failed to create lead:", err);
    } finally {
      setSavingLead(false);
    }
  };

  // Delete lead
  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this lead?")) return;
    try {
      const res = await fetch(`/api/admin/submissions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        if (selectedLead?.id === id) setSelectedLead(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Export Leads to CSV
  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Name", "Email", "Phone", "Service", "Status", "Deal Value (INR)", "Priority", "Source", "Notes", "Date"];
    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.service || "").replace(/"/g, '""')}"`,
      `"${l.status}"`,
      l.dealValue || 0,
      `"${l.priority || "medium"}"`,
      `"${(l.source || "").replace(/"/g, '""')}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexus_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1-Click WhatsApp Trigger
  const getWhatsAppLink = (lead: LeadItem) => {
    if (!lead.phone) return "#";
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hi ${lead.name || "there"}, thank you for contacting Nexus Digital regarding ${lead.service || "our services"}! Are you available for a brief 10-minute discovery call today?`
    );
    return `https://wa.me/${phoneWithCode}?text=${msg}`;
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const matches =
          (lead.name || "").toLowerCase().includes(q) ||
          (lead.email || "").toLowerCase().includes(q) ||
          (lead.phone || "").toLowerCase().includes(q) ||
          (lead.service || "").toLowerCase().includes(q) ||
          (lead.notes || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Stage filter
      if (selectedStage !== "all") {
        const normalizedStatus =
          lead.status === "resolved" || lead.status === "confirmed"
            ? "won"
            : lead.status === "rejected"
            ? "lost"
            : lead.status;
        if (normalizedStatus !== selectedStage) return false;
      }
      // Service filter
      if (selectedService !== "all" && lead.service !== selectedService) return false;
      // Source filter
      if (selectedSource !== "all" && lead.source !== selectedSource) return false;

      return true;
    });
  }, [leads, search, selectedStage, selectedService, selectedSource]);

  // Aggregate Pipeline Stats
  const stats = useMemo(() => {
    const total = leads.length;
    let pipelineVal = 0;
    let wonVal = 0;
    let wonCount = 0;
    let activeCount = 0;

    leads.forEach((l) => {
      const val = Number(l.dealValue) || 0;
      const st = l.status === "resolved" || l.status === "confirmed" ? "won" : l.status === "rejected" ? "lost" : l.status;
      if (st === "won") {
        wonVal += val;
        wonCount++;
      } else if (st !== "lost") {
        pipelineVal += val;
        activeCount++;
      }
    });

    const conversionRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;
    return { total, pipelineVal, wonVal, wonCount, activeCount, conversionRate };
  }, [leads]);

  return (
    <div className="space-y-6 pb-24 select-none w-full max-w-full overflow-x-hidden">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] p-6 sm:p-8 shadow-card"
      >
        <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 bg-gradient-to-br from-red-600/15 via-rose-500/10 to-transparent blur-[120px] rounded-full" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 shadow-[0_8px_25px_rgba(220,38,38,0.4)] flex items-center justify-center shrink-0">
              <Users2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  Leads &amp; CRM Pipeline
                </h1>
                <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-500/15 text-rose-400 border border-red-500/30 uppercase tracking-widest">
                  Live Growth
                </span>
              </div>
              <p className="text-[var(--text-muted)] text-xs sm:text-sm mt-1">
                Track, engage, and convert high-ticket agency leads with fast follow-up triggers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "kanban"
                    ? "bg-red-600 text-white shadow-glow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-red-600 text-white shadow-glow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            {/* Quick Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={leads.length === 0}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-red-500/30 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50"
              title="Export leads to CSV for Meta/Google Retargeting"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Quick Add Lead Modal Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-xs shadow-[0_4px_16px_rgba(220,38,38,0.4)] hover:shadow-[0_6px_24px_rgba(220,38,38,0.6)] transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>

            {/* Refresh */}
            <button
              onClick={loadLeads}
              disabled={refreshing}
              className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
              title="Refresh leads data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-red-500" : ""}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Performance Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatTile
          index={0}
          label="Active Pipeline Value"
          value={`₹${(stats.pipelineVal || 0).toLocaleString("en-IN")}`}
          sub={`${stats.activeCount} active opportunities`}
          icon={IndianRupee}
          accent="#3B82F6"
        />
        <StatTile
          index={1}
          label="Won Revenue"
          value={`₹${(stats.wonVal || 0).toLocaleString("en-IN")}`}
          sub={`${stats.wonCount} closed deals`}
          icon={Award}
          accent="#10B981"
        />
        <StatTile
          index={2}
          label="Conversion / Win Rate"
          value={`${stats.conversionRate}%`}
          sub="Won / Total Captured"
          trend="+12% this month"
          trendPositive={true}
          icon={TrendingUp}
          accent="#F59E0B"
        />
        <StatTile
          index={3}
          label="Total Captured Leads"
          value={stats.total}
          sub="Inbound & Outbound"
          icon={Users2}
          accent="#EC4899"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-card">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, email, phone, service, or notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-red-500/50 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stage Dropdown */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)] font-semibold focus:outline-none focus:border-red-500/40 cursor-pointer"
          >
            <option value="all">All Stages</option>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Service Dropdown */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)] font-semibold focus:outline-none focus:border-red-500/40 cursor-pointer max-w-[170px] truncate"
          >
            <option value="all">All Services</option>
            {SERVICES_LIST.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>

          {/* Clear Filters if any */}
          {(search || selectedStage !== "all" || selectedService !== "all" || selectedSource !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedStage("all");
                setSelectedService("all");
                setSelectedSource("all");
              }}
              className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3 text-[var(--text-muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p className="text-xs font-semibold uppercase tracking-wider">Syncing Lead Pipeline...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
            <Users2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No Leads Found</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1 mb-5">
            {search || selectedStage !== "all"
              ? "No leads matched your search or filters. Try adjusting your query."
              : "Your lead pipeline is currently empty. Add your first client lead to start tracking conversions."}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-glow-sm hover:scale-105 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Lead</span>
          </button>
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN BOARD VIEW */
        <div className="w-full max-w-full rounded-3xl bg-[var(--bg-card)]/60 border border-[var(--border-default)] p-3 sm:p-5 shadow-card overflow-hidden">
          {/* Kanban Board Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-[var(--border-default)] text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2 font-bold text-[var(--text-secondary)]">
              <Kanban className="w-4 h-4 text-red-500 shrink-0" />
              <span>Pipeline Workflow ({filteredLeads.length} leads across 6 stages)</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline text-[11px] font-semibold text-[var(--text-muted)]">
                Navigate stages:
              </span>
              <button
                type="button"
                onClick={() => kanbanScrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
                className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-red-500/40 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => kanbanScrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
                className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-red-500/40 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Track */}
          <div ref={kanbanScrollRef} className="w-full overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar">
            <div className="flex gap-4 items-start min-w-max">
              {STAGES.map((col) => {
                const colLeads = filteredLeads.filter((l) => {
                  const st = l.status === "resolved" || l.status === "confirmed" ? "won" : l.status === "rejected" ? "lost" : l.status;
                  return st === col.id;
                });
                const colTotalValue = colLeads.reduce((s, l) => s + (Number(l.dealValue) || 0), 0);

                return (
                  <div
                    key={col.id}
                    className="w-[285px] sm:w-[300px] shrink-0 flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm overflow-hidden"
                  >
                    {/* Column Header (Pinned) */}
                    <div className="p-3.5 pb-2.5 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/60 shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${col.bg} border ${col.border}`} />
                          <h3 className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">
                            {col.label}
                          </h3>
                        </div>
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                          {colLeads.length}
                        </span>
                      </div>

                      {/* Column Sub-header with value */}
                      <div className="text-[10px] font-bold text-[var(--text-muted)] mt-1.5 flex items-center justify-between">
                        <span>Potential:</span>
                        <span className="text-emerald-500 font-extrabold">₹{colTotalValue.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Column Cards (Internally Scrollable so it never overflows vertically) */}
                    <div className="flex-1 overflow-y-auto max-h-[calc(100vh-340px)] min-h-[420px] p-3 space-y-3 custom-scrollbar">
                      {colLeads.map((lead) => (
                        <motion.div
                          key={lead.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="group relative rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-red-500/40 p-3.5 shadow-sm transition-all duration-200 cursor-pointer overflow-hidden"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-red-600 via-rose-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                          {/* Top Row: Service + Priority */}
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <span className="text-[10px] font-extrabold text-[var(--text-secondary)] truncate max-w-[150px]">
                              {lead.service}
                            </span>
                            {lead.priority === "urgent" && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                                <Flame className="w-2.5 h-2.5 fill-red-400" /> Hot
                              </span>
                            )}
                          </div>

                          {/* Lead Name */}
                          <h4 className="font-black text-sm text-[var(--text-primary)] truncate group-hover:text-red-500 transition-colors">
                            {lead.name}
                          </h4>

                          {/* Deal Value */}
                          {lead.dealValue > 0 && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs font-black text-emerald-500">
                                ₹{lead.dealValue.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 uppercase tracking-tight">
                                {getServicePricing(lead.service).cycle === "monthly" ? "/mo" : "one-time"}
                              </span>
                            </div>
                          )}

                          {/* Quick Contact & Action Buttons */}
                          <div
                            className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--border-default)] gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1.5">
                              {lead.phone ? (
                                <a
                                  href={getWhatsAppLink(lead)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-500 border border-emerald-500/30 flex items-center justify-center transition-all cursor-pointer"
                                  title="1-Click WhatsApp follow-up"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              ) : null}

                              {lead.phone ? (
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="w-7 h-7 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 flex items-center justify-center transition-all cursor-pointer"
                                  title="Direct Phone Call"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              ) : null}

                              {lead.email ? (
                                <a
                                  href={`mailto:${lead.email}?subject=Nexus Digital Inquiry Follow-up`}
                                  className="w-7 h-7 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 flex items-center justify-center transition-all cursor-pointer"
                                  title="Send Email"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              ) : null}
                            </div>

                            {/* Fast Stage Cycler */}
                            <select
                              value={lead.status}
                              disabled={updatingStatusId === lead.id}
                              onChange={(e) => handleUpdateLead(lead.id, { status: e.target.value as CRMStage })}
                              className="text-[10px] font-bold px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-red-500/40 focus:outline-none cursor-pointer"
                            >
                              {STAGES.map((st) => (
                                <option key={st.id} value={st.id}>
                                  {st.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      ))}

                      {colLeads.length === 0 && (
                        <div className="h-36 rounded-xl border border-dashed border-[var(--border-default)] flex flex-col items-center justify-center text-[11px] text-[var(--text-muted)] italic gap-1">
                          <span>Empty stage</span>
                          <span className="text-[9px] not-italic opacity-60">No active leads</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* HIGH-DENSITY TABLE VIEW */
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-card overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-default)] text-[var(--text-muted)] uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Lead Name</th>
                  <th className="py-3.5 px-4">Service Required</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Deal Value</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {filteredLeads.map((lead) => {
                  const stageObj = STAGES.find((s) => s.id === lead.status) || STAGES[0];
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer text-[var(--text-secondary)]"
                    >
                      <td className="py-3 px-4">
                        <p className="font-extrabold text-[var(--text-primary)] text-sm">{lead.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{lead.email || lead.phone || "No direct info"}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--text-primary)] truncate max-w-[180px]">
                        {lead.service}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${stageObj.bg} ${stageObj.color} ${stageObj.border}`}>
                          {stageObj.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-400">
                        {lead.dealValue > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span>₹{lead.dealValue.toLocaleString("en-IN")}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              {getServicePricing(lead.service).cycle === "monthly" ? "/mo" : "one-time"}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            lead.priority === "urgent"
                              ? "bg-red-500/15 text-red-400 border-red-500/30"
                              : lead.priority === "high"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-default)]"
                          }`}
                        >
                          {lead.priority || "medium"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[var(--text-muted)] truncate max-w-[120px]">
                        {lead.source}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.phone && (
                            <a
                              href={getWhatsAppLink(lead)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all cursor-pointer"
                              title="WhatsApp chat"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="w-7 h-7 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 flex items-center justify-center transition-all cursor-pointer"
                              title="Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="w-7 h-7 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 flex items-center justify-center transition-all cursor-pointer"
                              title="Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK ADD LEAD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl p-4 sm:p-7"
            >
              <div className="flex items-center justify-between mb-4 border-b border-[var(--border-default)] pb-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[var(--text-primary)]">Capture New Lead</h2>
                    <p className="text-xs text-[var(--text-muted)]">Log offline calls, WhatsApp DMs, or event contacts.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-4 overflow-y-auto min-h-0 pr-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      placeholder="client@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Service of Interest
                    </label>
                    <select
                      value={newLead.service}
                      onChange={(e) => {
                        const srv = e.target.value;
                        const meta = getServicePricing(srv);
                        setNewLead({
                          ...newLead,
                          service: srv,
                          dealValue: String(meta.price),
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-red-500/50 cursor-pointer"
                    >
                      {SERVICES_LIST.map((srv) => (
                        <option key={srv} value={srv}>
                          {srv}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Estimated Deal Value (₹)
                      </label>
                      <span className="text-[9px] font-bold text-emerald-400 uppercase">
                        {getServicePricing(newLead.service).cycle === "monthly" ? "Monthly Retainer" : "One-Time Project"}
                      </span>
                    </div>
                    <input
                      type="number"
                      value={newLead.dealValue}
                      onChange={(e) => setNewLead({ ...newLead, dealValue: e.target.value })}
                      placeholder="e.g. 20000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Initial Stage
                    </label>
                    <select
                      value={newLead.status}
                      onChange={(e) => setNewLead({ ...newLead, status: e.target.value as CRMStage })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
                    >
                      {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Priority
                    </label>
                    <select
                      value={newLead.priority}
                      onChange={(e) => setNewLead({ ...newLead, priority: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
                    >
                      <option value="urgent">🔥 Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Lead Source
                    </label>
                    <select
                      value={newLead.source}
                      onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
                    >
                      {SOURCES_LIST.map((src) => (
                        <option key={src} value={src}>
                          {src}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Internal Notes / Context
                  </label>
                  <textarea
                    rows={2}
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    placeholder="e.g. Met on call, looking for ₹2 Lakhs monthly ad spend audit..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-default)] shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingLead}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-xs shadow-glow-sm cursor-pointer disabled:opacity-50"
                  >
                    {savingLead ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEAD DETAILS & EDIT DRAWER */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedLead(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-default)] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-6 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/70 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 uppercase tracking-wider">
                        {selectedLead.source}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(selectedLead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-[var(--text-primary)]">{selectedLead.name}</h2>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{selectedLead.service}</p>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 1-Click Action Bar */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border-default)]">
                  {selectedLead.phone && (
                    <a
                      href={getWhatsAppLink(selectedLead)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Client</span>
                    </a>
                  )}
                  {selectedLead.phone && (
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-bold transition-all"
                      title="Call Lead"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {selectedLead.email && (
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-400 text-xs font-bold transition-all"
                      title="Email Lead"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Drawer Body / Editor */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {/* Contact info card */}
                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] space-y-2 text-xs">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Direct Contacts</p>
                  <p className="font-semibold text-[var(--text-primary)] flex items-center justify-between">
                    <span>Phone:</span>
                    <span className="font-mono text-emerald-400">{selectedLead.phone || "None provided"}</span>
                  </p>
                  <p className="font-semibold text-[var(--text-primary)] flex items-center justify-between">
                    <span>Email:</span>
                    <span className="text-[var(--text-secondary)]">{selectedLead.email || "None provided"}</span>
                  </p>
                </div>

                {/* Deal Status & Value Controls */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Lead Pipeline Stage
                    </label>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => handleUpdateLead(selectedLead.id, { status: e.target.value as CRMStage })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-red-500/50 cursor-pointer"
                    >
                      {STAGES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Estimated Deal Value (₹)
                    </label>
                    <input
                      type="number"
                      value={selectedLead.dealValue || 0}
                      onChange={(e) => handleUpdateLead(selectedLead.id, { dealValue: Number(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-sm font-black text-emerald-400 focus:outline-none focus:border-red-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Priority Level
                    </label>
                    <select
                      value={selectedLead.priority || "medium"}
                      onChange={(e) => handleUpdateLead(selectedLead.id, { priority: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                    >
                      <option value="urgent">🔥 Urgent Follow-Up</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Internal CRM Notes
                    </label>
                    <textarea
                      rows={4}
                      value={selectedLead.notes || ""}
                      onChange={(e) => handleUpdateLead(selectedLead.id, { notes: e.target.value })}
                      placeholder="Add client follow-up details, audit feedback, budget remarks..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-red-500/50"
                    />
                  </div>

                  {selectedLead.message && (
                    <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                        Original Client Message
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                        &quot;{selectedLead.message}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/70 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteLead(selectedLead.id)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold shadow-glow-sm cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
