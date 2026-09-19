"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  RefreshCw,
  Loader2,
  TrendingUp,
  IndianRupee,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Copy,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  Mail,
  Phone,
  User,
  AlertCircle,
  ArrowUpDown,
  Check,
} from "lucide-react";

type PaymentItem = {
  _id: string;
  orderId: string;
  cfPaymentId: string;
  amount: number;
  currency: string;
  planName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentStatus: "SUCCESS" | "PENDING" | "FAILED";
  rawStatus: string;
  paymentMethod: string;
  date: string;
  time: string;
  createdAt: string;
  updatedAt?: string;
};

type GatewayMeta = {
  configured: boolean;
  environment: string;
  isLive: boolean;
};

type KpiData = {
  totalRevenue: number;
  successfulCount: number;
  pendingCount: number;
  failedCount: number;
  totalTransactions: number;
  averageOrderValue: number;
};

const STATUS_TABS = [
  { id: "all", label: "All Payments" },
  { id: "success", label: "Successful" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
] as const;

export default function CashfreePaymentsPage() {
  const router = useRouter();
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [kpis, setKpis] = useState<KpiData>({
    totalRevenue: 0,
    successfulCount: 0,
    pendingCount: 0,
    failedCount: 0,
    totalTransactions: 0,
    averageOrderValue: 0,
  });
  const [gateway, setGateway] = useState<GatewayMeta>({
    configured: false,
    environment: "Detecting...",
    isLive: false,
  });
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = statusFilter === "all" ? "" : `?status=${statusFilter}`;
      const res = await fetch(`/api/admin/payments${q}`);
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      const d = await res.json();
      if (res.ok) {
        setItems(d.items || []);
        if (d.kpis) setKpis(d.kpis);
        if (d.gateway) setGateway(d.gateway);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [router, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const verifyOrder = async (orderId: string) => {
    setVerifyingId(orderId);
    setFeedbackMsg(null);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({
          text: `Order ${orderId} verified with Cashfree: Status is ${data.isPaid ? "PAID (SUCCESS)" : data.orderStatus}.`,
          type: "success",
        });
        load();
      } else {
        setFeedbackMsg({
          text: data.message || data.error || "Cashfree verification response received.",
          type: "success",
        });
      }
    } catch (err: unknown) {
      setFeedbackMsg({
        text: err instanceof Error ? err.message : "Verification request failed.",
        type: "error",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = () => {
    if (items.length === 0) return;
    const headers = [
      "Order ID",
      "CF Payment ID",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Plan / Service",
      "Amount (INR)",
      "Payment Status",
      "Payment Method",
      "Date",
      "Time",
    ];

    const rows = items.map((o) => [
      `"${o.orderId}"`,
      `"${o.cfPaymentId || "N/A"}"`,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.customerPhone}"`,
      `"${o.planName}"`,
      o.amount,
      `"${o.paymentStatus}"`,
      `"${o.paymentMethod}"`,
      `"${o.date}"`,
      `"${o.time}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cashfree_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = items.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.cfPaymentId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      o.planName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-24 select-none">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-default)] p-6 sm:p-7 shadow-card"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 shadow-[0_6px_20px_rgba(16,185,129,0.35)] flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                Cashfree Payments
              </h1>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  gateway.isLive
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}
              >
                ● {gateway.environment}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
              Live audit trail of all online checkouts and revenue captured via Cashfree Payment Gateway.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50"
            title="Download CSV report"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-emerald-500/30 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <RefreshCw className="w-4 h-4" />}
            <span>Sync</span>
          </button>
        </div>
      </motion.div>

      {/* Verification Feedback Banner */}
      {feedbackMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold ${
            feedbackMsg.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/15 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-4 sm:p-5 shadow-card relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Cashfree Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            ₹{kpis.totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Captured in Cashfree
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-4 sm:p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Paid Transactions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {kpis.successfulCount}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-1">
            {kpis.totalTransactions} total checkouts initiated
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-4 sm:p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Pending / Dropouts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {kpis.pendingCount}
          </p>
          <p className="text-[10px] text-amber-400/80 font-semibold mt-1">
            Reconcile via 1-click verify
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] p-4 sm:p-5 shadow-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Avg. Ticket Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            ₹{kpis.averageOrderValue.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-1">
            Per confirmed payment
          </p>
        </motion.div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1.5 flex-wrap p-1 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl shadow-card">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`text-xs px-3.5 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
                statusFilter === t.id
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-[0_2px_12px_rgba(16,185,129,0.35)]"
                  : "bg-transparent border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Cashfree Ref, Customer, or Plan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 shadow-card transition-all"
          />
        </div>
      </div>

      {/* Payments Content View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-[var(--text-muted)]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-xs font-bold uppercase tracking-wider">Syncing Cashfree Ledger...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)]">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[var(--text-primary)] font-extrabold text-base">
              {search ? "No matching payments found" : "No Cashfree payments recorded"}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
              {search
                ? "Try searching for a different keyword or clearing your filter."
                : "Live purchases made through the Cashfree payment gateway will automatically appear here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-default)] overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-secondary)]/80 text-[var(--text-muted)] uppercase tracking-wider font-bold border-b border-[var(--border-default)] text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Order / Gateway ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Package / Service</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Gateway Status</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {filtered.map((o) => {
                  const isSuccess = o.paymentStatus === "SUCCESS";
                  const isPending = o.paymentStatus === "PENDING";
                  const isFailed = o.paymentStatus === "FAILED";

                  const phoneClean = o.customerPhone.replace(/[^0-9]/g, "");
                  const waNumber = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
                  const waUrl = waNumber
                    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
                        `Hi ${o.customerName}, this is Nexus Digital regarding your order ${o.orderId}.`
                      )}`
                    : null;

                  return (
                    <tr
                      key={o._id}
                      onClick={() => setSelectedPayment(o)}
                      className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer group"
                    >
                      {/* Order / Gateway ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[var(--text-primary)]">
                            {o.orderId}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(o.orderId, o._id);
                            }}
                            className="text-[var(--text-muted)] hover:text-emerald-400 transition-colors p-1"
                            title="Copy Order ID"
                          >
                            {copiedId === o._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {o.cfPaymentId && (
                          <p className="text-[10px] font-mono text-[var(--text-muted)]">
                            CF: {o.cfPaymentId}
                          </p>
                        )}
                      </td>

                      {/* Customer Details */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[var(--text-primary)]">{o.customerName}</p>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
                          {o.customerEmail && <span>{o.customerEmail}</span>}
                          {o.customerPhone && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{o.customerPhone}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Package / Service */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[var(--text-secondary)]">
                          {o.planName}
                        </span>
                        <p className="text-[10px] text-[var(--text-muted)] capitalize">
                          {o.paymentMethod || "Online Gateway"}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-black text-sm text-[var(--text-primary)]">
                          ₹{o.amount.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                            isSuccess
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : isPending
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-red-500/15 text-red-400 border-red-500/30"
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : isPending ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {o.paymentStatus}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-[11px] text-[var(--text-muted)]">
                        <p>{o.date || new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                        <p className="text-[10px] font-mono">{o.time}</p>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => verifyOrder(o.orderId)}
                            disabled={verifyingId === o.orderId}
                            className="px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] hover:border-emerald-500/40 text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                            title="Check live status from Cashfree API"
                          >
                            {verifyingId === o.orderId ? (
                              <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                            ) : (
                              <RefreshCw className="w-3 h-3 text-emerald-400" />
                            )}
                            <span>Verify</span>
                          </button>
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

      {/* Payment Details Drawer */}
      <AnimatePresence>
        {selectedPayment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedPayment(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-default)] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/70 shrink-0 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        selectedPayment.paymentStatus === "SUCCESS"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : selectedPayment.paymentStatus === "PENDING"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}
                    >
                      {selectedPayment.paymentStatus}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      {selectedPayment.orderId}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[var(--text-primary)]">
                    ₹{selectedPayment.amount.toLocaleString("en-IN")}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {selectedPayment.planName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-default)] space-y-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Customer Details
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      <span className="font-bold text-[var(--text-primary)]">
                        {selectedPayment.customerName}
                      </span>
                    </div>
                    {selectedPayment.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                        <span className="text-[var(--text-secondary)]">
                          {selectedPayment.customerEmail}
                        </span>
                      </div>
                    )}
                    {selectedPayment.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                        <span className="font-mono text-[var(--text-secondary)]">
                          {selectedPayment.customerPhone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-default)] space-y-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Cashfree Gateway Data
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">
                        Cashfree Payment ID
                      </p>
                      <p className="font-mono text-[var(--text-primary)]">
                        {selectedPayment.cfPaymentId || "Awaiting completion from gateway"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">
                        Payment Method
                      </p>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {selectedPayment.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">
                        Recorded At
                      </p>
                      <p className="text-[var(--text-secondary)]">
                        {new Date(selectedPayment.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 sm:p-6 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/70 shrink-0 space-y-2">
                <button
                  onClick={() => verifyOrder(selectedPayment.orderId)}
                  disabled={verifyingId === selectedPayment.orderId}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {verifyingId === selectedPayment.orderId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Verify with Cashfree Server</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
