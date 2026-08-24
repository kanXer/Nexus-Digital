"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trash2, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CartDrawer() {
  const { isCartOpen, closeCart, cart, removeFromCart, clearCart, user, openAuthModal } = useAuth();

  const subtotal = cart.reduce((sum, i) => sum + (i.numericPrice || 0), 0);

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
          onClick={closeCart}
        />

        {/* Slide-over Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="cart-drawer relative z-10 w-full max-w-md h-full bg-[#08080c] border-l border-white/10 flex flex-col overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[320px] h-[220px] bg-brand-blue/15 rounded-full blur-[110px] pointer-events-none" />

          {/* Header */}
          <div className="relative p-5 border-b border-white/8 bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light border border-white/10 flex items-center justify-center text-[#ffffff] shadow-[0_4px_16px_rgba(37,99,235,0.35)]">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Your Cart</h3>
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-wider text-white/60">
                    {cart.length} ITEM{cart.length !== 1 ? "S" : ""} SELECTED
                  </span>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg bg-white/5 border border-white/8 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {!user ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-brand-blue-light">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Login Required</p>
                  <p className="text-white/40 text-xs mt-1">Sign in to access your cart and checkout securely.</p>
                </div>
                <button
                  onClick={openAuthModal}
                  className="btn-primary inline-flex py-2.5 px-5 rounded-xl text-xs font-bold"
                >
                  Sign In / Create Account <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-white/25">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Your cart is empty</p>
                  <p className="text-white/40 text-xs mt-1">Explore our growth packages to get started.</p>
                </div>
                <Link
                  href="/pricing"
                  onClick={closeCart}
                  className="btn-primary inline-flex py-2.5 px-5 rounded-xl text-xs font-bold"
                >
                  Browse Packages <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            ) : (
              cart.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative p-4 rounded-2xl glass-card border border-white/8 hover:border-brand-blue/30 hover:shadow-glow-sm transition-all duration-300"
                >
                  <span className="absolute top-3 right-3 text-[9px] font-bold text-white/20 group-hover:text-brand-blue-light/60 transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-start gap-3 pr-6">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-brand-blue/10 border border-brand-blue/25 flex items-center justify-center text-brand-blue-light text-xs font-black">
                      ₹
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm leading-snug">{item.title}</h4>
                      {item.description && (
                        <p className="text-white/40 text-xs mt-1 line-clamp-1">{item.description}</p>
                      )}
                      <p className="text-brand-blue-light font-extrabold text-sm mt-2">{item.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    title="Remove"
                    className="absolute bottom-3 right-3 p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          {user && cart.length > 0 && (
            <div className="relative p-5 border-t border-white/8 bg-white/[0.03] space-y-4">
              {/* Subtotal */}
              <div className="rounded-2xl bg-white/[0.04] border border-white/8 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Subtotal</p>
                  <p className="text-[10px] text-white/25">Final amount at checkout</p>
                </div>
                <p className="text-xl font-black text-white leading-none">
                  ₹{subtotal.toLocaleString("en-IN")}
                  <span className="text-[10px] font-semibold text-white/30 ml-1">+GST</span>
                </p>
              </div>

              <button onClick={clearCart} className="text-[11px] text-white/35 hover:text-red-400 transition-colors">
                Clear all items
              </button>

              <Link
                href="/cart"
                onClick={closeCart}
                className="group w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm shadow-[0_0_25px_rgba(220,38,38,0.4)]"
              >
                Proceed to Secure Checkout
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <div className="flex items-center justify-center gap-4 text-[10px] text-white/35 font-semibold">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-green-400" /> 256-bit SSL
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-400" /> Instant Activation
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
