"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  MessageSquare,
  Tag,
  Calendar,
  User,
  RefreshCw,
  ChevronRight,
  Filter,
  Download,
  AlertCircle,
  ExternalLink,
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
  contact: { label: "Contact", color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30", icon: Mail },
  enquiry: { label: "Enquiry", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", icon: MessageSquare },
  booking: { label: "Booking", color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30", icon: Calendar },
  subscribe: { label: "Newsletter", color: "text-pink-400", bg: "bg-pink-500/15 border-pink-500/30", icon: Inbox },
  leadmagnet: { label: "Lead Magnet", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", icon: Download },
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  contacted: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  proposal: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  won: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  lost: "bg-red-500/15 text-red-400 border-red-500/30",
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

const FIELD_ICONS: Record<string, React.ElementType> = {
  name: User,
  email: Mail,
  phone: Phone,
  business: Briefcase,
  service: Tag,
  message: MessageSquare,
};

const TABS = [
  { id: "all", label: "All Submissions" },
  { id: "contact", label: "Contact Us" },
  { id: "enquiry", label: "Enquiries" },
  { id: "booking", label: "Bookings" },
  { id: "leadmagnet", label: "Lead Magnets" },
  { id: "subscribe", label: "Newsletter" },
] as const;

type FilterId = (typeof TABS)[number]["id"];

export default function SubmissionsPage() {
  const router = useRouter();
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SubmissionItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [resolutionRemarks, setResolutionRemarks] = useState("");
  const [sendResolveEmail, setSendResolveEmail] = useState(true);
  const [resolveSuccessMsg, setResolveSuccessMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter === "all" ? "" : `?type=${filter}`;
      const res = await fetch(`/api/admin/submissions${q}`);
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      const d = await res.json();
      if (res.ok) setItems(d.items || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [router, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSelectSubmission = (it: SubmissionItem) => {
    setSelected(it);
    setResolutionRemarks(String(it.data?.resolutionNotes || it.data?.notes || ""));
    setResolveSuccessMsg("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/submissions?id=${id}`, { method: "DELETE" });
      setSelected(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const updateStatus = async (item: SubmissionItem, newStatus: string, remarks?: string, sendMail?: boolean) => {
    setUpdating(true);
    setResolveSuccessMsg("");
    try {
      const res = await fetch("/api/admin/submissions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          status: newStatus,
          resolutionNotes: remarks ?? resolutionRemarks,
          sendEmail: sendMail ?? sendResolveEmail,
        }),
      });
      const data = await res.json();
      const updated: SubmissionItem = {
        ...item,
        status: newStatus,
        data: {
          ...item.data,
          ...(remarks ? { resolutionNotes: remarks } : {}),
        },
      };
      setSelected(updated);
      setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));

      if (newStatus === "resolved") {
        if (data.emailSent) {
          setResolveSuccessMsg("Query marked as Resolved and confirmation email dispatched to client!");
        } else {
          setResolveSuccessMsg("Query marked as Resolved (no email address found or email delivery skipped).");
        }
      }
    } finally {
      setUpdating(false);
    }
  };

  const cycleStatus = async (item: SubmissionItem) => {
    const current = item.status || "pending";
    const next =
      current === "pending"
        ? "contacted"
        : current === "contacted"
        ? "resolved"
        : current === "resolved"
        ? "rejected"
        : "pending";

    await updateStatus(item, next);
  };

  const getWhatsAppLink = (lead: SubmissionItem) => {
    const phone = String(lead.data?.phone || "");
    if (!phone) return null;
    const clean = phone.replace(/[^0-9]/g, "");
    const withCode = clean.length === 10 ? `91${clean}` : clean;
    const name = String(lead.data?.name || "there");
    const service = String(lead.data?.service || "digital marketing services");
    const msg = encodeURIComponent(
      `Hi ${name}, thank you for contacting Nexus Digital regarding ${service}! Are you free for a 10-minute strategy call?`
    );
    return `https://wa.me/${withCode}?text=${msg}`;
  };

  const filtered = items.filter((it) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(it.data?.name || "").toLowerCase().includes(q) ||
      String(it.data?.email || "").toLowerCase().includes(q) ||
      String(it.data?.phone || "").toLowerCase().includes(q) ||
      String(it.data?.service || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-24 select-none">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-default)] p-6 sm:p-7 shadow-card"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 shadow-[0_6px_20px_rgba(220,38,38,0.4)] flex items-center justify-center shrink-0">
            <Inbox className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Inbound Submissions</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Live inquiries, contact requests, and strategy bookings log.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-default)] px-3 py-1.5 rounded-xl">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-red-500/30 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <RefreshCw className="w-4 h-4" />}
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1.5 flex-wrap p-1 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl shadow-card">
          <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] ml-2 shrink-0" />
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                filter === t.id
                  ? "bg-red-600 text-white border-red-500 shadow-glow-sm"
                  : "bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
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
            placeholder="Filter by prospect name, email, phone, or service..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-red-500/50 shadow-card transition-all"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-[var(--text-muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <p className="text-xs font-bold uppercase tracking-wider">Syncing Submissions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[var(--text-primary)] font-extrabold text-base">
              {search ? "No matches found" : "Inbox empty"}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {search ? "Try searching for a different keyword." : "New leads from website forms will appear here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((it, i) => {
            const meta: TypeMetaEntry = TYPE_META[it.type] || TYPE_META.contact;
            const TypeIcon = meta.icon;
            const name = String(it.data?.name || it.data?.email || "Unknown Prospect");
            const email = String(it.data?.email || "");
            const phone = String(it.data?.phone || "");
            const service = String(it.data?.service || it.data?.resourceTitle || "");
            const status = it.status || "pending";
            const waLink = getWhatsAppLink(it);

            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => setSelected(it)}
                className="group relative overflow-hidden text-left w-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-red-500/40 rounded-2xl p-5 transition-all duration-200 shadow-card hover:shadow-[0_8px_30px_rgba(220,38,38,0.12)] cursor-pointer"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-red-600 via-rose-500 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between mb-3">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${meta.bg} ${meta.color}`}>
                    <TypeIcon className="w-3 h-3" />
                    {meta.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${STATUS_BADGE[status] || STATUS_BADGE.pending}`}>
                      {status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-red-500 transition-colors" />
                  </div>
                </div>

                <p className="font-extrabold text-[var(--text-primary)] text-base truncate mb-1 group-hover:text-red-500 transition-colors">
                  {name}
                </p>

                <div className="space-y-1.5 mb-4">
                  {email && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
                      <span className="truncate">{email}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
                      <span className="font-mono">{phone}</span>
                    </div>
                  )}
                  {service && (
                    <div className="flex items-center gap-1.5 text-xs truncate">
                      <Tag className="w-3.5 h-3.5 shrink-0 text-red-500" />
                      <span className="truncate font-semibold text-[var(--text-secondary)]">{service}</span>
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-semibold">
                    <Calendar className="w-3 h-3" />
                    {new Date(it.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {it.status !== "resolved" && (
                      <button
                        onClick={() => handleSelectSubmission(it)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => handleSelectSubmission(it)}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      Details →
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Side Slide-Out Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[var(--bg-card)] border-l border-[var(--border-default)] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-6 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/70 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {(() => {
                        const meta: TypeMetaEntry = TYPE_META[selected.type] || TYPE_META.contact;
                        const TypeIcon = meta.icon;
                        return (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${meta.bg} ${meta.color}`}>
                            <TypeIcon className="w-3 h-3" />
                            {meta.label}
                          </div>
                        );
                      })()}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_BADGE[selected.status || "pending"] || STATUS_BADGE.pending}`}>
                        {selected.status === "resolved" ? "✓ Resolved & Notified" : selected.status || "pending"}
                      </span>
                    </div>
                    <h2 className="text-[var(--text-primary)] font-black text-xl leading-tight truncate">
                      {String(selected.data?.name || selected.data?.email || "Submission Details")}
                    </h2>
                    <p className="text-[var(--text-muted)] text-xs mt-1">
                      Received {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Resolution Confirmation Banner */}
                {resolveSuccessMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-300">{resolveSuccessMsg}</p>
                    </div>
                  </div>
                )}

                {/* Resolve Query & Send Email Section */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--bg-secondary)] to-emerald-950/20 border border-emerald-500/30 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h3 className="text-xs font-extrabold text-[var(--text-primary)]">
                        Resolve Query & Client Email
                      </h3>
                    </div>
                    {selected.status === "resolved" ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Resolved
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        Awaiting Resolution
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Marking this inquiry as <span className="text-emerald-400 font-semibold">Resolved</span> will record your resolution notes and automatically send a formal resolution confirmation email to the prospect.
                  </p>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">
                      Resolution Remarks / Solution Shared
                    </label>
                    <textarea
                      value={resolutionRemarks}
                      onChange={(e) => setResolutionRemarks(e.target.value)}
                      placeholder="e.g., We contacted the client via phone and shared the tailored marketing proposal and onboarding roadmap..."
                      rows={3}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 resize-none transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[var(--text-secondary)] font-medium">
                      <input
                        type="checkbox"
                        checked={sendResolveEmail}
                        onChange={(e) => setSendResolveEmail(e.target.checked)}
                        className="rounded accent-emerald-500 w-3.5 h-3.5"
                      />
                      <span>Send resolution email to <span className="font-mono text-emerald-400">{String(selected.data?.email || "client")}</span></span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => updateStatus(selected, "resolved", resolutionRemarks, sendResolveEmail)}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {updating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <Mail className="w-4 h-4" />
                        </>
                      )}
                      <span>
                        {selected.status === "resolved"
                          ? "Re-Send Resolution Email & Update Remarks"
                          : "Mark as Resolved & Dispatch Email"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submission Data Fields */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Submitted Inbound Details
                  </h4>
                  {Object.entries(selected.data).map(([k, v]) => {
                    if (k === "auto") return null;
                    const val = typeof v === "string" || typeof v === "number" ? String(v) : JSON.stringify(v);
                    const FieldIcon = FIELD_ICONS[k];
                    return (
                      <div key={k} className="bg-[var(--bg-secondary)] rounded-xl px-4 py-3 border border-[var(--border-default)]">
                        <div className="flex items-center gap-1.5 mb-1">
                          {FieldIcon && <FieldIcon className="w-3 h-3 text-[var(--text-muted)]" />}
                          <p className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider">
                            {FIELD_LABELS[k] || k}
                          </p>
                        </div>
                        <p className="text-[var(--text-primary)] text-xs font-semibold break-words leading-relaxed">
                          {val}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 sm:p-6 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/70 space-y-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cycleStatus(selected)}
                    disabled={updating}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] font-bold text-xs hover:border-red-500/40 hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Cycle: {selected.status === "pending" ? "Contacted" : selected.status === "contacted" ? "Resolved" : selected.status === "resolved" ? "Rejected" : "Pending"}
                  </button>

                  <button
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleting}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 font-bold text-xs hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
