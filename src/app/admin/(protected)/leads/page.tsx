"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RefreshCw, Loader2, TrendingUp, Users, CalendarDays, Percent,
  FileBarChart2, ArrowRight, Inbox, Download,
} from "lucide-react";

type Report = {
  totals: {
    total: number;
    contact: number;
    booking: number;
    enquiry: number;
    pending: number;
    closed: number;
    thisWeek: number;
    thisMonth: number;
    conversionRate: number;
  };
  byService: { service: string; count: number }[];
  trend: { month: string; count: number }[];
  recentLeads: {
    id: string;
    type: string;
    name: string;
    service: string;
    status: string;
    createdAt: string;
  }[];
  leadMagnets: { total: number; top: { title: string; count: number }[] };
};

const fmtMonth = (m: string) => {
  const [y, mo] = m.split("-");
  const d = new Date(Number(y), Number(mo) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short" });
};

export default function LeadReportPage() {
  const router = useRouter();
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/leads/report");
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load");
      setData(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const maxService = data ? Math.max(1, ...data.byService.map((s) => s.count)) : 1;
  const maxTrend = data ? Math.max(1, ...data.trend.map((t) => t.count)) : 1;

  const kpis = data
    ? [
        { label: "Total Leads", value: data.totals.total, icon: Users, sub: `${data.totals.pending} pending · ${data.totals.closed} closed`, color: "from-brand-blue to-brand-blue-light" },
        { label: "This Month", value: data.totals.thisMonth, icon: CalendarDays, sub: `${data.totals.thisWeek} this week`, color: "from-purple-500 to-purple-600" },
        { label: "Enquiries", value: data.totals.enquiry, icon: Inbox, sub: `${data.totals.contact} contact · ${data.totals.booking} booking`, color: "from-emerald-500 to-emerald-600" },
        { label: "Conversion", value: `${data.totals.conversionRate}%`, icon: Percent, sub: "closed / total", color: "from-amber-500 to-orange-600" },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      <div className="relative mb-8 overflow-hidden rounded-3xl glass-card border border-white/8 p-7 md:p-8">
        <div className="pointer-events-none absolute -top-20 right-0 w-72 h-72 bg-brand-blue/15 blur-[100px] rounded-full" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-light shadow-glow-sm flex items-center justify-center">
              <FileBarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">Lead Generation Report</h1>
              <p className="text-white/45 text-sm">Where your enquiries come from and how they convert.</p>
            </div>
          </div>
          <button onClick={load} className="btn-secondary px-4 py-2.5 text-sm self-start sm:self-auto">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-6">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-white/40"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : !data || data.totals.total === 0 ? (
        <div className="glass-card rounded-2xl border border-white/8 p-16 text-center">
          <TrendingUp className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm">No leads captured yet. They&apos;ll show up here as enquiries, contacts and bookings come in.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((k) => (
              <div key={k.label} className="glass-card rounded-2xl p-5 border border-white/8">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3 shadow-glow-sm`}>
                  <k.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-black text-white">{k.value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{k.label}</p>
                <p className="text-[11px] text-white/35 mt-1">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* By service + trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl border border-white/8 p-6">
              <h2 className="text-white font-bold text-lg mb-5">Leads by Service</h2>
              <div className="space-y-3.5">
                {data.byService.map((s) => (
                  <div key={s.service}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/70 truncate pr-3">{s.service}</span>
                      <span className="text-white/45 shrink-0">{s.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.count / maxService) * 100}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-brand-blue-dark via-brand-blue to-brand-blue-light"
                      />
                    </div>
                  </div>
                ))}
                {data.byService.length === 0 && <p className="text-white/35 text-sm">No service data yet.</p>}
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-white/8 p-6">
              <h2 className="text-white font-bold text-lg mb-5">Lead Trend (last 6 months)</h2>
              <div className="flex items-end justify-between gap-2 h-44">
                {data.trend.map((t) => (
                  <div key={t.month} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-[10px] text-white/45 mb-1">{t.count}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(t.count / maxTrend) * 100}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-brand-blue-dark to-brand-blue-light"
                    />
                    <span className="text-[10px] text-white/35 mt-2">{fmtMonth(t.month)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lead magnets */}
          {data.leadMagnets.total > 0 && (
            <div className="glass-card rounded-2xl border border-white/8 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Download className="w-4 h-4 text-pink-400" />
                <h2 className="text-white font-bold text-lg">Lead Magnet Downloads</h2>
                <span className="ml-auto text-[11px] text-white/40">{data.leadMagnets.total} total</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.leadMagnets.top.map((m) => (
                  <div key={m.title} className="rounded-xl bg-white/3 border border-white/8 p-4">
                    <p className="text-white font-medium text-sm truncate">{m.title}</p>
                    <p className="text-brand-blue-light text-xl font-black mt-1">{m.count}</p>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">downloads</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent leads */}
          <div className="glass-card rounded-2xl border border-white/8 p-6">
            <h2 className="text-white font-bold text-lg mb-5">Recent Leads</h2>
            <div className="max-h-[420px] overflow-auto no-scrollbar">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="sticky top-0 bg-[var(--bg-secondary)]/95 backdrop-blur">
                <tr className="text-white/40 text-xs uppercase tracking-wider text-left">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Service</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {data.recentLeads.map((l) => (
                  <tr key={l.id} className="text-white/75">
                    <td className="py-3 pr-4 font-medium text-white truncate max-w-[160px]">{l.name}</td>
                    <td className="py-3 pr-4 text-white/60 truncate max-w-[180px]">{l.service}</td>
                    <td className="py-3 pr-4 text-white/50 capitalize">{l.type}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${
                        l.status === "pending" ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : l.status === "rejected" ? "bg-red-500/15 text-red-300 border-red-500/30"
                          : "bg-green-500/15 text-green-300 border-green-500/30"
                      }`}>{l.status}</span>
                    </td>
                    <td className="py-3 pr-4 text-white/40 whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="mt-5">
              <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-sm text-brand-blue-light hover:underline">
                Manage all submissions <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
