import { pricingPlans } from "@/data/pricing";
import { servicePricing } from "@/data/servicePricing";

export interface ProductInfo {
  id: string;
  name: string;
  priceInr: number;
  cycle?: "monthly" | "one-time";
}

// Single source of truth for purchasable prices (server-side). Service items
// expose two tiers: "<id>" (freelance) and "<id>-agency" (agency).
export function getProduct(id: string): ProductInfo | null {
  for (const plan of pricingPlans) {
    if (plan.id === id) {
      return { id: plan.id, name: plan.name, priceInr: plan.priceInr, cycle: "monthly" };
    }
  }
  for (const group of servicePricing) {
    for (const item of group.items) {
      if (item.id === id) {
        return {
          id: item.id,
          name: item.serviceName,
          priceInr: item.freelanceInr,
          cycle: item.cycle,
        };
      }
      if (`${item.id}-agency` === id) {
        return {
          id,
          name: `${item.serviceName} (Agency)`,
          priceInr: item.agencyInr,
          cycle: item.cycle,
        };
      }
    }
  }
  return null;
}
