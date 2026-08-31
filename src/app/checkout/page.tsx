"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, Lock, ArrowLeft, User, MapPin, CreditCard, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getProduct } from "@/lib/products";
import CashfreeButton from "@/components/payment/CashfreeButton";
import RequireAuth from "@/components/auth/RequireAuth";

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

  // Billing address must be completed before any payment option is shown.
  // Phone is mandatory too — Cashfree rejects orders without customer phone.
  const billingComplete = Boolean(
    userProfile.address && userProfile.city && userProfile.state && userProfile.pincode && userProfile.phone
  );

  // Cashfree runs in demo/simulation mode until real keys are added to .env
  // (NEXT_PUBLIC_CASHFREE_LIVE=true).
  const cashfreeLive = process.env.NEXT_PUBLIC_CASHFREE_LIVE === "true";

  const goToSuccess = (orderId: string, txn: string) => {
    // Open the Orders modal and navigate to home directly, bypassing success page
    openOrders();
    router.push("/");
  };

  const handleDemoCheckout = async () => {
    const txnId = `NEX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const order = await recordNewOrder({
      title: plan.name,
      amount: plan.priceStr,
      planId: plan.id,
      isSubscription: plan.recurring,
      numericAmount: plan.priceInr,
    });
    goToSuccess(order.id, txnId);
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
          className="w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm shadow-[0_0_30px_rgba(220,38,38,0.4)]"
        >
          Sign In / Create Account to Continue
        </button>
      </div>
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
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-brand-red/10 border border-brand-red/30">
              <AlertCircle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold text-sm">Billing address required</p>
                <p className="text-white/60 text-xs mt-1">
                  Please complete your billing address (street, city, state & pincode) before making a payment.
                </p>
                <button
                  onClick={openProfileModal}
                  className="mt-2 text-xs font-bold text-brand-blue-light hover:underline"
                >
                  Complete Billing Address →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Payment Gateway */}
      <div className="md:col-span-5 space-y-6 relative z-10">
        {billingComplete ? (
          <div className="payment-checkout-card always-dark relative overflow-hidden rounded-3xl p-6 border space-y-5 bg-gradient-to-br from-[#0d0a2e] via-[#120f38] to-[#0b0b0d] border-[#6d5efc]/30 shadow-[0_0_50px_rgba(109,94,252,0.25)] hover:shadow-[0_0_70px_rgba(109,94,252,0.35)] transition-shadow duration-500">
            {/* Ambient glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-36 bg-[#6d5efc]/25 rounded-full blur-[70px] pointer-events-none" />

            {!cashfreeLive && (
              <div className="relative flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  <strong className="text-amber-300">Demo / Test Mode:</strong> Cashfree keys are not configured in <code>.env</code>. Clicking pay will simulate a successful payment (no real charge). Add your keys &amp; set <code>NEXT_PUBLIC_CASHFREE_LIVE=true</code> for live payments.
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
                customerEmail={userProfile.email || user?.email || ""}
                customerPhone={userProfile.phone || ""}
                onDemo={handleDemoCheckout}
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
              Payments Processed via Authorized Payment Gateway
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-brand-red/15 border border-brand-red/30 flex items-center justify-center mx-auto text-brand-red">
              <Lock className="w-7 h-7" />
            </div>
            <h4 className="text-white font-bold text-lg">Payment Locked</h4>
            <p className="text-white/55 text-sm">
              Complete your billing address on the left to unlock secure payment options.
            </p>
            <button
              onClick={openProfileModal}
              className="w-full btn-primary py-3 rounded-xl justify-center font-bold text-sm"
            >
              <MapPin className="w-4 h-4 mr-1.5" /> Add Billing Address
            </button>
          </div>
        )}
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
