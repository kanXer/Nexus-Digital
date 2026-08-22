"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  RefreshCw, Loader2, Inbox, Trash2,
  CheckCircle2, XCircle, LayoutDashboard,
  TrendingUp, Download,
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
  contact: "Contact", booking: "Booking", enquiry: "Enquiry",
  subscribe: "Newsletter", leadmagnet: "Lead Magnet",
};
const statusBadge: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  confirmed: "bg-green-500/15 text-green-300 border-green-500/30",
  resolved: "bg-green-500/15 text-green-300 border-green-500/30",
  rejected: "bg-red-500/15 text-red-300 border-red-500/30",
};
const FIELD_LABELS: Record<string, string> = {
  name: "Name", email: "Email", phone: "Phone", business: "Business",
  service: "Service", budget: "Budget", message: "Message", subject: "Subject",
  company: "Company", city: "City", resource: "Resource", resourceTitle: "Resource",
  auto: "Auto-added", source: "Source",
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
      if (res.status === 401) { router.replace("/admin"); return; }
      const d = await res.json();
      if (res.ok) setOverview(d);
    } catch { /* ignore */ }
  }, [router]);

  const loadList = useCallback(async (f: typeof filter) => {
    setLoadingList(true);
    try {
      const q = f === "all" ? "" : `?type=${f}`;
      const res = await fetch(`/api/admin/submissions${q}`);
      if (res.status === 401) { router.replace("/admin"); return; }
      const d = await res.json();
      if (res.ok) {
        const its = (d.items || []) as SubmissionItem[];
        setItems(f === "all" ? its.filter((x) => x.type !== "subscribe") : its);
      }
    } catch { /* ignore */ }
    finally { setLoadingList(false); }
  }, [router]);

  useEffect(() => {
    (async () => {
      await Promise.all([loadOverview(), loadList(filter)]);
      setLoading(false);
    })();
  }, [loadOverview, loadList, filter]);

  const refreshAll = () => { loadOverview(); loadList(filter); };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch("/api/admin/submissions/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setSelected(null);
      refreshAll();
    } finally { setDeleting(false); }
  };

  const cycleStatus = async (item: SubmissionItem) => {
    const next = item.status === "pending" ? "resolved" : item.status === "resolved" ? "rejected" : "pending";
    setUpdating(true);
    try {
      await fetch("/api/admin/submissions/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, status: next }) });
      const updated = { ...item, status: next };
      setSelected(updated);
      setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
      loadOverview();
    } finally { setUpdating(false); }
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "enquiry", label: "Enquiries" },
    { id: "contact", label: "Contacts" },
    { id: "booking", label: "Bookings" },
    { id: "leadmagnet", label: "Lead Magnets" },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      {/* Header */}
      <div className="relative mb-7 overflow-hidden rounded-3xl glass-card border border-white/8 p-7 md:p-8">
        <div className="pointer-events-none absolute -top-24 right-0 w-80 h-80 bg-brand-blue/15 blur-[110px] rounded-full" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">Dashboard</h1>
              <p className="text-white/45 text-sm">Live leads at a glance.</p>
            </div>
          </div>
          <button onClick={refreshAll} className="btn-secondary px-4 py-2.5 text-sm self-start sm:self-auto">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-white/40"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatTile index={0} label="Total Leads" value={overview?.leads.total ?? 0} sub={overview ? `${overview.leads.pending} pending` : ""} icon={Inbox} accent="#3B82F6" />
            <StatTile index={1} label="Conversion" value={`${overview?.leads.conversionRate ?? 0}%`} sub="closed / total" icon={TrendingUp} accent="#22C55E" />
            <StatTile index={2} label="Lead Magnets" value={overview?.counts.leadmagnet ?? 0} sub="downloads" icon={Download} accent="#EC4899" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="glass-card rounded-2xl border border-white/8 p-5 sm:p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-base sm:text-lg">Lead Trend</h2>
                <span className="text-[11px] text-white/35">last 6 months</span>
              </div>
              <LineAreaChart
                data={overview?.leadTrend.map((d) => d.value) ?? []}
                labels={overview?.leadTrend.map((d) => d.label)}
                height={140}
              />
            </div>

            <div className="glass-card rounded-2xl border border-white/8 p-5 sm:p-6">
              <h2 className="text-white font-bold text-base sm:text-lg mb-4">Lead Sources</h2>
              <DonutChart
                centerLabel={overview?.leads.total ?? 0}
                centerSub="leads"
                segments={[
                  { label: "Contact", value: overview?.counts.contact ?? 0, color: "#3B82F6" },
                  { label: "Enquiry", value: overview?.counts.enquiry ?? 0, color: "#F59E0B" },
                  { label: "Booking", value: overview?.counts.booking ?? 0, color: "#8B5CF6" },
                  { label: "Lead Magnet", value: overview?.counts.leadmagnet ?? 0, color: "#EC4899" },
                ]}
              />
            </div>

            <div className="glass-card rounded-2xl border border-white/8 p-5 sm:p-6">
              <h2 className="text-white font-bold text-base sm:text-lg mb-4">Leads by Service</h2>
              <HBarList items={overview?.leadByService ?? []} />
            </div>

            {overview && overview.leadMagnets.length > 0 && (
              <div className="glass-card rounded-2xl border border-white/8 p-5 sm:p-6 lg:col-span-2">
                <h2 className="text-white font-bold text-base sm:text-lg mb-4">Most Downloaded Lead Magnets</h2>
                <HBarList items={overview.leadMagnets} />
              </div>
            )}
          </div>

          {/* Submissions list */}
          <div className="glass-card rounded-2xl border border-white/8 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                <Inbox className="w-4 h-4 text-white/40" /> Submissions
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilter(t.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filter === t.id ? "bg-brand-blue/15 border-brand-blue/40 text-white" : "bg-white/3 border-white/8 text-white/55 hover:border-white/20"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {loadingList ? (
              <div className="flex items-center justify-center py-10 text-white/40"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : items.length === 0 ? (
              <p className="text-white/35 text-sm text-center py-10">No submissions in this view yet.</p>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-white/40 text-xs uppercase tracking-wider text-left">
                      <th className="pb-3 font-semibold">From</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {items.map((it) => (
                      <tr key={it.id} className="text-white/75 hover:bg-white/3 transition-colors">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-white truncate max-w-[180px]">{String(it.data?.name || it.data?.email || "—")}</p>
                          <p className="text-white/40 text-[11px] truncate max-w-[180px]">{String(it.data?.service || it.data?.resourceTitle || "")}</p>
                        </td>
                        <td className="py-3 pr-4"><span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">{typeLabels[it.type]}</span></td>
                        <td className="py-3 pr-4"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusBadge[it.status || "pending"] || statusBadge.pending}`}>{it.status || "pending"}</span></td>
                        <td className="py-3 pr-4 text-white/40 whitespace-nowrap">{new Date(it.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 pr-4 text-right"><button onClick={() => setSelected(it)} className="text-brand-blue-light hover:underline text-xs">View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-secondary)] border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-5 sm:p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">{typeLabels[selected.type]}</span>
                <h3 className="text-white font-bold text-lg mt-2">{String(selected.data?.name || selected.data?.email || "Submission")}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white"><XCircle className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3 mb-5">
              {Object.entries(selected.data).map(([k, v]) => {
                if (k === "auto") return null;
                const val = typeof v === "string" || typeof v === "number" ? String(v) : JSON.stringify(v);
                return (
                  <div key={k} className="text-sm">
                    <p className="text-white/40 text-[11px] uppercase tracking-wider">{FIELD_LABELS[k] || k}</p>
                    <p className="text-white/80 break-words">{val}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-4">
              <button
                onClick={() => cycleStatus(selected)}
                disabled={updating}
                className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:border-brand-blue/40 disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Mark {selected.status === "pending" ? "Resolved" : selected.status === "resolved" ? "Rejected" : "Pending"}
              </button>
              <button
                onClick={() => handleDelete(selected.id)}
                disabled={deleting}
                className="inline-flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </div>
            <p className="text-white/30 text-[11px] mt-4">Received {new Date(selected.createdAt).toLocaleString()}</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
