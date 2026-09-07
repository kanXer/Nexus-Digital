"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useRef } from "react";
import { Wallet, AlertCircle, Loader2 } from "lucide-react";

async function fetchWithTimeout(url: string, init: RequestInit, ms = 30000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default function CashfreeButton({
  planId,
  planName,
  priceInr,
  recurring = false,
  userId,
  customerEmail = "",
  customerPhone = "",
  onDemo,
}: {
  planId: string;
  planName: string;
  priceInr: number;
  recurring?: boolean;
  userId?: string;
  customerEmail?: string;
  customerPhone?: string;
  onDemo: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [message, setMessage] = useState("");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleClick = useCallback(async () => {
    setStatus("processing");
    setMessage("Connecting to Cashfree secure payment gateway…");
    try {
      const res = await fetchWithTimeout(
        "/api/cashfree/initiate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            planName,
            priceInr,
            recurring,
            userId: userId || "guest",
            customerEmail: customerEmail || "client@thenexusdigital.in",
            customerPhone: customerPhone || "9696262007",
            redirectBase: typeof window !== "undefined" ? window.location.origin : "",
          }),
        },
        30000
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not start payment");

      if (data.demo) {
        setMessage("Demo mode: simulating successful payment…");
        onDemo();
        return;
      }

      if (!data.paymentSessionId) {
        throw new Error("Payment session not created. Please try again.");
      }

      setMessage("Redirecting to Cashfree Payment Gateway…");

      const isProd =
        process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" ||
        process.env.NEXT_PUBLIC_CASHFREE_LIVE === "true";

      const paymentUrl =
        data.paymentUrl ||
        (isProd
          ? "https://api.cashfree.com/pg/view/sessions/checkout"
          : "https://sandbox.cashfree.com/pg/view/sessions/checkout");

      // Seamless Native Hosted Checkout: Standard POST form submission.
      // This is Cashfree's official hosted redirect integration.
      // - 100% works across all mobile browsers (Android Chrome, iOS Safari)
      // - Direct UPI app deep links (Google Pay, PhonePe, Paytm, BHIM, QR)
      // - Zero iframe blocking or third-party cookie restrictions
      // - Eliminates false-positive domain whitelisting errors
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;
      form.style.display = "none";

      const sessionInput = document.createElement("input");
      sessionInput.type = "hidden";
      sessionInput.name = "payment_session_id";
      sessionInput.value = data.paymentSessionId;
      form.appendChild(sessionInput);

      document.body.appendChild(form);
      form.submit();
    } catch (e: any) {
      if (!mountedRef.current) return;
      setStatus("error");
      if (e?.name === "AbortError") {
        setMessage("Request timed out. Please check your connection and try again.");
      } else {
        setMessage(e?.message || "Payment could not be started.");
      }
    }
  }, [planId, planName, priceInr, recurring, userId, customerEmail, customerPhone, onDemo]);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "processing"}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-[#5138ee] hover:bg-[#4329d8] text-[#ffffff] transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(81,56,238,0.35)]"
      >
        {status === "processing" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        {status === "processing"
          ? message || "Redirecting to payment…"
          : "Pay Securely with UPI / Card"}
      </button>
      {status === "error" && (
        <div className="mt-2 space-y-2">
          <p className="text-xs flex items-center gap-1 text-red-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {message}
          </p>
          <button
            type="button"
            onClick={handleClick}
            className="w-full text-xs py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            Retry Payment
          </button>
        </div>
      )}
    </div>
  );
}
