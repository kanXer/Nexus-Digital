import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionEmail, SESSION_COOKIE } from "@/lib/admin";
import { getAllCoupons, saveOrUpdateCoupon, deleteCoupon, type Coupon } from "@/lib/coupons";

export const dynamic = "force-dynamic";

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const email = await getSessionEmail(token || "");
  return Boolean(email);
}

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const coupons = await getAllCoupons();
    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const code = String(body.code || "").toUpperCase().trim();
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const discountType = body.discountType === "flat" ? "flat" : "percentage";
    const discountValue = Number(body.discountValue || 0);

    if (discountValue <= 0) {
      return NextResponse.json({ error: "Discount value must be greater than 0" }, { status: 400 });
    }

    if (discountType === "percentage" && discountValue > 100) {
      return NextResponse.json({ error: "Percentage discount cannot exceed 100%" }, { status: 400 });
    }

    const coupon: Coupon = {
      code,
      title: String(body.title || "").trim() || `${discountValue}${discountType === "percentage" ? "%" : "₹"} Discount Offer`,
      discountType,
      discountValue,
      minOrderAmount: Number(body.minOrderAmount || 0),
      maxDiscountAmount: body.maxDiscountAmount ? Number(body.maxDiscountAmount) : undefined,
      expiryDate: body.expiryDate || undefined,
      isActive: body.isActive !== false,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const saved = await saveOrUpdateCoupon(coupon);
    if (!saved) {
      return NextResponse.json({ error: "Could not save coupon" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Coupon '${code}' saved successfully`, coupon });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save coupon" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code") || "";
    if (!code) {
      return NextResponse.json({ error: "Missing coupon code" }, { status: 400 });
    }

    const deleted = await deleteCoupon(code);
    return NextResponse.json({ success: deleted, message: deleted ? `Coupon '${code}' deleted` : "Coupon not found" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete coupon" }, { status: 500 });
  }
}
