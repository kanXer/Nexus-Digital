"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Wallet, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    Cashfree?: any;
  }
}

// Loads the official Cashfree web SDK once (v3).
function loadCashfreeSdk(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Cashfree) return Promise.resolve(window.Cashfree);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-cashfree-sdk]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Cashfree));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.setAttribute("data-cashfree-sdk", "true");
    script.onload = () => resolve(window.Cashfree);
    script.onerror = () => reject(new Error("Could not load payment SDK. Check your connection."));
    document.body.appendChild(script);
  });
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
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    loadCashfreeSdk()
      .then(() => setSdkReady(true))
      .catch(() => setSdkReady(false));
  }, []);

  const handleClick = async () => {
    setStatus("processing");
    setMessage("Connecting to secure payment gateway…");
    try {
      const res = await fetch("/api/cashfree/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          planName,
          priceInr,
          recurring,
          userId: userId || "guest",
          customerEmail,
          customerPhone,
          redirectBase: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not start payment");

      // No Cashfree credentials configured → simulate a successful payment so
      // the full purchase flow (cart → checkout → success → orders) still works.
      if (data.demo) {
        setMessage("Demo mode: simulating successful payment…");
        onDemo();
        return;
      }

      // Real Cashfree: open the hosted checkout (redirects back to
      // /payment-success when done via the order's return_url).
      const CashfreeCtor = await loadCashfreeSdk();
      const mode =
        process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" ||
        process.env.NEXT_PUBLIC_CASHFREE_LIVE === "true"
          ? "production"
          : "sandbox";
      const cashfree = new CashfreeCtor({ mode });
      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (e: any) {
      setStatus("error");
      setMessage(e?.message || "Payment could not be started.");
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "processing"}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-[#5138ee] hover:bg-[#4329d8] text-[#ffffff] transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(81,56,238,0.35)]"
      >
        <Wallet className="w-4 h-4" />
        {status === "processing"
          ? "Opening secure checkout…"
          : sdkReady
          ? "Pay Securely with UPI / Card"
          : "Pay Securely"}
      </button>
      {status !== "idle" && (
        <p className={`mt-2 text-xs flex items-center gap-1 ${status === "error" ? "text-red-400" : "text-white/50"}`}>
          {status === "error" && <AlertCircle className="w-3.5 h-3.5" />}
          {message}
        </p>
      )}
    </div>
  );
}
