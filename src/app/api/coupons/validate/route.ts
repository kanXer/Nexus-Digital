import { NextResponse } from "next/server";
import { findCouponByCode, calculateDiscount } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawCode = String(body?.code || "").trim();
    const subtotal = Number(body?.subtotal || 0);

    if (!rawCode) {
      return NextResponse.json({ success: false, error: "Please enter a coupon code." }, { status: 400 });
    }

    if (subtotal <= 0) {
      return NextResponse.json({ success: false, error: "Invalid order subtotal." }, { status: 400 });
    }

    const coupon = await findCouponByCode(rawCode);
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: `Coupon code '${rawCode.toUpperCase()}' is invalid.` },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: `Coupon code '${coupon.code}' is currently inactive.` },
        { status: 400 }
      );
    }

    if (coupon.expiryDate) {
      const expiry = new Date(coupon.expiryDate).getTime();
      if (!isNaN(expiry) && Date.now() > expiry) {
        return NextResponse.json(
          { success: false, error: `Coupon code '${coupon.code}' has expired.` },
          { status: 400 }
        );
      }
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Coupon '${coupon.code}' requires a minimum order amount of ₹${coupon.minOrderAmount.toLocaleString("en-IN")}.`,
        },
        { status: 400 }
      );
    }

    const discountAmount = calculateDiscount(coupon, subtotal);
    if (discountAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Coupon conditions not met for this order." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Coupon '${coupon.code}' applied! You saved ₹${discountAmount.toLocaleString("en-IN")}.`,
      coupon: {
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (err: any) {
    console.error("Coupon validation error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to validate coupon." },
      { status: 500 }
    );
  }
}
