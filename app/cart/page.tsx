"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Trash2, ArrowRight, ShieldCheck,
  Check, Star, Lock, Sparkles, X as XIcon, Plus,
  Rocket, TrendingUp, Crown, FlaskConical, Zap, MessageCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { pricingPlans } from "@/data/pricing";
import RequireAuth from "@/components/auth/RequireAuth";

const PLAN_ICONS: Record<string, typeof Rocket> = {
  basic: Rocket,
  growth: TrendingUp,
  premium: Crown,
  test: FlaskConical,
};

export default function CartPage() {
  const { user, loading, cart, removeFromCart, clearCart, addToCart, openAuthModal, requireAuthForAction } = useAuth();
  const router = useRouter();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const subtotal = cart.reduce((sum, c) => sum + (c.numericPrice || 0), 0);

  const handleAddToCart = (plan: typeof pricingPlans[0]) => {
    addToCart({
      id: plan.id,
      title: plan.name,
      price: plan.priceRange,
      numericPrice: plan.priceInr,
      description: plan.tagline,
    });
    setAddedIds((prev) => new Set([...prev, plan.id]));
  };

  const handleCheckoutItem = (planId: string) => {
    requireAuthForAction(() => {
      router.push(`/checkout?plan=${planId}`);
    });
  };

  const handleCheckoutAll = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (cart.length > 0) {
      router.push(`/checkout?plan=${cart[0].id}`);
    }
  };

  // Wait for Firebase auth to resolve before showing the RequireAuth login wall
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-brand-blue/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-blue-light animate-spin" />
        </div>
        <p className="text-sm text-white/40">Loading your cart…</p>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="bg-black min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen opacity-70" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen opacity-70" />
        <div className="absolute inset-0 noise-bg pointer-events-none opacity-20" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-10">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors mb-4">
              ← Back to Pricing
            </Link>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                  Your Marketing Cart
                  {cart.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-blue/15 border border-brand-blue/30 text-brand-blue-light align-middle">
                      {cart.length} {cart.length === 1 ? "item" : "items"}
                    </span>
                  )}
                </h1>
                <p className="text-white/50 mt-1 text-sm">
                  Review your selected packages and proceed to secure checkout.
                </p>
              </div>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-xs text-white/40 hover:text-red-400 transition-colors">
                  Clear Cart
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — Cart Items */}
            <div className="lg:col-span-2 space-y-5">
              <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
                Your Items
              </h2>

              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-card rounded-3xl border border-white/10 py-16 px-6 text-center"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-5">
                      <ShoppingCart className="w-9 h-9 text-white/25" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">Your cart is empty</h3>
                    <p className="text-white/45 text-sm max-w-xs mx-auto mb-7">
                      Explore our packages or grab the ₹1 test plan to try the full checkout experience.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/pricing" className="btn-primary py-3 px-6 rounded-xl justify-center font-bold text-sm inline-flex">
                        Browse Packages <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                      <a
                        href={`https://wa.me/${"919696262007"}?text=${encodeURIComponent("Hi! I want a custom marketing package.")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 font-semibold text-sm border border-white/10 transition-all inline-flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4 text-green-400" /> Talk to Us
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  cart.map((item, i) => {
                    const IconComp = PLAN_ICONS[item.id] || Zap;
                    const period = pricingPlans.find((p) => p.id === item.id)?.period || "/month";
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.35 }}
                        className="glass-card rounded-3xl p-5 border border-white/10 hover:border-brand-blue/40 hover:shadow-[0_0_30px_rgba(109,94,252,0.15)] transition-all duration-300 group"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-blue-dark/20 border border-brand-blue/40 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                            <IconComp className="w-6 h-6 text-brand-blue-light drop-shadow-glow" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <h3 className="font-bold text-white text-base leading-tight">{item.title}</h3>
                                {item.description && (
                                  <p className="text-white/45 text-xs mt-1 line-clamp-2">{item.description}</p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <div className="font-black text-white text-lg">{item.price}</div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4">
                              <button
                                onClick={() => handleCheckoutItem(item.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-primary font-bold text-xs"
                              >
                                {user ? <>Buy Now <ArrowRight className="w-3.5 h-3.5" /></> : <><Lock className="w-3 h-3" /> Sign In to Buy</>}
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold hover:bg-red-500/20 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                              <span className="ml-auto hidden sm:inline text-[10px] text-white/30 uppercase tracking-wider font-semibold">{period.replace("/", "billed ")}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>

              {/* Add More Packages */}
              <div className="pt-4">
                <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" /> Add More Services
                </h2>
                <div className="space-y-3">
                  {pricingPlans.map((plan) => {
                    const inCart = cart.some((c) => c.id === plan.id);
                    return (
                      <div
                        key={plan.id}
                        className={`glass-card rounded-2xl px-4 py-3.5 border flex items-center gap-3 transition-all ${
                          inCart ? "border-green-500/25" : "border-white/8 hover:border-white/20"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm truncate">{plan.name}</span>
                            {plan.badge && (
                              <span className="hidden sm:inline px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-gradient-to-r from-brand-blue-dark to-brand-blue text-white shrink-0">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-white/40 text-[11px] truncate">{plan.tagline}</p>
                        </div>
                        <span className="text-white font-extrabold text-sm whitespace-nowrap hidden sm:inline">{plan.priceRange}</span>
                        {inCart ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-green-500/15 text-green-400 border border-green-500/30 shrink-0">
                            <Check className="w-3 h-3" /> Added
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(plan)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all shrink-0"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
                Order Summary
              </h2>

              <div className="glass-card-brand rounded-3xl border border-brand-blue/30 shadow-[0_0_50px_rgba(109,94,252,0.1)] overflow-hidden sticky top-24 backdrop-blur-xl">
                {/* Mini list */}
                <div className="p-5 space-y-2.5 max-h-[34vh] overflow-y-auto">
                  <AnimatePresence initial={false}>
                    {cart.length === 0 ? (
                      <p className="text-center text-white/35 text-xs py-6">No items yet.</p>
                    ) : (
                      cart.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16 }}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/8"
                        >
                          <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                          <p className="flex-1 min-w-0 font-semibold text-white text-[11px] truncate">{item.title}</p>
                          <span className="text-brand-blue-light font-extrabold text-[11px] whitespace-nowrap">{item.price}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-white/25 hover:text-red-400 transition-colors p-0.5 shrink-0"
                            aria-label={`Remove ${item.title}`}
                          >
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* Totals */}
                {cart.length > 0 && (
                  <div className="px-5 pb-4 pt-1 space-y-2 text-xs border-t border-white/8">
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-white/50">Subtotal ({cart.length} {cart.length === 1 ? "package" : "packages"})</span>
                      <span className="text-white font-bold">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Onboarding & strategy session</span>
                      <span className="text-green-400 font-bold">FREE</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-white/10 mt-2">
                      <span className="text-white font-bold text-sm">Total Payable</span>
                      <span className="text-white font-black text-lg">
                        ₹{subtotal.toLocaleString("en-IN")}
                        <span className="text-[10px] font-semibold text-white/40 ml-1">+GST</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Checkout CTA */}
                <div className="p-5 border-t border-white/10 space-y-3 bg-white/2">
                  {!user ? (
                    <div className="text-center space-y-2">
                      <p className="text-white/50 text-xs">Sign in to proceed to checkout.</p>
                      <button
                        onClick={openAuthModal}
                        className="w-full btn-primary py-3 rounded-xl justify-center font-bold text-sm"
                      >
                        <Lock className="w-4 h-4 mr-1.5" /> Sign In to Checkout
                      </button>
                    </div>
                  ) : cart.length > 0 ? (
                    <>
                      <button
                        onClick={handleCheckoutAll}
                        className="w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm shadow-[0_0_25px_rgba(220,38,38,0.4)]"
                      >
                        <Sparkles className="w-4 h-4 mr-1 text-yellow-300" /> Proceed to Checkout
                      </button>
                      <div className="flex items-center justify-center gap-1 text-[11px] text-white/40">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> 256-bit SSL Secure Payment
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-white/40 text-xs py-2">
                      Add a package to enable checkout.
                    </p>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="glass-card rounded-2xl p-4 border border-white/8 space-y-2 text-xs text-white/50">
                {["Secure Payments via Authorized Gateway", "Refunds per Refund & Cancellation Policy", "Clear Timeline Before Work Begins"].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
