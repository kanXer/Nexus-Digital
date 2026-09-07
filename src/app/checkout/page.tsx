"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  AlertCircle,
  Download,
  Receipt,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Tag,
  X,
  Loader2,
  Package,
} from "lucide-react";
import { useAuth, type UserOrder } from "@/context/AuthContext";
import { pricingPlans } from "@/data/pricing";
import { getProduct } from "@/lib/products";
import CashfreeButton from "@/components/payment/CashfreeButton";
import RequireAuth from "@/components/auth/RequireAuth";
import { generateInvoicePdf, downloadBlob } from "@/lib/pdf";
import { config } from "@/lib/config";
import { trackEvent } from "@/lib/analytics";

interface CheckoutPlan {
  id: string;
  name: string;
  priceInr: number;
  priceStr: string;
  description: string;
  recurring: boolean;
}

interface AppliedCoupon {
  code: string;
  title: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  discountAmount: number;
}

interface PublicCoupon {
  code: string;
  title: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderAmount: number;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planParam = (searchParams.get("plan") || "").trim().toLowerCase();
  const priceParam = searchParams.get("price");

  const {
    user,
    loading,
    userProfile,
    openAuthModal,
    openProfileModal,
    openOrders,
    recordNewOrder,
    cart,
    clearCart,
  } = useAuth();
  const router = useRouter();

  const [completedOrder, setCompletedOrder] = useState<UserOrder | null>(null);
  const [copiedTxn, setCopiedTxn] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<PublicCoupon[]>([]);

  // Fetch active promotional coupons on load
  useEffect(() => {
    let isMounted = true;
    fetch("/api/coupons")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.coupons)) {
          setAvailableCoupons(data.coupons);
        }
      })
      .catch((err) => console.warn("Could not load coupons:", err));
    return () => {
      isMounted = false;
    };
  }, []);

  // Determine if checking out the full cart bundle
  const isCartBundle = planParam === "cart" || (!planParam && cart.length > 0);

  // Resolve plan and pricing
  let plan: CheckoutPlan;
  let isBundle = false;

  if (isCartBundle && cart.length > 0) {
    isBundle = true;
    const cartSubtotal = cart.reduce((sum, item) => sum + (item.numericPrice || 0), 0);
    const bundleTitles = cart.map((c) => c.title).join(", ");
    plan = {
      id: "cart",
      name: cart.length === 1 ? cart[0].title : `Marketing Bundle (${cart.length} Services)`,
      priceInr: cartSubtotal,
      priceStr: `₹${cartSubtotal.toLocaleString("en-IN")}`,
      description: bundleTitles,
      recurring: false,
    };
  } else {
    // Check if it exists in the user's cart first
    const inCart = cart.find((c) => c.id.toLowerCase() === planParam);
    if (inCart) {
      const numeric =
        (priceParam ? Number(priceParam) : inCart.numericPrice) ||
        getProduct(inCart.id)?.priceInr ||
        10000;
      plan = {
        id: inCart.id,
        name: inCart.title,
        priceInr: numeric,
        priceStr: `₹${numeric.toLocaleString("en-IN")}`,
        description: inCart.description || "",
        recurring: getProduct(inCart.id)?.cycle === "monthly",
      };
    } else {
      // Check standard pricing plans (Basic = 10000, Growth = 20000, Premium = 30000)
      const pPlan = pricingPlans.find((p) => p.id.toLowerCase() === planParam);
      if (pPlan) {
        const numeric = priceParam ? Number(priceParam) : pPlan.priceInr;
        plan = {
          id: pPlan.id,
          name: pPlan.name,
          priceInr: numeric,
          priceStr: `₹${numeric.toLocaleString("en-IN")}/mo`,
          description: pPlan.tagline,
          recurring: true,
        };
      } else {
        // Check service catalog product
        const prod = getProduct(planParam);
        if (prod) {
          const numeric = priceParam ? Number(priceParam) : prod.priceInr;
          plan = {
            id: prod.id,
            name: prod.name,
            priceInr: numeric,
            priceStr: `₹${numeric.toLocaleString("en-IN")}`,
            description: "Professional digital marketing service package.",
            recurring: prod.cycle === "monthly",
          };
        } else {
          // Fallback to Growth plan (₹20,000)
          const fallback = pricingPlans[1] || pricingPlans[0];
          plan = {
            id: fallback.id,
            name: fallback.name,
            priceInr: fallback.priceInr,
            priceStr: `₹${fallback.priceInr.toLocaleString("en-IN")}/mo`,
            description: fallback.tagline,
            recurring: true,
          };
        }
      }
    }
  }

  // ══════ DYNAMIC GST (FROM ENV / CONFIG) & DISCOUNT CALCULATION ══════
  const gstRate = Number(process.env.NEXT_PUBLIC_GST_RATE || config.gstRate || 18);
  const halfGst = gstRate / 2;
  const splitGstLabel =
    gstRate > 0
      ? ` - CGST ${Number.isInteger(halfGst) ? halfGst : halfGst.toFixed(1)}% + SGST ${
          Number.isInteger(halfGst) ? halfGst : halfGst.toFixed(1)
        }%`
      : "";

  const subtotal = plan.priceInr;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstAmount = Math.round((taxableAmount * gstRate) / 100);
  const totalPayable = taxableAmount + gstAmount;

  // Phone is recommended for transaction updates. Address is optional for GST invoices.
  const billingComplete = Boolean(
    userProfile.address && userProfile.city && userProfile.state && userProfile.pincode
  );

  // Cashfree runs in demo/simulation mode until real keys are added to .env
  const cashfreeLive = process.env.NEXT_PUBLIC_CASHFREE_LIVE === "true";

  // ══════ COUPON HANDLERS ══════
  const handleApplyCoupon = useCallback(
    async (codeOverride?: string) => {
      const code = (codeOverride || couponInput).trim().toUpperCase();
      if (!code) {
        setCouponError("Please enter a coupon code.");
        return;
      }

      setCouponLoading(true);
      setCouponError("");
      setCouponSuccess("");

      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, subtotal }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setAppliedCoupon(null);
          setCouponError(data.error || "Invalid coupon code.");
        } else {
          setAppliedCoupon(data.coupon);
          setCouponSuccess(
            `Coupon '${data.coupon.code}' applied! Saved ₹${data.coupon.discountAmount.toLocaleString("en-IN")}`
          );
          setCouponInput(data.coupon.code);
        }
      } catch (err) {
        console.error("Coupon application error:", err);
        setCouponError("Failed to apply coupon. Please check connection.");
      } finally {
        setCouponLoading(false);
      }
    },
    [couponInput, subtotal]
  );

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess("");
    setCouponError("");
    setCouponInput("");
  };

  // ══════ PAYMENT COMPLETION HANDLERS ══════
  const handlePaymentSuccess = async ({
    orderId,
    cfPaymentId,
  }: {
    orderId: string;
    cfPaymentId?: string;
  }) => {
    const finalAmountStr = `₹${totalPayable.toLocaleString("en-IN")}`;
    const order = await recordNewOrder({
      title: isBundle ? `${plan.name} (${cart.length} services)` : plan.name,
      amount: finalAmountStr,
      planId: plan.id,
      isSubscription: plan.recurring,
      numericAmount: totalPayable,
    });

    if (isBundle) {
      clearCart();
    }

    trackEvent("purchase", {
      transaction_id: orderId || cfPaymentId || order.id,
      value: totalPayable,
      currency: "INR",
      items: plan.name,
      coupon: appliedCoupon?.code || "NONE",
    });

    setCompletedOrder({
      ...order,
      id: orderId || order.id,
      numericAmount: totalPayable,
    });
  };

  const handleDemoCheckout = async () => {
    const txnId = `NEX-DEMO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const finalAmountStr = `₹${totalPayable.toLocaleString("en-IN")}`;
    const order = await recordNewOrder({
      title: isBundle ? `${plan.name} (${cart.length} services)` : plan.name,
      amount: finalAmountStr,
      planId: plan.id,
      isSubscription: plan.recurring,
      numericAmount: totalPayable,
    });

    if (isBundle) {
      clearCart();
    }

    trackEvent("purchase", {
      transaction_id: txnId,
      value: totalPayable,
      currency: "INR",
      items: plan.name,
      coupon: appliedCoupon?.code || "NONE",
    });

    setCompletedOrder({
      ...order,
      id: txnId,
      numericAmount: totalPayable,
    });
  };

  const handleDownloadInvoice = () => {
    if (!completedOrder) return;
    const billNumber = `INV-${completedOrder.id}`;
    const blob = generateInvoicePdf({
      billNumber,
      date: completedOrder.date,
      time: completedOrder.purchaseTime || "",
      agencyName: config.name,
      agencyEmail: config.email,
      agencyAddress: config.address,
      agencyWebsite: config.website,
      clientName: userProfile.name || user?.displayName || "Valued Client",
      clientEmail: userProfile.email || user?.email || "customer@thenexusdigital.in",
      planName: completedOrder.title,
      amount: subtotal,
      discount: discountAmount,
      couponCode: appliedCoupon?.code,
      gstRate: gstRate,
      currency: "INR",
      paymentRef: completedOrder.id,
    });
    downloadBlob(blob, `${billNumber}.pdf`);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-blue/30 border-t-brand-blue-light animate-spin" />
        <p className="text-sm text-white/40">Loading your checkout…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center mx-auto mb-4 text-brand-blue-light">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-white/60 text-sm mb-6">
          To complete your purchase and secure your marketing package, please sign in to your Nexus account.
        </p>
        <button
          onClick={openAuthModal}
          className="w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm shadow-[0_0_30px_rgba(220,38,38,0.4)] cursor-pointer"
        >
          Sign In / Create Account to Continue
        </button>
      </div>
    );
  }

  // ══════ IN-PAGE PAYMENT SUCCESS CONFIRMATION ══════
  if (completedOrder) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto space-y-6 relative z-10"
      >
        {/* Celebration Header */}
        <div className="glass-card-brand rounded-3xl p-8 text-center border border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.2)] relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none" />

          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Order Confirmed & Paid
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Payment Successful!
          </h2>
          <p className="text-white/70 text-sm max-w-md mx-auto">
            Welcome aboard! Your package <strong className="text-white">{completedOrder.title}</strong> is now officially active.
          </p>

          {/* Amount Paid Pill */}
          <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Total Paid (incl. {gstRate}% GST)</span>
            <span className="text-2xl font-black text-emerald-400">
              ₹{(completedOrder.numericAmount ?? totalPayable).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-blue-light" /> Transaction Receipt Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/5">
            <div>
              <span className="text-white/40 block">Order Reference:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <code className="text-white font-mono font-bold text-xs bg-black/40 px-2 py-1 rounded border border-white/10">
                  {completedOrder.id}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyId(completedOrder.id)}
                  className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedTxn ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-white/40 block">Payment Date & Time:</span>
              <span className="text-white font-semibold text-sm">
                {completedOrder.date} • {completedOrder.purchaseTime}
              </span>
            </div>

            <div>
              <span className="text-white/40 block">Customer Name:</span>
              <span className="text-white font-medium">
                {userProfile.name || user?.displayName || "Valued Client"}
              </span>
            </div>

            <div>
              <span className="text-white/40 block">Account Email:</span>
              <span className="text-white font-medium">
                {userProfile.email || user?.email || "customer@thenexusdigital.in"}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all shadow-[0_0_25px_rgba(220,38,38,0.35)] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download GST Tax Invoice (PDF)
            </button>

            <button
              type="button"
              onClick={openOrders}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              View in My Orders
            </button>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            >
              Return to Homepage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* What Happens Next Card */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
          <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-blue-light" /> What Happens Next?
          </h4>
          <ol className="space-y-3 text-xs text-white/70">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-blue/20 text-brand-blue-light border border-brand-blue/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-white block">Dedicated Onboarding Specialist</strong>
                Your dedicated account manager is assigned and will review your business goals and market competition.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-blue/20 text-brand-blue-light border border-brand-blue/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-white block">Kickoff Call within 24 Hours</strong>
                We will connect via WhatsApp / Phone (+91 96962 62007) to gather brand credentials and schedule campaign kickoff.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-brand-blue/20 text-brand-blue-light border border-brand-blue/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-white block">24/7 Priority Client Support</strong>
                Direct access to our digital marketing & tech leads at our agency headquarters.
              </div>
            </li>
          </ol>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ══════ LEFT COLUMN: Order Summary & Billing Info ══════ */}
      <div className="lg:col-span-7 space-y-6 relative z-10">
        {/* Selected Package / Bundle Summary */}
        <div className="glass-card-brand rounded-3xl p-6 border border-brand-blue/30 shadow-[0_0_40px_rgba(109,94,252,0.12)] relative overflow-hidden group hover:border-brand-blue/50 transition-colors duration-500">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl group-hover:bg-brand-blue/20 transition-all duration-500" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-blue/20 text-brand-blue-light border border-brand-blue/30 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              {isBundle ? `Cart Bundle (${cart.length} Services)` : "Selected Package"}
            </span>
            <span className="text-2xl font-black text-white">
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-white/60 text-sm mb-4">{plan.description}</p>

          {/* If checking out multiple cart items, display itemized list */}
          {isBundle && cart.length > 1 && (
            <div className="mb-4 pt-3 border-t border-white/10 space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-white/40 font-bold">
                Included Services ({cart.length}):
              </p>
              <div className="space-y-1.5">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/5"
                  >
                    <span className="text-white/80 font-medium truncate mr-2">
                      {idx + 1}. {item.title}
                    </span>
                    <span className="text-white font-semibold shrink-0">
                      ₹{(item.numericPrice || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ul className="space-y-2 text-xs text-white/70 pt-4 border-t border-white/10">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> 100% Dedicated Account Manager Onboarding
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> Transparent {gstRate}% GST Breakdown & Instant Tax Invoice
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> Cancel or Pause Anytime (No Lock-in Contracts)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> 24/7 Priority WhatsApp & Phone Client Support
            </li>
          </ul>
        </div>

        {/* User Billing Details */}
        <div className="glass-card rounded-3xl p-6 border border-white/12 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <User className="w-5 h-5 text-brand-blue-light" /> Billing & Tax Details
            </h4>
            <button
              onClick={openProfileModal}
              className="text-xs text-brand-blue-light hover:underline font-semibold cursor-pointer"
            >
              Edit Details
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/5">
            <div>
              <span className="text-white/40 block">Full Name:</span>
              <strong className="text-white text-sm">{userProfile.name || user.displayName || "Customer"}</strong>
            </div>

            <div>
              <span className="text-white/40 block">Account Email:</span>
              <strong className="text-white text-sm truncate block">{userProfile.email || user.email}</strong>
            </div>

            <div>
              <span className="text-white/40 block">Phone:</span>
              <strong className="text-white">{userProfile.phone || user.phoneNumber || "Not provided"}</strong>
            </div>

            <div>
              <span className="text-white/40 block">Company:</span>
              <strong className="text-white">{userProfile.company || "Individual / Self"}</strong>
            </div>

            {userProfile.gstin && (
              <div className="sm:col-span-2 pt-2 border-t border-white/10">
                <span className="text-white/40 block">GSTIN (For Input Tax Credit):</span>
                <strong className="text-white font-mono text-xs">{userProfile.gstin}</strong>
              </div>
            )}

            {userProfile.address && (
              <div className="sm:col-span-2 pt-2 border-t border-white/10">
                <span className="text-white/40 block flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Address:
                </span>
                <strong className="text-white">
                  {userProfile.address}, {userProfile.city} {userProfile.state} - {userProfile.pincode}
                </strong>
              </div>
            )}
          </div>

          {!billingComplete && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold text-sm">Billing details (Optional)</p>
                <p className="text-white/60 text-xs mt-0.5">
                  You can proceed to payment now. Adding your full billing address & GSTIN anytime generates a GST-compliant tax invoice for tax credit.
                </p>
                <button
                  onClick={openProfileModal}
                  className="mt-1.5 text-xs font-bold text-brand-blue-light hover:underline cursor-pointer"
                >
                  Edit Profile & Address →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════ RIGHT COLUMN: Payment, Coupon & Breakdown ══════ */}
      <div className="lg:col-span-5 space-y-6 relative z-10">
        <div className="payment-checkout-card always-dark relative overflow-hidden rounded-3xl p-6 border space-y-5 bg-gradient-to-br from-[#0d0a2e] via-[#120f38] to-[#0b0b0d] border-[#6d5efc]/30 shadow-[0_0_50px_rgba(109,94,252,0.25)] hover:shadow-[0_0_70px_rgba(109,94,252,0.35)] transition-shadow duration-500">
          {/* Ambient glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-36 bg-[#6d5efc]/25 rounded-full blur-[70px] pointer-events-none" />

          {!cashfreeLive && (
            <div className="relative flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                <strong className="text-amber-300">Demo / Simulation Mode:</strong> Cashfree production keys are not active in <code>.env</code>. Clicking pay will simulate order completion without charging.
              </p>
            </div>
          )}

          <div className="relative">
            <h4 className="font-bold text-white text-lg flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-[#b3aaff]" /> Order Summary & Payment
            </h4>
            <p className="text-white/50 text-xs">
              Secure 256-bit SSL encrypted checkout powered by Cashfree.
            </p>
          </div>

          {/* ══════ COUPON CODE SECTION ══════ */}
          <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/12 p-4 sm:p-5 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-brand-red/20 border border-brand-red/30 flex items-center justify-center text-brand-red">
                  <Tag className="w-3.5 h-3.5" />
                </span>
                Have a Coupon or Offer Code?
              </label>
              {appliedCoupon && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Active
                </span>
              )}
            </div>

            {appliedCoupon ? (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-black/40 border border-emerald-500/40 p-3.5 flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-white text-sm tracking-wider bg-black/40 px-2 py-0.5 rounded border border-emerald-500/30">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        {appliedCoupon.discountType === "percentage"
                          ? `${appliedCoupon.discountValue}% OFF`
                          : `Flat ₹${appliedCoupon.discountValue.toLocaleString("en-IN")} OFF`}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-300/90 font-medium mt-1">
                      Saved ₹{appliedCoupon.discountAmount.toLocaleString("en-IN")} on this order!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer shrink-0 ml-2"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    placeholder="Enter code (e.g. NEXUS10)"
                    disabled={couponLoading}
                    className="w-full bg-black/60 border border-white/20 hover:border-white/30 focus:border-brand-red rounded-xl px-3.5 py-2.5 text-xs text-white uppercase placeholder:text-white/35 placeholder:normal-case font-mono font-bold tracking-wider focus:outline-none focus:ring-1 focus:ring-brand-red/50 transition-all"
                  />
                  {couponInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setCouponInput("");
                        setCouponError("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(220,38,38,0.35)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {couponLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Apply Code"
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {couponError && (
              <div className="flex items-start gap-2 text-[11px] text-red-300 bg-red-500/15 border border-red-500/30 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="font-medium">{couponError}</span>
              </div>
            )}

            {/* Success Message */}
            {couponSuccess && !couponError && (
              <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-xl">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{couponSuccess}</span>
              </div>
            )}

            {/* Available Quick Offers Pill List */}
            {availableCoupons.length > 0 && !appliedCoupon && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/45">
                  <span>Available Offers for You:</span>
                  <span className="text-brand-red font-semibold">Tap to apply</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableCoupons.map((c) => {
                    const eligible = subtotal >= c.minOrderAmount;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCouponInput(c.code);
                          handleApplyCoupon(c.code);
                        }}
                        className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          eligible
                            ? "bg-white/[0.06] hover:bg-brand-red/20 border-white/15 hover:border-brand-red/40 text-white shadow-sm"
                            : "bg-white/[0.02] border-white/5 text-white/35 hover:text-white/55"
                        }`}
                        title={
                          eligible
                            ? `Click to apply ${c.code}`
                            : `Requires min order of ₹${c.minOrderAmount.toLocaleString("en-IN")}`
                        }
                      >
                        <Tag className="w-3 h-3 text-brand-red shrink-0" />
                        <span className="font-mono font-bold text-white">{c.code}</span>
                        <span className="text-emerald-400 font-semibold text-[10px]">
                          {c.discountType === "percentage"
                            ? `${c.discountValue}% OFF`
                            : `₹${c.discountValue} OFF`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ══════ ITEMIZED PRICE BREAKDOWN ══════ */}
          <div className="relative rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-2.5 text-xs">
            {/* Base Subtotal */}
            <div className="flex items-center justify-between text-white/70">
              <span>Subtotal (Base Price)</span>
              <span className="font-medium text-white">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Coupon Discount (if applied) */}
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Coupon Discount ({appliedCoupon?.code})
                </span>
                <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* Taxable Base */}
            <div className="flex items-center justify-between text-white/60 pt-1 border-t border-white/5">
              <span>Taxable Amount</span>
              <span className="text-white">
                ₹{taxableAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* GST (Configured Rate from ENV) */}
            <div className="flex items-center justify-between text-white/70">
              <span className="flex items-center gap-1">
                GST ({gstRate}%{splitGstLabel})
              </span>
              <span className="font-semibold text-white">
                + ₹{gstAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Total Payable Box */}
            <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">
                  Total Payable
                </span>
                <span className="text-[10px] text-emerald-400/80 font-medium">
                  {discountAmount > 0
                    ? `Saved ₹${discountAmount.toLocaleString("en-IN")}`
                    : `Inclusive of ${gstRate}% GST`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white leading-none tracking-tight">
                  ₹{totalPayable.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] block font-semibold text-white/40 mt-0.5">
                  (INR Net Total)
                </span>
              </div>
            </div>
          </div>

          {/* UPI / Cards / Net Banking / Wallets via Cashfree */}
          <div className="relative bg-black/40 p-4 rounded-2xl border border-white/10">
            <CashfreeButton
              planId={plan.id}
              planName={plan.name}
              priceInr={totalPayable}
              recurring={plan.recurring}
              userId={user?.uid}
              customerEmail={userProfile.email || user?.email || "customer@thenexusdigital.in"}
              customerPhone={userProfile.phone || user?.phoneNumber || "9696262007"}
              onDemo={handleDemoCheckout}
              onSuccess={handlePaymentSuccess}
            />
          </div>

          {/* Supported payment badges */}
          <div className="relative flex items-center justify-center gap-2 flex-wrap">
            {["UPI / GPay / PhonePe", "Cards", "Net Banking", "Wallets"].map((m) => (
              <span
                key={m}
                className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[10px] font-bold text-white/55 tracking-wide"
              >
                {m}
              </span>
            ))}
          </div>

          <div className="relative flex items-center justify-center gap-1.5 text-[11px] text-white/40 pt-1 text-center">
            <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
            <span>Payments Processed via Cashfree Authorized Payment Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <div className="bg-black min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[130px] pointer-events-none mix-blend-screen opacity-60" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-brand-red/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-60" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-20" />

        <div className="max-w-5xl mx-auto mb-8 relative z-10 flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cart & Review
          </Link>
          <Link
            href="/pricing"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Explore Other Packages
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-20 text-white/50 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-brand-blue/30 border-t-brand-blue-light animate-spin" />
              <span>Loading Checkout Details...</span>
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </div>
    </RequireAuth>
  );
}
