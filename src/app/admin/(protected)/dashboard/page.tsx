"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Trash2, Mail, Phone, Calendar, FileText, Inbox, Loader2,
  CheckCircle2, XCircle, Clock, ExternalLink, Send, LayoutDashboard,
} from "lucide-react";

type SubmissionItem = {
  id: string;
  type: "contact" | "booking" | "enquiry" | "subscribe";
  status?: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string | null;
};

type Counts = {
  contact: number;
  booking: number;
  enquiry: number;
  subscribe: number;
  contactPending: number;
  bookingPending: number;
  enquiryPending: number;
  total: number;
};

function getAdminName(email?: string): string {
  if (!email) return "";
  const base = email.split("@")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const typeLabels: Record<string, string> = {
  contact: "Contact",
  booking: "Meeting Booking",
  enquiry: "Enquiry",
  subscribe: "Newsletter",
};

const typeColors: Record<string, string> = {
  contact: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  booking: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  enquiry: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  subscribe: "bg-green-500/15 text-green-300 border-green-500/30",
};

const statusBadge: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  confirmed: "bg-green-500/15 text-green-300 border-green-500/30",
  resolved: "bg-green-500/15 text-green-300 border-green-500/30",
  rejected: "bg-red-500/15 text-red-300 border-red-500/30",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [counts, setCounts] = useState<Counts>({ contact: 0, booking: 0, enquiry: 0, subscribe: 0, contactPending: 0, bookingPending: 0, enquiryPending: 0, total: 0 });
  const [filter, setFilter] = useState<"all" | "contact" | "booking" | "enquiry">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "done">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<SubmissionItem | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/submissions");
    if (res.status === 401) {
      router.replace("/admin");
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load");
    setItems(data.items);
    setCounts(data.counts);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ses = await fetch("/api/admin/session");
        if (ses.ok) {
          const s = await ses.json();
          if (!cancelled && s.email) setEmail(s.email);
        }
      } catch {
        // ignore
      }
      try {
        const res = await fetch("/api/admin/submissions");
        if (res.status === 401) {
          router.replace("/admin");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (!cancelled) {
          setItems(data.items);
          setCounts(data.counts);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    try {
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    await fetch(`/api/admin/submissions?id=${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    load();
  };

  const handleStatus = async (item: SubmissionItem, action: "confirm" | "reject" | "resolve" | "reopen") => {
    if (item.type === "subscribe") return;
    setActing(item.id);
    setError("");
    try {
      const res = await fetch("/api/admin/submissions/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      await load();
      setSelected((prev) => {
        if (!prev || prev.id !== item.id) return prev;
        let status: string;
        if (item.type === "booking") {
          status = action === "confirm" ? "confirmed" : action === "reject" ? "rejected" : "pending";
        } else {
          status = action === "resolve" ? "resolved" : "pending";
        }
        return { ...prev, status };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setActing(null);
    }
  };

  const isDone = (item: SubmissionItem) =>
    item.status === "confirmed" || item.status === "resolved" || item.status === "rejected";

  const filtered = items.filter((i) => {
    if (i.type === "subscribe") return false;
    if (filter !== "all" && i.type !== filter) return false;
    if (statusFilter === "pending") return !isDone(i);
    if (statusFilter === "done") return isDone(i);
    return true;
  });

  const newsletterItems = items.filter((i) => i.type === "subscribe");

  const tabs = [
    { key: "all" as const, label: "All", value: counts.total - counts.subscribe, icon: Inbox },
    { key: "contact" as const, label: "Contact", value: counts.contact, icon: Mail },
    { key: "enquiry" as const, label: "Enquiries", value: counts.enquiry, icon: FileText },
    { key: "booking" as const, label: "Bookings", value: counts.booking, icon: Calendar },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <div className="relative mb-8 overflow-hidden rounded-3xl glass-card border border-white/8 p-7 md:p-8">
        <div className="pointer-events-none absolute -top-20 right-0 w-72 h-72 bg-brand-blue/15 blur-[100px] rounded-full" />
        <div className="pointer-events-none absolute bottom-0 left-10 w-40 h-40 bg-brand-blue/8 blur-[80px] rounded-full" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-blue-light mb-1.5">
              {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening"}
            </p>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  Welcome back{email ? `, ${getAdminName(email)}` : ""}
                </h1>
                <p className="text-white/45 text-sm">Here's what's happening across your submissions.</p>
              </div>
            </div>
          </div>
          <button onClick={handleRefresh} className="btn-secondary px-4 py-2.5 text-sm self-start sm:self-auto">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {tabs.map((t) => {
          const active = filter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`group glass-card relative overflow-hidden rounded-2xl p-4 text-left border transition-all ${
                active ? "border-brand-blue/40 bg-brand-blue/8 shadow-glow-sm" : "border-white/8 hover:border-white/15 hover:-translate-y-0.5"
              }`}
            >
              <div className={`pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl transition-opacity ${active ? "bg-brand-blue/30 opacity-100" : "opacity-0"}`} />
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? "bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm" : "bg-white/5 group-hover:bg-white/10"}`}>
                  <t.icon className={`w-4 h-4 ${active ? "text-white" : "text-brand-blue-light"}`} />
                </div>
                <p className="text-2xl font-black text-white">{t.value}</p>
              </div>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${active ? "text-brand-blue-light" : "text-white/40"}`}>{t.label}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-white/40 text-xs font-medium uppercase tracking-wider mr-1">Status:</span>
        {(
          [
            { key: "all" as const, label: "All", extra: "" },
            { key: "pending" as const, label: "Pending", extra: `(${counts.contactPending + counts.bookingPending + counts.enquiryPending})` },
            { key: "done" as const, label: "Confirmed / Resolved", extra: "" },
          ]
        ).map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === s.key
                ? "bg-brand-blue/15 text-brand-blue-light border-brand-blue/40"
                : "text-white/50 border-white/10 hover:text-white hover:border-white/20"
            }`}
          >
            {s.label} {s.extra}
          </button>
        ))}
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-white/40"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl border border-white/8 p-16 text-center">
          <Inbox className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm">No submissions match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelected(item)}
              className="glass-card rounded-2xl border border-white/8 p-5 cursor-pointer hover:border-white/15 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${typeColors[item.type]}`}>
                    {typeLabels[item.type] || item.type}
                  </span>
                  {item.status && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusBadge[item.status]}`}>
                      {item.status}
                    </span>
                  )}
                  <span className="text-white/30 text-xs">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {!isDone(item) && item.type === "booking" && (
                    <>
                      <button
                        onClick={() => handleStatus(item, "confirm")}
                        disabled={acting === item.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 bg-green-500/15 text-green-300 border border-green-500/30 hover:bg-green-500/25"
                        title="Confirm booking"
                      >
                        {acting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatus(item, "reject")}
                        disabled={acting === item.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25"
                        title="Reject booking"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                  {!isDone(item) && (item.type === "contact" || item.type === "enquiry") && (
                    <button
                      onClick={() => handleStatus(item, "resolve")}
                      disabled={acting === item.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 bg-green-500/15 text-green-300 border border-green-500/30 hover:bg-green-500/25"
                      title="Mark resolved"
                    >
                      {acting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Resolve
                    </button>
                  )}
                  {isDone(item) && (item.type === "contact" || item.type === "enquiry") && (
                    <button
                      onClick={() => handleStatus(item, "reopen")}
                      disabled={acting === item.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                    >
                      {acting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                      Reopen
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-white font-bold text-lg truncate">
                  {String(item.data?.name || "—")}
                </p>
                <p className="text-brand-blue-light text-sm font-semibold truncate">
                  {item.type === "booking" ? String(item.data?.service || "Free Consultation") : String(item.data?.service || item.data?.business || "General Enquiry")}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/40 font-semibold">
                <Mail className="w-3.5 h-3.5 text-brand-blue-light" />
                <span className="truncate">{String(item.data?.email || "")}</span>
                <span className="text-white/20 mx-1">·</span>
                <ExternalLink className="w-3.5 h-3.5 text-brand-blue-light shrink-0" />
                <span className="shrink-0">View details</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Newsletter subscribers */}
      {!loading && newsletterItems.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white">Newsletter Subscribers</h2>
              <p className="text-white/40 text-sm">{newsletterItems.length} total</p>
            </div>
            <Link href="/admin/newsletter" className="btn-secondary px-4 py-2.5 text-sm">
              <Send className="w-4 h-4" /> Open Newsletter
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {newsletterItems.slice(0, 12).map((item) => (
              <div key={item.id} className="glass-card rounded-xl border border-white/8 p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-brand-blue-light" />
                  </div>
                  <p className="text-white/85 text-sm font-medium truncate">{String(item.data?.email || "—")}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white/35 text-[11px] truncate">
                    {String(item.data?.name || "Newsletter Subscriber")} · {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded-md text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {newsletterItems.length > 12 && (
            <p className="text-white/30 text-xs mt-3">Showing latest 12 of {newsletterItems.length}. Open the newsletter page for the full list.</p>
          )}
        </div>
      )}

      {/* Details popup */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg-secondary)] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${typeColors[selected.type]}`}>
                    {typeLabels[selected.type] || selected.type}
                  </span>
                  {selected.status && selected.type !== "subscribe" && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusBadge[selected.status]}`}>
                      {selected.status}
                    </span>
                  )}
                </div>
                <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-xl leading-none p-1">×</button>
              </div>

              <p className="text-white/30 text-xs mb-5">{new Date(selected.createdAt).toLocaleString()}</p>

              <div className="space-y-3 mb-6">
                {Object.entries(selected.data)
                  .filter(([, v]) => v !== undefined && v !== null && v !== "")
                  .map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2.5">
                      {key === "email" && <Mail className="w-4 h-4 text-brand-blue-light shrink-0 mt-0.5" />}
                      {key === "phone" && <Phone className="w-4 h-4 text-brand-blue-light shrink-0 mt-0.5" />}
                      {(key === "date" || key === "time") && <Calendar className="w-4 h-4 text-brand-blue-light shrink-0 mt-0.5" />}
                      {(key === "message" || key === "business" || key === "service" || key === "budget" || key === "name") && <FileText className="w-4 h-4 text-brand-blue-light shrink-0 mt-0.5" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-white/35 text-[11px] font-medium uppercase tracking-wider">{key}</p>
                        <p className="text-white/90 text-sm break-words">{String(value)}</p>
                      </div>
                    </div>
                  ))}
              </div>

              {selected.type !== "subscribe" && (
                <div className="flex gap-2 border-t border-white/8 pt-5">
                  {selected.type === "booking" && !isDone(selected) && (
                    <>
                      <button
                        onClick={() => handleStatus(selected, "confirm")}
                        disabled={acting === selected.id}
                        className="btn-primary flex-1 justify-center text-sm py-3 disabled:opacity-60"
                      >
                        {acting === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Confirm Booking
                      </button>
                      <button
                        onClick={() => handleStatus(selected, "reject")}
                        disabled={acting === selected.id}
                        className="btn-secondary flex-1 justify-center text-sm py-3 disabled:opacity-60 hover:!border-red-500/40 hover:!text-red-300"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {selected.type === "booking" && isDone(selected) && (
                    <p className="flex-1 text-center text-sm py-3 text-white/40">
                      {selected.status === "confirmed" ? "This booking is confirmed." : "This booking was rejected."}
                    </p>
                  )}
                  {(selected.type === "contact" || selected.type === "enquiry") && (
                    <>
                      {!isDone(selected) ? (
                        <button
                          onClick={() => handleStatus(selected, "resolve")}
                          disabled={acting === selected.id}
                          className="btn-primary flex-1 justify-center text-sm py-3 disabled:opacity-60"
                        >
                          {acting === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Mark Resolved
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatus(selected, "reopen")}
                          disabled={acting === selected.id}
                          className="btn-secondary flex-1 justify-center text-sm py-3 disabled:opacity-60"
                        >
                          <Clock className="w-4 h-4" />
                          Reopen
                        </button>
                      )}
                    </>
                  )}
                  <button onClick={() => handleDelete(selected.id)} className="btn-secondary px-4 py-3 text-sm hover:!border-red-500/40 hover:!text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
