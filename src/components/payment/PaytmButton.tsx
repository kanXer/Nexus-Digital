"use client";
import { useState } from "react";
import { Wallet, AlertCircle } from "lucide-react";

export default function PaytmButton({
  planId,
  planName,
  priceInr,
  recurring = false,
  userId,
  onDemo,
}: {
  planId: string;
  planName: string;
  priceInr: number;
  recurring?: boolean;
  userId?: string;
  onDemo: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setStatus("processing");
    setMessage("Connecting to Paytm…");
    try {
      const res = await fetch("/api/paytm/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          planName,
          priceInr,
          recurring,
          userId: userId || "guest",
          redirectBase: window.location.origin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not start payment");

      // No Paytm credentials configured → simulate a successful payment so
      // the full purchase flow (cart → checkout → success → orders) still works.
      if (data.demo) {
        setMessage("Demo mode: simulating successful Paytm payment…");
        onDemo();
        return;
      }

      // Real Paytm: hand off to the hosted payment page.
      window.location.href = data.url;
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
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-[#00baf2] hover:bg-[#0098c9] text-[#ffffff] transition-all disabled:opacity-60 shadow-[0_0_20px_rgba(0,186,242,0.35)]"
      >
        <Wallet className="w-4 h-4" />
        {status === "processing" ? "Redirecting to Paytm…" : "Pay Securely with Paytm"}
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
