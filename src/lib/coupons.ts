import { getDb } from "@/lib/db";

export interface Coupon {
  code: string; // Uppercase alphanumeric, e.g. "NEXUS10"
  title: string; // Short description e.g. "Special 10% Launch Discount"
  discountType: "percentage" | "flat"; // "%" or "₹"
  discountValue: number; // e.g. 10 or 1000
  minOrderAmount: number; // Minimum order subtotal required (default 0)
  maxDiscountAmount?: number; // Cap for percentage discount
  expiryDate?: string; // ISO date or "YYYY-MM-DD"
  isActive: boolean;
  createdAt?: string;
}

// Built-in starter coupons so offers work immediately even before admin configuration
export const DEFAULT_COUPONS: Coupon[] = [
  {
    code: "NEXUS10",
    title: "10% Welcome Discount for New Clients",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 5000,
    maxDiscountAmount: 3000,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    code: "LAUNCH1000",
    title: "Flat ₹1,000 Instant Agency Discount",
    discountType: "flat",
    discountValue: 1000,
    minOrderAmount: 10000,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    code: "GROWTH20",
    title: "Exclusive 20% Off on Business Accelerator Plans",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 15000,
    maxDiscountAmount: 5000,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function calculateDiscount(coupon: Coupon, subtotal: number): number {
  if (!coupon || !coupon.isActive) return 0;
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) return 0;

  if (coupon.expiryDate) {
    const expiry = new Date(coupon.expiryDate).getTime();
    if (!isNaN(expiry) && Date.now() > expiry) return 0;
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  return Math.max(0, discount);
}

export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    const db = await getDb();
    const docs = await db.collection("coupons").find({}).sort({ createdAt: -1 }).toArray();
    if (docs && docs.length > 0) {
      return docs.map((d) => ({
        code: String(d.code).toUpperCase().trim(),
        title: d.title || "",
        discountType: d.discountType === "flat" ? "flat" : "percentage",
        discountValue: Number(d.discountValue || 0),
        minOrderAmount: Number(d.minOrderAmount || 0),
        maxDiscountAmount: d.maxDiscountAmount ? Number(d.maxDiscountAmount) : undefined,
        expiryDate: d.expiryDate || undefined,
        isActive: Boolean(d.isActive),
        createdAt: d.createdAt || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn("MongoDB coupons read note (using default coupons):", err);
  }

  return DEFAULT_COUPONS;
}

export async function findCouponByCode(rawCode: string): Promise<Coupon | null> {
  const code = String(rawCode || "").toUpperCase().trim();
  if (!code) return null;

  try {
    const db = await getDb();
    const doc = await db.collection("coupons").findOne({ code });
    if (doc) {
      return {
        code: String(doc.code).toUpperCase().trim(),
        title: doc.title || "",
        discountType: doc.discountType === "flat" ? "flat" : "percentage",
        discountValue: Number(doc.discountValue || 0),
        minOrderAmount: Number(doc.minOrderAmount || 0),
        maxDiscountAmount: doc.maxDiscountAmount ? Number(doc.maxDiscountAmount) : undefined,
        expiryDate: doc.expiryDate || undefined,
        isActive: Boolean(doc.isActive),
        createdAt: doc.createdAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("MongoDB find coupon note:", err);
  }

  // Fallback to default coupons
  const fallback = DEFAULT_COUPONS.find((c) => c.code === code);
  return fallback || null;
}

export async function saveOrUpdateCoupon(coupon: Coupon): Promise<boolean> {
  const code = String(coupon.code || "").toUpperCase().trim();
  if (!code) return false;

  try {
    const db = await getDb();
    await db.collection("coupons").updateOne(
      { code },
      {
        $set: {
          code,
          title: coupon.title || "",
          discountType: coupon.discountType,
          discountValue: Number(coupon.discountValue || 0),
          minOrderAmount: Number(coupon.minOrderAmount || 0),
          maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
          expiryDate: coupon.expiryDate || null,
          isActive: Boolean(coupon.isActive),
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: {
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error("Failed to save coupon in MongoDB:", err);
    return false;
  }
}

export async function deleteCoupon(rawCode: string): Promise<boolean> {
  const code = String(rawCode || "").toUpperCase().trim();
  if (!code) return false;

  try {
    const db = await getDb();
    const res = await db.collection("coupons").deleteOne({ code });
    return res.deletedCount > 0;
  } catch (err) {
    console.error("Failed to delete coupon in MongoDB:", err);
    return false;
  }
}
