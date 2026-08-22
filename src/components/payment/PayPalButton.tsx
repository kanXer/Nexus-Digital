/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { generateInvoicePdf, downloadBlob } from "@/lib/pdf";
import { config } from "@/lib/config";
import {
  PAYPAL_CURRENCY,
  formatPaypalAmount,
} from "@/lib/paypalConfig";

declare global {
  interface Window {
    paypal?: any;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";

// Subscriptions require the SDK to be loaded from the matching environment host.
const PAYPAL_HOST =
  (process.env.NEXT_PUBLIC_PAYPAL_ENV || "live").toLowerCase() === "sandbox"
    ? "https://www.sandbox.paypal.com"
    : "https://www.paypal.com";

export default function PayPalButton({
  planId,
  planName,
  priceInr,
  recurring = false,
}: {
  planId: string;
  planName: string;
  priceInr: number;
  recurring?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function renderButtons() {
      if (cancelled || !containerRef.current || !window.paypal) return;
      containerRef.current.innerHTML = "";

      // For recurring plans, resolve the PayPal billing plan id first.
      let subscriptionPlanId: string | null = null;
      if (recurring) {
        try {
          const r = await fetch(
            `/api/paypal/plan?productId=${encodeURIComponent(planId)}`
          );
          const j = await r.json();
          if (!r.ok || !j.planId) throw new Error(j.error || "Could not load plan");
          subscriptionPlanId = j.planId;
        } catch (e: any) {
          setStatus("error");
          setMessage(e?.message || "Could not initialise subscription. Please try again.");
          return;
        }
      }

      const configObj: any = {
        style: {
          layout: "vertical",
          color: "blue",
          shape: "pill",
          label: recurring ? "subscribe" : "paypal",
        },
        onApprove: async (data: any) => {
          try {
            setStatus("processing");
            setMessage(
              recurring
                ? "Confirming your subscription…"
                : "Confirming payment with PayPal…"
            );

            const payload: any = {
              productId: planId,
              paypalOrderId: data.orderID,
            };
            if (data.subscriptionID) payload.subscriptionId = data.subscriptionID;

            const res = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const result = await res.json();

            if (!res.ok) {
              setStatus("error");
              setMessage(result?.error || "Payment could not be verified.");
              return;
            }

            const billNumber = result.billNumber;
            setMessage("Generating your invoice…");

            const blob = generateInvoicePdf({
              billNumber,
              date: new Date().toLocaleString("en-IN"),
              agencyName: config.name,
              agencyEmail: config.email,
              agencyAddress: config.address,
              clientName: result.payerName || "Customer",
              clientEmail: result.payerEmail || "",
              planName,
              amount: priceInr,
              currency: "INR",
              paypalOrderId: data.subscriptionID || data.orderID,
            });
            downloadBlob(blob, `${billNumber}.pdf`);

            setStatus("success");
            setMessage(
              result.alreadyRecorded
                ? `Invoice ${billNumber} downloaded.`
                : `Success! Invoice ${billNumber} downloaded and emailed.`
            );
          } catch (err) {
            console.error("Checkout error:", err);
            setStatus("error");
            setMessage("Something went wrong after payment. Contact support.");
          }
        },
        onError: (err: any) => {
          const msg = String(err?.message || err || "");
          // Closing the gateway popup throws a "Detected popup close" error from
          // the SDK — treat it as a cancel, not a failure.
          if (/popup close|cancel|closed|user cancelled/i.test(msg)) {
            setStatus("idle");
            setMessage("");
            return;
          }
          console.error("PayPal error:", err);
          setStatus("error");
          setMessage("Payment failed. Please try again.");
        },
        onCancel: () => {
          setStatus("idle");
          setMessage("");
        },
      };

      if (recurring && subscriptionPlanId) {
        configObj.createSubscription = (_d: any, actions: any) =>
          actions.subscription.create({
            plan_id: subscriptionPlanId,
            custom_id: planId,
          });
      } else {
        configObj.createOrder = (_d: any, actions: any) =>
          actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                description: `${planName} - Digital Marketing Services`,
                amount: {
                  currency_code: PAYPAL_CURRENCY,
                  value: formatPaypalAmount(priceInr),
                },
              },
            ],
          });
      }

      window.paypal.Buttons(configObj).render(containerRef.current);
    }

    function loadSdk() {
      if (window.paypal) {
        renderButtons();
        return;
      }
      const existing = document.getElementById("paypal-sdk") as HTMLScriptElement | null;
      if (existing) {
        // Script tag already in the DOM — if it finished loading, render now;
        // otherwise wait for its load event (guards against a missed event).
        if (existing.dataset.loaded === "true") renderButtons();
        else existing.addEventListener("load", renderButtons, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      // `vault=true` is REQUIRED for subscription (recurring) buttons — without it
      // the PayPal gateway never opens on click.
      script.src = `${PAYPAL_HOST}/sdk/js?client-id=${CLIENT_ID}&currency=${PAYPAL_CURRENCY}&intent=capture&vault=true`;
      script.async = true;
      script.dataset.loaded = "false";
      script.onload = () => {
        script.dataset.loaded = "true";
        renderButtons();
      };
      script.onerror = () => {
        setStatus("error");
        setMessage("Could not load PayPal. Please check your connection and refresh.");
      };
      document.body.appendChild(script);
    }

    loadSdk();
    return () => {
      cancelled = true;
    };
  }, [planId, planName, priceInr, recurring]);

  return (
    <div className="w-full">
      <div ref={containerRef} className="min-h-[40px]" />
      {status !== "idle" && (
        <p
          className={`mt-2 text-sm ${
            status === "error"
              ? "text-red-600"
              : status === "success"
              ? "text-green-600"
              : "text-gray-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
