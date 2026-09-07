"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
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
} from "lucide-react";
import { useAuth, type UserOrder } from "@/context/AuthContext";
import { getProduct } from "@/lib/products";
import CashfreeButton from "@/components/payment/CashfreeButton";
import RequireAuth from "@/components/auth/RequireAuth";
import { generateInvoicePdf, downloadBlob } from "@/lib/pdf";
import { config } from "@/lib/config";
import { trackEvent } from "@/lib/analytics";

const CANONICAL_PLANS: Record<string, { id: string; name: string; priceInr: number; priceStr: string; description: string; recurring: boolean }> = {
  basic: {
    id: "basic",
    name: "Basic Growth Plan",
    priceInr: 4999,
    priceStr: "₹4,999/mo",
    description: "Ideal for small local businesses starting out with social media & local SEO.",
    recurring: true,
  },
  growth: {
    id: "growth",
    name: "Pro Business Accelerator",
    priceInr: 14999,
    priceStr: "₹14,999/mo",
    description: "Full funnel marketing, Google & Meta Ads management, high-converting landing pages.",
    recurring: true,
  },
  premium: {
    id: "premium",
    name: "Enterprise Custom Scaler",
    priceInr: 29999,
    priceStr: "₹29,999/mo",
    description: "Dedicated account manager, omnichannel ad scaling, influencer marketing & PR.",
    recurring: true,
  },
};

interface CheckoutPlan {
  id: string;
  name: string;
  priceInr: number;
  priceStr: string;
  description: string;
  recurring: boolean;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planKey = (searchParams.get("plan") || "growth").toLowerCase();
  const { user, loading, userProfile, openAuthModal, openProfileModal, openOrders, recordNewOrder, cart } = useAuth();
  const router = useRouter();

  const [completedOrder, setCompletedOrder] = useState<UserOrder | null>(null);
  const [copiedTxn, setCopiedTxn] = useState(false);

  // While Firebase is resolving the session, show a neutral spinner —
  // this prevents the "login required" wall from flashing briefly.
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-blue/30 border-t-brand-blue-light animate-spin" />
        <p className="text-sm text-white/40">Loading your checkout…</p>
      </div>
    );
  }

  // Resolve the plan being checked out — supports both the 3 main plans and any
  // service/freelance item added to the cart (via its numeric price + cycle).
  const cartItem = cart.find((c) => c.id === planKey);
  const canonical = CANONICAL_PLANS[planKey];
  let plan: CheckoutPlan;
  if (canonical) {
    plan = { ...canonical };
  } else if (cartItem) {
    const prod = getProduct(cartItem.id);
    const numeric = cartItem.numericPrice ?? prod?.priceInr ?? 0;
    const recurring = prod?.cycle === "monthly";
    plan = {
      id: cartItem.id,
      name: cartItem.title,
      priceInr: numeric,
      priceStr: cartItem.price,
      description: cartItem.description || "",
      recurring,
    };
  } else {
    plan = { ...CANONICAL_PLANS.growth };
  }

  // Phone is recommended for transaction updates. Address is optional for GST invoices.
  const hasPhone = Boolean(userProfile.phone || user?.phoneNumber);
  const billingComplete = Boolean(
    userProfile.address && userProfile.city && userProfile.state && userProfile.pincode
  );

  // Cashfree runs in demo/simulation mode until real keys are added to .env
  // (NEXT_PUBLIC_CASHFREE_LIVE=true).
  const cashfreeLive = process.env.NEXT_PUBLIC_CASHFREE_LIVE === "true";

  const handlePaymentSuccess = async ({ orderId, cfPaymentId }: { orderId: string; cfPaymentId?: string }) => {
    const order = await recordNewOrder({
      title: plan.name,
      amount: plan.priceStr,
      planId: plan.id,
      isSubscription: plan.recurring,
      numericAmount: plan.priceInr,
    });
    trackEvent("purchase", {
      transaction_id: orderId || cfPaymentId || order.id,
      value: plan.priceInr,
      currency: "INR",
      items: plan.name,
    });
    setCompletedOrder({
      ...order,
      id: orderId || order.id,
    });
  };

  const handleDemoCheckout = async () => {
    const txnId = `NEX-DEMO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const order = await recordNewOrder({
      title: plan.name,
      amount: plan.priceStr,
      planId: plan.id,
      isSubscription: plan.recurring,
      numericAmount: plan.priceInr,
    });
    trackEvent("purchase", {
      transaction_id: txnId,
      value: plan.priceInr,
      currency: "INR",
      items: plan.name,
    });
    setCompletedOrder({
      ...order,
      id: txnId,
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
      amount: completedOrder.numericAmount ?? plan.priceInr,
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

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center mx-auto mb-4 text-brand-blue-light">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-white/60 text-sm mb-6">
          To complete your purchase and secure your package, please sign in to your Nexus account.
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
            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">Total Paid</span>
            <span className="text-2xl font-black text-emerald-400">
              ₹{(completedOrder.numericAmount ?? plan.priceInr).toLocaleString("en-IN")}
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
              Download GST Invoice (PDF)
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
                Direct access to our digital marketing & tech leads at our Gorakhpur agency office.
              </div>
            </li>
          </ol>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Left Column: Order Summary & Billing Info */}
      <div className="md:col-span-7 space-y-6 relative z-10">
        {/* Selected Plan Summary */}
        <div className="glass-card-brand rounded-3xl p-6 border border-brand-blue/30 shadow-[0_0_40px_rgba(109,94,252,0.12)] relative overflow-hidden group hover:border-brand-blue/50 transition-colors duration-500">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl group-hover:bg-brand-blue/20 transition-all duration-500" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-blue/20 text-brand-blue-light border border-brand-blue/30">
              Selected Package
            </span>
            <span className="text-2xl font-black text-white">{plan.priceStr}</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-white/60 text-sm mb-4">{plan.description}</p>

          <ul className="space-y-2 text-xs text-white/70 pt-4 border-t border-white/10">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> 100% Dedicated Account Manager Onboarding
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> Cancel or Pause Anytime (No Lock-in)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> 24/7 Priority Client Support
            </li>
          </ul>
        </div>

        {/* User Billing Details */}
        <div className="glass-card rounded-3xl p-6 border border-white/12 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <User className="w-5 h-5 text-brand-blue-light" /> Billing Details
            </h4>
            <button
              onClick={openProfileModal}
              className="text-xs text-brand-blue-light hover:underline font-semibold"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/5">
            <div>
              <span className="text-white/40 block">Full Name:</span>
              <strong className="text-white text-sm">{userProfile.name || user.displayName || "Customer"}</strong>
            </div>

            <div>
              <span className="text-white/40 block">Email:</span>
              <strong className="text-white text-sm">{userProfile.email || user.email}</strong>
            </div>

            <div>
              <span className="text-white/40 block">Phone:</span>
              <strong className="text-white">{userProfile.phone || "Not provided"}</strong>
            </div>

            <div>
              <span className="text-white/40 block">Company:</span>
              <strong className="text-white">{userProfile.company || "Individual"}</strong>
            </div>

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
                  You can proceed to payment now. Add full billing address anytime to get a GST-compliant tax invoice.
                </p>
                <button
                  onClick={openProfileModal}
                  className="mt-1.5 text-xs font-bold text-brand-blue-light hover:underline"
                >
                  Edit Profile & Address →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Payment Gateway */}
      <div className="md:col-span-5 space-y-6 relative z-10">
        <div className="payment-checkout-card always-dark relative overflow-hidden rounded-3xl p-6 border space-y-5 bg-gradient-to-br from-[#0d0a2e] via-[#120f38] to-[#0b0b0d] border-[#6d5efc]/30 shadow-[0_0_50px_rgba(109,94,252,0.25)] hover:shadow-[0_0_70px_rgba(109,94,252,0.35)] transition-shadow duration-500">
          {/* Ambient glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-36 bg-[#6d5efc]/25 rounded-full blur-[70px] pointer-events-none" />

          {!cashfreeLive && (
            <div className="relative flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                <strong className="text-amber-300">Demo / Test Mode:</strong> Cashfree keys are not configured in <code>.env</code>. Clicking pay will simulate a successful payment (no real charge).
              </p>
            </div>
          )}

          <div className="relative">
            <h4 className="font-bold text-white text-lg flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-[#b3aaff]" /> Express Checkout
            </h4>
            <p className="text-white/50 text-xs">
              Secure SSL Encryption. Instant Order Activation.
            </p>
          </div>

          {/* Total Payable */}
          <div className="relative rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-white/45 font-bold">
              Total Payable
            </span>
            <span className="text-xl font-black text-white leading-none">
              ₹{plan.priceInr.toLocaleString("en-IN")}
              <span className="text-[10px] font-semibold text-white/35 ml-1">+GST</span>
            </span>
          </div>

          {/* UPI / Cards / Net Banking / Wallets via Cashfree */}
          <div className="relative bg-black/40 p-4 rounded-2xl border border-white/10">
            <CashfreeButton
              planId={plan.id}
              planName={plan.name}
              priceInr={plan.priceInr}
              recurring={plan.recurring}
              userId={user?.uid}
              customerEmail={userProfile.email || user?.email || "customer@thenexusdigital.in"}
              customerPhone={userProfile.phone || user?.phoneNumber || "9696262007"}
              onDemo={handleDemoCheckout}
              onSuccess={handlePaymentSuccess}
            />
          </div>

          {/* Payment methods */}
          <div className="relative flex items-center justify-center gap-2 flex-wrap">
            {["UPI", "Cards", "Net Banking", "Wallets"].map((m) => (
              <span
                key={m}
                className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[10px] font-bold text-white/55 tracking-wide"
              >
                {m}
              </span>
            ))}
          </div>

          <div className="relative flex items-center justify-center gap-1.5 text-[11px] text-white/40 pt-1">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            Payments Processed via Cashfree Authorized Payment Gateway
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
        
        <div className="max-w-4xl mx-auto mb-8 relative z-10">
          <Link href="/pricing" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Packages & Pricing
          </Link>
        </div>

        <Suspense fallback={<div className="text-center py-20 text-white/50">Loading Checkout...</div>}>
          <CheckoutContent />
        </Suspense>
      </div>
    </RequireAuth>
  );
}
