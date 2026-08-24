"use client";
import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { ServicePricingItem } from "@/data/servicePricing";

export default function ServiceItemBuyer({ item }: { item: ServicePricingItem }) {
  const { addToCart } = useAuth();
  const [tier, setTier] = useState<"freelance" | "agency">("freelance");
  const [added, setAdded] = useState(false);

  const isAgency = tier === "agency";
  const price = isAgency ? item.agencyInr : item.freelanceInr;
  const productId = isAgency ? `${item.id}-agency` : item.id;
  const name = isAgency ? `${item.serviceName} (Agency)` : item.serviceName;
  const recurring = item.cycle === "monthly";
  const priceLabel = `₹${price.toLocaleString("en-IN")}${recurring ? "/mo" : ""}`;

  const handleAddToCart = () => {
    addToCart({
      id: productId,
      title: name,
      price: priceLabel,
      numericPrice: price,
      description: item.serviceName,
      tier,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

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
      <button
        type="button"
        onClick={handleAddToCart}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
          added
            ? "bg-green-500/20 border border-green-500/40 text-green-300"
            : "btn-primary"
        }`}
      >
        {added ? (
          <>
            <Check className="w-4 h-4" /> Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" /> Add to Cart · {priceLabel}
          </>
        )}
      </button>
    </div>
  );
}
