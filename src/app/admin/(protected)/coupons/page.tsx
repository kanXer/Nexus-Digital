"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Plus,
  Trash2,
  Check,
  Copy,
  Percent,
  IndianRupee,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import type { Coupon } from "@/lib/coupons";
import { config } from "@/lib/config";

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal / Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [formData, setFormData] = useState<{
    code: string;
    title: string;
    discountType: "percentage" | "flat";
    discountValue: string;
    minOrderAmount: string;
    maxDiscountAmount: string;
    expiryDate: string;
    isActive: boolean;
  }>({
    code: "",
    title: "",
    discountType: "percentage",
    discountValue: "10",
    minOrderAmount: "5000",
    maxDiscountAmount: "",
    expiryDate: "",
    isActive: true,
  });

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      const data = await res.json();
      if (res.ok && data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    const updated: Coupon = { ...coupon, isActive: !coupon.isActive };
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setCoupons((prev) => prev.map((c) => (c.code === coupon.code ? updated : c)));
      }
    } catch (err) {
      console.error("Toggle coupon status error:", err);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon '${code}'?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons?code=${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.code !== code));
      }
    } catch (err) {
      console.error("Delete coupon error:", err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormSubmitting(true);

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim() || `${formData.discountValue}${formData.discountType === "percentage" ? "%" : "₹"} Discount Offer`,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount || 0),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        expiryDate: formData.expiryDate || undefined,
        isActive: formData.isActive,
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create coupon");
      }

      setFormSuccess(`Coupon '${payload.code}' created successfully!`);
      setTimeout(() => {
        setShowCreateModal(false);
        setFormSuccess("");
        setFormData({
          code: "",
          title: "",
          discountType: "percentage",
          discountValue: "10",
          minOrderAmount: "5000",
          maxDiscountAmount: "",
          expiryDate: "",
          isActive: true,
        });
        loadCoupons();
      }, 1000);
    } catch (err: any) {
      setFormError(err?.message || "Failed to create coupon.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.code.toLowerCase().includes(q) || (c.title && c.title.toLowerCase().includes(q));
  });

  const activeCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <Tag className="w-8 h-8 text-brand-red" /> Coupons &amp; Offers
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-1.5 font-medium">
            Create discount codes, set percentage or flat deductions, and manage promotional offers for checkouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCoupons}
            disabled={loading}
            className="p-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh coupons"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary py-3 px-5 rounded-xl font-bold text-sm flex items-center gap-2.5 shadow-[0_0_25px_rgba(220,38,38,0.35)] cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Create Coupon
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-default)] shadow-card">
          <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] font-bold block mb-1.5">
            Total Coupons
          </span>
          <p className="text-3xl font-black text-[var(--text-primary)]">{coupons.length}</p>
          <span className="text-xs text-[var(--text-muted)] mt-1.5 block font-medium">Active and archived promotional codes</span>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-default)] shadow-card">
          <span className="text-xs uppercase tracking-wider text-emerald-500 font-bold block mb-1.5">
            Active Offers
          </span>
          <p className="text-3xl font-black text-emerald-500">{activeCount}</p>
          <span className="text-xs text-[var(--text-muted)] mt-1.5 block font-medium">Currently applicable at checkout</span>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-default)] shadow-card">
          <span className="text-xs uppercase tracking-wider text-brand-red font-bold block mb-1.5">
            Configured Tax Rate
          </span>
          <p className="text-3xl font-black text-[var(--text-primary)]">{config.gstRate}% GST</p>
          <span className="text-xs text-[var(--text-muted)] mt-1.5 block font-medium">Live from .env (NEXT_PUBLIC_GST_RATE)</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by coupon code or offer title…"
          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm sm:text-base focus:outline-none focus:border-brand-red/50 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)] transition-all font-medium"
        />
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-9 h-9 text-brand-red animate-spin" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">Loading coupons…</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-2xl p-14 text-center border border-[var(--border-default)] shadow-card">
          <Tag className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-base font-bold text-[var(--text-primary)]">No coupons found</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5 mb-5 font-medium">
            {search ? "No codes match your search query." : "Create your first discount coupon code."}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary py-2.5 px-5 rounded-xl text-sm font-bold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create First Coupon
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCoupons.map((coupon) => (
            <motion.div
              key={coupon.code}
              layout
              className={`bg-[var(--bg-card)] rounded-2xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between ${
                coupon.isActive ? "border-[var(--border-default)] hover:border-brand-red/40 hover:shadow-glow-sm" : "border-[var(--border-default)] opacity-60"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-base sm:text-lg px-3 py-1.5 rounded-xl bg-brand-red/15 text-brand-red border border-brand-red/30 tracking-wider uppercase">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer rounded-lg hover:bg-[var(--bg-card-hover)]"
                      title="Copy Code"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      coupon.isActive
                        ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25"
                        : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-default)]"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Discount Value */}
                <div className="mb-3">
                  <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-1.5">
                    {coupon.discountType === "percentage" ? (
                      <>
                        <Percent className="w-6 h-6 text-emerald-500 shrink-0" />
                        {coupon.discountValue}% OFF
                      </>
                    ) : (
                      <>
                        <IndianRupee className="w-6 h-6 text-emerald-500 shrink-0" />
                        ₹{coupon.discountValue.toLocaleString("en-IN")} FLAT OFF
                      </>
                    )}
                  </span>
                  <p className="text-sm text-[var(--text-secondary)] mt-1.5 font-semibold line-clamp-2 leading-relaxed">
                    {coupon.title}
                  </p>
                </div>

                {/* Rules & Limits */}
                <div className="space-y-1.5 text-xs sm:text-sm text-[var(--text-secondary)] py-3 border-t border-[var(--border-default)] font-medium">
                  {coupon.minOrderAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] font-medium">Min Order:</span>
                      <strong className="text-[var(--text-primary)] font-bold">₹{coupon.minOrderAmount.toLocaleString("en-IN")}</strong>
                    </div>
                  )}
                  {coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)] font-medium">Max Cap:</span>
                      <strong className="text-[var(--text-primary)] font-bold">₹{coupon.maxDiscountAmount.toLocaleString("en-IN")}</strong>
                    </div>
                  )}
                  {coupon.expiryDate && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[var(--text-muted)] font-medium">
                        <Calendar className="w-3.5 h-3.5" /> Expiry:
                      </span>
                      <strong className="text-[var(--text-primary)] font-bold">{coupon.expiryDate}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3.5 border-t border-[var(--border-default)] flex items-center justify-between mt-3.5">
                <button
                  onClick={() => handleToggleStatus(coupon)}
                  className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  {coupon.isActive ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-emerald-500" /> Active
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-[var(--text-muted)]" /> Inactive
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(coupon.code)}
                  className="p-2 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Delete coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Coupon Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="always-dark bg-[#0e0c1a] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[92vh] overflow-y-auto text-white"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-red/25 text-brand-red border border-brand-red/40">
                  Offer Engine
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-brand-red" /> Create Promo Coupon
              </h3>
              <p className="text-white/70 text-sm sm:text-base mb-6 font-medium">
                Create a dynamic discount code that instantly validates at checkout.
              </p>

              {/* Live Ticket Preview */}
              <div className="mb-6 relative overflow-hidden rounded-2xl border-2 border-dashed border-brand-red/50 bg-gradient-to-br from-brand-red/15 via-brand-purple/15 to-transparent p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="p-2.5 rounded-xl bg-brand-red/25 text-brand-red border border-brand-red/40 shrink-0">
                      <Tag className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-mono font-black text-lg sm:text-xl tracking-widest text-white truncate">
                        {formData.code || "OFFERCODE"}
                      </div>
                      <p className="text-xs sm:text-sm text-white/80 truncate font-medium mt-0.5">
                        {formData.title || "Custom promotional discount"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg sm:text-xl font-black text-brand-red block">
                      {formData.discountValue
                        ? formData.discountType === "percentage"
                          ? `${formData.discountValue}% OFF`
                          : `₹${Number(formData.discountValue).toLocaleString("en-IN")} OFF`
                        : "0% OFF"}
                    </span>
                    {formData.minOrderAmount && Number(formData.minOrderAmount) > 0 ? (
                      <p className="text-xs text-white/70 font-semibold mt-0.5">Min ₹{Number(formData.minOrderAmount).toLocaleString("en-IN")}</p>
                    ) : (
                      <p className="text-xs text-emerald-400 font-bold mt-0.5">No minimum spend</p>
                    )}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="mb-5 p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="mb-5 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm font-semibold flex items-center gap-2.5">
                  <Check className="w-5 h-5 shrink-0 text-emerald-400" />
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-5 text-sm">
                <div>
                  <label className="block text-white/95 mb-2 font-bold text-sm sm:text-base">
                    Coupon Code <span className="text-brand-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })}
                      placeholder="e.g. MEGA50, FREESHIP, WELCOME20"
                      className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-white/[0.08] border border-white/20 text-white font-mono font-black text-base sm:text-lg uppercase tracking-wider focus:outline-none focus:border-brand-red/80 focus:ring-2 focus:ring-brand-red/30 transition-all placeholder:text-white/30"
                    />
                    <Tag className="w-5 h-5 text-white/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-white/95 mb-2 font-bold text-sm sm:text-base">Offer Title / Customer Facing Description</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Special Launch 15% Off on All Growth Bundles"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.08] border border-white/20 text-white text-sm sm:text-base font-medium focus:outline-none focus:border-brand-red/80 focus:ring-2 focus:ring-brand-red/30 transition-all placeholder:text-white/30"
                  />
                </div>

                {/* Discount Type Segmented Switcher */}
                <div>
                  <label className="block text-white/95 mb-2 font-bold text-sm sm:text-base">Discount Type</label>
                  <div className="grid grid-cols-2 p-1.5 rounded-xl bg-white/[0.06] border border-white/15 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: "percentage" })}
                      className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        formData.discountType === "percentage"
                          ? "bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-lg shadow-brand-red/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Percent className="w-4 h-4" /> Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: "flat" })}
                      className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        formData.discountType === "flat"
                          ? "bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-lg shadow-brand-red/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <IndianRupee className="w-4 h-4" /> Flat Rupee (₹)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/95 mb-2 font-bold text-sm sm:text-base">
                      Discount Value {formData.discountType === "percentage" ? "(%)" : "(₹)"} <span className="text-brand-red">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={formData.discountType === "percentage" ? "100" : "500000"}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder={formData.discountType === "percentage" ? "e.g. 15" : "e.g. 1500"}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/[0.08] border border-white/20 text-white font-mono text-base font-black focus:outline-none focus:border-brand-red/80 focus:ring-2 focus:ring-brand-red/30 transition-all placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-white/95 mb-2 font-bold text-sm sm:text-base">Min Subtotal (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                      placeholder="0 for none"
                      className="w-full px-4 py-3.5 rounded-xl bg-white/[0.08] border border-white/20 text-white font-mono text-base font-bold focus:outline-none focus:border-brand-red/80 focus:ring-2 focus:ring-brand-red/30 transition-all placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/95 mb-2 font-bold text-sm sm:text-base">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      disabled={formData.discountType === "flat"}
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      placeholder={formData.discountType === "flat" ? "N/A for flat" : "Optional cap"}
                      className="w-full px-4 py-3.5 rounded-xl bg-white/[0.08] border border-white/20 text-white font-mono text-base font-bold focus:outline-none focus:border-brand-red/80 focus:ring-2 focus:ring-brand-red/30 transition-all placeholder:text-white/30 disabled:opacity-35 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-white/95 mb-2 font-bold text-sm sm:text-base">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#141224] border border-white/20 text-white text-sm sm:text-base font-medium focus:outline-none focus:border-brand-red/80 focus:ring-2 focus:ring-brand-red/30 [color-scheme:dark] transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3.5 pt-2 p-4 rounded-xl bg-white/[0.05] border border-white/15">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-white/30 text-brand-red focus:ring-0 w-5 h-5 cursor-pointer accent-brand-red"
                  />
                  <label htmlFor="isActive" className="text-white font-bold cursor-pointer select-none text-sm sm:text-base">
                    Activate this coupon immediately for customer checkout
                  </label>
                </div>

                <div className="flex items-center justify-end gap-4 pt-5 border-t border-white/15">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-bold text-sm sm:text-base"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="btn-primary px-8 py-3 rounded-xl font-extrabold text-sm sm:text-base flex items-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-xl shadow-brand-red/30"
                  >
                    {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
