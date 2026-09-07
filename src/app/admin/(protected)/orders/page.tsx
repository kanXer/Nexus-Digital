"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RefreshCw, Loader2, PackageCheck, TrendingUp, IndianRupee, Users, Search, ArrowUpDown, Calendar, CreditCard } from "lucide-react";

type OrderItem = {
  _id: string;
  name: string;
  email: string;
  amount: number;
  planName: string;
  orderId: string;
  status: string;
  date: string;
  time: string;
  createdAt: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"date" | "amount" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.status === 401) { router.replace("/admin"); return; }
      const d = await res.json();
      if (res.ok) setOrders(d.items || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const totalRevenue = orders.reduce((s, o) => s + (o.amount || 0), 0);
  const totalOrders = orders.length;
  const uniqueCustomers = new Set(orders.map((o) => o.email)).size;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const filtered = orders
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.planName.toLowerCase().includes(q) || o.orderId.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "amount") return (a.amount - b.amount) * dir;
      if (sortKey === "name") return (a.name || "").localeCompare(b.name || "") * dir;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    });

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const kpis = [
    { label: "Total Orders", value: String(totalOrders), icon: PackageCheck, gradient: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400", border: "border-blue-500/20" },
    { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, gradient: "from-green-500/20 to-green-600/5", iconColor: "text-green-400", border: "border-green-500/20" },
    { label: "Customers", value: String(uniqueCustomers), icon: Users, gradient: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400", border: "border-purple-500/20" },
    { label: "Avg. Order", value: `Rs. ${avgOrder.toLocaleString("en-IN")}`, icon: TrendingUp, gradient: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-400", border: "border-amber-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-light flex items-center justify-center shadow-glow-sm">
              <PackageCheck className="w-5 h-5 text-white" />
            </span>
            Orders & Subscriptions
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 ml-[52px]">All customer purchases and subscription payments.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-brand-blue/30 hover:shadow-glow-sm transition-all duration-200"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`relative p-5 rounded-2xl bg-gradient-to-br ${kpi.gradient} border ${kpi.border} overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/[0.03] blur-xl" />
            <div className={`w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center mb-3 ${kpi.iconColor}`}>
              <kpi.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">{kpi.label}</p>
            <p className="text-xl font-black text-[var(--text-primary)] tracking-tight">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + Sort Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, product..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-brand-blue/40 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {([["date", "Date"], ["amount", "Amount"], ["name", "Name"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                sortKey === key
                  ? "bg-brand-blue/15 text-brand-blue-light border border-brand-blue/25"
                  : "bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden shadow-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue-light" />
            <p className="text-sm text-[var(--text-muted)]">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card-hover)] flex items-center justify-center mx-auto mb-4">
              <PackageCheck className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-secondary)]">{search ? "No matching orders found." : "No orders yet."}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{search ? "Try a different search term." : "Orders will appear here once customers make a purchase."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/50">
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--text-muted)] text-[10px] uppercase tracking-[0.15em]">#</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--text-muted)] text-[10px] uppercase tracking-[0.15em]">Customer</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--text-muted)] text-[10px] uppercase tracking-[0.15em] hidden sm:table-cell">Product</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-[var(--text-muted)] text-[10px] uppercase tracking-[0.15em]">Amount</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--text-muted)] text-[10px] uppercase tracking-[0.15em] hidden md:table-cell">Date & Time</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--text-muted)] text-[10px] uppercase tracking-[0.15em]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-card-hover)]/50 transition-colors group"
                  >
                    <td className="px-5 py-4 text-[var(--text-muted)] text-xs font-medium">{i + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue/20 to-brand-blue-light/20 border border-brand-blue/20 flex items-center justify-center text-[10px] font-bold text-brand-blue-light shrink-0">
                          {(order.name || order.email || "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--text-primary)] text-sm truncate">{order.name || "—"}</p>
                          <p className="text-[var(--text-muted)] text-[11px] truncate">{order.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-primary)]">
                        <CreditCard className="w-3 h-3 text-brand-blue-light" />
                        {order.planName}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-green-400 text-sm">Rs. {(order.amount || 0).toLocaleString("en-IN")}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                        <span>{order.date}</span>
                        {order.time && <span className="text-[var(--text-muted)]">at {order.time}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/15 text-green-300 border border-green-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {order.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
