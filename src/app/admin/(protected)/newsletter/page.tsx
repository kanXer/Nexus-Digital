"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Loader2, Send, Users, CheckCircle2, Inbox, RefreshCw, ArrowLeft } from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export default function AdminNewsletterPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/subscribers");
    if (res.status === 401) {
      router.replace("/admin");
      return;
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load");
    setSubscribers(data.subscribers);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/subscribers");
        if (res.status === 401) {
          router.replace("/admin");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (!cancelled) setSubscribers(data.subscribers);
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

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === subscribers.length
        ? new Set()
        : new Set(subscribers.map((s) => s.id))
    );
  };

  const selectedEmails = subscribers
    .filter((s) => selected.has(s.id))
    .map((s) => s.email);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (selectedEmails.length === 0) {
      setError("Select at least one subscriber to send to.");
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
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSuccess(`Newsletter sent to ${data.sent} subscriber${data.sent > 1 ? "s" : ""}.`);
      setSubject("");
      setContent("");
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 mb-5 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="relative mb-8 overflow-hidden rounded-3xl glass-card border border-white/8 p-7 md:p-8">
        <div className="pointer-events-none absolute -top-20 right-0 w-72 h-72 bg-brand-blue/15 blur-[100px] rounded-full" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Newsletter</h1>
            </div>
            <p className="text-white/45 text-sm">Select subscribers, then send your campaign to them.</p>
          </div>
          <button onClick={() => { setError(""); load(); }} className="btn-secondary px-4 py-2.5 text-sm self-start sm:self-auto">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Compose */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 glass-card rounded-2xl border border-white/8 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold">Compose Campaign</h2>
              <p className="text-white/40 text-xs">Send to selected subscribers only</p>
            </div>
          </div>

          {error && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">{error}</div>}
          {success && <div className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mb-4 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {success}</div>}

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="text-white/45 text-xs font-medium mb-1.5 block">Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                maxLength={120}
                placeholder="e.g. New launch — get 20% off"
                className="input-field-with-icon"
              />
            </div>
            <div>
              <label className="text-white/45 text-xs font-medium mb-1.5 block">Content *</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={8}
                placeholder="Write your newsletter message here..."
                className="input-field-with-icon resize-y min-h-[180px]"
              />
            </div>
            <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm ${selectedEmails.length > 0 ? "bg-brand-blue/8 border-brand-blue/25 text-brand-blue-light" : "bg-white/3 border-white/8 text-white/40"}`}>
              <span className="font-semibold">{selectedEmails.length} of {subscribers.length} selected</span>
              <button
                type="button"
                onClick={() => selectedEmails.length > 0 && setSelected(new Set())}
                className={`text-xs font-semibold underline underline-offset-2 ${selectedEmails.length > 0 ? "hover:text-white" : "text-white/25 cursor-default"}`}
              >
                Clear
              </button>
            </div>
            <button
              type="submit"
              disabled={sending || selectedEmails.length === 0}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-60"
            >
              {sending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sending to {selectedEmails.length}...</>
              ) : (
                <><Send className="w-4 h-4" /> Send to {selectedEmails.length} Selected</>
              )}
            </button>
          </form>
        </motion.div>

        {/* Subscribers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card rounded-2xl border border-white/8 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-[0_4px_15px_rgba(16,185,129,0.35)] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold">Subscribers</h2>
              <p className="text-white/40 text-xs">{subscribers.length} total</p>
            </div>
            {subscribers.length > 0 && (
              <button
                onClick={toggleAll}
                className="text-xs font-semibold text-brand-blue-light hover:text-white underline underline-offset-2"
              >
                {selected.size === subscribers.length ? "Clear all" : "Select all"}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-white/40"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-xs">No subscribers yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {subscribers.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-3 bg-white/3 border rounded-lg px-3 py-2.5 cursor-pointer transition-all ${
                    selected.has(s.id) ? "border-brand-blue/40 bg-brand-blue/8" : "border-white/6 hover:border-white/15"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    className="w-4 h-4 accent-[#dc2626] shrink-0"
                  />
                  <div className="w-8 h-8 rounded-full bg-brand-blue/15 border border-brand-blue/25 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-brand-blue-light" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white/85 text-sm font-medium truncate">{s.email}</p>
                    <p className="text-white/35 text-[11px] truncate">{s.name} · {new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
