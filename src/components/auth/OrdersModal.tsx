"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, PackageCheck, Clock, CheckCircle2, ArrowRight, Calendar, ShieldCheck, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { generateInvoicePdf, downloadBlob } from "@/lib/pdf";
import { config } from "@/lib/config";
import type { UserOrder } from "@/context/AuthContext";

export default function OrdersModal() {
  const { isOrdersOpen, closeOrders, orders, userProfile, user } = useAuth();

  if (!isOrdersOpen || !user) return null;

  const handleDownloadBill = (order: UserOrder) => {
    const billNumber = `INV-${order.id}`;
    const blob = generateInvoicePdf({
      billNumber,
      date: `${order.date}${order.purchaseTime ? " at " + order.purchaseTime : ""}`,
      agencyName: config.name,
      agencyEmail: config.email,
      agencyAddress: config.address,
      clientName: userProfile.name || "Customer",
      clientEmail: userProfile.email || "",
      planName: order.title,
      amount: order.numericAmount ?? 0,
      currency: "INR",
      paymentRef: order.id,
    });
    downloadBlob(blob, `${billNumber}.pdf`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="auth-backdrop fixed inset-0 backdrop-blur-md"
          onClick={closeOrders}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-xl glass-card rounded-3xl p-6 sm:p-8 border border-white/12 auth-modal-card overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={closeOrders}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-brand-blue-light">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Your Orders & Subscriptions</h3>
              <p className="text-white/60 text-xs sm:text-sm">Track your active marketing plans, expiry dates, and purchase timeline.</p>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {orders.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-base">No active orders yet</h4>
                  <p className="text-white/50 text-xs mt-1">Once you book a service or plan, your order status & expiry date will appear here.</p>
                </div>
                <Link
                  href="/pricing"
                  onClick={closeOrders}
                  className="btn-primary inline-flex py-2.5 px-5 rounded-xl text-xs font-bold"
                >
                  View Marketing Packages <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm sm:text-base">{order.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {order.status}
                      </span>
                    </div>
                    <span className="font-extrabold text-brand-blue-light text-sm sm:text-base">{order.amount}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-white/50 pt-1 border-t border-white/5 gap-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-white/40" />
                      <span>Purchased: <strong className="text-white/80">{order.date} {order.purchaseTime ? `at ${order.purchaseTime}` : ""}</strong></span>
                    </div>

                    <button
                      onClick={() => handleDownloadBill(order)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all font-semibold"
                      title="Download Bill"
                    >
                      <Download className="w-3.5 h-3.5" /> Bill
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-white/50 pt-1 gap-2">
                    {order.isSubscription !== false ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-brand-blue-light font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Expires / Renews: <strong>{order.expiryDate || "In 30 Days"}</strong></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 text-white/60">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> One-Time Service
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
