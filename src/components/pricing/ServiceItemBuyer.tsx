"use client";
import { useState } from "react";
import PayPalButton from "@/components/payment/PayPalButton";
import type { ServicePricingItem } from "@/data/servicePricing";

export default function ServiceItemBuyer({ item }: { item: ServicePricingItem }) {
  const [tier, setTier] = useState<"freelance" | "agency">("freelance");
  const isAgency = tier === "agency";
  const price = isAgency ? item.agencyInr : item.freelanceInr;
  const productId = isAgency ? `${item.id}-agency` : item.id;
  const name = isAgency ? `${item.serviceName} (Agency)` : item.serviceName;
  const recurring = item.cycle === "monthly";

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          type="button"
          onClick={() => setTier("freelance")}
          className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
            !isAgency
              ? "bg-brand-blue/15 border-brand-blue/40 text-white"
              : "bg-white/3 border-white/8 text-white/55 hover:border-white/20"
          }`}
        >
          Freelance · ₹{item.freelanceInr.toLocaleString("en-IN")}
        </button>
        <button
          type="button"
          onClick={() => setTier("agency")}
          className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
            isAgency
              ? "bg-brand-blue/15 border-brand-blue/40 text-white"
              : "bg-white/3 border-white/8 text-white/55 hover:border-white/20"
          }`}
        >
          Agency · ₹{item.agencyInr.toLocaleString("en-IN")}
        </button>
      </div>
      <PayPalButton
        planId={productId}
        planName={name}
        priceInr={price}
        recurring={recurring}
      />
    </div>
  );
}
