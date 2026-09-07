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
} from "lucide-react";
import type { Coupon } from "@/lib/coupons";

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
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-7 h-7 text-brand-blue-light" /> Coupons & Offers
          </h1>
          <p className="text-white/50 text-xs sm:text-sm mt-1">
            Create discount codes, set percentage or flat deductions, and manage promotional offers for checkouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadCoupons}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.35)] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/8">
          <span className="text-[11px] uppercase tracking-wider text-white/40 font-bold block mb-1">
            Total Coupons
          </span>
          <p className="text-2xl font-black text-white">{coupons.length}</p>
          <span className="text-[10px] text-white/40 mt-1 block">Active and archived promotional codes</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/8">
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
            Active Offers
          </span>
          <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
          <span className="text-[10px] text-white/40 mt-1 block">Currently applicable at checkout</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/8">
          <span className="text-[11px] uppercase tracking-wider text-brand-blue-light font-bold block mb-1">
            Standard Tax Rate
          </span>
          <p className="text-2xl font-black text-brand-blue-light">18% GST</p>
          <span className="text-[10px] text-white/40 mt-1 block">Calculated on taxable subtotal after discount</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code or offer title…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/35 text-xs focus:outline-none focus:border-brand-blue/50"
        />
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-brand-blue-light animate-spin" />
          <p className="text-xs text-white/40">Loading coupons…</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/8">
          <Tag className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">No coupons found</p>
          <p className="text-xs text-white/40 mt-1 mb-4">
            {search ? "No codes match your search query." : "Create your first discount coupon code."}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary py-2 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create First Coupon
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => (
            <motion.div
              key={coupon.code}
              layout
              className={`glass-card rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                coupon.isActive ? "border-white/10 hover:border-brand-blue/40" : "border-white/5 opacity-60"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-brand-blue/20 text-brand-blue-light border border-brand-blue/30 tracking-wider">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1 text-white/40 hover:text-white transition-colors cursor-pointer"
                      title="Copy Code"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      coupon.isActive
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Discount Value */}
                <div className="mb-2">
                  <span className="text-xl font-black text-white flex items-center gap-1">
                    {coupon.discountType === "percentage" ? (
                      <>
                        <Percent className="w-4 h-4 text-emerald-400" />
                        {coupon.discountValue}% OFF
                      </>
                    ) : (
                      <>
                        <IndianRupee className="w-4 h-4 text-emerald-400" />
                        ₹{coupon.discountValue.toLocaleString("en-IN")} FLAT OFF
                      </>
                    )}
                  </span>
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">{coupon.title}</p>
                </div>

                {/* Rules & Limits */}
                <div className="space-y-1 text-[11px] text-white/45 py-2 border-t border-white/5">
                  {coupon.minOrderAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Min Order:</span>
                      <strong className="text-white/75">₹{coupon.minOrderAmount.toLocaleString("en-IN")}</strong>
                    </div>
                  )}
                  {coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Max Cap:</span>
                      <strong className="text-white/75">₹{coupon.maxDiscountAmount.toLocaleString("en-IN")}</strong>
                    </div>
                  )}
                  {coupon.expiryDate && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Expiry:
                      </span>
                      <strong className="text-white/75">{coupon.expiryDate}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-white/8 flex items-center justify-between mt-3">
                <button
                  onClick={() => handleToggleStatus(coupon)}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  {coupon.isActive ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-400" /> Active
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-white/40" /> Inactive
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(coupon.code)}
                  className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e0c1a] border border-white/12 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            >
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-blue-light" /> Create New Coupon
              </h3>
              <p className="text-white/50 text-xs mb-5">
                Add an active discount code that clients can use on the checkout page.
              </p>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-white/70 mb-1 font-semibold">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })}
                    placeholder="e.g. WELCOME10 or GROWTH500"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold uppercase focus:outline-none focus:border-brand-blue/50"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-semibold">Offer Title / Description</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Special 10% Discount on Digital Growth"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-blue/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "flat" })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141224] border border-white/10 text-white focus:outline-none focus:border-brand-blue/50 cursor-pointer"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">
                      Discount Value {formData.discountType === "percentage" ? "(%)" : "(₹)"} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={formData.discountType === "percentage" ? "100" : "500000"}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder="e.g. 10 or 1000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-blue/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">Min Order Subtotal (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                      placeholder="e.g. 5000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-blue/50"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-semibold">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      min="0"
                      disabled={formData.discountType === "flat"}
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      placeholder="Optional cap"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-blue/50 disabled:opacity-30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-semibold">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141224] border border-white/10 text-white focus:outline-none focus:border-brand-blue/50"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-white/20 text-brand-blue focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-white/80 cursor-pointer">
                    Activate this coupon immediately
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="btn-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
