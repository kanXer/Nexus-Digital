"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2, Download, ArrowRight, Sparkles,
  Calendar, Receipt, Home, ShieldCheck, Copy, Check, AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { generateInvoicePdf, downloadBlob } from "@/lib/pdf";
import { getProduct } from "@/lib/products";
import { config } from "@/lib/config";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, userProfile, orders, recordNewOrder } = useAuth();
  const [copied, setCopied] = useState(false);
  const [verifyError, setVerifyError] = useState(false);
  const recordedRef = useRef(false);

  const orderId = searchParams.get("orderId");
  const planId = searchParams.get("plan") || "growth";
  const txnId = searchParams.get("txn") || `NEX-${Date.now().toString(36).toUpperCase()}`;
  // Present only after a real Paytm redirect (po = Paytm orderId).
  const po = searchParams.get("po");
  const payStatus = searchParams.get("status");

  // Find matching order from context if available
  const matchedOrder = orders.find((o) => o.id === orderId || o.planId === planId);
  const displayOrder = matchedOrder || {
    id: orderId || txnId.slice(0, 8),
    title: planId === "basic"
      ? "Basic Growth Plan"
      : planId === "premium"
      ? "Enterprise Custom Scaler"
      : "Pro Business Accelerator",
    amount: planId === "basic" ? "₹4,999/mo" : planId === "premium" ? "₹29,999/mo" : "₹14,999/mo",
    date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    purchaseTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    isSubscription: true,
    numericAmount: planId === "basic" ? 4999 : planId === "premium" ? 29999 : 14999,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    }),
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(txnId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadInvoice = () => {
    const priceNum =
      displayOrder.numericAmount ??
      (planId === "basic" ? 4999 : planId === "premium" ? 29999 : 14999);
    const billNumber = `INV-${orderId || txnId}`;
    const blob = generateInvoicePdf({
      billNumber,
      date: `${displayOrder.date} ${displayOrder.purchaseTime ? "at " + displayOrder.purchaseTime : ""}`,
      agencyName: config.name,
      agencyEmail: config.email,
      agencyAddress: config.address,
      clientName: userProfile.name || user?.displayName || "Customer",
      clientEmail: userProfile.email || user?.email || "",
      planName: displayOrder.title,
      amount: priceNum,
      currency: "INR",
      paymentRef: txnId,
    });
    downloadBlob(blob, `${billNumber}.pdf`);
  };

  // Real Paytm return: verify the transaction, then record the order in
  // Firebase so it appears in "My Orders" and can be billed/downloaded.
  useEffect(() => {
    if (!user) {
      router.push("/pricing");
      return;
    }
    if (po && !recordedRef.current) {
      recordedRef.current = true;
      (async () => {
        try {
          const res = await fetch(`/api/paytm/status?po=${encodeURIComponent(po)}`);
          const data = await res.json();
          if (data?.body?.resultInfo?.resultStatus !== "TXN_SUCCESS") {
            setVerifyError(true);
            return;
          }
          const prod = getProduct(planId);
          await recordNewOrder({
            title: prod?.name || planId,
            amount: prod
              ? `₹${prod.priceInr.toLocaleString("en-IN")}${prod.cycle === "monthly" ? "/mo" : ""}`
              : "",
            planId,
            isSubscription: prod?.cycle === "monthly",
            numericAmount: prod?.priceInr || 0,
          });
          router.replace(`/payment-success?plan=${encodeURIComponent(planId)}&txn=${txnId}`);
        } catch {
          setVerifyError(true);
        }
      })();
    }
  }, [po, user, planId, router, recordNewOrder, txnId]);

  // Redirect if no valid context
  useEffect(() => {
    if (!user) {
      router.push("/pricing");
    }
  }, [user, router]);

  if (!user) return null;

  // Real Paytm payment failed / could not be verified.
  if (payStatus === "failed" || verifyError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-red-500/15 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Payment Not Completed</h1>
        <p className="text-white/60 text-sm mb-8">
          Your Paytm transaction was not successful or could not be verified. No amount was charged. Please try again or contact support.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/checkout" className="w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm">
            Retry Payment <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link href="/pricing" className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm border border-white/10 transition-all">
            Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 text-center">
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 border-2 border-green-500/50 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
      >
        <CheckCircle2 className="w-12 h-12 text-green-400" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span className="text-xs font-bold text-brand-blue-light uppercase tracking-widest">Payment Successful</span>
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          Welcome Aboard! 🎉
        </h1>
        <p className="text-white/60 text-sm leading-relaxed">
          Your <strong className="text-white">{displayOrder.title}</strong> is now active. Our team will onboard you within 24 hours!
        </p>
      </motion.div>

      {/* Order Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="mt-8 glass-card-brand rounded-3xl p-6 border border-brand-blue/30 shadow-[0_0_40px_rgba(220,38,38,0.12)] text-left space-y-4"
      >
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Receipt className="w-5 h-5 text-brand-blue-light" /> Order Summary
        </h3>

        <div className="space-y-3 text-sm">
          {/* Transaction ID */}
          <div className="flex items-center justify-between gap-3 bg-white/5 rounded-2xl p-3 border border-white/8">
            <div>
              <span className="text-white/40 text-xs block">Transaction ID</span>
              <strong className="text-white font-mono text-xs">{txnId}</strong>
            </div>
            <button
              onClick={handleCopy}
              title="Copy Transaction ID"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Plan & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/8">
              <span className="text-white/40 text-xs block">Package</span>
              <strong className="text-white text-xs">{displayOrder.title}</strong>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/8">
              <span className="text-white/40 text-xs block">Amount Paid</span>
              <strong className="text-brand-blue-light">{displayOrder.amount}</strong>
            </div>
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/8">
              <span className="text-white/40 text-xs block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Purchase Date
              </span>
              <strong className="text-white text-xs">{displayOrder.date} {displayOrder.purchaseTime ? `at ${displayOrder.purchaseTime}` : ""}</strong>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/8">
              <span className="text-white/40 text-xs block">
                {displayOrder.isSubscription ? "Renews / Expires" : "Service Type"}
              </span>
              {displayOrder.isSubscription ? (
                <strong className="text-yellow-400 text-xs">{displayOrder.expiryDate}</strong>
              ) : (
                <strong className="text-green-400 text-xs">One-Time Payment</strong>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-6 space-y-3"
      >
        <button
          onClick={handleDownloadInvoice}
          className="w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm"
        >
          <Download className="w-4 h-4 mr-2" /> Download Invoice / Bill
        </button>

        <Link href="/" className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-sm border border-white/10 transition-all">
          <Home className="w-4 h-4" /> Back to Home
        </Link>

        <Link href="/pricing" className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-brand-blue-light font-semibold text-xs hover:underline transition-all">
          Explore More Packages <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>

      {/* Security & Trust footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-white/30"
      >
        <ShieldCheck className="w-4 h-4 text-green-400" />
        Your billing data is encrypted and securely stored.
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="bg-black min-h-screen pt-28 pb-24">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-brand-blue/5 rounded-full blur-[80px]" />
      </div>

      <Suspense fallback={
        <div className="text-center py-20 text-white/50">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4 animate-pulse" />
          Confirming your payment...
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
