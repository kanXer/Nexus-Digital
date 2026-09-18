import { NextResponse } from "next/server";
import { getAllCoupons } from "@/lib/coupons";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coupons = await getAllCoupons();
    // Return only active coupons for public display
    const activeCoupons = coupons
      .filter((c) => c.isActive)
      .map((c) => ({
        code: c.code,
        title: c.title,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount,
      }));

    return NextResponse.json({ success: true, coupons: activeCoupons });
  } catch (err: any) {
    return NextResponse.json({ success: false, coupons: [] }, { status: 500 });
  }
}
