"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, Loader2, Search, CheckCircle2, XCircle, Trash2,
  Mail, Phone, Briefcase, MessageSquare, Tag, Calendar,
  User, RefreshCw, ChevronRight, Filter, Download,
  AlertCircle,
} from "lucide-react";

type SubmissionItem = {
  id: string;
  type: "contact" | "booking" | "enquiry" | "subscribe" | "leadmagnet";
  status?: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string | null;
};

type TypeMetaEntry = { label: string; color: string; bg: string; icon: React.ElementType };

const TYPE_META: Record<string, TypeMetaEntry> = {
  contact:    { label: "Contact",     color: "text-blue-400",   bg: "bg-blue-500/15 border-blue-500/30",    icon: Mail },
  enquiry:    { label: "Enquiry",     color: "text-amber-400",  bg: "bg-amber-500/15 border-amber-500/30",  icon: MessageSquare },
  booking:    { label: "Booking",     color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30", icon: Calendar },
  subscribe:  { label: "Newsletter",  color: "text-pink-400",   bg: "bg-pink-500/15 border-pink-500/30",    icon: Inbox },
  leadmagnet: { label: "Lead Magnet", color: "text-emerald-400",bg: "bg-emerald-500/15 border-emerald-500/30", icon: Download },
};

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

const FIELD_LABELS: Record<string, string> = {
  name: "Name", email: "Email", phone: "Phone", business: "Business",
  service: "Service", budget: "Budget", message: "Message", subject: "Subject",
  company: "Company", city: "City", resource: "Resource", resourceTitle: "Resource",
  source: "Source",
};

const FIELD_ICONS: Record<string, React.ElementType> = {
  name: User, email: Mail, phone: Phone, business: Briefcase,
  service: Tag, message: MessageSquare,
};

const TABS = [
  { id: "all",        label: "All" },
  { id: "enquiry",    label: "Enquiries" },
  { id: "contact",    label: "Contacts" },
  { id: "booking",    label: "Bookings" },
  { id: "leadmagnet", label: "Lead Magnets" },
  { id: "subscribe",  label: "Newsletter" },
] as const;

type FilterId = typeof TABS[number]["id"];

export default function SubmissionsPage() {
  const router = useRouter();
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SubmissionItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter === "all" ? "" : `?type=${filter}`;
      const res = await fetch(`/api/admin/submissions${q}`);
      if (res.status === 401) { router.replace("/admin"); return; }
      const d = await res.json();
      if (res.ok) setItems(d.items || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [router, filter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch("/api/admin/submissions/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setSelected(null);
      load();
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
    } finally { setUpdating(false); }
  };

  const filtered = items.filter((it) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(it.data?.name || "").toLowerCase().includes(q) ||
      String(it.data?.email || "").toLowerCase().includes(q) ||
      String(it.data?.service || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-6 shadow-card"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-red to-red-600 shadow-glow-sm flex items-center justify-center shrink-0">
            <Inbox className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">Submissions</h1>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">All form submissions, enquiries, bookings &amp; contacts.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--bg-secondary)] border border-[var(--border-default)] px-3 py-1.5 rounded-lg">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-brand-red/30 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Filter Tabs + Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="flex items-center gap-1.5 flex-wrap p-1 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl">
          <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] ml-1 shrink-0" />
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                filter === t.id
                  ? "bg-brand-red/15 border-brand-red/40 text-brand-red"
                  : "bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, service..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-brand-red/40 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)] transition-all"
          />
        </div>
      </motion.div>

      {/* Card Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-[var(--text-muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
          <p className="text-sm">Loading submissions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <div>
            <p className="text-[var(--text-secondary)] font-semibold">{search ? "No results found" : "No submissions yet"}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{search ? "Try a different search term." : "Submissions will appear here once users fill out your forms."}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((it, i) => {
            const meta: TypeMetaEntry = TYPE_META[it.type] || TYPE_META.contact;
            const TypeIcon = meta.icon;
            const name = String(it.data?.name || it.data?.email || "Unknown");
            const email = String(it.data?.email || "");
            const phone = String(it.data?.phone || "");
            const service = String(it.data?.service || it.data?.resourceTitle || "");
            const status = it.status || "pending";

            return (
              <motion.button
                key={it.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                onClick={() => setSelected(it)}
                className="group text-left w-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-brand-red/30 rounded-2xl p-5 transition-all duration-200 shadow-card hover:shadow-glow-sm relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-red to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-3">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${meta.bg} ${meta.color}`}>
                    <TypeIcon className="w-3 h-3" />
                    {meta.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_BADGE[status] || STATUS_BADGE.pending}`}>
                      {status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-brand-red transition-colors" />
                  </div>
                </div>
                <p className="font-bold text-[var(--text-primary)] text-base truncate mb-1">{name}</p>
                <div className="space-y-1 mb-3">
                  {email && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] truncate">
                      <Mail className="w-3 h-3 shrink-0" /><span className="truncate">{email}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Phone className="w-3 h-3 shrink-0" /><span>{phone}</span>
                    </div>
                  )}
                  {service && (
                    <div className="flex items-center gap-1.5 text-xs truncate">
                      <Tag className="w-3 h-3 shrink-0 text-brand-red" />
                      <span className="truncate font-medium text-[var(--text-secondary)]">{service}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                    <Calendar className="w-3 h-3" />
                    {new Date(it.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  <span className="text-[10px] text-brand-red font-semibold group-hover:underline">View Details →</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Side Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-default)] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="px-6 pt-6 pb-4 border-b border-[var(--border-default)] shrink-0 bg-[var(--bg-secondary)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {(() => {
                      const meta: TypeMetaEntry = TYPE_META[selected.type] || TYPE_META.contact;
                      const TypeIcon = meta.icon;
                      return (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold mb-2 ${meta.bg} ${meta.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {meta.label}
                        </div>
                      );
                    })()}
                    <h2 className="text-[var(--text-primary)] font-black text-xl leading-tight truncate">
                      {String(selected.data?.name || selected.data?.email || "Submission")}
                    </h2>
                    <p className="text-[var(--text-muted)] text-xs mt-1">
                      Received {new Date(selected.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all shrink-0"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-3">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border capitalize ${STATUS_BADGE[selected.status || "pending"] || STATUS_BADGE.pending}`}>
                    {selected.status || "pending"}
                  </span>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                {Object.entries(selected.data).map(([k, v]) => {
                  if (k === "auto") return null;
                  const val = typeof v === "string" || typeof v === "number" ? String(v) : JSON.stringify(v);
                  const FieldIcon = FIELD_ICONS[k];
                  return (
                    <div key={k} className="bg-[var(--bg-secondary)] rounded-xl px-4 py-3 border border-[var(--border-default)]">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {FieldIcon && <FieldIcon className="w-3 h-3 text-[var(--text-muted)]" />}
                        <p className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider font-semibold">{FIELD_LABELS[k] || k}</p>
                      </div>
                      <p className="text-[var(--text-primary)] text-sm break-words leading-relaxed font-medium">{val}</p>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-secondary)] shrink-0 space-y-2">
                <button
                  onClick={() => cycleStatus(selected)}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] font-semibold text-sm hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  Mark as {selected.status === "pending" ? "Resolved" : selected.status === "resolved" ? "Rejected" : "Pending"}
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  disabled={deleting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Submission
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
