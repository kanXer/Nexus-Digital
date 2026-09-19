"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Loader2,
  Inbox,
  Trash2,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  TrendingUp,
  Download,
  Users2,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  Plus,
  Zap,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { LineAreaChart, DonutChart, HBarList, StatTile } from "@/components/admin/Charts";

type SubmissionItem = {
  id: string;
  type: "contact" | "booking" | "enquiry" | "subscribe" | "leadmagnet";
  status?: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string | null;
};

type Overview = {
  counts: { contact: number; booking: number; enquiry: number; subscribe: number; leadmagnet: number };
  leads: { total: number; thisWeek: number; thisMonth: number; pending: number; closed: number; conversionRate: number };
  leadTrend: { label: string; value: number }[];
  leadByService: { label: string; value: number }[];
  leadMagnets: { label: string; value: number }[];
};

const typeLabels: Record<string, string> = {
  contact: "Contact",
  booking: "Booking",
  enquiry: "Enquiry",
  subscribe: "Newsletter",
  leadmagnet: "Lead Magnet",
};

const statusBadge: Record<string, string> = {
  pending: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  contacted: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  qualified: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  proposal: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  won: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  lost: "bg-red-500/15 text-red-400 border-red-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  business: "Business / Company",
  service: "Service Required",
  budget: "Budget",
  dealValue: "Deal Value (INR)",
  message: "Message",
  subject: "Subject",
  company: "Company",
  city: "City",
  resource: "Resource",
  resourceTitle: "Resource Title",
  source: "Attribution Source",
  notes: "Internal Notes",
};

export default function DashboardPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [filter, setFilter] = useState<"all" | "contact" | "enquiry" | "booking" | "leadmagnet">("all");
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [selected, setSelected] = useState<SubmissionItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      const d = await res.json();
      if (res.ok) setOverview(d);
    } catch {
      /* ignore */
    }
  }, [router]);

  const loadList = useCallback(
    async (f: typeof filter) => {
      setLoadingList(true);
      try {
        const q = f === "all" ? "" : `?type=${f}`;
        const res = await fetch(`/api/admin/submissions${q}`);
        if (res.status === 401) {
          router.replace("/admin");
          return;
        }
        const d = await res.json();
        if (res.ok) {
          const its = (d.items || []) as SubmissionItem[];
          setItems(f === "all" ? its.filter((x) => x.type !== "subscribe") : its);
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingList(false);
      }
    },
    [router]
  );

  useEffect(() => {
    (async () => {
      await Promise.all([loadOverview(), loadList(filter)]);
      setLoading(false);
    })();
  }, [loadOverview, loadList, filter]);

  const refreshAll = () => {
    loadOverview();
    loadList(filter);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this record? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/submissions?id=${id}`, { method: "DELETE" });
      setSelected(null);
      refreshAll();
    } finally {
      setDeleting(false);
    }
  };

  const cycleStatus = async (item: SubmissionItem) => {
    const current = item.status || "pending";
    const next =
      current === "pending"
        ? "contacted"
        : current === "contacted"
        ? "proposal"
        : current === "proposal"
        ? "won"
        : "pending";

    setUpdating(true);
    try {
      await fetch("/api/admin/submissions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: next }),
      });
      const updated = { ...item, status: next };
      setSelected(updated);
      setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
      loadOverview();
    } finally {
      setUpdating(false);
    }
  };

  const tabs = [
    { id: "all", label: "All Inquiries" },
    { id: "enquiry", label: "Enquiries" },
    { id: "contact", label: "Contacts" },
    { id: "booking", label: "Strategy Bookings" },
    { id: "leadmagnet", label: "Lead Magnets" },
  ] as const;

  const getWhatsAppLink = (item: SubmissionItem) => {
    const phone = String(item.data?.phone || "");
    if (!phone) return null;
    const clean = phone.replace(/[^0-9]/g, "");
    const withCode = clean.length === 10 ? `91${clean}` : clean;
    const name = String(item.data?.name || "there");
    const service = String(item.data?.service || "digital marketing services");
    const msg = encodeURIComponent(
      `Hi ${name}, thank you for contacting Nexus Digital regarding ${service}! When is a good time for a 10-minute strategy call?`
    );
    return `https://wa.me/${withCode}?text=${msg}`;
  };

  return (
    <div className="space-y-6 pb-24 select-none">
      {/* Luxury Glass Hero Greeting Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] p-6 sm:p-8 shadow-card"
      >
        <div className="pointer-events-none absolute -top-24 right-0 w-96 h-96 bg-gradient-to-br from-red-600/18 via-rose-500/10 to-transparent blur-[120px] rounded-full" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 shadow-[0_8px_25px_rgba(220,38,38,0.4)] flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  Executive Dashboard
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" /> Live
                </span>
              </div>
              <p className="text-[var(--text-muted)] text-xs sm:text-sm mt-0.5">
                Real-time agency growth metrics, lead pipeline conversion, and marketing performance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/admin/leads"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-xs shadow-[0_4px_16px_rgba(220,38,38,0.4)] hover:shadow-[0_6px_24px_rgba(220,38,38,0.6)] transition-all cursor-pointer"
            >
              <Users2 className="w-4 h-4" />
              <span>Open CRM Pipeline</span>
            </Link>

            <button
              onClick={refreshAll}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-red-500/30 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-500" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3 text-[var(--text-muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading Executive Metrics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Stat Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <StatTile
              index={0}
              label="Total Agency Leads"
              value={overview?.leads.total ?? 0}
              sub={`${overview?.leads.pending ?? 0} pending follow-up`}
              trend="+15% this month"
              trendPositive={true}
              icon={Inbox}
              accent="#DC2626"
            />
            <StatTile
              index={1}
              label="Conversion Rate"
              value={`${overview?.leads.conversionRate ?? 0}%`}
              sub="Won / Total Opportunities"
              icon={TrendingUp}
              accent="#10B981"
            />
            <StatTile
              index={2}
              label="Lead Magnet Downloads"
              value={overview?.counts.leadmagnet ?? 0}
              sub="Organic Inbound Captures"
              icon={Download}
              accent="#EC4899"
            />
            <StatTile
              index={3}
              label="Recent Growth"
              value={`+${overview?.leads.thisMonth ?? 0}`}
              sub={`${overview?.leads.thisWeek ?? 0} acquired this week`}
              icon={Zap}
              accent="#8B5CF6"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 6-Month Lead Trend Line Chart */}
            <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-5 sm:p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[var(--text-primary)] font-bold text-base sm:text-lg">
                    Lead Acquisition Velocity
                  </h2>
                  <p className="text-[11px] text-[var(--text-muted)]">Monthly trend across all form submissions</p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                  Last 6 Months
                </span>
              </div>
              <LineAreaChart
                data={overview?.leadTrend.map((d) => d.value) ?? []}
                labels={overview?.leadTrend.map((d) => d.label)}
                height={160}
              />
            </div>

            {/* Lead Sources Donut Chart */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-5 sm:p-6 shadow-card flex flex-col justify-between">
              <div>
                <h2 className="text-[var(--text-primary)] font-bold text-base sm:text-lg mb-1">
                  Lead Inbound Channels
                </h2>
                <p className="text-[11px] text-[var(--text-muted)] mb-4">Channel volume breakdown</p>
              </div>
              <DonutChart
                centerLabel={overview?.leads.total ?? 0}
                centerSub="Total Leads"
                segments={[
                  { label: "Contact Form", value: overview?.counts.contact ?? 0, color: "#DC2626" },
                  { label: "Enquiries", value: overview?.counts.enquiry ?? 0, color: "#F59E0B" },
                  { label: "Strategy Call", value: overview?.counts.booking ?? 0, color: "#8B5CF6" },
                  { label: "Lead Magnet", value: overview?.counts.leadmagnet ?? 0, color: "#EC4899" },
                ]}
              />
            </div>
          </div>

          {/* Service & Magnet Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-5 sm:p-6 shadow-card">
              <h2 className="text-[var(--text-primary)] font-bold text-base sm:text-lg mb-1">
                Top Demand by Service
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mb-5">Which agency services clients request most</p>
              <HBarList items={overview?.leadByService ?? []} />
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-5 sm:p-6 shadow-card">
              <h2 className="text-[var(--text-primary)] font-bold text-base sm:text-lg mb-1">
                Top Performing Lead Magnets
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mb-5">Resources generating the most email captures</p>
              <HBarList
                items={overview?.leadMagnets && overview.leadMagnets.length > 0 ? overview.leadMagnets : []}
              />
            </div>
          </div>

          {/* Recent Inbound Submissions List */}
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-5 sm:p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-[var(--text-primary)] font-bold text-base sm:text-lg flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-red-500" /> Recent Inbound Opportunities
                </h2>
                <p className="text-[11px] text-[var(--text-muted)]">Click on any submission for fast follow-up</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilter(t.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      filter === t.id
                        ? "bg-red-600 text-white shadow-glow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingList ? (
              <div className="flex items-center justify-center py-16 text-[var(--text-muted)]">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-[var(--text-muted)] text-xs text-center py-16">
                No submissions found for this filter.
              </p>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-xs min-w-[650px] text-left">
                  <thead>
                    <tr className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider border-b border-[var(--border-default)]">
                      <th className="pb-3 px-3 font-bold">Client / Prospect</th>
                      <th className="pb-3 px-3 font-bold">Inquiry Type</th>
                      <th className="pb-3 px-3 font-bold">Status</th>
                      <th className="pb-3 px-3 font-bold">Received</th>
                      <th className="pb-3 px-3 font-bold text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)]">
                    {items.map((it) => {
                      const waLink = getWhatsAppLink(it);
                      const name = String(it.data?.name || it.data?.email || "Prospect");
                      const detail = String(it.data?.service || it.data?.resourceTitle || it.data?.phone || "");
                      const st = it.status || "pending";
                      return (
                        <tr
                          key={it.id}
                          className="text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer group"
                          onClick={() => setSelected(it)}
                        >
                          <td className="py-3 px-3">
                            <p className="font-extrabold text-[var(--text-primary)] group-hover:text-red-500 transition-colors">
                              {name}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[200px]">{detail}</p>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                              {typeLabels[it.type] || it.type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                                statusBadge[st] || statusBadge.pending
                              }`}
                            >
                              {st}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[var(--text-muted)] whitespace-nowrap">
                            {new Date(it.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => setSelected(it)}
                                className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-red-500/15 hover:text-red-400 border border-[var(--border-default)] text-[11px] font-bold transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4 pb-3 border-b border-[var(--border-default)]">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                    {typeLabels[selected.type] || selected.type}
                  </span>
                  <h3 className="text-[var(--text-primary)] font-black text-xl mt-2">
                    {String(selected.data?.name || selected.data?.email || "Inquiry Record")}
                  </h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Data fields */}
              <div className="space-y-2.5 mb-5">
                {Object.entries(selected.data).map(([k, v]) => {
                  if (k === "auto") return null;
                  const val = typeof v === "string" || typeof v === "number" ? String(v) : JSON.stringify(v);
                  return (
                    <div
                      key={k}
                      className="text-xs bg-[var(--bg-secondary)] rounded-xl px-3.5 py-2.5 border border-[var(--border-default)]"
                    >
                      <p className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider mb-0.5">
                        {FIELD_LABELS[k] || k}
                      </p>
                      <p className="text-[var(--text-primary)] break-words font-semibold text-xs leading-relaxed">
                        {val}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Footer action buttons */}
              <div className="flex items-center justify-between gap-3 border-t border-[var(--border-default)] pt-4">
                <button
                  onClick={() => cycleStatus(selected)}
                  disabled={updating}
                  className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] hover:border-red-500/40 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  Advance to: {selected.status === "pending" ? "Contacted" : selected.status === "contacted" ? "Proposal" : selected.status === "proposal" ? "Won" : "Pending"}
                </button>

                <button
                  onClick={() => handleDelete(selected.id)}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
