"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Loader2,
  Send,
  Users,
  CheckCircle2,
  Inbox,
  RefreshCw,
  ArrowLeft,
  CreditCard,
  MessageSquare,
  Calendar,
  Download,
  User,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Phone,
} from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  source: string;
  sourceLabel: string;
  sources: string[];
  createdAt: string;
  lastActive: string;
};

type CountsBreakdown = {
  total: number;
  cashfree: number;
  contact: number;
  newsletter: number;
  bookings: number;
  leadmagnet: number;
  users: number;
};

const SOURCE_TABS = [
  { id: "all", label: "All Audience" },
  { id: "cashfree", label: "Cashfree Buyers" },
  { id: "contact", label: "Contact Us" },
  { id: "newsletter", label: "Newsletter Subs" },
  { id: "bookings", label: "Strategy Bookings" },
  { id: "leadmagnet", label: "Lead Magnets" },
  { id: "users", label: "Logged-in Accounts" },
] as const;

export default function AdminNewsletterPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [counts, setCounts] = useState<CountsBreakdown>({
    total: 0,
    cashfree: 0,
    contact: 0,
    newsletter: 0,
    bookings: 0,
    leadmagnet: 0,
    users: 0,
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load audience");
      setSubscribers(data.subscribers || []);
      if (data.counts) setCounts(data.counts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load audience");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      // Source filter
      let matchesSource = true;
      if (sourceFilter === "cashfree") {
        matchesSource = s.sources.some((src) => src.toLowerCase().includes("cashfree"));
      } else if (sourceFilter === "contact") {
        matchesSource = s.sources.some((src) => src.toLowerCase().includes("contact"));
      } else if (sourceFilter === "newsletter") {
        matchesSource = s.sources.some((src) => src.toLowerCase().includes("newsletter"));
      } else if (sourceFilter === "bookings") {
        matchesSource = s.sources.some((src) => src.toLowerCase().includes("booking"));
      } else if (sourceFilter === "leadmagnet") {
        matchesSource = s.sources.some((src) => src.toLowerCase().includes("lead magnet"));
      } else if (sourceFilter === "users") {
        matchesSource = s.sources.some((src) => src.toLowerCase().includes("account"));
      }

      if (!matchesSource) return false;

      // Search query
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        s.email.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q))
      );
    });
  }, [subscribers, sourceFilter, search]);

  const selectAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      filteredSubscribers.forEach((s) => next.add(s.id));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      filteredSubscribers.forEach((s) => next.delete(s.id));
      return next;
    });
  };

  const areAllFilteredSelected =
    filteredSubscribers.length > 0 &&
    filteredSubscribers.every((s) => selected.has(s.id));

  const selectedEmails = useMemo(() => {
    return subscribers
      .filter((s) => selected.has(s.id))
      .map((s) => s.email);
  }, [subscribers, selected]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (selectedEmails.length === 0) {
      setError("Please select at least one recipient to send to.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content, emails: selectedEmails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send broadcast");
      setSuccess(`Broadcast dispatched successfully to ${data.sent} contact${data.sent > 1 ? "s" : ""}!`);
      setSubject("");
      setContent("");
      setSelected(new Set());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send email broadcast");
    } finally {
      setSending(false);
    }
  };

  const getSourceIcon = (sourceLabel: string) => {
    const s = sourceLabel.toLowerCase();
    if (s.includes("cashfree")) return CreditCard;
    if (s.includes("contact")) return Mail;
    if (s.includes("booking")) return Calendar;
    if (s.includes("lead magnet")) return Download;
    if (s.includes("account")) return User;
    return Inbox;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 select-none">
      {/* Top Breadcrumb */}
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] px-3 py-1.5 rounded-xl transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] p-6 sm:p-8 shadow-card">
        <div className="pointer-events-none absolute -top-20 right-0 w-80 h-80 bg-red-600/10 blur-[100px] rounded-full" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 shadow-[0_4px_20px_rgba(220,38,38,0.4)] flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  Unified Email Broadcasts
                </h1>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-500/15 text-rose-400 border border-red-500/30">
                  {counts.total} Omnichannel Leads
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
                Every captured contact across website forms, Cashfree checkouts, strategy calls, and user logins.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setError("");
                load();
              }}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-red-500/30 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <RefreshCw className="w-4 h-4" />}
              <span>Refresh Audience</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Compose Custom Message */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-default)] p-6 shadow-card flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 shadow-[0_4px_16px_rgba(220,38,38,0.3)] flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[var(--text-primary)] font-extrabold text-base">
                  Compose Custom Message
                </h2>
                <p className="text-[var(--text-muted)] text-xs">
                  Dispatched directly to chosen recipients with Nexus luxury branding
                </p>
              </div>
            </div>

            {error && (
              <div className="text-rose-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5 mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2.5 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSend} id="broadcast-form" className="space-y-4">
              <div>
                <label className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider mb-1.5 block">
                  Campaign Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  maxLength={120}
                  placeholder="e.g. Exclusive Q4 Strategy: Unlock 3x ROAS with Nexus Digital"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-red-500/50 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider mb-1.5 block">
                  Custom Message Body *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={9}
                  placeholder="Hi there,&#10;&#10;We are rolling out an exclusive growth accelerator for our valued partners..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-red-500/50 shadow-sm resize-y min-h-[190px] transition-all"
                />
              </div>

              {/* Selection Indicator Banner */}
              <div
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-xs font-semibold ${
                  selectedEmails.length > 0
                    ? "bg-red-500/10 border-red-500/30 text-rose-300"
                    : "bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-muted)]"
                }`}
              >
                <span>
                  <strong className="text-white">{selectedEmails.length}</strong> of{" "}
                  {subscribers.length} total recipients selected
                </span>
                {selectedEmails.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="text-[11px] text-rose-400 hover:text-white underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              form="broadcast-form"
              disabled={sending || selectedEmails.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-[0_4px_20px_rgba(220,38,38,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Dispatching to {selectedEmails.length} Recipients...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast ({selectedEmails.length})</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Right Column: Audience Selector & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-default)] p-6 shadow-card flex flex-col"
        >
          {/* Top Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-[var(--text-primary)] font-extrabold text-base">
                  Audience Directory
                </h2>
                <p className="text-[var(--text-muted)] text-xs">
                  {filteredSubscribers.length} shown · {selected.size} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={areAllFilteredSelected ? deselectAllFiltered : selectAllFiltered}
                disabled={filteredSubscribers.length === 0}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {areAllFilteredSelected ? (
                  <>
                    <Square className="w-3.5 h-3.5 text-rose-400" />
                    <span>Deselect Filtered</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Select Filtered ({filteredSubscribers.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Source Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap p-1 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl mb-3">
            {SOURCE_TABS.map((t) => {
              const countForTab =
                t.id === "all"
                  ? counts.total
                  : counts[t.id as keyof CountsBreakdown] || 0;
              return (
                <button
                  key={t.id}
                  onClick={() => setSourceFilter(t.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    sourceFilter === t.id
                      ? "bg-red-600 text-white shadow-glow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="text-[9px] opacity-75">({countForTab})</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts by name, email, or phone number..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-red-500/50 transition-all"
            />
          </div>

          {/* Audience List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2 text-[var(--text-muted)]">
              <Loader2 className="w-7 h-7 animate-spin text-red-500" />
              <p className="text-xs uppercase font-bold tracking-wider">Loading Contacts...</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-center text-[var(--text-muted)]">
              <Inbox className="w-8 h-8 mx-auto text-[var(--text-muted)]" />
              <p className="text-xs font-semibold">No contacts found in this category.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredSubscribers.map((s) => {
                const isChecked = selected.has(s.id);
                const Icon = getSourceIcon(s.sourceLabel);

                return (
                  <div
                    key={s.id}
                    onClick={() => toggleSelect(s.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isChecked
                        ? "border-red-500/60 bg-red-500/10 shadow-[0_2px_12px_rgba(220,38,38,0.15)]"
                        : "border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-red-500/30 hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(s.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-red-600 rounded cursor-pointer shrink-0"
                    />

                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-rose-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {s.name}
                        </p>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                          {new Date(s.lastActive).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                        {s.email}
                      </p>

                      {/* Source Pills */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {s.sources.map((src, i) => {
                          const isCF = src.includes("Cashfree");
                          const isContact = src.includes("Contact");
                          const isBook = src.includes("Booking");
                          return (
                            <span
                              key={i}
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${
                                isCF
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : isContact
                                  ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                  : isBook
                                  ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                                  : "bg-red-500/10 text-rose-300 border-red-500/20"
                              }`}
                            >
                              {src}
                            </span>
                          );
                        })}
                        {s.phone && (
                          <span className="text-[9px] font-mono text-[var(--text-muted)]">
                            {s.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
