"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Trash2, ArrowRight, ShieldCheck,
  Check, Star, Lock, Sparkles, X as XIcon, Plus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { pricingPlans } from "@/data/pricing";
import RequireAuth from "@/components/auth/RequireAuth";

export default function CartPage() {
  const { user, cart, removeFromCart, clearCart, addToCart, openAuthModal, requireAuthForAction } = useAuth();
  const router = useRouter();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

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
    // Checkout with first cart item
    if (cart.length > 0) {
      router.push(`/checkout?plan=${cart[0].id}`);
    }
  };

  return (
    <RequireAuth>
      <div className="bg-black min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link href="/pricing" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors mb-4">
            ← Back to Pricing
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Your Marketing Cart 🛒
              </h1>
              <p className="text-white/50 mt-1 text-sm">
                Select your digital marketing packages and proceed to secure checkout.
              </p>
            </div>
            {cart.length > 0 && (
              <div className="flex items-center gap-3">
                <button onClick={clearCart} className="text-xs text-white/40 hover:text-red-400 transition-colors">
                  Clear Cart
                </button>
                <button
                  onClick={handleCheckoutAll}
                  className="btn-primary py-3 px-6 rounded-xl justify-center font-bold text-sm shadow-[0_0_30px_rgba(220,38,38,0.35)]"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — All Plans */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-base font-bold text-white/70 uppercase tracking-wider mb-4">
              Available Marketing Packages
            </h2>

            {pricingPlans.map((plan, i) => {
              const inCart = cart.some((c) => c.id === plan.id);
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className={`rounded-3xl p-6 border transition-all ${
                    plan.highlight
                      ? "glass-card-brand border-brand-blue/40 shadow-[0_0_40px_rgba(220,38,38,0.15)]"
                      : "glass-card border-white/8"
                  }`}
                >
                  {/* Plan Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        {plan.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-brand-blue-dark to-brand-blue text-white flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" /> {plan.badge}
                          </span>
                        )}
                        {inCart && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                            ✓ In Cart
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 text-xs">{plan.tagline}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-white">{plan.priceRange}</div>
                      <div className="text-[11px] text-white/40">{plan.period}</div>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 mb-5">
                    {plan.features.filter((f) => f.included).slice(0, 6).map((f) => (
                      <li key={f.text} className="flex items-center gap-2 text-xs text-white/70">
                        <Check className="w-3.5 h-3.5 text-brand-blue-light shrink-0" />
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleCheckoutItem(plan.id)}
                      className={`flex-1 ${plan.highlight ? "btn-primary" : "btn-secondary"} py-2.5 rounded-xl justify-center font-bold text-sm min-w-[140px]`}
                    >
                      {user ? (
                        <>Buy Now <ArrowRight className="w-4 h-4 ml-1" /></>
                      ) : (
                        <><Lock className="w-3.5 h-3.5 mr-1" /> Sign In to Buy</>
                      )}
                    </button>

                    {inCart ? (
                      <button
                        onClick={() => removeFromCart(plan.id)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(plan)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-bold hover:bg-white/10 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right — Cart Summary */}
          <div className="space-y-5">
            <h2 className="text-base font-bold text-white/70 uppercase tracking-wider mb-4">
              Cart Summary
            </h2>

            <div className="glass-card rounded-3xl border border-white/12 overflow-hidden sticky top-24">
              {/* Cart Items */}
              <div className="p-5 space-y-3 max-h-[40vh] overflow-y-auto">
                <AnimatePresence>
                  {cart.length === 0 ? (
                    <div className="text-center py-10 space-y-3">
                      <ShoppingCart className="w-10 h-10 mx-auto text-white/20" />
                      <p className="text-white/50 text-sm font-medium">Your cart is empty</p>
                      <p className="text-white/30 text-xs">Add marketing packages using the buttons on the left.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/8"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-xs truncate">{item.title}</p>
                          <p className="text-brand-blue-light font-extrabold text-xs mt-0.5">{item.price}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-white/30 hover:text-red-400 transition-colors p-1"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

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
              {["30-Day Money-Back Guarantee", "Cancel or Pause Anytime", "Live in 24 Hours After Payment"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
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
