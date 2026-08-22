/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { ensurePayPalPlan } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId") || "";
    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json({ error: "Unknown product" }, { status: 400 });
    }
    if (product.cycle !== "monthly") {
      return NextResponse.json(
        { error: "Product is not a recurring plan" },
        { status: 400 }
      );
    }

    const planId = await ensurePayPalPlan(product);
    return NextResponse.json({ planId });
  } catch (err: any) {
    console.error("Plan resolve error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to resolve plan" },
      { status: 500 }
    );
  }
}
